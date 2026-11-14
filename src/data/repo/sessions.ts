import { collection, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
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

export function recordItems(uid: string, sessionId: string, items: SessionItem[]): void {
  void updateDoc(doc(db, 'users', uid, 'sessions', sessionId), { items }).catch(() => {})
}

export function finishSession(uid: string, sessionId: string, items: SessionItem[]): void {
  void updateDoc(doc(db, 'users', uid, 'sessions', sessionId), {
    items,
    endedAt: serverTimestamp(),
  }).catch(() => {})
}
