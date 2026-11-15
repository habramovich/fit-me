// The session planner: a pure, deterministic function (spec 003 FR-005–FR-014, research R2).
import type { Marks } from '../data/repo/marks'
import { estimateSeconds } from '../exercises'
import {
  BODY_AREA_LABEL,
  TECHNIQUE_LABEL,
  type BodyArea,
  type Dose,
  type Exercise,
  type Phase,
  type Version,
  type VersionKey,
} from '../exercises/types'
import type { Amount, Profile, RoutineId } from '../profile/types'
import { hashSeed, seededRandom } from './random'
import { ROUTINES, ROUTINE_ORDER, type RoutineDef } from './routines'

export interface HistorySummary {
  /** Exercises done in the sessions read (about 14 days). */
  done: string[]
  /** Exercises done yesterday. */
  yesterday: string[]
  /** Exercises done in the last 7 days. */
  recent: string[]
}

export const EMPTY_HISTORY: HistorySummary = { done: [], yesterday: [], recent: [] }

export interface PlanInput {
  library: readonly Exercise[]
  profile: Profile
  routine: RoutineId
  minutes: number
  marks: Marks
  history: HistorySummary
  /** YYYY-MM-DD, part of the seed so each day differs. */
  today: string
  /** Seed counter of a kept plan: +1 per Reshuffle or new plan (spec 006 R3). */
  generation: number
}

export interface PlanItem {
  exerciseId: string
  version: VersionKey
  dose: Dose
  phase: Phase
  reason: string
  seconds: number
}

/** A plan item as kept (spec 006): `passed` lists exercises already swapped away from the slot. */
export interface KeptItem extends PlanItem {
  passed: string[]
}

export type PlanResult =
  | { kind: 'plan'; items: PlanItem[]; totalSeconds: number; shortOfTime: boolean }
  | { kind: 'insufficient'; routine: RoutineId; suggestion: RoutineId | null }

const PHASES: Phase[] = ['warmup', 'main', 'cooldown']
const AMOUNT_WEIGHT: Record<Amount, number> = { none: 0, some: 1, lots: 2 }
const MIN_CANDIDATES = 3
const PHASE_WORD: Record<Phase, string> = { warmup: 'warm-up', main: 'main', cooldown: 'cool-down' }

/**
 * Which exercises are in the plan, by part. An exercise preferred in both warm-up and cool-down
 * may be used once in each (e.g. cat-cow to open and close a session).
 */
class Usage {
  private parts = new Map<string, Phase[]>()
  canUse(c: Candidate, phase: Phase): boolean {
    const uses = this.parts.get(c.exercise.id)
    if (!uses || uses.length === 0) return true
    const bookends = c.prefs?.includes('warmup') && c.prefs.includes('cooldown')
    return Boolean(
      bookends && phase !== 'main' && !uses.includes(phase) && uses.every((p) => p !== 'main'),
    )
  }
  add(id: string, phase: Phase): void {
    this.parts.set(id, [...(this.parts.get(id) ?? []), phase])
  }
  remove(id: string, phase: Phase): void {
    const uses = this.parts.get(id) ?? []
    const i = uses.indexOf(phase)
    if (i >= 0) uses.splice(i, 1)
  }
}

interface Candidate {
  exercise: Exercise
  versionKey: VersionKey
  version: Version
  jitter: number
  /** The person's preferred parts for this exercise (spec 004 FR-009). */
  prefs?: Phase[]
}

// ---------- Eligibility ----------

function positionOf(e: Exercise, v: Version) {
  return v.position ?? e.position
}

function equipmentOf(e: Exercise, v: Version) {
  return v.equipment ?? e.equipment
}

