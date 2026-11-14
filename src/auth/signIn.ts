import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { errorCode } from '../data/repo/errors'

const IGNORED = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request'])

/**
 * Must be called directly from a click handler so the browser allows the popup.
 * Returns an error message to show, or null. The UI follows onAuthStateChanged, not this result.
 */
export async function signInWithGoogle(): Promise<string | null> {
  try {
    await signInWithPopup(auth, new GoogleAuthProvider())
    return null
  } catch (err) {
    const code = errorCode(err)
    if (code && IGNORED.has(code)) return null
    if (code === 'auth/popup-blocked') {
      return 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.'
    }
    if (code === 'auth/network-request-failed') {
      return "Can't reach Google right now. Check your connection and try again."
    }
    return 'Sign-in failed. Please try again.'
  }
}

export function signOutUser(): Promise<void> {
  return signOut(auth)
}
