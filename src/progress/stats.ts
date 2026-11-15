// Progress figures from past sessions (005). Pure: every function takes `now`.
// Weeks start on Monday, in local time.
import type { PastSession } from '../data/repo/sessions'
import { estimateSeconds, getExercise, getVersion } from '../exercises'
import { BODY_AREA_LABEL, TECHNIQUES, type BodyArea, type Technique } from '../exercises/types'
import type { Rating } from '../player/machine'
import { ROUTINES } from '../planner/routines'
import type { RoutineId } from '../profile/types'

export type StatSession = Pick<
  PastSession,
  'id' | 'routine' | 'startedAt' | 'items' | 'activeSeconds'
>

export const BODY_AREAS = Object.keys(BODY_AREA_LABEL) as BodyArea[]

/** Seconds assumed for an exercise that is no longer in the library. */
const UNKNOWN_SECONDS = 60

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

export const startOfDay = (d: Date) => addDays(d, 0)

/** Monday 00:00 of the week containing `d`. */
export function weekStart(d: Date): Date {
  return addDays(d, -((d.getDay() + 6) % 7))
}

const dayKey = (d: Date) => startOfDay(d).getTime()

const doneItems = (s: StatSession) => s.items.filter((i) => i.outcome === 'done')

/** A session counts once at least one exercise was done. */
export const counts = (s: StatSession) => s.items.some((i) => i.outcome === 'done')

export function countedSessions<T extends StatSession>(sessions: T[]): T[] {
  return sessions.filter(counts)
}

function itemSeconds(item: StatSession['items'][number]): number {
  const ex = getExercise(item.exerciseId)
  const version = ex && (getVersion(ex, item.version) ?? ex.standard)
  return version ? estimateSeconds(version) : UNKNOWN_SECONDS
}

/** Recorded active seconds, or an estimate from the done exercises for older sessions. */
export function sessionSeconds(s: StatSession): number {
  if (s.activeSeconds !== null && s.activeSeconds > 0) return s.activeSeconds
  return doneItems(s).reduce((sum, i) => sum + itemSeconds(i), 0)
}

export function sessionMinutes(s: StatSession): number {
  return Math.max(1, Math.round(sessionSeconds(s) / 60))
}

const toMinutes = (seconds: number) => Math.round(seconds / 60)

export interface WeekSummary {
  minutes: number
  sessions: number
  goal: number
  /** 0–1, capped at 1. */
  fraction: number
}

export function weekSummary(sessions: StatSession[], now: Date, goal: number): WeekSummary {
  const from = weekStart(now).getTime()
  const week = countedSessions(sessions).filter((s) => s.startedAt.getTime() >= from)
  const minutes = toMinutes(week.reduce((sum, s) => sum + sessionSeconds(s), 0))
  return {
    minutes,
    sessions: week.length,
    goal,
    fraction: goal > 0 ? Math.min(1, minutes / goal) : 0,
  }
}

export interface Streaks {
  /** Days in a row with a session, ending today, or yesterday if there's none yet today. */
  current: number
  /** Longest run among the sessions given. */
  best: number
}

export function streaks(sessions: StatSession[], now: Date): Streaks {
  const days = new Set(countedSessions(sessions).map((s) => dayKey(s.startedAt)))
  const today = startOfDay(now)
  let start = days.has(today.getTime()) ? today : addDays(today, -1)
  let current = 0
  while (days.has(start.getTime())) {
    current++
    start = addDays(start, -1)
  }
  let best = 0
  for (const key of days) {
    const day = new Date(key)
    if (days.has(addDays(day, -1).getTime())) continue // not the start of a run
    let run = 0
    let d = day
    while (days.has(d.getTime())) {
      run++
      d = addDays(d, 1)
    }
    best = Math.max(best, run)
  }
  return { current, best: Math.max(best, current) }
}

export interface WeekMinutes {
  /** Monday of the week. */
  start: Date
  minutes: number
}

/** Minutes per week for the last `weeks` weeks, oldest first; the last is this week. */
export function weeklyMinutes(sessions: StatSession[], now: Date, weeks = 8): WeekMinutes[] {
  const thisWeek = weekStart(now)
  const series = Array.from({ length: weeks }, (_, i) => ({
    start: addDays(thisWeek, -7 * (weeks - 1 - i)),
    seconds: 0,
  }))
  const index = new Map(series.map((w, i) => [w.start.getTime(), i]))
  for (const s of countedSessions(sessions)) {
    const i = index.get(weekStart(s.startedAt).getTime())
    if (i !== undefined) series[i].seconds += sessionSeconds(s)
  }
  return series.map((w) => ({ start: w.start, minutes: toMinutes(w.seconds) }))
}

export interface TechniqueShare {
  technique: Technique
  minutes: number
  /** Whole percent; the shares add up to 100. */
  percent: number
}

/**
 * Minutes per technique over the last `weeks` calendar weeks (this one included). Each session's
 * time is split across its done exercises in proportion to their estimated length.
 */