/** Picks the version for this person and routine, or null if none fits. */
export function chooseVersion(
  e: Exercise,
  profile: Profile,
  routine: RoutineDef,
): VersionKey | null {
  const goEasy = e.loadsAreas.some((a) => profile.goEasyAreas.includes(a))
  let preferred: VersionKey[]
  if (goEasy) preferred = ['easier', 'standard']
  else if (profile.level === 'advanced') preferred = ['harder', 'standard', 'easier']
  else preferred = ['standard', 'easier', 'harder']
  // Cardio below advanced: low-impact only when there is a choice (FR-009), keeping the usual
  // order among low-impact versions (standard before easier unless going easy).
  if (e.technique === 'cardio' && profile.level !== 'advanced') {
    const all: VersionKey[] = [...preferred, ...(['easier', 'standard', 'harder'] as const)]
    const low = [...new Set(all)].filter((k) => e[k]?.lowImpact)
    if (low.length > 0) preferred = low
  }
  const have = new Set<string>(['none', ...profile.equipment])
  for (const key of preferred) {
    const v = e[key]
    if (!v) continue
    const equipment = equipmentOf(e, v)
    if (!equipment.every((q) => have.has(q))) continue
    if (routine.positions && !routine.positions.includes(positionOf(e, v))) continue
    if (routine.equipment && !equipment.every((q) => routine.equipment!.includes(q))) continue
    return key
  }
  return null
}

function eligible(e: Exercise, input: PlanInput, routine: RoutineDef): VersionKey | null {
  const { profile, marks } = input
  if (marks[e.id] === 'notForMe') return null
  if (profile.techniques[e.technique] === 'none') return null
  if (e.loadsAreas.some((a) => profile.avoidAreas.includes(a))) return null
  if (
    !routine.intensities.includes(e.intensity) &&
    !(e.intensity === 'vigorous' && profile.level === 'advanced')
  )
    return null
  return chooseVersion(e, profile, routine)
}

/**
 * Whether a candidate can go in a phase. `relaxed` lets a phase borrow exercises listed for other
 * phases when it has none of its own (e.g. a Calm morning's main part from gentle warm-up moves).
 */
function fitsPhase(c: Candidate, phase: Phase, routine: RoutineDef, relaxed = false): boolean {
  if (routine.mainTechniques) {
    const isMainTech = routine.mainTechniques.includes(c.exercise.technique)
    if (phase === 'main' ? !isMainTech : isMainTech) return false
  }
  if (c.prefs) return c.prefs.includes(phase)
  return relaxed || c.exercise.phases.includes(phase)
}

// ---------- Scoring ----------

interface PickState {
  phase: Phase
  newCount: number
  mainCount: number
  mainStrengthCount: number
  firstOfPhase: boolean
}

interface Scored {
  score: number
  reason: string
}

function score(
  c: Candidate,
  input: PlanInput,
  routine: RoutineDef,
  st: PickState,
  recentAreas: Set<BodyArea>,
): Scored {
  const { profile, marks, history } = input
  const e = c.exercise
  const reasons: [number, string][] = []
  let s = 1 + c.jitter

  if (c.prefs?.includes(st.phase)) {
    s += 1.5
    reasons.push([2.6, `Your ${PHASE_WORD[st.phase]} pick`])
  }

  const tech = AMOUNT_WEIGHT[profile.techniques[e.technique]]
  s += tech
  if (tech === 2) reasons.push([1.2, `${TECHNIQUE_LABEL[e.technique]}, which you like`])
  s += routine.techniqueBoost[e.technique] ?? 0

  const focusHits = e.worksAreas.filter((a) => profile.focusAreas.includes(a))
  if (focusHits.length) {
    s += Math.min(2, focusHits.length) * 1.5
    reasons.push([
      2 + focusHits.length * 0.1,
      `Focus: ${focusHits
        .slice(0, 2)
        .map((a) => BODY_AREA_LABEL[a])
        .join(' and ')}`,
    ])
  }

  if (marks[e.id] === 'favourite') {
    s += 1.5
    reasons.push([1.9, 'Favourite'])
  }

  const routineHits = e.worksAreas.filter((a) => routine.areaBoost.includes(a))
  if (routineHits.length) {
    s += 1
    reasons.push([1.1, `${routine.name}: ${BODY_AREA_LABEL[routineHits[0]]}`])
  }

  const known = history.done.includes(e.id) || marks[e.id] === 'favourite'
  if (!known) {
    if (profile.tryNew === 'new') {
      s += 2.5
      reasons.push([2.5, 'New for you'])
    } else if (profile.tryNew === 'mix') {
      if (st.newCount < 2) {
        s += 2
        reasons.push([2.4, 'New for you'])
      } else s -= 0.5
    } else s -= 2
  }

  if (st.phase === 'main' && history.yesterday.includes(e.id)) s -= 2
  if (history.recent.includes(e.id)) s -= 0.5
  if (e.worksAreas.some((a) => !recentAreas.has(a))) {
    s += 0.7
    reasons.push([
      0.8,
      `Variety: ${BODY_AREA_LABEL[e.worksAreas.find((a) => !recentAreas.has(a))!]}`,
    ])
  }

  const strengthLike = e.technique === 'strength' || e.tags.includes('balance')
  if (
    routine.id === 'strength' &&
    st.phase === 'main' &&
    strengthLike &&
    st.mainStrengthCount * 2 <= st.mainCount + 1
  ) {
    s += 3
    reasons.push([1.5, e.tags.includes('balance') ? 'Balance' : 'Strength'])
  }

  if (
    routine.id === 'calm' &&
    e.tags.includes('breathing') &&
    (st.phase === 'cooldown' || (st.phase === 'warmup' && st.firstOfPhase))
  ) {
    s += 3
    reasons.push([1.6, 'Calm, with the breath'])
  }

  const older =
    profile.ageRange === '50s' || profile.ageRange === '60s' || profile.ageRange === '70plus'
  if (
    e.tags.includes('boneLoading') &&
    (profile.goals.includes('boneStrength') || (older && routine.id === 'strength'))
  ) {
    s += 1.5
    reasons.push([1.7, 'Bone strength'])
  }
  if (e.tags.includes('balance') && profile.goals.includes('balance')) {
    s += 1
    reasons.push([1.3, 'Balance'])
  }

  reasons.sort((a, b) => b[0] - a[0])
  return { score: s, reason: reasons[0]?.[1] ?? `${TECHNIQUE_LABEL[e.technique]} for balance` }
}

