// Schedule items and class attendance (010). See specs/010-schedule/data-model.md.
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { RoutineId } from '../../profile/types'
import {
  ATTENDANCE_SCHEMA_VERSION,
  CLASS_TYPES,
  SCHEDULE_SCHEMA_VERSION,
  WEEKDAYS,
  type Attendance,
  type ClassType,
  type ScheduleDraft,
  type ScheduleItem,
  type Weekday,
} from '../../schedule/types'

const ROUTINE_IDS: RoutineId[] = ['calm', 'desk', 'strength', 'weekend', 'cardio']
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE = /^\d{4}-\d{2}-\d{2}$/

const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

function days(v: unknown): Weekday[] | null {
  if (!Array.isArray(v)) return null
  const list = [...new Set(v)].filter((d): d is Weekday => WEEKDAYS.includes(d as Weekday))
  return list.length > 0 ? list.sort((a, b) => a - b) : null
}

/** A stored item, or null when it is malformed or from a newer app. */
export function itemFromData(id: string, d: DocumentData): ScheduleItem | null {
  const list = days(d.days)
  if (!list || typeof d.start !== 'string' || !TIME.test(d.start) || !isNumber(d.minutes)) {
    return null
  }
  const base = { id, days: list, start: d.start, minutes: d.minutes }
  if (d.kind === 'class' && typeof d.name === 'string' && CLASS_TYPES.includes(d.type)) {
    return { ...base, kind: 'class', name: d.name, type: d.type as ClassType }
  }
  if (d.kind === 'home' && ROUTINE_IDS.includes(d.routine)) {
    return { ...base, kind: 'home', routine: d.routine as RoutineId }
  }
  return null
}

export function attendanceFromData(id: string, d: DocumentData): Attendance | null {
  if (
    typeof d.classId !== 'string' ||
    typeof d.date !== 'string' ||
    !DATE.test(d.date) ||
    (d.status !== 'attended' && d.status !== 'skipped') ||
    !isNumber(d.minutes)
  ) {
    return null
  }
  return {
    id,
    classId: d.classId,
    date: d.date,
    status: d.status,
    minutes: d.minutes,
    name: typeof d.name === 'string' ? d.name : 'Class',
    type: CLASS_TYPES.includes(d.type) ? (d.type as ClassType) : 'other',
    start: typeof d.start === 'string' && TIME.test(d.start) ? d.start : '00:00',
  }
}

const scheduleCol = (uid: string) => collection(db, 'users', uid, 'schedule')
const attendanceCol = (uid: string) => collection(db, 'users', uid, 'attendance')

/** Subscribes to the person's schedule items. */
export function watchSchedule(
  uid: string,
  onData: (items: ScheduleItem[]) => void,
  onError: (err: unknown) => void,
): () => void {
  return onSnapshot(
    scheduleCol(uid),
    (snap) =>
      onData(
        snap.docs
          .map((d) => itemFromData(d.id, d.data()))
          .filter((i): i is ScheduleItem => i !== null),
      ),
    onError,
  )
}

/** Creates an item and returns its id. Not awaited: offline writes queue. */
export function createScheduleItem(uid: string, draft: ScheduleDraft): string {
  const ref = doc(scheduleCol(uid))
  void setDoc(ref, {
    ...draft,
    schemaVersion: SCHEDULE_SCHEMA_VERSION,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch(() => {})
  return ref.id
}

/** Writes only the changed fields. */
export function updateScheduleItem(uid: string, id: string, changed: Partial<ScheduleDraft>): void {
  void updateDoc(doc(scheduleCol(uid), id), { ...changed, updatedAt: serverTimestamp() }).catch(
    () => {},
  )
}

export function deleteScheduleItem(uid: string, id: string): void {
  void deleteDoc(doc(scheduleCol(uid), id)).catch(() => {})
}

/** Subscribes to attendance on or after `sinceDate` ("YYYY-MM-DD"). */
export function watchAttendance(
  uid: string,
  sinceDate: string,
  onData: (records: Attendance[]) => void,
  onError: (err: unknown) => void,
): () => void {
  return onSnapshot(
    query(attendanceCol(uid), where('date', '>=', sinceDate)),
    (snap) =>
      onData(
        snap.docs
          .map((d) => attendanceFromData(d.id, d.data()))
          .filter((a): a is Attendance => a !== null),
      ),
    onError,
  )
}

/** Records attendance on its deterministic id, so two devices write one record. */
export function setAttendance(uid: string, record: Attendance): void {
  const { id, ...fields } = record
  void setDoc(
    doc(attendanceCol(uid), id),
    { ...fields, schemaVersion: ATTENDANCE_SCHEMA_VERSION, updatedAt: serverTimestamp() },
    { merge: true },
  ).catch(() => {})
}

export function clearAttendance(uid: string, id: string): void {
  void deleteDoc(doc(attendanceCol(uid), id)).catch(() => {})
}
