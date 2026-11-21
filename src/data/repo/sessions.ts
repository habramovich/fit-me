import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
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

function sessionFromData(id: string, data: DocumentData, now: Date): PastSession {
  return {
    id,
    routine: typeof data.routine === 'string' ? data.routine : '',
    startedAt: (data.startedAt as Timestamp | null)?.toDate() ?? now,
    endedAt: (data.endedAt as Timestamp | null)?.toDate() ?? null,
    items: (data.items as SessionItem[] | undefined) ?? [],
    activeSeconds: typeof data.activeSeconds === 'number' ? data.activeSeconds : null,
  }
}

const sessionsSince = (uid: string, since: Date) =>
  query(
    collection(db, 'users', uid, 'sessions'),
    where('startedAt', '>=', Timestamp.fromDate(since)),
  )

/** Sessions started in the last `days` days (served from the offline cache when offline). */
export async function recentSessions(
  uid: string,
  days: number,
  now = new Date(),
): Promise<PastSession[]> {
  const snap = await getDocs(sessionsSince(uid, new Date(now.getTime() - days * 86_400_000)))
  return snap.docs.map((d) => sessionFromData(d.id, d.data({ serverTimestamps: 'estimate' }), now))
}

/** Subscribes to sessions started since `since` (spec 010: live "done" ticks). */
export function watchSessionsSince(
  uid: string,
  since: Date,
  onData: (sessions: PastSession[]) => void,
  onError: (err: unknown) => void,
): () => void {
  return onSnapshot(
    sessionsSince(uid, since),
    (snap) =>
      onData(
        snap.docs.map((d) =>
          sessionFromData(d.id, d.data({ serverTimestamps: 'estimate' }), new Date()),
        ),
      ),
    onError,
  )
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
