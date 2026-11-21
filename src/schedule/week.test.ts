import { describe, expect, it } from 'vitest'
import type { SessionItem } from '../data/repo/sessions'
import type { Attendance, ClassItem, HomeItem, ScheduleDraft } from './types'
import {
  canMarkAttendance,
  covers,
  dateKey,
  isoWeekday,
  mondayOf,
  plannedChoice,
  todayEntries,
  validateItem,
  weekOccurrences,
} from './week'

const pilates: ClassItem = {
  id: 'p',
  kind: 'class',
  name: 'Pilates',
  type: 'strength',
  days: [2, 4],
  start: '18:00',
  minutes: 60,
}
const yoga: ClassItem = {
  id: 'y',
  kind: 'class',
  name: 'Yoga',
  type: 'yoga',
  days: [2],
  start: '09:00',
  minutes: 60,
}
const calm: HomeItem = {
  id: 'c',
  kind: 'home',
  routine: 'calm',
  days: [1, 2, 3, 4, 5],
  start: '07:30',
  minutes: 15,
}
const desk = (id: string, start: string): HomeItem => ({
  id,
  kind: 'home',
  routine: 'desk',
  days: [2],
  start,
  minutes: 5,
})

// Tuesday 24 Nov 2026, 12:00.
const TUE = new Date(2026, 10, 24, 12, 0)

const record = (over: Partial<Attendance>): Attendance => ({
  id: 'p_2026-11-24',
  classId: 'p',
  date: '2026-11-24',
  status: 'attended',
  minutes: 60,
  name: 'Pilates',
  type: 'strength',
  start: '18:00',
  ...over,
})

const done: SessionItem = {
  exerciseId: 'cat-cow',
  version: 'standard',
  outcome: 'done',
  rating: null,
}
const skipped: SessionItem = { ...done, outcome: 'skipped' }

describe('dates', () => {
  it('numbers weekdays Monday 1 to Sunday 7 and finds the Monday', () => {
    expect(isoWeekday(new Date(2026, 10, 23))).toBe(1)
    expect(isoWeekday(new Date(2026, 10, 29))).toBe(7)
    expect(dateKey(mondayOf(new Date(2026, 10, 29, 23)))).toBe('2026-11-23')
    expect(dateKey(mondayOf(TUE))).toBe('2026-11-23')
  })
})

describe('weekOccurrences', () => {
  it('puts items on their weekdays in start order', () => {
    const week = weekOccurrences([pilates, yoga, calm], mondayOf(TUE))
    expect(week.map((d) => d.dateKey)).toEqual([
      '2026-11-23',
      '2026-11-24',
      '2026-11-25',
      '2026-11-26',
      '2026-11-27',
      '2026-11-28',
      '2026-11-29',
    ])
    expect(week[1].occurrences.map((o) => o.item.id)).toEqual(['c', 'y', 'p'])
    expect(week[3].occurrences.map((o) => o.item.id)).toEqual(['c', 'p'])
    expect(week[5].occurrences).toEqual([])
    expect(week[1].occurrences[2].endsAt.getHours()).toBe(19)
  })

  it('crosses a month end', () => {
    const week = weekOccurrences([pilates], new Date(2026, 10, 30))
    expect(week[1].dateKey).toBe('2026-12-01')
    expect(week[1].occurrences).toHaveLength(1)
  })

  it('keeps wall-clock times across a daylight-saving change', () => {
    // The week of the last Sunday in March (a DST change in much of Europe).
    const week = weekOccurrences([{ ...calm, days: [7] }], new Date(2026, 2, 23))
    expect(week[6].occurrences[0].startsAt.getHours()).toBe(7)
    expect(week[6].occurrences[0].startsAt.getMinutes()).toBe(30)
  })
})

describe('validateItem', () => {
  const draft = (over: Partial<ScheduleDraft>): ScheduleDraft =>
    ({ ...pilates, ...over }) as ScheduleDraft

  it('accepts a valid class and home session', () => {
    expect(validateItem(draft({}))).toEqual({})
    expect(validateItem({ ...calm })).toEqual({})
  })

  it('needs a name of 1–40 characters', () => {
    expect(validateItem(draft({ name: '   ' })).name).toBeDefined()
    expect(validateItem(draft({ name: 'x'.repeat(41) })).name).toBeDefined()
    expect(validateItem(draft({ name: ' ' + 'x'.repeat(40) + ' ' })).name).toBeUndefined()
  })

  it('needs a day and a start time', () => {
    expect(validateItem(draft({ days: [] })).days).toBeDefined()
    expect(validateItem(draft({ start: '' })).start).toBeDefined()
    expect(validateItem(draft({ start: '25:00' })).start).toBeDefined()
  })

  it('keeps minutes in range and a class ending by midnight', () => {
    expect(validateItem(draft({ minutes: 4 })).minutes).toBeDefined()
    expect(validateItem(draft({ minutes: 241 })).minutes).toBeDefined()
    expect(validateItem(draft({ minutes: NaN })).minutes).toBeDefined()
    expect(validateItem(draft({ start: '23:00', minutes: 60 })).minutes).toBeUndefined()
    expect(validateItem(draft({ start: '23:30', minutes: 60 })).minutes).toBe(
      'The class must end by midnight.',
    )
    expect(validateItem({ ...calm, minutes: 95 }).minutes).toBeDefined()
  })
})

