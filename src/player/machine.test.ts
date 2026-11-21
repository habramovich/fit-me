import { describe, expect, it } from 'vitest'
import type { Dose } from '../exercises/types'
import {
  GET_READY_SECONDS,
  SWITCH_SIDE_SECONDS,
  initPlayer,
  playerReducer,
  summary,
  type PlayItem,
  type PlayerState,
} from './machine'

const reps = (r: number, sets: number, perSide = false): Dose => ({
  kind: 'reps',
  reps: r,
  range: [1, 50],
  sets,
  perSide,
})
const time = (s: number, perSide = false): Dose => ({
  kind: 'time',
  seconds: s,
  range: [5, 300],
  perSide,
})

const items: PlayItem[] = [
  { exerciseId: 'a', version: 'standard', dose: reps(10, 2) },
  { exerciseId: 'b', version: 'standard', dose: time(3) },
  { exerciseId: 'c', version: 'easier', dose: time(2, true) },
]

const run = (s: PlayerState, ...events: Parameters<typeof playerReducer>[1][]) =>
  events.reduce(playerReducer, s)

/** Ends Get ready before a timed exercise (011). */
const ready = { type: 'startNow' } as const

describe('player machine', () => {
  it('starts on the first exercise, set 1, side 1', () => {
    const s = initPlayer(items)
    expect(s).toMatchObject({ index: 0, set: 1, side: 1, phase: 'doing', paused: false })
  })

  it('advances sets on Set done, then asks for a rating', () => {
    let s = run(initPlayer(items), { type: 'setDone' })
    expect(s).toMatchObject({ set: 2, phase: 'doing' })
    s = run(s, { type: 'setDone' })
    expect(s.phase).toBe('rating')
  })

  it('records the rating and moves on', () => {
    const s = run(
      initPlayer(items),
      { type: 'setDone' },
      { type: 'setDone' },
      { type: 'rate', rating: 'easy' },
    )
    expect(s.index).toBe(1)
    expect(s).toMatchObject({ phase: 'getReady', remaining: GET_READY_SECONDS })
    expect(run(s, ready).remaining).toBe(3)
    expect(s.outcomes[0]).toEqual({ outcome: 'done', rating: 'easy' })
  })

  it('counts down timed exercises and asks for a rating at zero', () => {
    let s = run(initPlayer(items), { type: 'skip' }, ready)
    s = run(s, { type: 'tick' }, { type: 'tick' })
    expect(s.remaining).toBe(1)
    s = run(s, { type: 'tick' })
    expect(s.phase).toBe('rating')
  })

  it('does not count down while paused', () => {
    let s = run(initPlayer(items), { type: 'skip' }, ready, { type: 'pause' }, { type: 'tick' })
    expect(s.remaining).toBe(3)
    s = run(s, { type: 'resume' }, { type: 'tick' })
    expect(s.remaining).toBe(2)
  })

  it('pauses when the app is hidden', () => {
    const s = run(initPlayer(items), { type: 'hidden' })
    expect(s.paused).toBe(true)
  })

  it('finishes timed exercises early', () => {
    const s = run(initPlayer(items), { type: 'skip' }, ready, { type: 'finishEarly' })
    expect(s.phase).toBe('rating')
  })

  it('prompts a side switch for per-side exercises, then runs side 2', () => {
    let s = run(initPlayer(items), { type: 'skip' }, { type: 'skip' }, ready)
    expect(s).toMatchObject({ index: 2, side: 1, remaining: 2 })
    s = run(s, { type: 'tick' }, { type: 'tick' })
    expect(s.phase).toBe('switchSide')
    s = run(s, { type: 'continueSide' })
    expect(s).toMatchObject({ phase: 'doing', side: 2, remaining: 2, set: 1 })
    s = run(s, { type: 'finishEarly' })
    expect(s.phase).toBe('rating')
  })

  it('continues to side 2 by itself after the switch countdown', () => {
    let s = run(initPlayer(items), { type: 'skip' }, { type: 'skip' }, ready, {
      type: 'finishEarly',
    })
    expect(s.phase).toBe('switchSide')
    for (let i = 0; i < SWITCH_SIDE_SECONDS; i++) s = run(s, { type: 'tick' })
    expect(s).toMatchObject({ phase: 'doing', side: 2 })
  })

  it('records skips without a rating', () => {
    const s = run(initPlayer(items), { type: 'skip' })
    expect(s.outcomes[0]).toEqual({ outcome: 'skipped', rating: null })
  })

  it('goes back to the start of the previous exercise; no-op on the first', () => {
    expect(run(initPlayer(items), { type: 'back' }).index).toBe(0)
    const s = run(initPlayer(items), { type: 'skip' }, { type: 'tick' }, { type: 'back' })
    expect(s).toMatchObject({ index: 0, set: 1, phase: 'doing' })
  })

  it('finishes after the last exercise and summarises', () => {
    const s = run(
      initPlayer(items),
      { type: 'setDone' },
      { type: 'setDone' },
      { type: 'rate', rating: 'right' },
      { type: 'skip' },
      ready,
      { type: 'finishEarly' },
      { type: 'continueSide' },
      { type: 'finishEarly' },
      { type: 'rate', rating: 'hard' },
    )
    expect(s.phase).toBe('finished')
    expect(summary(s)).toEqual({ done: 2, skipped: 1, rated: 2, total: 3, minutes: 1 })
  })

  it('records Skip next time as done without a rating (006 US3)', () => {
    const s = run(
      initPlayer(items),
      { type: 'setDone' },
      { type: 'setDone' },
      { type: 'rate', rating: null },
    )
    expect(s.outcomes[0]).toEqual({ outcome: 'done', rating: null })
    expect(s.index).toBe(1)
    expect(summary(s)).toMatchObject({ done: 1, rated: 0 })
  })

  it('counts active seconds only, not paused time', () => {
    const s = run(
      initPlayer(items),
      { type: 'tick' },
      { type: 'pause' },
      { type: 'tick' },
      { type: 'resume' },
      { type: 'tick' },
    )
    expect(s.elapsed).toBe(2)
  })

  it('ignores events that do not apply', () => {
    const s = initPlayer(items)
    expect(run(s, { type: 'rate', rating: 'easy' })).toBe(s) // not in rating phase
    expect(run(s, { type: 'finishEarly' })).toBe(s) // reps exercise
    expect(run(s, { type: 'continueSide' })).toBe(s)
  })

  describe('Get ready (011)', () => {
    const timedFirst: PlayItem[] = [
      { exerciseId: 'b', version: 'standard', dose: time(30) },
      { exerciseId: 'a', version: 'standard', dose: reps(10, 1) },
      { exerciseId: 'c', version: 'standard', dose: time(20, true) },
    ]

    it('starts a timed first exercise with Get ready, its clock not yet running', () => {
      const s = initPlayer(timedFirst)
      expect(s).toMatchObject({ phase: 'getReady', remaining: GET_READY_SECONDS, index: 0 })
    })

    it('starts the exercise clock at its full time when Get ready runs out', () => {
      let s = initPlayer(timedFirst)
      for (let i = 0; i < GET_READY_SECONDS - 1; i++) s = run(s, { type: 'tick' })
      expect(s).toMatchObject({ phase: 'getReady', remaining: 1 })
      s = run(s, { type: 'tick' })
      expect(s).toMatchObject({ phase: 'doing', remaining: 30 })
    })

    it('starts at once on Start now', () => {
      expect(run(initPlayer(timedFirst), ready)).toMatchObject({ phase: 'doing', remaining: 30 })
    })

    it('ignores Finish early during Get ready', () => {
      const s = initPlayer(timedFirst)
      expect(run(s, { type: 'finishEarly' })).toBe(s)
    })

    it('stops counting while paused or hidden', () => {
      let s = run(initPlayer(timedFirst), { type: 'hidden' }, { type: 'tick' })
      expect(s).toMatchObject({ paused: true, remaining: GET_READY_SECONDS })
      s = run(s, { type: 'resume' }, { type: 'tick' })
      expect(s.remaining).toBe(GET_READY_SECONDS - 1)
    })

    it('can be skipped, and going back to a timed exercise gets ready again', () => {
      let s = run(initPlayer(timedFirst), { type: 'skip' })
      expect(s).toMatchObject({ index: 1, phase: 'doing' }) // reps: no Get ready
      s = run(s, { type: 'back' })
      expect(s).toMatchObject({ index: 0, phase: 'getReady' })
    })

    it('uses Switch sides, not Get ready, before the second side', () => {
      let s = run(initPlayer(timedFirst), { type: 'skip' }, { type: 'skip' })
      expect(s).toMatchObject({ index: 2, phase: 'getReady' })
      s = run(s, ready, { type: 'finishEarly' })
      expect(s.phase).toBe('switchSide')
      s = run(s, { type: 'continueSide' })
      expect(s).toMatchObject({ phase: 'doing', side: 2, remaining: 20 })
    })

    it('counts Get ready seconds toward session time', () => {
      const s = run(initPlayer(timedFirst), { type: 'tick' }, { type: 'tick' })
      expect(s.elapsed).toBe(2)
    })
  })

  it('handles an empty list', () => {
    expect(initPlayer([]).phase).toBe('finished')
  })
})
