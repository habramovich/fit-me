// Saving and adding to sets from the plan, the exercise page and the Library (spec 004).
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MarksProvider } from '../app/marks'
import { PlansProvider } from '../app/plans'
import { SetsContext, type SetsValue } from '../app/setsContext'
import type { SavedSet } from '../data/repo/sets'
import { EMPTY_HISTORY } from '../planner/plan'
import { DEFAULT_PROFILE } from '../profile/types'
import { ExerciseDetail } from './ExerciseDetail'
import { Library } from './Library'
import { PlanView } from './PlanView'

const saveProfile = vi.hoisted(() => vi.fn(async () => {}))
vi.mock('../data/repo/users', () => ({ saveProfile }))
vi.mock('../data/repo/marks', () => ({
  watchMarks: (_uid: string, onData: (m: object) => void) => {
    onData({})
    return () => {}
  },
  setMark: vi.fn(),
}))
vi.mock('../data/repo/plans', () => ({
  watchPlans: (_uid: string, onData: (p: unknown[]) => void) => {
    onData([])
    return () => {}
  },
  getPlan: async () => null,
  savePlan: vi.fn(),
  updatePlanItems: vi.fn(),
  markPlanViewed: vi.fn(),
  planId: (routine: string, minutes: number) => `${routine}-${minutes}`,
}))

const existing: SavedSet = {
  id: 's1',
  name: 'Morning',
  source: 'manual',
  items: [],
  updatedAt: new Date(),
}

function withSets(ui: React.ReactNode, over: Partial<SetsValue> = {}) {
  const value: SetsValue = {
    sets: [existing],
    create: vi.fn(() => 'new-id'),
    saveItems: vi.fn(),
    rename: vi.fn(),
    remove: vi.fn(),
    ...over,
  }
  render(
    <MarksProvider uid="u1">
      <PlansProvider uid="u1">
        <SetsContext.Provider value={value}>{ui}</SetsContext.Provider>
      </PlansProvider>
    </MarksProvider>,
  )
  return value
}

afterEach(() => {
  vi.clearAllMocks()
  window.location.hash = ''
})

describe('Save as set (plan)', () => {
  it('saves the plan in order and opens the new set', async () => {
    const v = withSets(
      <PlanView
        params={{ routine: 'calm', minutes: 15 }}
        profile={{ ...DEFAULT_PROFILE, setupDone: true }}
        history={EMPTY_HISTORY}
      />,
    )
    expect((await screen.findAllByText('Swap')).length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: 'Save as set' }))
    const input = screen.getByLabelText('Name for this set')
    await userEvent.clear(input)
    await userEvent.type(input, 'My calm morning{Enter}')
    expect(v.create).toHaveBeenCalledWith('My calm morning', expect.any(Array), 'plan:calm')
    const items = (v.create as ReturnType<typeof vi.fn>).mock.calls[0][1]
    expect(items.length).toBeGreaterThanOrEqual(3)
    expect(items[0]).toHaveProperty('phase', 'warmup')
    expect(window.location.hash).toBe('#/set/new-id')
  })
})

describe('Exercise page', () => {
  it('saves where she likes the exercise', async () => {
    withSets(<ExerciseDetail id="cat-cow" uid="u1" profile={DEFAULT_PROFILE} />)
    await userEvent.click(screen.getByRole('button', { name: 'Warm-up' }))
    expect(saveProfile).toHaveBeenCalledWith('u1', { phasePrefs: { 'cat-cow': ['warmup'] } })
  })

  it('shows the saved preference and what it means', () => {
    withSets(
      <ExerciseDetail
        id="cat-cow"
        uid="u1"
        profile={{ ...DEFAULT_PROFILE, phasePrefs: { 'cat-cow': ['warmup', 'cooldown'] } }}
      />,
    )
    expect(screen.getByText(/may use it in both/)).toBeInTheDocument()
  })

  it('adds the exercise to an existing set in the chosen part', async () => {
    const v = withSets(<ExerciseDetail id="cat-cow" uid="u1" profile={DEFAULT_PROFILE} />)
    await userEvent.click(screen.getByRole('button', { name: 'Add to set' }))
    await userEvent.click(screen.getByRole('group', { name: 'Part' }).querySelector('button')!) // Warm-up
    await userEvent.click(screen.getByRole('button', { name: /Morning/ }))
    expect(v.saveItems).toHaveBeenCalledWith('s1', [
      expect.objectContaining({ exerciseId: 'cat-cow', phase: 'warmup' }),
    ])
    expect(screen.getByRole('link', { name: 'Open set' })).toHaveAttribute('href', '#/set/s1')
  })

  it('Back goes to the Library when the page was opened directly', async () => {
    withSets(<ExerciseDetail id="cat-cow" uid="u1" profile={DEFAULT_PROFILE} />)
    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(window.location.hash).toBe('#/library')
  })
})

describe('Library add mode', () => {
  it('adds exercises to the set, duplicates allowed', async () => {
    const v = withSets(<Library addTo="s1" phase="cooldown" />)
    expect(screen.getByText(/Adding to/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Add Cat–cow to Morning' }))
    expect(v.saveItems).toHaveBeenCalledWith('s1', [
      expect.objectContaining({ exerciseId: 'cat-cow', phase: 'cooldown' }),
    ])
    expect(screen.getByRole('button', { name: 'Add Cat–cow to Morning' })).toHaveTextContent(
      'Added ×1',
    )
  })
})
