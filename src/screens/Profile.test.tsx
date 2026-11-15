import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PROFILE } from '../profile/types'
import { Profile } from './Profile'

const saveProfile = vi.hoisted(() => vi.fn(async () => {}))
vi.mock('../data/repo/users', () => ({ saveProfile }))
vi.mock('../auth/signIn', () => ({ signOutUser: vi.fn() }))

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
