import { createContext, useContext } from 'react'
import type {
  Attendance,
  AttendanceStatus,
  ClassItem,
  ScheduleDraft,
  ScheduleItem,
} from '../schedule/types'

export interface ScheduleValue {
  uid: string
  /** null while loading. */
  items: ScheduleItem[] | null
  /** Attendance from the last 60 days; null while loading. */
  attendance: Attendance[] | null
  add: (draft: ScheduleDraft) => string
  update: (id: string, changed: Partial<ScheduleDraft>) => void
  remove: (id: string) => void
  /** Marks a class on a date; minutes default to the existing record's, else the class's. */
  setAttendance: (item: ClassItem, date: string, status: AttendanceStatus, minutes?: number) => void
  clearAttendance: (id: string) => void
}

export const ScheduleContext = createContext<ScheduleValue>({
  uid: '',
  items: [],
  attendance: [],
  add: () => '',
  update: () => {},
  remove: () => {},
  setAttendance: () => {},
  clearAttendance: () => {},
})

export function useSchedule(): ScheduleValue {
  return useContext(ScheduleContext)
}