// ---------- Doses and time ----------

function secondsFor(v: Version, dose: Dose): number {
  return estimateSeconds({ ...v, dose })
}

/**
 * Scales a dose by `factor`, keeping reps or seconds inside the recommended range. Sets may change
 * by one only when `allowSets` (main part); warm-up and cool-down keep their sets.
 */
function scaleDose(dose: Dose, factor: number, allowSets: boolean): Dose {
  const [min, max] = dose.range
  if (dose.kind === 'time') {
    const s = Math.round((dose.seconds * factor) / 5) * 5
    return { ...dose, seconds: Math.min(max, Math.max(min, s)) }
  }
  let sets = dose.sets
  let f = factor
  if (allowSets && f > 1.45 && sets < 3) {
    f = (f * sets) / (sets + 1)
    sets += 1
  } else if (allowSets && f < 0.7 && sets > 1) {
    f = (f * sets) / (sets - 1)
    sets -= 1
  }
  const reps = Math.min(max, Math.max(min, Math.round(dose.reps * f)))
  return { ...dose, reps, sets }
}

// ---------- Main ----------

interface Context {
  routine: RoutineDef
  pool: Candidate[]
  usable: Candidate[]
  byId: Map<string, Exercise>
  recentAreas: Set<BodyArea>
}

/** The eligible candidates (with their seeded jitter) and what scoring needs. */
function context(input: PlanInput): Context {
  const routine = ROUTINES[input.routine]
  const rng = seededRandom(hashSeed(`${input.today}|${input.routine}|${input.generation}`))
  const pool: Candidate[] = []
  for (const e of input.library) {
    const key = eligible(e, input, routine)
    const jitter = rng() * 1.2 // drawn for every exercise, so the sequence is stable
    if (!key) continue
    const prefs = input.profile.phasePrefs[e.id]
    pool.push({
      exercise: e,
      versionKey: key,
      version: e[key]!,
      jitter,
      prefs: prefs && prefs.length > 0 ? prefs : undefined,
    })
  }
  const byId = new Map(input.library.map((e) => [e.id, e]))
  return {
    routine,
    pool,
    usable: pool.filter((c) => PHASES.some((p) => fitsPhase(c, p, routine))),
    byId,
    recentAreas: new Set<BodyArea>(
      input.history.recent.flatMap((id) => byId.get(id)?.worksAreas ?? []),
    ),
  }
}

