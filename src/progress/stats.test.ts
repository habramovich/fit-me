import { describe, expect, it } from 'vitest'
import { estimateSeconds, getExercise } from '../exercises'
import type { SessionItem } from '../data/repo/sessions'
import {
  areaCoverage,
  recentList,
  routineLabel,
  sessionMinutes,
  sessionSeconds,
  streaks,
  techniqueMix,
  weekStart,
  weeklyMinutes,
  weekSummary,
  type StatSession,
} from './stats'

const done = (exerciseId: string, rating: SessionItem['rating'] = null): SessionItem => ({
  exerciseId,
  version: 'standard',
  outcome: 'done',
  rating,
})
const skipped = (exerciseId: string): SessionItem => ({
  exerciseId,
  version: 'standard',
  outcome: 'skipped',
  rating: null,
})

let n = 0
function session(
  at: string,
  items: SessionItem[],
  activeSeconds: number | null = 600,
  routine = 'plan:calm',
): StatSession {
  return { id: `s${n++}`, routine, startedAt: new Date(at), items, activeSeconds }
}

// Wednesday 18 Nov 2026, 9am local. The week started Monday 16 Nov.
const now = new Date('2026-11-18T09:00:00')

describe('weekStart', () => {
  it('is Monday 00:00 local, also on a Sunday and on a Monday', () => {
    expect(weekStart(now)).toEqual(new Date('2026-11-16T00:00:00'))
    expect(weekStart(new Date('2026-11-22T23:30:00'))).toEqual(new Date('2026-11-16T00:00:00'))
    expect(weekStart(new Date('2026-11-16T00:00:00'))).toEqual(new Date('2026-11-16T00:00:00'))
  })
})

describe('session minutes', () => {
  it('uses the recorded active time', () => {
    expect(sessionSeconds(session('2026-11-18T07:00:00', [done('cat-cow')], 754))).toBe(754)
    expect(sessionMinutes(session('2026-11-18T07:00:00', [done('cat-cow')], 754))).toBe(13)
  })

  it('estimates from done exercises when no time was recorded', () => {
    const catCow = estimateSeconds(getExercise('cat-cow')!.standard)
    const bridge = estimateSeconds(getExercise('glute-bridge')!.standard)
    const s = session(
      '2026-11-18T07:00:00',
      [done('cat-cow'), skipped('dead-bug'), done('glute-bridge')],
      null,
    )
    expect(sessionSeconds(s)).toBe(catCow + bridge)
  })
})

describe('weekSummary', () => {
  it('sums this week only and ignores sessions with nothing done', () => {
    const sessions = [
      session('2026-11-16T07:00:00', [done('cat-cow')], 900), // Mon: 15 min
      session('2026-11-18T07:00:00', [done('cat-cow')], 1200), // Wed: 20 min
      session('2026-11-17T07:00:00', [skipped('cat-cow')], 300), // nothing done
      session('2026-11-15T07:00:00', [done('cat-cow')], 1800), // last Sunday
    ]
    expect(weekSummary(sessions, now, 90)).toEqual({
      minutes: 35,
      sessions: 2,
      goal: 90,
      fraction: 35 / 90,
    })
  })

  it('caps the fraction at 1', () => {
    const s = [session('2026-11-17T07:00:00', [done('cat-cow')], 6000)]
    expect(weekSummary(s, now, 60).fraction).toBe(1)
  })
})

describe('streaks', () => {
  it('counts days in a row ending today; two sessions on one day count once', () => {
    const s = [
      session('2026-11-16T07:00:00', [done('a')]),
      session('2026-11-17T07:00:00', [done('a')]),
      session('2026-11-17T18:00:00', [done('a')]),
      session('2026-11-18T07:00:00', [done('a')]),
    ]
    expect(streaks(s, now)).toEqual({ current: 3, best: 3 })
  })

  it('still counts a run ending yesterday', () => {
    const s = [
      session('2026-11-16T07:00:00', [done('a')]),
      session('2026-11-17T07:00:00', [done('a')]),
    ]
    expect(streaks(s, now).current).toBe(2)
  })

  it('is broken by a whole missed day; best remembers older runs', () => {
    const s = [
      session('2026-11-08T07:00:00', [done('a')]),
      session('2026-11-09T07:00:00', [done('a')]),
      session('2026-11-10T07:00:00', [done('a')]),
      session('2026-11-11T07:00:00', [done('a')]),
      session('2026-11-16T07:00:00', [done('a')]),
      session('2026-11-17T07:00:00', [skipped('a')]), // doesn't count
    ]
    expect(streaks(s, now)).toEqual({ current: 0, best: 4 })
  })

  it('is zero with no sessions', () => {
    expect(streaks([], now)).toEqual({ current: 0, best: 0 })
  })
})

describe('weeklyMinutes', () => {
  it('gives 8 Monday weeks oldest first, with empty weeks as zero', () => {
    const s = [
      session('2026-11-17T07:00:00', [done('a')], 600),
      session('2026-11-18T07:00:00', [done('a')], 300),
      session('2026-11-08T20:00:00', [done('a')], 1200), // Sunday of the week of 2 Nov
      session('2026-09-01T07:00:00', [done('a')], 1200), // too old
    ]
    const w = weeklyMinutes(s, now)
    expect(w).toHaveLength(8)
    expect(w[0].start).toEqual(new Date('2026-09-28T00:00:00'))
    expect(w[7].start).toEqual(new Date('2026-11-16T00:00:00'))
    expect(w.map((x) => x.minutes)).toEqual([0, 0, 0, 0, 0, 20, 0, 15])
  })
})

