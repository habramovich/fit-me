import { describe, expect, it } from 'vitest'
import { initialState, transition, type SessionState } from './session'

const user = { uid: 'u1', email: 'a@example.com', displayName: 'Ann' }

describe('session state machine', () => {
  it('starts loading', () => {
    expect(initialState).toEqual({ status: 'loading' })
  })

  it('goes to signedOut when auth resolves with no user', () => {
    expect(transition(initialState, { type: 'authResolved', user: null })).toEqual({
      status: 'signedOut',
    })
  })

  it('goes to checkingInvite when auth resolves with a user', () => {
    expect(transition(initialState, { type: 'authResolved', user })).toEqual({
      status: 'checkingInvite',
      user,
    })
  })

  it('goes from checkingInvite to invited when the invite is found', () => {
    const s: SessionState = { status: 'checkingInvite', user }
    expect(transition(s, { type: 'inviteFound' })).toEqual({ status: 'invited', user })
  })

  it('goes from checkingInvite to notInvited when the invite is missing', () => {
    const s: SessionState = { status: 'checkingInvite', user }
    expect(transition(s, { type: 'inviteMissing' })).toEqual({ status: 'notInvited', user })
  })

  it('goes from invited to notInvited on permission denied', () => {
    const s: SessionState = { status: 'invited', user }
    expect(transition(s, { type: 'permissionDenied' })).toEqual({ status: 'notInvited', user })
  })

  it('goes to signedOut from invited or notInvited when auth resolves with no user', () => {
    for (const status of ['invited', 'notInvited', 'checkingInvite'] as const) {
      const s = { status, user } as SessionState
      expect(transition(s, { type: 'authResolved', user: null })).toEqual({ status: 'signedOut' })
    }
  })

  it('ignores invite results that arrive after sign-out', () => {
    const s: SessionState = { status: 'signedOut' }
    expect(transition(s, { type: 'inviteFound' })).toBe(s)
    expect(transition(s, { type: 'inviteMissing' })).toBe(s)
  })

  it('ignores invite results for a previous user', () => {
    const s: SessionState = { status: 'checkingInvite', user }
    expect(transition(s, { type: 'inviteFound', uid: 'someone-else' })).toBe(s)
    expect(transition(s, { type: 'inviteFound', uid: 'u1' })).toEqual({ status: 'invited', user })
  })

  it('ignores permission denied when not invited', () => {
    const s: SessionState = { status: 'checkingInvite', user }
    expect(transition(s, { type: 'permissionDenied' })).toBe(s)
  })
})
