import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { errorCode } from './errors'

export type InviteResult = 'invited' | 'notInvited' | 'offline'

/**
 * Checks the invite list for this email. The document ID is the lowercased email.
 * This is a UX check only; firestore.rules is the real gate.
 */
export async function checkInvite(email: string): Promise<InviteResult> {
  try {
    const snap = await getDoc(doc(db, 'allowlist', email.toLowerCase()))
    return snap.exists() ? 'invited' : 'notInvited'
  } catch (err) {
    const code = errorCode(err)
    if (code === 'permission-denied') return 'notInvited'
    if (code === 'unavailable') return 'offline'
    throw err
  }
}
