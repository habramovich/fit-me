import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MarksProvider } from '../app/marks'
import { SoundPrefsContext } from '../sound/prefs'
import { PlayerScreen } from './PlayerScreen'

const sessions = vi.hoisted(() => ({
  recentSessions: async () => [],
  startSession: vi.fn(() => 's1'),
  recordItems: vi.fn(),
  finishSession: vi.fn(),
}))
vi.mock('../data/repo/sessions', () => sessions)
const marksRepo = vi.hoisted(() => ({
  watchMarks: () => () => {},
  setMark: vi.fn(async () => {}),
}))
vi.mock('../data/repo/marks', () => marksRepo)
const engine = vi.hoisted(() => ({
  audioRunning: vi.fn(() => true),
  playCue: vi.fn(),
  startMusic: vi.fn(),
  stopMusic: vi.fn(),
  unlockAudio: vi.fn(),
  setAudioWanted: vi.fn(),
}))
vi.mock('../sound/engine', () => engine)

function renderPlayer(
  routine: string,
  version?: string,
  sound = { music: false, cues: false, setMusic: vi.fn() },
) {
  render(
    <SoundPrefsContext.Provider value={sound}>
      <MarksProvider uid="u1">
        <PlayerScreen routine={routine} version={version} uid="u1" />
      </MarksProvider>
    </SoundPrefsContext.Provider>,
  )
  return sound
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
    expect(screen.queryByText(/More next time|Easier next time|Keep it/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Just right/ }))
    expect(screen.getByRole('heading', { name: 'Session done' })).toBeInTheDocument()
    expect(screen.getByText(/1 done · 0 skipped · 1 rated/)).toBeInTheDocument()
    expect(screen.getByText(/you’ll see them in Progress/)).toBeInTheDocument()
    expect(screen.queryByText(/planner arrives/)).not.toBeInTheDocument()
    expect(sessions.finishSession).toHaveBeenCalledWith(
      'u1',
      's1',
      [{ exerciseId: 'glute-bridge', version: 'standard', outcome: 'done', rating: 'right' }],
      0,
    )
  })

  it('Skip next time marks the exercise Not for me and moves on (006 US3)', async () => {
    const user = userEvent.setup()
    renderPlayer('single:glute-bridge')
    await user.click(screen.getByRole('button', { name: 'Set done' }))
    await user.click(screen.getByRole('button', { name: 'Done' }))
    await user.click(screen.getByRole('button', { name: /Skip next time/ }))
    expect(marksRepo.setMark).toHaveBeenCalledWith('u1', 'glute-bridge', 'notForMe')
    expect(screen.getByRole('heading', { name: 'Session done' })).toBeInTheDocument()
    expect(screen.getByText(/1 done · 0 skipped · 0 rated/)).toBeInTheDocument()
    expect(screen.getByText(/Glute bridge won’t be suggested again/)).toBeInTheDocument()
    expect(sessions.finishSession).toHaveBeenCalledWith(
      'u1',
      's1',
      [{ exerciseId: 'glute-bridge', version: 'standard', outcome: 'done', rating: null }],
      0,
    )
  })

  it('shows the pace next to the figure (006 US2)', () => {
    renderPlayer('single:figure-four')
    expect(screen.getByLabelText('Pace: Hold')).toBeInTheDocument()
  })

  it('counts down a timed hold and pauses', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
    renderPlayer('single:figure-four')
    act(() => {
      screen.getByRole('button', { name: 'Start now' }).click()
    })
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
    expect(screen.getByText('Paused')).toHaveAttribute('data-shown', 'true')
    // Skipping saves the outcome with the active (unpaused) seconds only.
    act(() => {
      screen.getByRole('button', { name: 'Skip exercise' }).click()
    })
    expect(sessions.finishSession).toHaveBeenLastCalledWith(
      'u1',
      's1',
      [{ exerciseId: 'figure-four', version: 'standard', outcome: 'skipped', rating: null }],
      2,
    )
  })
})

