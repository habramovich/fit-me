// Freshen a saved set (spec 012): up to three suggested changes, each an Add or a Replace, that
// bring something new into a set while keeping it balanced by body areas, part times, technique
// mix and the set's routine character. Pure and deterministic; nothing here is stored.
import type { Marks } from '../data/repo/marks'
import type { SavedSet } from '../data/repo/sets'
import { estimateSeconds, getExercise } from '../exercises'
import {
  BODY_AREA_LABEL,
  TECHNIQUE_LABEL,
  type BodyArea,
  type Dose,
  type Exercise,
  type Intensity,
  type Phase,
  type Technique,
  type VersionKey,
} from '../exercises/types'
import { eligible, fitsPhase, scaleDose, unfit, UNFIT_TEXT, type Candidate } from '../planner/plan'
import { hashSeed, seededRandom } from '../planner/random'
import { ROUTINES, type RoutineDef } from '../planner/routines'
import type { Profile, RoutineId } from '../profile/types'
import { addItem, MAX_SET_ITEMS, PHASE_ORDER, type SetItem } from './edit'

// ---------- Types (data-model.md) ----------

export interface Character {
  routine: RoutineDef
  handMade: boolean
  /** The hand-made cap; null for a set saved from a plan. */
  maxIntensity: Intensity | null
}

export type Change =
  | { kind: 'add'; phase: Phase }
  | { kind: 'replace'; target: { exerciseId: string; phase: Phase }; repair: boolean }

export interface Suggestion {
  key: string
  change: Change
  item: SetItem
  reason: string
  /** Gap area named in the reason, if any: two suggestions never share one. */
  gap: BodyArea | null
  /** Exercises already shown for this change (Another idea). */
  passed: string[]
  hasAnother: boolean
}

export interface FreshenInput {
  set: Pick<SavedSet, 'id' | 'source' | 'items'>
  library: readonly Exercise[]
  profile: Profile
  marks: Marks
  /** YYYY-MM-DD, part of the seed: the same all day, different tomorrow. */
  today: string
  /** Exercises skipped on this visit. */
  skipped: readonly string[]
}

export interface SetReview {
  worked: BodyArea[]
  missing: BodyArea[]
  parts: { phase: Phase; seconds: number; flag: 'short' | 'long' | null }[]
  techniques: [Technique, number][]
}

export const MAX_SUGGESTIONS = 3
export const PHASE_LABEL: Record<Phase, string> = {
  warmup: 'Warm-up',
  main: 'Main',
  cooldown: 'Cool-down',
}
const PART_WORD: Record<Phase, string> = {
  warmup: 'warm-up',
  main: 'main part',
  cooldown: 'cool-down',
}
const INTENSITIES: Intensity[] = ['gentle', 'moderate', 'vigorous']
const HAND_MADE_SHARES: Record<Phase, number> = { warmup: 0.2, main: 0.6, cooldown: 0.2 }
/** An empty set is measured against this length for its part shares. */
const EMPTY_SET_SECONDS = 600
const ALL_AREAS = Object.keys(BODY_AREA_LABEL) as BodyArea[]
/** Routines built around one technique: having mostly that technique is their character. */
const BUILT_AROUND: Partial<Record<RoutineId, Technique>> = {
  strength: 'strength',
  cardio: 'cardio',
}

function builtAround(ch: Character): Technique | null {
  return ch.handMade ? null : (BUILT_AROUND[ch.routine.id] ?? null)
}

// ---------- Character (research R2) ----------

