import { doc, onSnapshot, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import type { SessionUser } from '../../auth/session'
import { PROFILE_SCHEMA_VERSION, type Profile } from '../../profile/types'

export const USER_SCHEMA_VERSION = 1

/** The user record as the app sees it. See specs/001-foundation-signin/data-model.md. */
export interface UserRecord {
  schemaVersion: number
  displayName: string | null
  email: string
  lastSignInAt: Date | null
  /** Stored profile (may be partial or missing); use withDefaults() to read it. */
  profile: Partial<Profile> | null
}

/**
 * Saves some profile fields. A merge write, so nested maps (techniques, routineMinutes) merge
 * field by field and phone and tablet edits don't overwrite each other. Not awaited by callers.
 */
export function saveProfile(uid: string, patch: Partial<Profile>): Promise<void> {
  return setDoc(
    doc(db, 'users', uid),
    { profile: { ...patch, schemaVersion: PROFILE_SCHEMA_VERSION } },
    { merge: true },
  )
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
        profile: (data.profile as Partial<Profile> | undefined) ?? null,
      })
    },
    onError,
  )
}