describe('techniqueMix', () => {
  it('splits each session by its exercises and adds up to 100%', () => {
    // cat-cow is yoga, glute bridge strength, commencement tai chi.
    const ea = estimateSeconds(getExercise('cat-cow')!.standard)
    const eb = estimateSeconds(getExercise('glute-bridge')!.standard)
    const s = [
      session('2026-11-17T07:00:00', [done('cat-cow'), done('glute-bridge')], 1200),
      session('2026-11-10T07:00:00', [done('tai-chi-commencement')], 600),
      session('2026-10-01T07:00:00', [done('glute-bridge')], 6000), // before the 4 weeks
    ]
    const mix = techniqueMix(s, now)
    expect(mix.map((m) => m.technique)).toEqual(['yoga', 'taichi', 'strength'])
    const by = Object.fromEntries(mix.map((m) => [m.technique, m]))
    // 1200 s split by the two exercises' estimated lengths.
    expect(by.yoga.minutes).toBe(Math.round((1200 * ea) / (ea + eb) / 60))
    expect(by.strength.minutes).toBe(Math.round((1200 * eb) / (ea + eb) / 60))
    expect(by.taichi.minutes).toBe(10)
    expect(mix.reduce((sum, m) => sum + m.percent, 0)).toBe(100)
    expect(by.taichi.percent).toBe(Math.round((600 / 1800) * 100))
  })

  it('is empty with no sessions', () => {
    expect(techniqueMix([], now)).toEqual([])
  })

  it('rounds three equal shares to 34/33/33', () => {
    const s = [
      session('2026-11-17T07:00:00', [done('cat-cow')], 600),
      session('2026-11-17T08:00:00', [done('glute-bridge')], 600),
      session('2026-11-17T09:00:00', [done('tai-chi-commencement')], 600),
    ]
    expect(
      techniqueMix(s, now)
        .map((m) => m.percent)
        .sort(),
    ).toEqual([33, 33, 34])
  })
})

describe('areaCoverage', () => {
  it('counts areas from the last 7 days, focus first, and lists the rest', () => {
    const s = [
      session('2026-11-17T07:00:00', [done('shoulder-rotations'), done('hip-circles')]),
      session('2026-11-18T07:00:00', [done('shoulder-rotations'), skipped('calf-raises')]),
      session('2026-11-05T07:00:00', [done('calf-raises')]), // too old
    ]
    const c = areaCoverage(s, now, ['shoulders', 'hips', 'calves'])
    const shoulders = c.worked.find((w) => w.area === 'shoulders')
    expect(shoulders).toEqual({ area: 'shoulders', count: 2, focus: true })
    expect(c.worked.find((w) => w.area === 'hips')?.focus).toBe(true)
    // Focus areas come first.
    const firstNonFocus = c.worked.findIndex((w) => !w.focus)
    expect(
      c.worked.slice(firstNonFocus === -1 ? c.worked.length : firstNonFocus).every((w) => !w.focus),
    ).toBe(true)
    // Calves weren't worked this week and are a focus area, so they lead the list.
    expect(c.notWorked[0]).toEqual({ area: 'calves', focus: true })
    const all = [...c.worked.map((w) => w.area), ...c.notWorked.map((w) => w.area)]
    expect(new Set(all).size).toBe(all.length)
  })
})

describe('recentList', () => {
  it('lists counted sessions newest first with counts and ratings', () => {
    const s = [
      session('2026-11-16T07:00:00', [done('a', 'easy'), done('b', 'right'), skipped('c')], 600),
      session('2026-11-18T07:00:00', [done('a', 'hard')], 120, 'single:cat-cow'),
      session('2026-11-17T07:00:00', [skipped('a')]),
    ]
    const r = recentList(s)
    expect(r.map((x) => x.routine)).toEqual(['single:cat-cow', 'plan:calm'])
    expect(r[1]).toMatchObject({
      minutes: 10,
      done: 2,
      skipped: 1,
      ratings: { easy: 1, right: 1, hard: 0 },
    })
  })

  it('keeps at most n', () => {
    const s = Array.from({ length: 12 }, (_, i) =>
      session(`2026-11-${String(i + 1).padStart(2, '0')}T07:00:00`, [done('a')]),
    )
    expect(recentList(s)).toHaveLength(10)
  })
})

describe('routineLabel', () => {
  const names = (id: string) => (id === 'x1' ? 'Morning flow' : undefined)
  it('names routines, plans, single exercises and sets', () => {
    expect(routineLabel('sample', names)).toBe('Sample routine')
    expect(routineLabel('plan:calm', names)).toBe('Calm morning')
    expect(routineLabel('single:cat-cow', names)).toBe(getExercise('cat-cow')!.name)
    expect(routineLabel('set:x1', names)).toBe('Morning flow')
    expect(routineLabel('set:gone', names)).toBe('Saved set')
  })
})