export function characterOf(
  set: Pick<SavedSet, 'source' | 'items'>,
  library: readonly Exercise[],
  profile: Profile,
): Character {
  const id = set.source.startsWith('plan:') ? set.source.slice(5) : ''
  if (id in ROUTINES) {
    return { routine: ROUTINES[id as RoutineId], handMade: false, maxIntensity: null }
  }
  const byId = new Map(library.map((e) => [e.id, e]))
  const ranks = set.items
    .map((i) => byId.get(i.exerciseId))
    .filter((e): e is Exercise => e !== undefined)
    .map((e) => INTENSITIES.indexOf(e.intensity))
  const top = ranks.length > 0 ? Math.max(...ranks) : profile.level === 'advanced' ? 2 : 1
  const maxIntensity = INTENSITIES[top]
  // A routine shape for a set made by hand: no limits beyond the profile, no boosts. Its id is
  // only a placeholder; nothing below reads it for a hand-made set.
  const routine: RoutineDef = {
    id: 'weekend',
    name: 'Your set',
    hint: '',
    pace: 60,
    shares: HAND_MADE_SHARES,
    intensities: INTENSITIES.slice(0, top + 1),
    techniqueBoost: {},
    areaBoost: [],
  }
  return { routine, handMade: true, maxIntensity }
}

// ---------- Context: the set as the scorer sees it ----------

interface Ctx {
  input: FreshenInput
  ch: Character
  byId: Map<string, Exercise>
  /** Jitter per exercise, seeded by set and day. */
  jitter: Map<string, number>
  weights: Map<BodyArea, number>
  allowedTechniques: number
  inSet: Set<string>
}

function makeCtx(input: FreshenInput): Ctx {
  const { set, library, profile } = input
  const ch = characterOf(set, library, profile)
  const rng = seededRandom(hashSeed(`${set.id}|${input.today}`))
  const jitter = new Map<string, number>()
  for (const e of library) jitter.set(e.id, rng() * 0.3)
  const weights = new Map<BodyArea, number>()
  for (const a of ALL_AREAS) {
    if (profile.avoidAreas.includes(a)) continue
    const focus = profile.focusAreas.includes(a)
    if (a === 'heart' && !focus && (ch.handMade || ch.routine.id !== 'cardio')) continue
    weights.set(a, focus ? 3 : !ch.handMade && ch.routine.areaBoost.includes(a) ? 2 : 1)
  }
  const allowedTechniques = Math.max(
    1,
    Object.values(profile.techniques).filter((v) => v !== 'none').length,
  )
  return {
    input,
    ch,
    byId: new Map(library.map((e) => [e.id, e])),
    jitter,
    weights,
    allowedTechniques,
    inSet: new Set(set.items.map((i) => i.exerciseId)),
  }
}

/** What a set holds, counted by distinct exercises still in the library. */
interface Tally {
  exercises: Exercise[]
  area: Map<BodyArea, number>
  technique: Map<Technique, number>
}

function tally(ctx: Ctx, items: readonly SetItem[]): Tally {
  const exercises = [...new Set(items.map((i) => i.exerciseId))]
    .map((id) => ctx.byId.get(id))
    .filter((e): e is Exercise => e !== undefined)
  const area = new Map<BodyArea, number>()
  const technique = new Map<Technique, number>()
  for (const e of exercises) {
    for (const a of e.worksAreas) area.set(a, (area.get(a) ?? 0) + 1)
    technique.set(e.technique, (technique.get(e.technique) ?? 0) + 1)
  }
  return { exercises, area, technique }
}

const areaCount = (t: Tally, a: BodyArea) => t.area.get(a) ?? 0

function itemSeconds(ctx: Ctx, item: SetItem): number {
  const v = ctx.byId.get(item.exerciseId)?.[item.version]
  return v ? estimateSeconds({ ...v, dose: item.dose }) : 0
}

/** Parts whose time is below 85% of their usual share of the set's time. */
function shortParts(ctx: Ctx, items: readonly SetItem[]): Set<Phase> {
  const per = new Map<Phase, number>()
  for (const i of items) per.set(i.phase, (per.get(i.phase) ?? 0) + itemSeconds(ctx, i))
  const total = [...per.values()].reduce((a, b) => a + b, 0) || EMPTY_SET_SECONDS
  return new Set(
    PHASE_ORDER.filter((p) => (per.get(p) ?? 0) < 0.85 * ctx.ch.routine.shares[p] * total),
  )
}

