// Progress tab (spec 005).
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SetsContext, type SetsValue } from '../app/setsContext'
import type { PastSession, SessionItem } from '../data/repo/sessions'
import { DEFAULT_PROFILE } from '../profile/types'
import { Progress } from './Progress'

const recentSessions = vi.hoisted(() => vi.fn(async (): Promise<PastSession[]> => []))
vi.mock('../data/repo/sessions', () => ({ recentSessions }))

const done = (exerciseId: string, rating: SessionItem['rating'] = 'right'): SessionItem => ({
  exerciseId,
  version: 'standard',
  outcome: 'done',
  rating,
})

const at = (daysAgo: number, hour = 7) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, 0, 0, 0)
  return d
}

const session = (
  id: string,
  daysAgo: number,
  items: SessionItem[],
  activeSeconds: number,
  routine = 'plan:calm',
): PastSession => ({
  id,
  routine,
  startedAt: at(daysAgo),
  endedAt: null,
  items,
  activeSeconds,
})

function renderProgress() {
  const sets: SetsValue = {
    sets: [{ id: 'm1', name: 'Morning flow', source: 'manual', items: [], updatedAt: new Date() }],
    create: vi.fn(() => ''),
    saveItems: vi.fn(),
    rename: vi.fn(),
    remove: vi.fn(),
  }
  render(
    <SetsContext.Provider value={sets}>
      <Progress
        uid="u1"
        profile={{ ...DEFAULT_PROFILE, weeklyMinutes: 60, focusAreas: ['shoulders', 'calves'] }}
      />
    </SetsContext.Provider>,
  )
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  // A Wednesday, so "today" and "yesterday" are in the same week.
  vi.setSystemTime(new Date('2026-11-18T12:00:00'))
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('Progress', () => {
  it('shows an empty state with a way to start', async () => {
    renderProgress()
    expect(await screen.findByText('No sessions yet.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start a session' })).toHaveAttribute('href', '#/today')
    expect(recentSessions).toHaveBeenCalledWith('u1', 60)
  })

  it('shows this week, trends, areas and recent sessions', async () => {
    recentSessions.mockResolvedValueOnce([
      session('a', 0, [done('shoulder-rotations'), done('cat-cow', 'easy')], 900),
      session('b', 1, [done('shoulder-rotations')], 600, 'set:m1'),
      session('c', 9, [done('glute-bridge', 'hard')], 1200, 'single:glute-bridge'),
    ])
    renderProgress()

    // This week: 15 + 10 minutes against a 60-minute goal, 2 sessions, 2-day streak.
    const week = await screen.findByRole('region', { name: 'This week' })
    expect(within(week).getByText('25')).toBeInTheDocument()
    expect(within(week).getByText(/of 60 min/)).toBeInTheDocument()
    expect(within(week).getByText('35 min to your weekly goal.')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Minutes this week' })).toHaveAttribute(
      'aria-valuenow',
      '25',
    )
    const tiles = within(week)
      .getAllByRole('definition')
      .map((d) => d.textContent)
    expect(tiles).toEqual(['2', '2', '2'])

    // Weekly bars: this week is picked; tapping another week shows its minutes.
    expect(screen.getByText(/This week:/, { selector: '.prog-readout' })).toHaveTextContent(
      'This week: 25 min',
    )
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const bars = screen.getAllByRole('button', { name: /minute/ })
    expect(bars).toHaveLength(8)
    await user.click(bars[6])
    expect(screen.getByText(/Week of/, { selector: '.prog-readout' })).toHaveTextContent(/20 min/)

    // Technique mix has text labels with minutes and percent.
    const mix = screen.getByRole('region', { name: 'Technique mix' })
    expect(within(mix).getByText('Mobility')).toBeInTheDocument()
    expect(within(mix).getByText('Strength')).toBeInTheDocument()
    expect(within(mix).getByText('Yoga')).toBeInTheDocument()

    // Body areas: shoulders is a focus area worked twice; calves are a focus area not worked.
    const areas = screen.getByRole('list', { name: 'Areas worked' })
    expect(within(areas).getAllByRole('listitem')[0]).toHaveTextContent('Shoulders2×Focus')
    expect(screen.getByText('calves (focus)')).toBeInTheDocument()

    // Recent sessions, newest first, with routine names and ratings.
    const recent = within(screen.getByRole('region', { name: 'Recent sessions' })).getAllByRole(
      'listitem',
    )
    expect(recent.map((li) => li.querySelector('strong')?.textContent)).toEqual([
      'Calm morning',
      'Morning flow',
      'Glute bridge',
    ])
    expect(recent[0]).toHaveTextContent('1 too easy · 1 just right')
  })
})
