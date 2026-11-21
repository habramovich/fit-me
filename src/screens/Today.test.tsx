// Today with a schedule (010 US2): the card and the planned preselection.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { routineForTime } from '../planner/routines'
import { DEFAULT_PROFILE } from '../profile/types'
import type { TodaySchedule } from '../schedule/useToday'
import type { ClassItem, HomeItem } from '../schedule/types'
import { plannedChoice, todayEntries } from '../schedule/week'
import { Today } from './Today'

const NOW = new Date(2026, 10, 24, 6, 0) // Tuesday, before everything

const strength: HomeItem = {
  id: 'h',
  kind: 'home',
  routine: 'strength',
  days: [2],
  start: '07:30',
  minutes: 25,
}
const pilates: ClassItem = {
  id: 'p',
  kind: 'class',
  name: 'Pilates',
  type: 'strength',
  days: [2],
  start: '18:00',
  minutes: 60,
}

const state = vi.hoisted(() => ({ value: null as TodaySchedule | null }))
vi.mock('../schedule/useToday', () => ({ useTodaySchedule: () => state.value }))

function schedule(items: (HomeItem | ClassItem)[]): TodaySchedule {
  const entries = todayEntries(items, [], [], NOW)
  return { now: NOW, entries, choice: plannedChoice(entries), loaded: true }
}

const renderToday = () => render(<Today name="Ann" profile={DEFAULT_PROFILE} />)

describe('Today with a schedule', () => {
  it('lists today’s items and preselects the planned routine and minutes', () => {
    state.value = schedule([pilates, strength])
    renderToday()
    expect(screen.getByRole('heading', { name: 'Today’s schedule' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /07:30, Strength keeper/ })).toHaveAttribute(
      'href',
      '#/plan?r=strength&m=25',
    )
    expect(screen.getByRole('link', { name: /18:00, Pilates, class/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Strength keeper/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: '25 min' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps the person’s own pick', async () => {
    state.value = schedule([strength])
    const { rerender } = renderToday()
    await userEvent.click(screen.getByRole('button', { name: /Calm morning/ }))
    state.value = { ...schedule([strength]) }
    rerender(<Today name="Ann" profile={DEFAULT_PROFILE} />)
    expect(screen.getByRole('button', { name: /Calm morning/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('link', { name: /Plan my 15-minute calm morning/ })).toBeInTheDocument()
  })

  it('shows no card and the time-of-day default when nothing is scheduled', () => {
    state.value = schedule([])
    renderToday()
    expect(screen.queryByRole('heading', { name: 'Today’s schedule' })).toBeNull()
    // 06:00 on a weekday is a Calm morning by time of day.
    expect(routineForTime(NOW)).toBe('calm')
    expect(screen.getByRole('button', { name: /Calm morning/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