// ---------- Eligibility ----------

/** The version of `e` a suggestion would use, or null if it can't be suggested at all. */
function versionFor(ctx: Ctx, e: Exercise): VersionKey | null {
  const key = eligible(e, ctx.input, ctx.ch.routine)
  if (!key) return null
  if (
    ctx.ch.maxIntensity &&
    INTENSITIES.indexOf(e.intensity) > INTENSITIES.indexOf(ctx.ch.maxIntensity)
  )
    return null
  return key
}

function candidateOf(ctx: Ctx, e: Exercise, key: VersionKey): Candidate {
  const prefs = ctx.input.profile.phasePrefs[e.id]
  return {
    exercise: e,
    versionKey: key,
    version: e[key]!,
    jitter: 0,
    prefs: prefs && prefs.length > 0 ? prefs : undefined,
  }
}

// ---------- Scoring (research R4) ----------

interface Scored {
  e: Exercise
  key: VersionKey
  score: number
  reason: string
  gap: BodyArea | null
}

const label = (a: BodyArea) => BODY_AREA_LABEL[a]

function joinAreas(areas: BodyArea[]): string {
  const names = areas.slice(0, 2).map(label)
  return names.join(' and ')
}

/**
 * How much `e` in `phase` would improve the set described by `t`. `kept` are areas a Replace keeps
 * worked whatever happens (the replaced item's own), so they don't count as gaps.
 */
function scoreOne(
  ctx: Ctx,
  e: Exercise,
  key: VersionKey,
  phase: Phase,
  t: Tally,
  opts: { short: boolean; kept?: readonly BodyArea[]; jitter?: boolean },
): Scored {
  const { profile, marks } = ctx.input
  const terms: [number, string][] = []
  let s = 1 + (opts.jitter === false ? 0 : (ctx.jitter.get(e.id) ?? 0))

  const gaps = e.worksAreas
    .filter((a) => (ctx.weights.get(a) ?? 0) > 0 && areaCount(t, a) === 0)
    .filter((a) => !opts.kept?.includes(a))
    .sort((a, b) => (ctx.weights.get(b) ?? 0) - (ctx.weights.get(a) ?? 0))
  const fill = Math.min(
    6,
    gaps.reduce((sum, a) => sum + (ctx.weights.get(a) ?? 0), 0),
  )
  if (fill > 0) {
    s += fill
    const top = gaps[0]
    const text =
      top === 'heart'
        ? 'Raises your heart rate, which the set doesn’t.'
        : profile.focusAreas.includes(top)
          ? `Works the ${label(top)}, one of your focus areas, which the set doesn’t.`
          : `Works the ${joinAreas(gaps)}, which the set doesn’t.`
    terms.push([fill, text])
  }

  for (const a of e.worksAreas) {
    const n = areaCount(t, a)
    if (n >= 2) s -= 0.4 * (n - 1)
  }

  const n = t.exercises.length
  const techShare = n > 0 ? (t.technique.get(e.technique) ?? 0) / n : 0
  if (profile.techniques[e.technique] === 'lots' && techShare < 1 / ctx.allowedTechniques) {
    s += 1
    terms.push([
      1,
      `Adds ${TECHNIQUE_LABEL[e.technique].toLowerCase()}, which you like; the set has little.`,
    ])
  }
  if (n > 0 && techShare > 0.5 && e.technique !== builtAround(ctx.ch)) s -= 1.5
  s += ctx.ch.routine.techniqueBoost[e.technique] ?? 0

  if (profile.phasePrefs[e.id]?.includes(phase)) {
    s += 1.5
    terms.push([1.5, `Your ${PART_WORD[phase]} pick.`])
  }
  if (marks[e.id] === 'favourite') {
    s += 1
    terms.push([1, 'Favourite.'])
  }
  if (opts.short) {
    s += 1.5
    terms.push([1.4, `The ${PART_WORD[phase]} is short for this set.`])
  }

  terms.sort((a, b) => b[0] - a[0])
  const reason =
    terms[0]?.[1] ??
    `Something new for the ${PART_WORD[phase]}: ${TECHNIQUE_LABEL[e.technique].toLowerCase()}.`
  return { e, key, score: s, reason, gap: fill > 0 ? gaps[0] : null }
}

