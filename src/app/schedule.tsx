import { useEffect, useState, type ReactNode } from 'react'
import {
  clearAttendance,
  createScheduleItem,
  deleteScheduleItem,
  setAttendance,
  updateScheduleItem,
  watchAttendance,
  watchSchedule,
} from '../data/repo/schedule'
import { todayKey } from '../planner/history'
import { attendanceId } from '../schedule/week'
import type { Attendance, ScheduleItem } from '../schedule/types'
import { ScheduleContext, type ScheduleValue } from './scheduleContext'

/** Days of attendance kept in memory: Progress reads 60 days of sessions. */
const ATTENDANCE_DAYS = 60

/** Keeps the person's schedule and recent attendance in memory, applying edits optimistically. */
export function ScheduleProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [items, setItems] = useState<ScheduleItem[] | null>(null)
  const [attendance, setAttendanceList] = useState<Attendance[] | null>(null)

  useEffect(() => watchSchedule(uid, setItems, () => setItems([])), [uid])
  useEffect(() => {
    const since = new Date()
    since.setDate(since.getDate() - ATTENDANCE_DAYS)
    return watchAttendance(uid, todayKey(since), setAttendanceList, () => setAttendanceList([]))
  }, [uid])

  const value: ScheduleValue = {
    uid,
    items,
    attendance,
    add: (draft) => {
      const id = createScheduleItem(uid, draft)
      setItems((all) => [...(all ?? []), { ...draft, id }])
      return id
    },
    update: (id, changed) => {
      setItems(
        (all) => all?.map((i) => (i.id === id ? ({ ...i, ...changed } as ScheduleItem) : i)) ?? all,
      )
      updateScheduleItem(uid, id, changed)
    },
    remove: (id) => {
      setItems((all) => all?.filter((i) => i.id !== id) ?? all)
      deleteScheduleItem(uid, id)
    },
    setAttendance: (item, date, status, minutes) => {
      const id = attendanceId(item.id, date)
      const existing = attendance?.find((a) => a.id === id)
      const record: Attendance = {
        id,
        classId: item.id,
        date,
        status,
        minutes: minutes ?? existing?.minutes ?? item.minutes,
        // A record keeps what it was made with, even after the class is renamed (FR-010).
        name: existing?.name ?? item.name,
        type: existing?.type ?? item.type,
        start: existing?.start ?? item.start,
      }
      setAttendanceList((all) => [...(all ?? []).filter((a) => a.id !== id), record])
      setAttendance(uid, record)
    },
    clearAttendance: (id) => {
      setAttendanceList((all) => all?.filter((a) => a.id !== id) ?? all)
      clearAttendance(uid, id)
    },
  }

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
}
