import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { Session } from './auth/useSession'

const mockSession = vi.hoisted(() => ({ current: null as unknown as Session }))
const signIn = vi.hoisted(() => ({
  signInWithGoogle: vi.fn(async () => null as string | null),
  signOutUser: vi.fn(async () => {}),
}))

vi.mock('./auth/useSession', () => ({ useSession: () => mockSession.current }))
vi.mock('./auth/signIn', () => signIn)
// Firestore listeners are not under test here; marks start empty.
vi.mock('./data/repo/marks', () => ({ watchMarks: () => () => {}, setMark: vi.fn(async () => {}) }))
vi.mock('./data/repo/sessions', () => ({
  startSession: () => 's1',
  recordItems: vi.fn(),
  finishSession: vi.fn(),
}))

const user = { uid: 'u1', email: 'ann@example.com', displayName: 'Ann' }

function setSession(s: Partial<Session> & Pick<Session, 'state'>) {
  mockSession.current = { record: null, online: true, ...s }
}

describe('App screens', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading', () => {
    setSession({ state: { status: 'loading' } })
    render(<App />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows the sign-in button when signed out and calls sign-in on click', async () => {
    setSession({ state: { status: 'signedOut' } })
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }))
    expect(signIn.signInWithGoogle).toHaveBeenCalledOnce()
  })

  it('shows a sign-in error, e.g. a blocked popup', async () => {
    signIn.signInWithGoogle.mockResolvedValueOnce('Your browser blocked the sign-in window.')
    setSession({ state: { status: 'signedOut' } })
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Sign in with Google' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('blocked')
  })

  it('shows the invite check, with an offline note when offline', () => {
    setSession({ state: { status: 'checkingInvite', user }, online: false })
    render(<App />)
    expect(screen.getByText('Checking your invite…')).toBeInTheDocument()
    expect(screen.getByText(/You're offline/)).toBeInTheDocument()
  })

  it('shows the invite-only message and sign out when not invited', async () => {
    setSession({ state: { status: 'notInvited', user } })
    render(<App />)
    expect(screen.getByText('FitMe is invite-only. Ask the owner to add you.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(signIn.signOutUser).toHaveBeenCalledOnce()
  })

  const record = {
    schemaVersion: 1,
    displayName: 'Ann',
    email: user.email,
    lastSignInAt: new Date('2026-11-14T09:30:00'),
  }

  it('greets an invited person by name on Today, with the tab bar and a Start link', () => {
    window.location.hash = '#/today'
    setSession({ state: { status: 'invited', user }, record })
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Hi, Ann' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Start/ })).toHaveAttribute(
      'href',
      '#/player?routine=sample',
    )
  })

  it('shows the last sign-in time and Sign out on Profile', async () => {
    window.location.hash = '#/profile'
    setSession({ state: { status: 'invited', user }, record })
    render(<App />)
    expect(screen.getByText(/Last signed in/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    expect(signIn.signOutUser).toHaveBeenCalledOnce()
  })

  it('falls back to email when there is no display name', () => {
    window.location.hash = '#/today'
    setSession({ state: { status: 'invited', user: { ...user, displayName: null } } })
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Hi, ann@example.com' })).toBeInTheDocument()
  })
})