// ---------- Changes and their ranked candidates ----------

/** The item a Replace targets: the first in its part with that exercise. */
function targetIndex(items: readonly SetItem[], target: { exerciseId: string; phase: Phase }) {
  return items.findIndex((i) => i.exerciseId === target.exerciseId && i.phase === target.phase)
}

/** Areas only the target item works: a replacement must work them (FR-005). */
function lostAreas(ctx: Ctx, items: readonly SetItem[], index: number): BodyArea[] {
  const e = ctx.byId.get(items[index].exerciseId)
  if (!e) return []
  const without = tally(
    ctx,
    items.filter((_, i) => i !== index),
  )
  return e.worksAreas.filter((a) => areaCount(without, a) === 0)
}

interface Ranked {
  list: Scored[]
  /** Score of the item being replaced, in the same terms (0 for an Add). */
  baseline: number
}

/**
 * Every exercise that could fill `change`, best first. `exclude` are exercises that can't be used
 * (on other cards, passed, skipped); the set's own exercises are always out.
 */
function rank(ctx: Ctx, change: Change, exclude: ReadonlySet<string>): Ranked {
  const items = ctx.input.set.items
  const phase = change.kind === 'add' ? change.phase : change.target.phase
  let t: Tally
  let kept: BodyArea[] = []
  let lost: BodyArea[] = []
  let baseline = 0
  let short = false
  if (change.kind === 'add') {
    t = tally(ctx, items)
    short = shortParts(ctx, items).has(phase)
  } else {
    const idx = targetIndex(items, change.target)
    if (idx < 0) return { list: [], baseline: 0 }
    const rest = items.filter((_, i) => i !== idx)
    t = tally(ctx, rest)
    const old = ctx.byId.get(change.target.exerciseId)
    kept = old?.worksAreas ?? []
    lost = change.repair ? [] : lostAreas(ctx, items, idx)
    if (old && !change.repair) {
      baseline = scoreOne(ctx, old, items[idx].version, phase, t, {
        short: false,
        kept,
        jitter: false,
      }).score
    }
  }

  // In a routine built around a technique, a main item of that technique is replaced in kind.
  const core = builtAround(ctx.ch)
  const keepTechnique =
    change.kind === 'replace' &&
    phase === 'main' &&
    core !== null &&
    ctx.byId.get(change.target.exerciseId)?.technique === core
      ? core
      : null

  const pool: { e: Exercise; key: VersionKey; c: Candidate }[] = []
  for (const e of ctx.input.library) {
    if (ctx.inSet.has(e.id) || exclude.has(e.id) || ctx.input.skipped.includes(e.id)) continue
    const key = versionFor(ctx, e)
    if (!key) continue
    if (!lost.every((a) => e.worksAreas.includes(a))) continue
    if (keepTechnique && e.technique !== keepTechnique) continue
    pool.push({ e, key, c: candidateOf(ctx, e, key) })
  }
  let fits = pool.filter((p) => fitsPhase(p.c, phase, ctx.ch.routine))
  if (fits.length === 0) fits = pool.filter((p) => fitsPhase(p.c, phase, ctx.ch.routine, true))

  const list = fits.map(({ e, key }) => {
    const s = scoreOne(ctx, e, key, phase, t, { short, kept })
    // A repair prefers exercises that keep what the old item worked.
    if (change.kind === 'replace' && change.repair) {
      s.score += 0.5 * e.worksAreas.filter((a) => kept.includes(a)).length
    }
    return s
  })
  list.sort((a, b) => b.score - a.score || (a.e.id < b.e.id ? -1 : 1))
  return { list, baseline }
}

