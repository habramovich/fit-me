// Schedule model (010). See specs/010-schedule/data-model.md.
import { TECHNIQUES, TECHNIQUE_LABEL, type Technique } from '../exercises/types'
import type { RoutineId } from '../profile/types'

/** ISO weekday: 1 Monday … 7 Sunday. */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const WEEKDAYS: readonly Weekday[] = [1, 2, 3, 4, 5, 6, 7]

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun',
}

export const WEEKDAY_LONG: Record<Weekday, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
}

export type ClassType = Technique | 'other'

export const CLASS_TYPES: readonly ClassType[] = [...TECHNIQUES, 'other']

export const CLASS_TYPE_LABEL: Record<ClassType, string> = { ...TECHNIQUE_LABEL, other: 'Other' }

export interface ClassDraft {
  kind: 'class'
  name: string
  type: ClassType
  days: Weekday[]
  /** "HH:MM", local wall-clock time. */
  start: string
  minutes: number
}

export interface HomeDraft {
  kind: 'home'
  routine: RoutineId
  days: Weekday[]
  start: string
  minutes: number
}

export type ScheduleDraft = ClassDraft | HomeDraft

export type ClassItem = ClassDraft & { id: string }
export type HomeItem = HomeDraft & { id: string }
export type ScheduleItem = ClassItem | HomeItem

export type AttendanceStatus = 'attended' | 'skipped'

export interface Attendance {
  /** `{classId}_{date}`. */
  id: string
  classId: string
  /** "YYYY-MM-DD", local. */
  date: string
  status: AttendanceStatus
  minutes: number
  /** Copied from the class when recorded (FR-010). */
  name: string
  type: ClassType
  start: string
}

export const SCHEDULE_SCHEMA_VERSION = 1
export const ATTENDANCE_SCHEMA_VERSION = 1

export const CLASS_MINUTES = { min: 5, max: 240 }
export const HOME_MINUTES = { min: 5, max: 90 }
export const NAME_MAX = 40
