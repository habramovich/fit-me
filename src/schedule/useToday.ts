// Live sessions for "done" ticks, and today's schedule entries (010, research R4).
import { useEffect, useMemo, useState } from 'react'
import { useSchedule } from '../app/scheduleContext'
import { watchSessionsSince, type PastSession } from '../data/repo/sessions'
import { plannedChoice, startOfDay, todayEntries, type TodayEntry } from './week'

const NONE: PastSession[] = []

/** Sessions started since `since`, kept live; null while loading. */
export function useSessionsSince(uid: string, since: Date): PastSession[] | null {
  const [sessions, setSessions] = useState<PastSession[] | null>(null)
  const from = since.getTime()
  useEffect(() => {
    if (!uid) return
    return watchSessionsSince(uid, new Date(from), setSessions, () => setSessions([]))
  }, [uid, from])
  return uid ? sessions : NONE
}

export interface TodaySchedule {
  now: Date
  entries: TodayEntry[]
  choice: ReturnType<typeof plannedChoice>
  /** Schedule loaded (entries may still gain done ticks as sessions arrive). */
  loaded: boolean
}

/** Today's items with status and the planned choice; `now` is fixed when the screen opens. */
export function useTodaySchedule(): TodaySchedule {
  const { uid, items, attendance } = useSchedule()
  const [now] = useState(() => new Date())
  const sessions = useSessionsSince(uid, startOfDay(now))
  return useMemo(() => {
    const entries = todayEntries(items ?? [], attendance ?? [], sessions ?? [], now)
    return { now, entries, choice: plannedChoice(entries), loaded: items !== null }
  }, [items, attendance, sessions, now])
}