describe('todayEntries and plannedChoice', () => {
  it('lists only today’s items, with passed and class status', () => {
    const entries = todayEntries([pilates, yoga, calm], [record({})], [], TUE)
    expect(entries.map((e) => [e.occurrence.item.id, e.status, e.passed])).toEqual([
      ['c', 'open', true],
      ['y', 'open', true],
      ['p', 'attended', false],
    ])
    expect(todayEntries([pilates], [], [], new Date(2026, 10, 25, 9))).toEqual([])
  })

  it('ticks a home session from a counted plan session of its routine today', () => {
    const today = (routine: string, items: SessionItem[], startedAt = TUE) => ({
      routine,
      startedAt,
      items,
    })
    const status = (sessions: ReturnType<typeof today>[]) =>
      todayEntries([calm], [], sessions, TUE)[0].status
    expect(status([today('plan:calm', [done])])).toBe('done')
    expect(status([today('plan:calm', [skipped])])).toBe('open')
    expect(status([today('plan:desk', [done])])).toBe('open')
    expect(status([today('set:abc', [done])])).toBe('open')
    expect(status([today('plan:calm', [done], new Date(2026, 10, 23, 8))])).toBe('open')
  })

  it('ticks the first N slots of a routine for N sessions', () => {
    const entries = todayEntries(
      [desk('d2', '15:00'), desk('d1', '10:00')],
      [],
      [{ routine: 'plan:desk', startedAt: TUE, items: [done] }],
      TUE,
    )
    expect(entries.map((e) => [e.occurrence.item.id, e.status])).toEqual([
      ['d1', 'done'],
      ['d2', 'open'],
    ])
    expect(plannedChoice(entries)).toEqual({ routine: 'desk', minutes: 5 })
  })

  it('picks the first open home session, ignoring classes', () => {
    const entries = todayEntries([pilates, calm, desk('d', '10:00')], [], [], TUE)
    expect(plannedChoice(entries)).toEqual({ routine: 'calm', minutes: 15 })
    expect(plannedChoice(todayEntries([pilates], [], [], TUE))).toBeNull()
    const allDone = todayEntries(
      [calm],
      [],
      [{ routine: 'plan:calm', startedAt: TUE, items: [done] }],
      TUE,
    )
    expect(plannedChoice(allDone)).toBeNull()
  })
})

describe('canMarkAttendance', () => {
  it('allows Monday of last week up to today', () => {
    expect(canMarkAttendance('2026-11-24', TUE)).toBe(true)
    expect(canMarkAttendance('2026-11-16', TUE)).toBe(true)
    expect(canMarkAttendance('2026-11-15', TUE)).toBe(false)
    expect(canMarkAttendance('2026-11-25', TUE)).toBe(false)
  })

  it('works on a Monday and a Sunday', () => {
    const mon = new Date(2026, 10, 23, 8)
    expect(canMarkAttendance('2026-11-16', mon)).toBe(true)
    expect(canMarkAttendance('2026-11-15', mon)).toBe(false)
    const sun = new Date(2026, 10, 29, 20)
    expect(canMarkAttendance('2026-11-16', sun)).toBe(true)
    expect(canMarkAttendance('2026-11-29', sun)).toBe(true)
  })
})

describe('covers', () => {
  it('covers today’s classes not skipped, and yesterday’s attended ones', () => {
    expect(covers([pilates, yoga], [], TUE)).toEqual([
      { name: 'Yoga', type: 'yoga', when: 'today' },
      { name: 'Pilates', type: 'strength', when: 'today' },
    ])
    expect(covers([pilates], [record({ status: 'skipped' })], TUE)).toEqual([])
    const wed = new Date(2026, 10, 25, 8)
    expect(covers([pilates], [record({})], wed)).toEqual([
      { name: 'Pilates', type: 'strength', when: 'yesterday' },
    ])
    expect(covers([pilates], [record({ status: 'skipped' })], wed)).toEqual([])
  })

  it('counts a deleted class’s attendance, leaves out Other, one per technique', () => {
    const wed = new Date(2026, 10, 25, 8)
    expect(covers([], [record({ name: 'Old class' })], wed)).toEqual([
      { name: 'Old class', type: 'strength', when: 'yesterday' },
    ])
    expect(covers([{ ...pilates, type: 'other' }], [], TUE)).toEqual([])
    const thu = new Date(2026, 10, 26, 8)
    expect(covers([pilates], [record({ id: 'p_2026-11-25', date: '2026-11-25' })], thu)).toEqual([
      { name: 'Pilates', type: 'strength', when: 'today' },
    ])
  })
})
