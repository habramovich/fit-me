import { describe, expect, it } from 'vitest'
import { summariseHistory, todayKey } from './history'

const item = (exerciseId: string, outcome: 'done' | 'skipped' = 'done') => ({
  exerciseId,
  version: 'standard' as const,
  outcome,
  rating: null,
})

describe('summariseHistory', () => {
  const now = new Date('2026-11-16T08:00:00')
  it('splits done, yesterday and the last 7 days; ignores skipped', () => {
    const h = summariseHistory(
      [
        { startedAt: new Date('2026-11-15T07:00:00'), items: [item('a'), item('b', 'skipped')] },
        { startedAt: new Date('2026-11-12T07:00:00'), items: [item('c')] },
        { startedAt: new Date('2026-11-05T07:00:00'), items: [item('d')] },
      ],
      now,
    )
    expect(h.yesterday).toEqual(['a'])
    expect(h.recent.sort()).toEqual(['a', 'c'])
    expect(h.done.sort()).toEqual(['a', 'c', 'd'])
  })

  it('formats today as YYYY-MM-DD in local time', () => {
    expect(todayKey(now)).toBe('2026-11-16')
  })
})
