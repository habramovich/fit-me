// Pure session-player state machine. See specs/002-exercise-library-player/data-model.md.
import type { Dose, VersionKey } from '../exercises/types'

export interface PlayItem {
  exerciseId: string
  version: VersionKey
  dose: Dose
}

export type Rating = 'easy' | 'right' | 'hard'

export interface Outcome {
  outcome: 'done' | 'skipped'
  rating: Rating | null
}

export type PlayerPhase = 'doing' | 'switchSide' | 'rating' | 'finished'

export interface PlayerState {
  items: PlayItem[]
  index: number
  set: number
  side: 1 | 2
  /** Seconds left: countdown for timed exercises, or for the side-switch prompt. */
  remaining: number
  paused: boolean
  phase: PlayerPhase
  outcomes: (Outcome | undefined)[]
  /** Active (unpaused) seconds since the start, for the summary. */
  elapsed: number
}

export type PlayerEvent =
  | { type: 'tick' }
  | { type: 'setDone' }
  | { type: 'finishEarly' }
  | { type: 'continueSide' }
  /** `null`: done without a rating (Skip next time, spec 006 US3). */
  | { type: 'rate'; rating: Rating | null }
  | { type: 'skip' }
  | { type: 'back' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'hidden' }

export const SWITCH_SIDE_SECONDS = 5

const secondsOf = (dose: Dose) => (dose.kind === 'time' ? dose.seconds : 0)

function goTo(s: PlayerState, index: number): PlayerState {
  if (index >= s.items.length) return { ...s, phase: 'finished', paused: false }
  return {
    ...s,
    index,
    set: 1,
    side: 1,
    remaining: secondsOf(s.items[index].dose),
    paused: false,
    phase: 'doing',
  }
}

export function initPlayer(items: PlayItem[]): PlayerState {
  const base: PlayerState = {
    items,
    index: 0,
    set: 1,
    side: 1,
    remaining: 0,
    paused: false,
    phase: 'doing',
    outcomes: items.map(() => undefined),
    elapsed: 0,
  }
  return goTo(base, 0)
}

/** The current exercise (or side) is complete: switch sides or ask for a rating. */
function complete(s: PlayerState): PlayerState {
  const dose = s.items[s.index].dose
  if (dose.perSide && s.side === 1) {
    return { ...s, phase: 'switchSide', remaining: SWITCH_SIDE_SECONDS }
  }
  return { ...s, phase: 'rating', remaining: 0 }
}

function startSide2(s: PlayerState): PlayerState {
  return {
    ...s,
    side: 2,
    set: 1,
    remaining: secondsOf(s.items[s.index].dose),
    phase: 'doing',
  }
}

function withOutcome(s: PlayerState, outcome: Outcome): PlayerState {
  const outcomes = s.outcomes.slice()
  outcomes[s.index] = outcome
  return { ...s, outcomes }
}

export function playerReducer(s: PlayerState, e: PlayerEvent): PlayerState {
  if (s.phase === 'finished') return s
  const dose = s.items[s.index].dose

  switch (e.type) {
    case 'tick': {
      if (s.paused) return s
      const t = { ...s, elapsed: s.elapsed + 1 }
      if (t.phase === 'switchSide') {
        return t.remaining <= 1 ? startSide2(t) : { ...t, remaining: t.remaining - 1 }
      }
      if (t.phase !== 'doing' || dose.kind !== 'time') return t
      return t.remaining <= 1
        ? complete({ ...t, remaining: 0 })
        : { ...t, remaining: t.remaining - 1 }
    }
    case 'setDone':
      if (s.phase !== 'doing' || dose.kind !== 'reps') return s
      return s.set < dose.sets ? { ...s, set: s.set + 1 } : complete(s)
    case 'finishEarly':
      if (s.phase !== 'doing' || dose.kind !== 'time') return s
      return complete(s)
    case 'continueSide':
      return s.phase === 'switchSide' ? startSide2(s) : s
    case 'rate':
      if (s.phase !== 'rating') return s
      return goTo(withOutcome(s, { outcome: 'done', rating: e.rating }), s.index + 1)
    case 'skip':
      return goTo(withOutcome(s, { outcome: 'skipped', rating: null }), s.index + 1)
    case 'back':
      return s.index === 0 ? s : goTo(s, s.index - 1)
    case 'pause':
    case 'hidden':
      return s.phase === 'doing' || s.phase === 'switchSide' ? { ...s, paused: true } : s
    case 'resume':
      return { ...s, paused: false }
  }
}

export function summary(s: PlayerState) {
  const done = s.outcomes.filter((o) => o?.outcome === 'done').length
  const skipped = s.outcomes.filter((o) => o?.outcome === 'skipped').length
  const rated = s.outcomes.filter((o) => o?.rating).length
  return {
    done,
    skipped,
    rated,
    total: s.items.length,
    minutes: Math.max(1, Math.round(s.elapsed / 60)),
  }
}