export function makePlan(input: PlanInput): PlanResult {
  const { routine, pool, usable, byId, recentAreas } = context(input)
  const mainOk = pool.some((c) => fitsPhase(c, 'main', routine, true))
  if (usable.length < MIN_CANDIDATES || !mainOk) {
    return { kind: 'insufficient', routine: input.routine, suggestion: suggestRoutine(input) }
  }

  const target = input.minutes * 60
  const tolerance = input.minutes <= 10 ? 60 : 120

  const picked: (PlanItem & { score: number })[] = []
  const used = new Usage()
  const st: PickState = {
    phase: 'warmup',
    newCount: 0,
    mainCount: 0,
    mainStrengthCount: 0,
    firstOfPhase: true,
  }

  const known = (id: string) => input.history.done.includes(id) || input.marks[id] === 'favourite'
  const bestFor = (phase: Phase, relaxed: boolean) => {
    let best: { c: Candidate; s: Scored } | null = null
    for (const c of usable) {
      if (!used.canUse(c, phase) || !fitsPhase(c, phase, routine, relaxed)) continue
      const s = score(c, input, routine, st, recentAreas)
      if (!best || s.score > best.s.score) best = { c, s }
    }
    return best
  }
  /** Picks the best candidate for a phase; `borrow` allows exercises listed for other phases. */
  const pickOne = (phase: Phase, borrow = false): boolean => {
    st.phase = phase
    const best = bestFor(phase, false) ?? (borrow ? bestFor(phase, true) : null)
    if (!best) return false
    const { c, s } = best
    used.add(c.exercise.id, phase)
    picked.push({
      exerciseId: c.exercise.id,
      version: c.versionKey,
      dose: c.version.dose,
      phase,
      reason: s.reason,
      seconds: estimateSeconds(c.version),
      score: s.score,
    })
    if (!known(c.exercise.id)) st.newCount++
    if (phase === 'main') {
      st.mainCount++
      if (c.exercise.technique === 'strength' || c.exercise.tags.includes('balance'))
        st.mainStrengthCount++
    }
    st.firstOfPhase = false
    return true
  }

  const spentIn = (phase: Phase) =>
    picked.filter((p) => p.phase === phase).reduce((sum, p) => sum + p.seconds, 0)
  // The routine's pace caps how many exercises each part gets (fewer, longer ones for calmer
  // routines); doses are then scaled up within their ranges to fill the time.
  const maxItems = Math.max(3, Math.ceil(target / routine.pace))
  const capFor = (phase: Phase) => Math.max(1, Math.round(maxItems * routine.shares[phase]))
  const countIn = (phase: Phase) => picked.filter((p) => p.phase === phase).length
  const fill = (phase: Phase, borrow: boolean) => {
    st.firstOfPhase = picked.every((p) => p.phase !== phase)
    while (
      spentIn(phase) < target * routine.shares[phase] * 0.85 &&
      countIn(phase) < capFor(phase)
    ) {
      if (!pickOne(phase, borrow)) break
    }
  }

  // Order matters with a small library: reserve one main exercise of its own first, then the
  // cool-down and warm-up (each borrowing only for its first pick), then fill the main part,
  // borrowing what's left. Items are put back in phase order afterwards.
  pickOne('main', false)
  for (const phase of ['cooldown', 'warmup'] as const) {
    st.firstOfPhase = true
    if (pickOne(phase, true)) fill(phase, false)
  }
  fill('main', true)
  if (!picked.some((p) => p.phase === 'main')) {
    // Nothing left for main: move the weakest item from the fuller of warm-up / cool-down.
    const donors = picked.filter((p) => picked.filter((q) => q.phase === p.phase).length > 1)
    if (donors.length > 0) donors.reduce((a, b) => (b.score < a.score ? b : a)).phase = 'main'
  }
  picked.sort((a, b) => PHASES.indexOf(a.phase) - PHASES.indexOf(b.phase))

  // Fit the time: scale doses within their ranges, then drop or add main items.
  const versionOf = (p: PlanItem) => byId.get(p.exerciseId)![p.version]!
  const total = () => picked.reduce((sum, p) => sum + p.seconds, 0)
  // Always scale from the base doses, so repeated rescales don't drift.
  const rescale = () => {
    const base = picked.reduce((sum, p) => sum + estimateSeconds(versionOf(p)), 0)
    if (base === 0) return
    const factor = target / base
    for (const p of picked) {
      const v = versionOf(p)
      p.dose = scaleDose(v.dose, factor, p.phase === 'main')
      p.seconds = secondsFor(v, p.dose)
    }
  }
  const trim = () => {
    for (let guard = 0; guard < 20 && total() > target + tolerance; guard++) {
      const mains = picked.filter((p) => p.phase === 'main')
      // Drop the weakest main item; else from any phase that has more than one item.
      const pool =
        mains.length > 1
          ? mains
          : picked.filter((p) => picked.filter((q) => q.phase === p.phase).length > 1)
      if (pool.length === 0) break
      const weakest = pool.reduce((a, b) => (b.score < a.score ? b : a))
      picked.splice(picked.indexOf(weakest), 1)
      used.remove(weakest.exerciseId, weakest.phase)
      rescale()
    }
  }
  rescale()
  trim()
  for (let guard = 0; guard < 20 && total() < target - tolerance; guard++) {
    // Short of time: add to the main part first, then the cool-down, then the warm-up
    // (e.g. Cardio, once every cardio move is in the main part).
    if (!pickOne('main', true) && !pickOne('cooldown', true) && !pickOne('warmup', true)) break
    const added = picked[picked.length - 1]
    // Back into phase order (stable, so the new item goes at the end of its part).
    picked.sort((a, b) => PHASES.indexOf(a.phase) - PHASES.indexOf(b.phase))
    rescale()
    if (total() > target + tolerance) {
      // That addition overshot and doses can't shrink further: take it back and stop.
      picked.splice(picked.indexOf(added), 1)
      used.remove(added.exerciseId, added.phase)
      rescale()
      break
    }
  }
  trim()

  // Calm morning ends on a breathing move when there is one in the cool-down.
  if (input.routine === 'calm') {
    const cool = picked.filter((p) => p.phase === 'cooldown')
    const breath = cool.find((p) => byId.get(p.exerciseId)!.tags.includes('breathing'))
    if (breath && cool[cool.length - 1] !== breath) {
      picked.splice(picked.indexOf(breath), 1)
      picked.push(breath)
    }
  }

  const items: PlanItem[] = picked.map(({ score: _score, ...rest }) => rest)
  const totalSeconds = items.reduce((sum, p) => sum + p.seconds, 0)
  return { kind: 'plan', items, totalSeconds, shortOfTime: totalSeconds < target - tolerance }
}

