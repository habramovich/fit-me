import { describe, expect, it } from 'vitest'
import type { Dose } from '../exercises/types'
import {
  GET_READY_SECONDS,
  SWITCH_SIDE_SECONDS,
  initPlayer,
  playerReducer,
  type PlayerEvent,
  type PlayerState,
} from '../player/machine'
import { cueFor, type Cue } from './cues'

const time = (seconds: number, perSide = false): Dose => ({
  kind: 'time',
  seconds,
  range: [5, 300],
  perSide,
})
const reps = (r: number, sets: number): Dose => ({
  kind: 'reps',
  reps: r,
  range: [1, 50],
  sets,
  perSide: false,
})

function play(doses: Dose[], events: PlayerEvent[]): (Cue | null)[] {
  let s: PlayerState = initPlayer(
    doses.map((dose, i) => ({ exerciseId: `e${i}`, version: 'standard', dose })),
  )
  return events.map((e) => {
    const next = playerReducer(s, e)
    const cue = cueFor(s, next)
    s = next
    return cue
  })
}

const ticks = (n: number): PlayerEvent[] => Array.from({ length: n }, () => ({ type: 'tick' }))
const ready: PlayerEvent = { type: 'startNow' }

describe('cueFor', () => {
  it('ticks the last 3 seconds of a hold, then chimes', () => {
    expect(play([time(5), reps(5, 1)], [ready, ...ticks(5)])).toEqual([
      'start',
      null,
      'tick',
      'tick',
      'tick',
      'chime',
    ])
  })

  it('plays switch, then start for the second side', () => {
    const cues = play([time(4, true)], [ready, ...ticks(4), ...ticks(SWITCH_SIDE_SECONDS)])
    expect(cues.slice(0, 5)).toEqual(['start', 'tick', 'tick', 'tick', 'switch'])
    expect(cues.slice(5)).toEqual([null, null, null, null, 'start'])
  })

  it('plays start when the next exercise begins', () => {
    expect(
      play([reps(5, 1), reps(5, 1)], [{ type: 'setDone' }, { type: 'rate', rating: 'right' }]),
    ).toEqual([null, 'start'])
    expect(play([reps(5, 1), reps(5, 1)], [{ type: 'skip' }])).toEqual(['start'])
    expect(play([reps(5, 1), reps(5, 1)], [{ type: 'skip' }, { type: 'back' }])).toEqual([
      'start',
      'start',
    ])
  })

  it('stays quiet while paused, between sets and at the end', () => {
    expect(play([time(5)], [{ type: 'pause' }, ...ticks(5)])).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
    ])
    expect(play([reps(5, 2)], [{ type: 'setDone' }])).toEqual([null])
    expect(play([reps(5, 1)], [{ type: 'setDone' }, { type: 'rate', rating: 'easy' }])).toEqual([
      null,
      null,
    ])
  })

  it('does not chime when the person finishes early', () => {
    expect(play([time(30)], [ready, { type: 'finishEarly' }])).toEqual(['start', null])
  })

  it('plays switch for Get ready before a timed exercise, then start (011)', () => {
    const cues = play(
      [reps(5, 1), time(30)],
      [{ type: 'setDone' }, { type: 'rate', rating: 'right' }, ...ticks(GET_READY_SECONDS)],
    )
    expect(cues).toEqual([null, 'switch', null, null, null, null, 'start'])
    expect(play([reps(5, 1), time(30)], [{ type: 'skip' }, ready])).toEqual(['switch', 'start'])
  })
})
