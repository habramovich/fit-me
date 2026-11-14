// Pure session state machine. See specs/001-foundation-signin/data-model.md.

export interface SessionUser {
  uid: string
  email: string
  displayName: string | null
}

export type SessionState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'checkingInvite'; user: SessionUser }
  | { status: 'invited'; user: SessionUser }
  | { status: 'notInvited'; user: SessionUser }

/** `uid`, when given, must match the current user or the event is ignored (stale result). */
export type SessionEvent =
  | { type: 'authResolved'; user: SessionUser | null }
  | { type: 'inviteFound'; uid?: string }
  | { type: 'inviteMissing'; uid?: string }
  | { type: 'permissionDenied'; uid?: string }

export const initialState: SessionState = { status: 'loading' }

export function transition(state: SessionState, event: SessionEvent): SessionState {
  if (event.type === 'authResolved') {
    return event.user ? { status: 'checkingInvite', user: event.user } : { status: 'signedOut' }
  }

  if (!('user' in state)) return state
  if (event.uid !== undefined && event.uid !== state.user.uid) return state

  switch (event.type) {
    case 'inviteFound':
      return state.status === 'checkingInvite' ? { status: 'invited', user: state.user } : state
    case 'inviteMissing':
      return state.status === 'checkingInvite' ? { status: 'notInvited', user: state.user } : state
    case 'permissionDenied':
      return state.status === 'invited' ? { status: 'notInvited', user: state.user } : state
  }
}
