import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PROFILE } from '../profile/types'
import { Profile } from './Profile'

const saveProfile = vi.hoisted(() => vi.fn(async () => {}))
vi.mock('../data/repo/users', () => ({ saveProfile }))
vi.mock('../auth/signIn', () => ({ signOutUser: vi.fn() }))
const engine = vi.hoisted(() => ({ previewMood: vi.fn(), previewCues: vi.fn() }))
vi.mock('../sound/engine', () => engine)

afterEach(() => vi.clearAllMocks())

const user = { uid: 'u1', email: 'owner@example.com', displayName: 'Owner' }

describe('Profile: figure style', () => {
  it('shows Classic selected by default and saves Doodle when picked', async () => {
    const u = userEvent.setup()
    render(<Profile user={user} record={null} profile={DEFAULT_PROFILE} />)
    const group = screen.getByRole('group', { name: 'Figure style' })
    expect(within(group).getByRole('button', { name: 'Classic' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await u.click(within(group).getByRole('button', { name: 'Doodle' }))
    expect(saveProfile).toHaveBeenCalledWith('u1', { figureStyle: 'doodle' })
  })

  it('shows Doodle selected when chosen', () => {
    render(
      <Profile user={user} record={null} profile={{ ...DEFAULT_PROFILE, figureStyle: 'doodle' }} />,
    )
    const group = screen.getByRole('group', { name: 'Figure style' })
    expect(within(group).getByRole('button', { name: 'Doodle' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})

describe('Profile: sound (009)', () => {
  it('starts with music off and cues on, and saves changes', async () => {
    const u = userEvent.setup()
    render(<Profile user={user} record={null} profile={DEFAULT_PROFILE} />)
    const music = screen.getByRole('group', { name: 'Music during sessions' })
    const cues = screen.getByRole('group', { name: 'Sound cues' })
    expect(within(music).getByRole('button', { name: 'Off' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(cues).getByRole('button', { name: 'On' })).toHaveAttribute('aria-pressed', 'true')
    await u.click(within(music).getByRole('button', { name: 'On' }))
    expect(saveProfile).toHaveBeenCalledWith('u1', { sessionMusic: true })
    await u.click(within(cues).getByRole('button', { name: 'Off' }))
    expect(saveProfile).toHaveBeenCalledWith('u1', { soundCues: false })
  })

  it('plays samples and links to song ideas', async () => {
    const u = userEvent.setup()
    render(<Profile user={user} record={null} profile={DEFAULT_PROFILE} />)
    await u.click(screen.getByRole('button', { name: 'Upbeat' }))
    expect(engine.previewMood).toHaveBeenCalledWith('upbeat')
    await u.click(screen.getByRole('button', { name: 'Cues' }))
    expect(engine.previewCues).toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Song ideas for your playlist' })).toHaveAttribute(
      'href',
      '#/songs',
    )
  })
})