export function techniqueMix(sessions: StatSession[], now: Date, weeks = 4): TechniqueShare[] {
  const from = addDays(weekStart(now), -7 * (weeks - 1)).getTime()
  const seconds = new Map<Technique, number>()
  for (const s of countedSessions(sessions)) {
    if (s.startedAt.getTime() < from) continue
    const done = doneItems(s)
    const estimates = done.map(itemSeconds)
    const totalEstimate = estimates.reduce((a, b) => a + b, 0)
    const total = sessionSeconds(s)
    done.forEach((item, i) => {
      const technique = getExercise(item.exerciseId)?.technique
      if (!technique || totalEstimate === 0) return
      seconds.set(technique, (seconds.get(technique) ?? 0) + (total * estimates[i]) / totalEstimate)
    })
  }
  const shares = TECHNIQUES.filter((t) => (seconds.get(t) ?? 0) > 0).map((t) => ({
    technique: t,
    seconds: seconds.get(t) ?? 0,
  }))
  const sum = shares.reduce((a, s) => a + s.seconds, 0)
  return withPercents(shares, sum).map(({ technique, seconds: sec, percent }) => ({
    technique,
    minutes: Math.max(1, toMinutes(sec)),
    percent,
  }))
}

/** Largest-remainder rounding so whole percents add up to exactly 100. */
function withPercents<T extends { seconds: number }>(items: T[], sum: number) {
  if (sum === 0) return items.map((i) => ({ ...i, percent: 0 }))
  const raw = items.map((i) => (i.seconds / sum) * 100)
  const floors = raw.map(Math.floor)
  let left = 100 - floors.reduce((a, b) => a + b, 0)
  const order = raw.map((r, i) => [r - floors[i], i] as const).sort((a, b) => b[0] - a[0])
  for (const [, i] of order) {
    if (left <= 0) break
    floors[i]++
    left--
  }
  return items.map((item, i) => ({ ...item, percent: floors[i] }))
}

export interface AreaCount {
  area: BodyArea
  /** Done exercises that worked this area. */
  count: number
  focus: boolean
}

export interface AreaCoverage {
  /** Focus areas first, then by count. */
  worked: AreaCount[]
  /** Focus areas first, then in the usual body order. */
  notWorked: { area: BodyArea; focus: boolean }[]
}

/** Body areas worked by done exercises in the last `days` days. */
export function areaCoverage(
  sessions: StatSession[],
  now: Date,
  focus: BodyArea[],
  days = 7,
): AreaCoverage {
  const from = addDays(startOfDay(now), -(days - 1)).getTime()
  const tally = new Map<BodyArea, number>()
  for (const s of sessions) {
    if (s.startedAt.getTime() < from) continue
    for (const item of doneItems(s)) {
      for (const a of getExercise(item.exerciseId)?.worksAreas ?? []) {
        tally.set(a, (tally.get(a) ?? 0) + 1)
      }
    }
  }
  const isFocus = (a: BodyArea) => focus.includes(a)
  const byFocus = (a: BodyArea, b: BodyArea) => Number(isFocus(b)) - Number(isFocus(a))
  const worked = [...tally.entries()]
    .map(([area, count]) => ({ area, count, focus: isFocus(area) }))
    .sort((a, b) => byFocus(a.area, b.area) || b.count - a.count)
  const notWorked = BODY_AREAS.filter((a) => !tally.has(a))
    .sort(byFocus)
    .map((area) => ({ area, focus: isFocus(area) }))
  return { worked, notWorked }
}

export interface RecentSession {
  id: string
  startedAt: Date
  routine: string
  minutes: number
  done: number
  skipped: number
  ratings: Record<Rating, number>
}

/** The `n` most recent counted sessions, newest first. */
export function recentList(sessions: StatSession[], n = 10): RecentSession[] {
  return countedSessions(sessions)
    .slice()
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .slice(0, n)
    .map((s) => {
      const ratings: Record<Rating, number> = { easy: 0, right: 0, hard: 0 }
      for (const i of s.items) if (i.rating) ratings[i.rating]++
      return {
        id: s.id,
        startedAt: s.startedAt,
        routine: s.routine,
        minutes: sessionMinutes(s),
        done: doneItems(s).length,
        skipped: s.items.filter((i) => i.outcome === 'skipped').length,
        ratings,
      }
    })
}

/** A readable name for a session's routine string. */
export function routineLabel(routine: string, setName: (id: string) => string | undefined): string {
  if (routine === 'sample') return 'Sample routine'
  if (routine.startsWith('plan:')) {
    return ROUTINES[routine.slice(5) as RoutineId]?.name ?? 'Planned session'
  }
  if (routine.startsWith('single:')) return getExercise(routine.slice(7))?.name ?? 'One exercise'
  if (routine.startsWith('set:')) return setName(routine.slice(4)) ?? 'Saved set'
  return 'Session'
}
