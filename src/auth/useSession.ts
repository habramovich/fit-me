import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useReducer, useState } from 'react'
import { auth } from '../firebase'
import { checkInvite } from '../data/repo/allowlist'
import { errorCode } from '../data/repo/errors'
import { upsertOnSignIn, watchUser, type UserRecord } from '../data/repo/users'
import { initialState, transition, type SessionState } from './session'

export interface Session {
  state: SessionState
  record: UserRecord | null
  online: boolean
}

function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  return online
}

export function useSession(): Session {
  const [state, dispatch] = useReducer(transition, initialState)
  const [record, setRecord] = useState<UserRecord | null>(null)
  const online = useOnline()

  // Auth state drives everything (setup guide B5).
  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        dispatch({
          type: 'authResolved',
          user: u ? { uid: u.uid, email: u.email ?? '', displayName: u.displayName } : null,
        })
      }),
    [],
  )

  // Invite check. Re-runs when coming back online if the first try had no answer.
  const checkingUser = state.status === 'checkingInvite' ? state.user : null
  useEffect(() => {
    if (!checkingUser) return
    let cancelled = false
    checkInvite(checkingUser.email).then(
      (result) => {
        if (cancelled || result === 'offline') return
        if (result === 'invited') {
          upsertOnSignIn(checkingUser).catch((err: unknown) => {
            if (errorCode(err) === 'permission-denied') {
              dispatch({ type: 'permissionDenied', uid: checkingUser.uid })
            }
          })
          dispatch({ type: 'inviteFound', uid: checkingUser.uid })
        } else {
          dispatch({ type: 'inviteMissing', uid: checkingUser.uid })
        }
      },
      () => {
        // Unexpected error: stay in checkingInvite; the online effect retries.
      },
    )
    return () => {
      cancelled = true
    }
  }, [checkingUser, online])

  // Live user record while invited. A permission error means the invite was removed.
  const invitedUid = state.status === 'invited' ? state.user.uid : null
  useEffect(() => {
    if (!invitedUid) return
    const unsubscribe = watchUser(invitedUid, setRecord, (err) => {
      if (errorCode(err) === 'permission-denied') {
        dispatch({ type: 'permissionDenied', uid: invitedUid })
      }
    })
    return () => {
      unsubscribe()
      setRecord(null)
    }
  }, [invitedUid])

  return { state, record, online }
}
