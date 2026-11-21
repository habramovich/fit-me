// Pure schedule rules (010): the week, today's entries, the planned choice, planner covers and
// validation. Dates are local "YYYY-MM-DD"; times are local "HH:MM" (research R3).
import type { PastSession } from '../data/repo/sessions'
import type { Technique } from '../exercises/types'
import type { Cover } from '../planner/plan'
import { todayKey } from '../planner/history'
import type { RoutineId } from '../profile/types'
import {
  CLASS_MINUTES,
  HOME_MINUTES,
  NAME_MAX,
  type Attendance,
  type ClassItem,
  type ScheduleDraft,
  type ScheduleItem,
  type Weekday,
} from './types'

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const DAY_MINUTES = 24 * 60

export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

export const startOfDay = (d: Date) => addDays(d, 0)

/** ISO weekday of a date: 1 Monday … 7 Sunday. */
export const isoWeekday = (d: Date) => (((d.getDay() + 6) % 7) + 1) as Weekday

/** Monday 00:00 of the week containing `d`. */
export const mondayOf = (d: Date) => addDays(d, 1 - isoWeekday(d))

export const dateKey = (d: Date) => todayKey(d)

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Minutes since midnight for "HH:MM", or NaN. */
export function minutesOf(start: string): number {
  if (!TIME.test(start)) return NaN
  const [h, m] = start.split(':').map(Number)
  return h * 60 + m
}

/** The local moment of `start` on `date` (wall-clock, so DST never shifts it). */
export function at(date: Date, start: string): Date {
  const m = minutesOf(start)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(m / 60), m % 60)
}

export const attendanceId = (classId: string, date: string) => `${classId}_${date}`

export function itemName(item: ScheduleItem, routineName: (r: RoutineId) => string): string {
  return item.kind === 'class' ? item.name : routineName(item.routine)
}

// ---------- The week ----------

const dayMonth = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' })

/** The week's dates in the reader's locale, e.g. "Nov 16 – 22" or "16–22 Nov". */
export function weekRange(monday: Date): string {
  return dayMonth.formatRange(monday, addDays(monday, 6))
}

export interface Occurrence {
  item: ScheduleItem
  dateKey: string
  startsAt: Date
  endsAt: Date
}

export interface DayOccurrences {
  date: Date
  dateKey: string
  weekday: Weekday
  occurrences: Occurrence[]
}

function occurrencesOn(items: readonly ScheduleItem[], date: Date): Occurrence[] {
  const weekday = isoWeekday(date)
  const key = dateKey(date)
  return items
    .filter((i) => i.days.includes(weekday) && TIME.test(i.start))
    .map((item) => {
      const startsAt = at(date, item.start)
      return {
        item,
        dateKey: key,
        startsAt,
        endsAt: new Date(startsAt.getTime() + item.minutes * 60_000),
      }
    })
    .sort(
      (a, b) =>
        a.startsAt.getTime() - b.startsAt.getTime() ||
        (a.item.kind === 'class' ? a.item.name : a.item.routine).localeCompare(
          b.item.kind === 'class' ? b.item.name : b.item.routine,
        ),
    )
}

/** The 7 days from `monday`, each with its items in start order. */
export function weekOccurrences(items: readonly ScheduleItem[], monday: Date): DayOccurrences[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i)
    return {
      date,
      dateKey: dateKey(date),
      weekday: isoWeekday(date),
      occurrences: occurrencesOn(items, date),
    }
  })
}

// ---------- Attendance ----------

/** Attendance can be set from Monday of last week up to today (FR-008). */
export function canMarkAttendance(key: string, now: Date): boolean {
  return key >= dateKey(addDays(mondayOf(now), -7)) && key <= dateKey(now)
}

export function attendanceFor(
  item: ClassItem,
  key: string,
  attendance: readonly Attendance[],
): Attendance | undefined {
  return attendance.find((a) => a.id === attendanceId(item.id, key))
}

// ---------- Today ----------

export type EntryStatus = 'open' | 'done' | 'attended' | 'skipped'

export interface TodayEntry {
  occurrence: Occurrence
  status: EntryStatus
  /** The item has ended. */
  passed: boolean
}

export type TodaySession = Pick<PastSession, 'routine' | 'startedAt' | 'items'>

/**
 * A day's items with their status. A home session is done when a counted session of its routine
 * started that day; N such sessions tick the first N slots of that routine (research R4).
 */