// ---------- Changing a kept plan (spec 006 R3) ----------

/** The best candidate for slot `index`, other than the plan's other items and `exclude`. */
function bestAlternative(
  input: PlanInput,
  ctx: Context,
  items: readonly KeptItem[],
  index: number,
  exclude: readonly string[],
): { c: Candidate; s: Scored } | null {
  const item = items[index]
  const used = new Usage()
  items.forEach((it, i) => i !== index && used.add(it.exerciseId, it.phase))
  const known = (id: string) => input.history.done.includes(id) || input.marks[id] === 'favourite'
  const others = items.filter((_, i) => i !== index)
  const mains = others.filter((it) => it.phase === 'main')
  const st: PickState = {
    phase: item.phase,
    newCount: others.filter((it) => !known(it.exerciseId)).length,
    mainCount: mains.length,
    mainStrengthCount: mains.filter((it) => {
      const e = ctx.byId.get(it.exerciseId)
      return e && (e.technique === 'strength' || e.tags.includes('balance'))
    }).length,
    firstOfPhase: false,
  }
  let best: { c: Candidate; s: Scored } | null = null
  for (const c of ctx.usable) {
    if (exclude.includes(c.exercise.id)) continue
    if (!used.canUse(c, item.phase) || !fitsPhase(c, item.phase, ctx.routine, true)) continue
    const s = score(c, input, ctx.routine, st, ctx.recentAreas)
    if (
      !best ||
      s.score > best.s.score ||
      (s.score === best.s.score && c.exercise.id < best.c.exercise.id)
    )
      best = { c, s }
  }
  return best
}

