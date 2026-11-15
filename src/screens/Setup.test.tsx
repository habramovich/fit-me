import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PROFILE } from '../profile/types'
import { Setup } from './Setup'

const saveProfile = vi.hoisted(() => vi.fn(async () => {}))
vi.mock('../data/repo/users', () => ({ saveProfile }))

afterEach(() => {
  vi.clearAllMocks()
  window.location.hash = ''
})

describe('Setup', () => {
  it('saves age and sex and suggests goals for a woman in her 50s', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<Setup uid="u1" profile={DEFAULT_PROFILE} step={1} />)
    await user.click(screen.getByRole('button', { name: '50–59' }))
    await user.click(screen.getByRole('button', { name: 'Woman' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(saveProfile).toHaveBeenCalledWith('u1', { ageRange: '50s', sex: 'woman' })
    expect(window.location.hash).toBe('#/setup/2')

    rerender(<Setup uid="u1" profile={DEFAULT_PROFILE} step={2} />)
    for (const g of ['Mobility', 'Balance', 'Bone strength']) {
      expect(screen.getByRole('button', { name: g })).toHaveAttribute('aria-pressed', 'true')
    }
  })

  it('finishes on step 6 with setupDone', async () => {
    const user = userEvent.setup()
    render(<Setup uid="u1" profile={DEFAULT_PROFILE} step={6} />)
    await user.click(screen.getByRole('button', { name: 'Finish' }))
    expect(saveProfile).toHaveBeenCalledWith('u1', expect.objectContaining({ setupDone: true }))
    expect(window.location.hash).toBe('#/today')
  })

  it('can skip setup entirely', async () => {
    const user = userEvent.setup()
    render(<Setup uid="u1" profile={DEFAULT_PROFILE} step={1} />)
    await user.click(screen.getByRole('button', { name: 'Skip setup for now' }))
    expect(saveProfile).toHaveBeenCalledWith('u1', { setupDone: true })
  })

  it('marks an area to go easy on', async () => {
    const user = userEvent.setup()
    render(<Setup uid="u1" profile={DEFAULT_PROFILE} step={4} />)
    const knees = screen.getByRole('group', { name: 'Knees' })
    await user.click(knees.querySelector('button:nth-child(2)')!)
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(saveProfile).toHaveBeenCalledWith('u1', { goEasyAreas: ['knees'], avoidAreas: [] })
  })
})
