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