/** The candidate as a plan item filling the same time as `slot`. */
function fillSlot(slot: KeptItem, { c, s }: { c: Candidate; s: Scored }, passed: string[]) {
  const dose = scaleDose(
    c.version.dose,
    slot.seconds / Math.max(1, estimateSeconds(c.version)),
    slot.phase === 'main',
  )
  return {
    exerciseId: c.exercise.id,
    version: c.versionKey,
    dose,
    phase: slot.phase,
    reason: s.reason,
    seconds: secondsFor(c.version, dose),
    passed,
  }
}

/**
 * Swaps slot `index` for the best alternative that hasn't been in that slot yet. Once every
 * alternative has been passed, the cycle starts again. Other items are unchanged.
 */
export function swapItem(input: PlanInput, items: readonly KeptItem[], index: number): KeptItem[] {
  const item = items[index]
  if (!item) return [...items]
  const ctx = context(input)
  let passed = [...new Set([...item.passed, item.exerciseId])]
  let best = bestAlternative(input, ctx, items, index, passed)
  if (!best) {
    passed = [item.exerciseId]
    best = bestAlternative(input, ctx, items, index, passed)
  }
  if (!best) return [...items]
  const next = fillSlot(item, best, passed)
  return items.map((it, i) => (i === index ? next : it))
}

type Unfit = 'notForMe' | 'profile' | 'removed'

/** Why a kept item can't be used any more, or null if it still can. */
function unfit(input: PlanInput, ctx: Context, item: KeptItem): Unfit | null {
  const e = ctx.byId.get(item.exerciseId)
  const v = e?.[item.version]
  if (!e || !v) return 'removed'
  if (input.marks[e.id] === 'notForMe') return 'notForMe'
  const { profile } = input
  if (profile.techniques[e.technique] === 'none') return 'profile'
  if (e.loadsAreas.some((a) => profile.avoidAreas.includes(a))) return 'profile'
  const have = new Set<string>(['none', ...profile.equipment])
  if (!equipmentOf(e, v).every((q) => have.has(q))) return 'profile'
  return null
}

const UNFIT_TEXT: Record<Unfit, string> = {
  notForMe: 'is now Not for me',
  profile: 'no longer fits your profile',
  removed: 'is no longer in the library',
}

/**
 * Replaces the items of a kept plan that can no longer be used (spec 006 FR-005), each with the
 * best alternative for its part, or removes them when nothing fits. Everything else is unchanged.
 * Returns no items when nothing in the plan can be kept.
 */
export function repairPlan(
  input: PlanInput,
  items: readonly KeptItem[],
): { items: KeptItem[]; notes: string[] } {
  const ctx = context(input)
  const name = (id: string) => ctx.byId.get(id)?.name ?? 'An exercise'
  let out = [...items]
  const notes: string[] = []
  for (let i = 0; i < out.length;) {
    const why = unfit(input, ctx, out[i])
    if (!why) {
      i++
      continue
    }
    const old = out[i]
    const best = bestAlternative(input, ctx, out, i, [old.exerciseId])
    if (best) {
      out = out.map((it, j) => (j === i ? fillSlot(old, best, []) : it))
      notes.push(
        `${name(old.exerciseId)} ${UNFIT_TEXT[why]}, so it was swapped for ${best.c.exercise.name}.`,
      )
      i++
    } else {
      out = out.filter((_, j) => j !== i)
      notes.push(`${name(old.exerciseId)} ${UNFIT_TEXT[why]}; nothing else fits there.`)
    }
  }
  return { items: out, notes }
}

/** The routine with the most usable exercises, other than the requested one. */
function suggestRoutine(input: PlanInput): RoutineId | null {
  let best: RoutineId | null = null
  let bestCount = MIN_CANDIDATES - 1
  for (const id of ROUTINE_ORDER) {
    if (id === input.routine) continue
    const r = ROUTINES[id]
    const count = input.library.filter((e) => {
      const key = eligible(e, input, r)
      if (!key) return false
      const c: Candidate = { exercise: e, versionKey: key, version: e[key]!, jitter: 0 }
      return PHASES.some((p) => fitsPhase(c, p, r))
    }).length
    const hasMain = input.library.some((e) => {
      const key = eligible(e, input, r)
      return (
        key !== null &&
        fitsPhase({ exercise: e, versionKey: key, version: e[key]!, jitter: 0 }, 'main', r, true)
      )
    })
    if (count > bestCount && hasMain) {
      best = id
      bestCount = count
    }
  }
  return best
}
