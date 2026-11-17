import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SONGS, amazonMusicUrl } from '../sound/songs'
import { Songs } from './Songs'

afterEach(() => vi.restoreAllMocks())

describe('Songs', () => {
  it('lists every song by mood with a private Amazon Music link', () => {
    render(<Songs />)
    expect(screen.getByRole('heading', { name: 'Song ideas' })).toBeInTheDocument()
    expect(screen.getByText(/FitMe can’t add songs for you/)).toBeInTheDocument()
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(SONGS.length)
    const calm = screen.getByRole('region', { name: 'Calm' })
    const weightless = within(calm).getByRole('link', { name: /Weightless/ })
    expect(weightless).toHaveAttribute('href', amazonMusicUrl(SONGS[0]))
    expect(weightless).toHaveAttribute('target', '_blank')
    expect(weightless).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('region', { name: 'Upbeat' })).toBeInTheDocument()
  })

  it('says a connection is needed when offline', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    const u = userEvent.setup()
    render(<Songs />)
    await u.click(screen.getByRole('link', { name: /Weightless/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Opening a song needs a connection.')
  })
})
