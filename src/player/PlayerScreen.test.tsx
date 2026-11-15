import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MarksProvider } from '../app/marks'
import { EMPTY_HISTORY } from '../planner/plan'
import { DEFAULT_PROFILE } from '../profile/types'
import { PlayerScreen } from './PlayerScreen'

const sessions = vi.hoisted(() => ({
  recentSessions: async () => [],
  startSession: vi.fn(() => 's1'),
  recordItems: vi.fn(),
  finishSession: vi.fn(),
}))
vi.mock('../data/repo/sessions', () => sessions)
vi.mock('../data/repo/marks', () => ({ watchMarks: () => () => {}, setMark: vi.fn() }))

function renderPlayer(routine: string, version?: string) {
  render(
    <MarksProvider uid="u1">
      <PlayerScreen
        routine={routine}
        version={version}
        uid="u1"
        profile={DEFAULT_PROFILE}
        history={EMPTY_HISTORY}
      />
    </MarksProvider>,
  )
}

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('PlayerScreen', () => {
  it('starts the sample session on the first favourite', () => {
    renderPlayer('sample')
    expect(screen.getByRole('heading', { name: 'Pelvic tilts' })).toBeInTheDocument()
    expect(screen.getByText(/1 of 8/)).toBeInTheDocument()
    expect(sessions.startSession).toHaveBeenCalledWith('u1', 'sample')
  })

  it('runs a single exercise: sets, rating, summary, saved', async () => {
    const user = userEvent.setup()
    renderPlayer('single:glute-bridge')
    expect(screen.getByText(/set 1 of 2/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Set done' }))
    expect(screen.getByText(/set 2 of 2/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.getByRole('dialog', { name: 'How was Glute bridge?' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Just right/ }))
    expect(screen.getByRole('heading', { name: 'Session done' })).toBeInTheDocument()
    expect(screen.getByText(/1 done · 0 skipped · 1 rated/)).toBeInTheDocument()
    expect(sessions.finishSession).toHaveBeenCalledWith('u1', 's1', [
      { exerciseId: 'glute-bridge', version: 'standard', outcome: 'done', rating: 'right' },
    ])
  })

  it('counts down a timed hold and pauses', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
    renderPlayer('single:figure-four')
    expect(screen.getByText('0:30')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('0:28')).toBeInTheDocument()
    act(() => {
      screen.getByRole('button', { name: 'Pause' }).click()
    })
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByText('0:28')).toBeInTheDocument()
    expect(screen.getByText('Paused')).toBeInTheDocument()
  })
})