export function dayEntries(
  items: readonly ScheduleItem[],
  attendance: readonly Attendance[],
  sessions: readonly TodaySession[],
  day: Date,
  now: Date,
): TodayEntry[] {
  const key = dateKey(day)
  const doneByRoutine = new Map<string, number>()
  for (const s of sessions) {
    if (dateKey(s.startedAt) !== key || !s.routine.startsWith('plan:')) continue
    if (!s.items.some((i) => i.outcome === 'done')) continue
    const r = s.routine.slice(5)
    doneByRoutine.set(r, (doneByRoutine.get(r) ?? 0) + 1)
  }
  return occurrencesOn(items, startOfDay(day)).map((occurrence) => {
    const { item } = occurrence
    let status: EntryStatus = 'open'
    if (item.kind === 'class') {
      status = attendanceFor(item, key, attendance)?.status ?? 'open'
    } else {
      const left = doneByRoutine.get(item.routine) ?? 0
      if (left > 0) {
        status = 'done'
        doneByRoutine.set(item.routine, left - 1)
      }
    }
    return { occurrence, status, passed: occurrence.endsAt.getTime() < now.getTime() }
  })
}

/** Today's items with their status. */
export function todayEntries(
  items: readonly ScheduleItem[],
  attendance: readonly Attendance[],
  sessions: readonly TodaySession[],
  now: Date,
): TodayEntry[] {
  return dayEntries(items, attendance, sessions, now, now)
}

/** The first of today's planned home sessions not yet done (research R5). */
export function plannedChoice(
  entries: readonly TodayEntry[],
): { routine: RoutineId; minutes: number } | null {
  for (const e of entries) {
    const { item } = e.occurrence
    if (item.kind === 'home' && e.status === 'open') {
      return { routine: item.routine, minutes: item.minutes }
    }
  }
  return null
}

// ---------- Planner ----------

/**
 * Classes that cover a technique for today's plan: scheduled today and not marked Not this time,
 * or attended yesterday. Other is left out; one cover per technique, today's first (research R6).
 */
export function covers(
  items: readonly ScheduleItem[],
  attendance: readonly Attendance[],
  now: Date,
): Cover[] {
  const today = dateKey(now)
  const yesterday = dateKey(addDays(now, -1))
  const found: Cover[] = []
  const seen = new Set<Technique>()
  const add = (name: string, type: string, when: Cover['when']) => {
    if (type === 'other' || seen.has(type as Technique)) return
    seen.add(type as Technique)
    found.push({ name, type: type as Technique, when })
  }
  for (const { item } of occurrencesOn(items, startOfDay(now))) {
    if (item.kind !== 'class') continue
    if (attendanceFor(item, today, attendance)?.status === 'skipped') continue
    add(item.name, item.type, 'today')
  }
  attendance
    .filter((a) => a.date === yesterday && a.status === 'attended')
    .sort((a, b) => minutesOf(a.start) - minutesOf(b.start))
    .forEach((a) => add(a.name, a.type, 'yesterday'))
  return found
}

// ---------- Validation ----------

export type DraftErrors = Partial<Record<'name' | 'days' | 'start' | 'minutes', string>>

/** Per-field problems with a draft; empty when it can be saved (research R11). */
export function validateItem(draft: ScheduleDraft): DraftErrors {
  const errors: DraftErrors = {}
  if (draft.kind === 'class') {
    const name = draft.name.trim()
    if (name.length === 0) errors.name = 'Give the class a name.'
    else if (name.length > NAME_MAX) errors.name = `Keep the name to ${NAME_MAX} characters.`
  }
  if (draft.days.length === 0) errors.days = 'Pick at least one day.'
  const start = minutesOf(draft.start)
  if (Number.isNaN(start)) errors.start = 'Pick a start time.'
  const range = draft.kind === 'class' ? CLASS_MINUTES : HOME_MINUTES
  if (!Number.isInteger(draft.minutes) || draft.minutes < range.min || draft.minutes > range.max) {
    errors.minutes = `Between ${range.min} and ${range.max} minutes.`
  } else if (
    draft.kind === 'class' &&
    !Number.isNaN(start) &&
    start + draft.minutes > DAY_MINUTES
  ) {
    errors.minutes = 'The class must end by midnight.'
  }
  return errors
}

/** A draft ready to store: trimmed name, days unique and sorted. */
export function cleanDraft(draft: ScheduleDraft): ScheduleDraft {
  const days = [...new Set(draft.days)].sort((a, b) => a - b)
  return draft.kind === 'class' ? { ...draft, name: draft.name.trim(), days } : { ...draft, days }
}