/** Why an item is a good one to swap out, as a sentence, or '' if nothing stands out. */
function whyReplace(ctx: Ctx, items: readonly SetItem[], index: number): string {
  const e = ctx.byId.get(items[index].exerciseId)
  if (!e) return ''
  const t = tally(ctx, items)
  const top = [...e.worksAreas].sort((a, b) => areaCount(t, b) - areaCount(t, a))[0]
  if (top && areaCount(t, top) >= 3) {
    return `${e.name} works the ${label(top)}, like ${areaCount(t, top) - 1} others in the set.`
  }
  const n = t.exercises.length
  const k = t.technique.get(e.technique) ?? 0
  if (n > 0 && k / n > 0.5 && e.technique !== builtAround(ctx.ch)) {
    return `${TECHNIQUE_LABEL[e.technique]} is ${k} of the set’s ${n} exercises.`
  }
  return ''
}

/** How weak an item's place in the set is: higher = better to swap out (research R5). */
function weakness(ctx: Ctx, items: readonly SetItem[], index: number): number {
  const item = items[index]
  const e = ctx.byId.get(item.exerciseId)!
  const t = tally(ctx, items)
  let w = e.worksAreas.reduce((sum, a) => sum + Math.max(0, areaCount(t, a) - 1), 0)
  const n = t.exercises.length
  const crowded = n > 0 && (t.technique.get(e.technique) ?? 0) / n > 0.5
  if (crowded && e.technique !== builtAround(ctx.ch)) w += 1.5
  if (ctx.input.profile.phasePrefs[e.id]?.includes(item.phase)) w -= 1.5
  return w
}

function changeKey(change: Change): string {
  return change.kind === 'add'
    ? `add:${change.phase}`
    : `replace:${change.target.exerciseId}:${change.target.phase}`
}

function toSuggestion(ctx: Ctx, change: Change, s: Scored, passed: string[]): Suggestion {
  const items = ctx.input.set.items
  const v = s.e[s.key]!
  let dose: Dose = v.dose
  let reason = s.reason
  const phase = change.kind === 'add' ? change.phase : change.target.phase
  if (change.kind === 'replace') {
    const idx = targetIndex(items, change.target)
    const old = items[idx]
    const oldSeconds = itemSeconds(ctx, old)
    if (oldSeconds > 0) {
      dose = scaleDose(v.dose, oldSeconds / Math.max(1, estimateSeconds(v)), phase === 'main')
    }
    const name = ctx.byId.get(old.exerciseId)?.name ?? 'An exercise'
    if (change.repair) {
      const why = unfit(ctx.input, ctx.byId, old)
      reason = `${name} ${UNFIT_TEXT[why ?? 'removed']}. ${reason}`
    } else {
      const why = whyReplace(ctx, items, idx)
      if (why) reason = `${reason} ${why}`
    }
  }
  return {
    key: changeKey(change),
    change,
    item: { exerciseId: s.e.id, version: s.key, phase, dose },
    reason,
    gap: change.kind === 'replace' && change.repair ? null : s.gap,
    passed,
    hasAnother: false,
  }
}

/** Sets `hasAnother` on each suggestion, given the others on screen. */
function markAnother(ctx: Ctx, list: Suggestion[]): Suggestion[] {
  return list.map((s) => {
    const others = new Set(list.filter((o) => o !== s).map((o) => o.item.exerciseId))
    const ranked = rank(ctx, s.change, others)
    return { ...s, hasAnother: ranked.list.some((r) => r.e.id !== s.item.exerciseId) }
  })
}

// ---------- Suggest (research R5) ----------