describe('PlayerScreen Get ready (011)', () => {
  it('waits 5 s before a timed exercise, its clock full, then starts it', () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] })
    renderPlayer('single:figure-four')
    expect(screen.getByRole('dialog', { name: 'Get ready' })).toBeInTheDocument()
    expect(screen.getByText('Figure four stretch starts in 5 s.')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByText('Figure four stretch starts in 2 s.')).toBeInTheDocument()
    expect(screen.getByText('0:30')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.queryByRole('dialog', { name: 'Get ready' })).not.toBeInTheDocument()
    expect(screen.getByText('0:29')).toBeInTheDocument()
  })

  it('has no Get ready before a repetition exercise', () => {
    renderPlayer('single:glute-bridge')
    expect(screen.queryByRole('dialog', { name: 'Get ready' })).not.toBeInTheDocument()
  })
})

describe('PlayerScreen sound (009)', () => {
  const on = (music: boolean, cues: boolean) => ({ music, cues, setMusic: vi.fn() })

  it('plays no music when music is off', () => {
    renderPlayer('single:glute-bridge')
    expect(engine.startMusic).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Music' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('the music button saves the choice', async () => {
    const user = userEvent.setup()
    const sound = renderPlayer('single:glute-bridge')
    await user.click(screen.getByRole('button', { name: 'Music' }))
    expect(sound.setMusic).toHaveBeenCalledWith(true)
    expect(engine.unlockAudio).toHaveBeenCalled()
  })

  it('plays the session mood, stops quickly on pause and gently at the end', async () => {
    const user = userEvent.setup()
    renderPlayer('single:glute-bridge', undefined, on(true, false))
    expect(screen.getByRole('button', { name: 'Music' })).toHaveAttribute('aria-pressed', 'true')
    // Glute bridge is a strength exercise: Steady.
    expect(engine.startMusic).toHaveBeenLastCalledWith('steady')
    await user.click(screen.getByRole('button', { name: 'Pause' }))
    expect(engine.stopMusic).toHaveBeenLastCalledWith(0.3)
    await user.click(screen.getByRole('button', { name: 'Resume' }))
    expect(engine.startMusic).toHaveBeenLastCalledWith('steady')
    await user.click(screen.getByRole('button', { name: 'Set done' }))
    await user.click(screen.getByRole('button', { name: 'Done' }))
    await user.click(screen.getByRole('button', { name: /Just right/ }))
    expect(screen.getByRole('heading', { name: 'Session done' })).toBeInTheDocument()
    expect(engine.stopMusic).toHaveBeenLastCalledWith(1.5)
  })

  it('plays cues only when cues are on', async () => {
    const user = userEvent.setup()
    renderPlayer('sample', undefined, on(false, true))
    await user.click(screen.getByRole('button', { name: 'Skip exercise' }))
    expect(engine.playCue).toHaveBeenCalledWith('start')
    expect(engine.startMusic).not.toHaveBeenCalled()
  })

  it('plays no cues when cues are off', async () => {
    const user = userEvent.setup()
    renderPlayer('sample', undefined, on(true, false))
    await user.click(screen.getByRole('button', { name: 'Skip exercise' }))
    expect(engine.playCue).not.toHaveBeenCalled()
  })

  it('asks for a tap when the browser keeps audio off', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    engine.audioRunning.mockReturnValue(false)
    renderPlayer('single:glute-bridge', undefined, on(true, true))
    act(() => {
      vi.advanceTimersByTime(600)
    })
    const tap = screen.getByRole('button', { name: 'Tap to start sound' })
    engine.audioRunning.mockReturnValue(true)
    act(() => {
      tap.click()
    })
    expect(engine.unlockAudio).toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(screen.queryByRole('button', { name: 'Tap to start sound' })).not.toBeInTheDocument()
  })
})
