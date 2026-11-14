import { doc, onSnapshot, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import type { SessionUser } from '../../auth/session'

export const USER_SCHEMA_VERSION = 1

/** The user record as the app sees it. See specs/001-foundation-signin/data-model.md. */
export interface UserRecord {
  schemaVersion: number
  displayName: string | null
  email: string
  lastSignInAt: Date | null
}

/**
 * Creates or updates the signed-in person's record, setting only these fields.
 * Not awaited by callers: offline writes queue and sync later.
 */
export function upsertOnSignIn(user: SessionUser): Promise<void> {
  return setDoc(
    doc(db, 'users', user.uid),
    {
      schemaVersion: USER_SCHEMA_VERSION,
      displayName: user.displayName,
      email: user.email,
      lastSignInAt: serverTimestamp(),
    },
    { merge: true },
  )
}

/** Subscribes to the person's record. Returns an unsubscribe function. */
export function watchUser(
  uid: string,
  onData: (record: UserRecord | null) => void,
  onError: (err: unknown) => void,
): () => void {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null)
        return
      }
      // 'estimate' shows a local time while the server timestamp is still pending.
      const data = snap.data({ serverTimestamps: 'estimate' })
      const ts = data.lastSignInAt as Timestamp | null | undefined
      onData({
        schemaVersion: data.schemaVersion as number,
        displayName: (data.displayName as string | null | undefined) ?? null,
        email: data.email as string,
        lastSignInAt: ts ? ts.toDate() : null,
      })
    },
    onError,
  )
}