export function suggest(input: FreshenInput): Suggestion[] {
  const ctx = makeCtx(input)
  const items = input.set.items
  const out: Suggestion[] = []
  const usedExercises = new Set<string>()
  const usedTargets = new Set<string>()
  const usedGaps = new Set<BodyArea>()
  const take = (s: Suggestion) => {
    out.push(s)
    usedExercises.add(s.item.exerciseId)
    if (s.change.kind === 'replace') usedTargets.add(changeKey(s.change))
    if (s.gap) usedGaps.add(s.gap)
  }

  // 1. Repairs: items that can't be used any more, in set order.
  const seen = new Set<string>()
  items.forEach((item, i) => {
    if (out.length >= MAX_SUGGESTIONS) return
    const key = `${item.exerciseId}:${item.phase}`
    if (seen.has(key) || !unfit(input, ctx.byId, item)) return
    seen.add(key)
    if (targetIndex(items, item) !== i) return
    const change: Change = {
      kind: 'replace',
      target: { exerciseId: item.exerciseId, phase: item.phase },
      repair: true,
    }
    const best = rank(ctx, change, usedExercises).list[0]
    if (best) take(toSuggestion(ctx, change, best, []))
  })

  // 2. Candidate changes: an Add per part (room permitting), the two weakest removable items.
  const changes: Change[] = []
  if (items.length < MAX_SET_ITEMS) {
    for (const phase of PHASE_ORDER) changes.push({ kind: 'add', phase })
  }
  const removable = items
    .map((item, i) => ({ item, i }))
    .filter(({ item, i }) => {
      const e = ctx.byId.get(item.exerciseId)
      return (
        e &&
        targetIndex(items, item) === i &&
        !unfit(input, ctx.byId, item) &&
        input.marks[item.exerciseId] !== 'favourite'
      )
    })
    .map(({ item, i }) => ({ item, w: weakness(ctx, items, i), i }))
    .sort((a, b) => b.w - a.w || a.i - b.i)
  let replaces = 0
  for (const { item } of removable) {
    if (replaces >= 2) break
    const change: Change = {
      kind: 'replace',
      target: { exerciseId: item.exerciseId, phase: item.phase },
      repair: false,
    }
    if (rank(ctx, change, new Set()).list.length === 0) continue
    changes.push(change)
    replaces++
  }
  const rankings = new Map(changes.map((c) => [changeKey(c), rank(ctx, c, new Set())]))

  // 3. Greedy, best gain first, with no shared exercise, target or gap, and both kinds when both
  //    are possible.
  const best = (c: Change) => {
    if (c.kind === 'replace' && usedTargets.has(changeKey(c))) return null
    const r = rankings.get(changeKey(c))!
    const s = r.list.find((x) => !usedExercises.has(x.e.id) && !(x.gap && usedGaps.has(x.gap)))
    return s ? { s, gain: s.score - r.baseline } : null
  }
  let open = changes.filter((c) => !out.some((o) => o.key === changeKey(c)))
  while (out.length < MAX_SUGGESTIONS && open.length > 0) {
    const options = open
      .map((c) => ({ c, b: best(c) }))
      .filter((o): o is { c: Change; b: { s: Scored; gain: number } } => o.b !== null)
      .filter((o) => o.b.gain > 0)
    if (options.length === 0) break
    const kinds = new Set(out.map((o) => o.change.kind))
    const missing = (['add', 'replace'] as Change['kind'][]).filter(
      (k) => !kinds.has(k) && options.some((o) => o.c.kind === k),
    )
    const slots = MAX_SUGGESTIONS - out.length
    const pool =
      slots <= missing.length ? options.filter((o) => missing.includes(o.c.kind)) : options
    pool.sort((a, b) => b.b.gain - a.b.gain)
    const pick = pool[0]
    take(toSuggestion(ctx, pick.c, pick.b.s, []))
    open = open.filter((c) => changeKey(c) !== changeKey(pick.c))
  }
  return markAnother(ctx, out)
}

// ---------- Another idea (research R6) ----------

