import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { VersionKey } from '../../exercises/types'
import type { Rating } from '../../player/machine'

export const SESSION_SCHEMA_VERSION = 1

export interface SessionItem {
  exerciseId: string
  version: VersionKey
  outcome: 'done' | 'skipped'
  rating: Rating | null
}

/** Creates the session document and returns its id. The write is not awaited (queues offline). */
export function startSession(uid: string, routine: string): string {
  const ref = doc(collection(db, 'users', uid, 'sessions'))
  void setDoc(ref, {
    schemaVersion: SESSION_SCHEMA_VERSION,
    routine,
    startedAt: serverTimestamp(),
    endedAt: null,
    items: [],
  }).catch(() => {})
  return ref.id
}

/** Saves the outcomes so far and the active (unpaused) seconds. */
export function recordItems(
  uid: string,
  sessionId: string,
  items: SessionItem[],
  activeSeconds: number,
): void {
  void updateDoc(doc(db, 'users', uid, 'sessions', sessionId), { items, activeSeconds }).catch(
    () => {},
  )
}

export interface PastSession {
  id: string
  /** 'sample', 'single:<id>', 'plan:<routineId>' or 'set:<setId>'. */
  routine: string
  startedAt: Date
  endedAt: Date | null
  items: SessionItem[]
  /** Active seconds; missing on sessions saved before it was recorded. */
  activeSeconds: number | null
}

/** Sessions started in the last `days` days (served from the offline cache when offline). */
export async function recentSessions(
  uid: string,
  days: number,
  now = new Date(),
): Promise<PastSession[]> {
  const since = Timestamp.fromDate(new Date(now.getTime() - days * 86_400_000))
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'sessions'), where('startedAt', '>=', since)),
  )
  return snap.docs.map((d) => {
    const data = d.data({ serverTimestamps: 'estimate' })
    return {
      id: d.id,
      routine: typeof data.routine === 'string' ? data.routine : '',
      startedAt: (data.startedAt as Timestamp | null)?.toDate() ?? now,
      endedAt: (data.endedAt as Timestamp | null)?.toDate() ?? null,
      items: (data.items as SessionItem[] | undefined) ?? [],
      activeSeconds: typeof data.activeSeconds === 'number' ? data.activeSeconds : null,
    }
  })
}

export function finishSession(
  uid: string,
  sessionId: string,
  items: SessionItem[],
  activeSeconds: number,
): void {
  void updateDoc(doc(db, 'users', uid, 'sessions', sessionId), {
    items,
    activeSeconds,
    endedAt: serverTimestamp(),
  }).catch(() => {})
}
