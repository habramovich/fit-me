// Pure editing of a set's ordered items (spec 004 FR-004–FR-006). Items are always kept grouped
// by part: warm-up, then main, then cool-down. Drag-and-drop and the buttons both use these.
import type { Dose, Phase, VersionKey } from '../exercises/types'
import type { PlanItem } from '../planner/plan'

export interface SetItem {
  exerciseId: string
  version: VersionKey
  phase: Phase
  dose: Dose
}

export const MAX_SET_ITEMS = 40
export const PHASE_ORDER: Phase[] = ['warmup', 'main', 'cooldown']

/** Index in `items` where position `pos` of `phase` is (clamped to that part). */
function insertionIndex(items: SetItem[], phase: Phase, pos: number): number {
  const order = PHASE_ORDER.indexOf(phase)
  const start = items.findIndex((i) => PHASE_ORDER.indexOf(i.phase) >= order)
  const first = start === -1 ? items.length : start
  const count = items.filter((i) => i.phase === phase).length
  return first + Math.max(0, Math.min(pos, count))
}

/** Moves item `from` to position `pos` within `phase`. */
export function moveTo(items: SetItem[], from: number, phase: Phase, pos: number): SetItem[] {
  const item = items[from]
  if (!item) return items
  const rest = items.filter((_, i) => i !== from)
  const at = insertionIndex(rest, phase, pos)
  return [...rest.slice(0, at), { ...item, phase }, ...rest.slice(at)]
}

const positionIn = (items: SetItem[], index: number) =>
  items.slice(0, index).filter((i) => i.phase === items[index].phase).length

/** One place up; from the top of a part, to the end of the previous part. */
export function moveUp(items: SetItem[], index: number): SetItem[] {
  const item = items[index]
  if (!item) return items
  const pos = positionIn(items, index)
  if (pos > 0) return moveTo(items, index, item.phase, pos - 1)
  const p = PHASE_ORDER.indexOf(item.phase)
  if (p === 0) return items
  const prev = PHASE_ORDER[p - 1]
  return moveTo(items, index, prev, items.filter((i) => i.phase === prev).length)
}

/** One place down; from the end of a part, to the start of the next part. */
export function moveDown(items: SetItem[], index: number): SetItem[] {
  const item = items[index]
  if (!item) return items
  const pos = positionIn(items, index)
  const count = items.filter((i) => i.phase === item.phase).length
  if (pos < count - 1) return moveTo(items, index, item.phase, pos + 1)
  const p = PHASE_ORDER.indexOf(item.phase)
  if (p === PHASE_ORDER.length - 1) return items
  return moveTo(items, index, PHASE_ORDER[p + 1], 0)
}

/** Adds at the end of the item's part. Duplicates are fine; full sets are left unchanged. */
export function addItem(items: SetItem[], item: SetItem): SetItem[] {
  if (items.length >= MAX_SET_ITEMS) return items
  const at = insertionIndex(items, item.phase, Number.MAX_SAFE_INTEGER)
  return [...items.slice(0, at), item, ...items.slice(at)]
}

export function removeItem(items: SetItem[], index: number): SetItem[] {
  return items.filter((_, i) => i !== index)
}

export function fromPlan(plan: PlanItem[]): SetItem[] {
  return plan.map(({ exerciseId, version, phase, dose }) => ({ exerciseId, version, phase, dose }))
}

// ----- The person's own dose for an item (011 US3) -----

export type DoseField = 'reps' | 'sets' | 'seconds'

/** Limits and step for each adjustable number. */
export const DOSE_LIMITS: Record<DoseField, { min: number; max: number; step: number }> = {
  reps: { min: 1, max: 50, step: 1 },
  sets: { min: 1, max: 5, step: 1 },
  seconds: { min: 10, max: 600, step: 5 },
}

/** The fields the person can change for this kind of dose. */
export const doseFields = (dose: Dose): DoseField[] =>
  dose.kind === 'reps' ? ['reps', 'sets'] : ['seconds']

export function doseValue(dose: Dose, field: DoseField): number | null {
  if (dose.kind === 'reps')
    return field === 'reps' ? dose.reps : field === 'sets' ? dose.sets : null
  return field === 'seconds' ? dose.seconds : null
}

/**
 * One step up or down, kept inside the limits. Seconds snap to the 5-second grid on the way.
 * `range`, `perSide` and `repsNote` stay as they are; a field the dose doesn't have changes nothing.
 */
export function stepDose(dose: Dose, field: DoseField, delta: 1 | -1): Dose {
  const value = doseValue(dose, field)
  if (value === null) return dose
  const { min, max, step } = DOSE_LIMITS[field]
  const snapped =
    delta > 0 ? Math.floor(value / step) * step + step : Math.ceil(value / step) * step - step
  const next = Math.min(max, Math.max(min, snapped))
  if (next === value) return dose
  if (dose.kind === 'reps')
    return field === 'reps' ? { ...dose, reps: next } : { ...dose, sets: next }
  return { ...dose, seconds: next }
}

/** Whether the main number (reps or seconds) is inside the recommended range. */
export function inRange(dose: Dose): boolean {
  const value = dose.kind === 'reps' ? dose.reps : dose.seconds
  return value >= dose.range[0] && value <= dose.range[1]
}

/** The items with item `index`'s dose replaced. */
export function withDose(items: SetItem[], index: number, dose: Dose): SetItem[] {
  if (!items[index] || items[index].dose === dose) return items
  return items.map((item, i) => (i === index ? { ...item, dose } : item))
}