export function anotherIdea(
  input: FreshenInput,
  list: readonly Suggestion[],
  key: string,
): Suggestion[] {
  const s = list.find((x) => x.key === key)
  if (!s) return [...list]
  const ctx = makeCtx(input)
  const others = list.filter((x) => x !== s).map((x) => x.item.exerciseId)
  const current = s.item.exerciseId
  let passed = [...new Set([...s.passed, current])]
  let next = rank(ctx, s.change, new Set([...others, ...passed])).list[0]
  if (!next) {
    passed = [current]
    next = rank(ctx, s.change, new Set([...others, current])).list[0]
  }
  if (!next) return [...list]
  const replaced = toSuggestion(ctx, s.change, next, passed)
  const out = list.map((x) => (x === s ? replaced : x))
  return markAnother(ctx, out)
}

// ---------- Apply and keep valid (research R7) ----------

const nameOf = (id: string) => getExercise(id)?.name ?? 'An exercise'

/** A card's heading as plain text: "Add X to Main" or "Replace Y with X". */
export function changeText(s: Suggestion): string {
  const name = nameOf(s.item.exerciseId)
  return s.change.kind === 'add'
    ? `Add ${name} to ${PHASE_LABEL[s.change.phase]}`
    : `Replace ${nameOf(s.change.target.exerciseId)} with ${name}`
}

export function applySuggestion(items: SetItem[], s: Suggestion): SetItem[] {
  if (s.change.kind === 'add') return addItem(items, s.item)
  const idx = targetIndex(items, s.change.target)
  if (idx < 0) return items
  return items.map((it, i) => (i === idx ? s.item : it))
}

/** Drops suggestions that no longer apply to the set as it is now; the rest stay unchanged. */
export function revalidate(input: FreshenInput, list: readonly Suggestion[]): Suggestion[] {
  const ctx = makeCtx(input)
  const items = input.set.items
  const t = tally(ctx, items)
  const kept = list.filter((s) => {
    if (ctx.inSet.has(s.item.exerciseId)) return false
    if (input.skipped.includes(s.item.exerciseId)) return false
    if (s.change.kind === 'replace' && targetIndex(items, s.change.target) < 0) return false
    if (s.change.kind === 'add' && items.length >= MAX_SET_ITEMS) return false
    if (s.gap && areaCount(t, s.gap) > 0) return false
    const e = ctx.byId.get(s.item.exerciseId)
    return e !== undefined && versionFor(ctx, e) !== null
  })
  return kept.length === list.length ? [...list] : kept
}

// ---------- Review (US3) ----------

export function reviewSet(
  set: Pick<SavedSet, 'id' | 'source' | 'items'>,
  library: readonly Exercise[],
  profile: Profile,
): SetReview {
  const ctx = makeCtx({ set, library, profile, marks: {}, today: '', skipped: [] })
  const t = tally(ctx, set.items)
  const worked = [...t.area.entries()]
    .sort((a, b) => b[1] - a[1] || ALL_AREAS.indexOf(a[0]) - ALL_AREAS.indexOf(b[0]))
    .map(([a]) => a)
  const missing = [...ctx.weights.entries()]
    .filter(([a]) => areaCount(t, a) === 0)
    .sort((a, b) => b[1] - a[1] || ALL_AREAS.indexOf(a[0]) - ALL_AREAS.indexOf(b[0]))
    .slice(0, 3)
    .map(([a]) => a)
  const seconds = new Map<Phase, number>()
  for (const i of set.items) {
    seconds.set(i.phase, (seconds.get(i.phase) ?? 0) + itemSeconds(ctx, i))
  }
  const total = [...seconds.values()].reduce((a, b) => a + b, 0)
  const parts = PHASE_ORDER.map((phase) => {
    const s = seconds.get(phase) ?? 0
    const usual = ctx.ch.routine.shares[phase]
    let flag: 'short' | 'long' | null = null
    if (total >= 180) {
      const share = s / total
      if (share < 0.6 * usual) flag = 'short'
      else if (share > 1.5 * usual) flag = 'long'
    }
    return { phase, seconds: s, flag }
  })
  const techniques = [...t.technique.entries()].sort((a, b) => b[1] - a[1])
  return { worked, missing, parts, techniques }
}
