import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MarksProvider } from '../app/marks'
import { PlansProvider } from '../app/plans'
import { ScheduleContext, type ScheduleValue } from '../app/scheduleContext'
import type { KeptPlan } from '../data/repo/plans'
import type { Marks } from '../data/repo/marks'
import { EMPTY_HISTORY, type KeptItem } from '../planner/plan'
import { DEFAULT_PROFILE } from '../profile/types'
import { PlanView } from './PlanView'

const state = vi.hoisted(() => ({
  marks: {} as Marks,
  plans: [] as KeptPlan[],
}))
vi.mock('../data/repo/marks', () => ({
  watchMarks: (_uid: string, onData: (m: Marks) => void) => {
    onData(state.marks)
    return () => {}
  },
  setMark: vi.fn(),
}))
const repo = vi.hoisted(() => ({
  watchPlans: (_uid: string, onData: (p: KeptPlan[]) => void) => {
    onData(state.plans)
    return () => {}
  },
  getPlan: vi.fn(async () => null),
  savePlan: vi.fn(),
  updatePlanItems: vi.fn(),
  markPlanViewed: vi.fn(),
  markPlanUsed: vi.fn(),
  planId: (routine: string, minutes: number) => `${routine}-${minutes}`,
}))
vi.mock('../data/repo/plans', () => repo)

const profile = {
  ...DEFAULT_PROFILE,
  setupDone: true,
  focusAreas: ['shoulders' as const, 'hips' as const],
}

const noSchedule: Partial<ScheduleValue> = { items: [], attendance: [] }

function renderPlan(
  routine: 'calm' | 'cardio',
  history: typeof EMPTY_HISTORY | null = EMPTY_HISTORY,
  over: Partial<typeof profile> = {},
  schedule: Partial<ScheduleValue> = noSchedule,
) {
  const value: ScheduleValue = {
    uid: 'u1',
    items: [],
    attendance: [],
    add: vi.fn(() => ''),
    update: vi.fn(),
    remove: vi.fn(),
    setAttendance: vi.fn(),
    clearAttendance: vi.fn(),
    ...schedule,
  }
  render(
    <MarksProvider uid="u1">
      <PlansProvider uid="u1">
        <ScheduleContext.Provider value={value}>
          <PlanView
            params={{ routine, minutes: 15 }}
            profile={{ ...profile, ...over }}
            history={history}
          />
        </ScheduleContext.Provider>
      </PlansProvider>
    </MarksProvider>,
  )
}

const item = (exerciseId: string, phase: KeptItem['phase']): KeptItem => ({
  exerciseId,
  version: 'standard',
  dose: { kind: 'reps', reps: 8, range: [5, 12], sets: 1, perSide: false },
  phase,
  reason: 'Kept for you',
  seconds: 60,
  passed: [],
})

const keptCalm = (): KeptPlan => ({
  id: 'calm-15',
  routine: 'calm',
  minutes: 15,
  generation: 2,
  items: [
    item('cat-cow', 'warmup'),
    item('glute-bridge', 'main'),
    item('pelvic-tilts', 'cooldown'),
  ],
  notes: [],
  shortOfTime: false,
  plannedAt: new Date(Date.now() - 2 * 86_400_000),
  viewedAt: new Date(Date.now() - 2 * 86_400_000),
  usedAt: null,
  sessionId: null,
})

const names = () =>
  within(screen.getByRole('list'))
    .getAllByRole('listitem')
    .map((li) => within(li).getByRole('link').getAttribute('aria-label'))

afterEach(() => {
  state.marks = {}
  state.plans = []
  vi.clearAllMocks()
})

describe('PlanView', () => {
  it('makes and keeps a new plan, with reasons, Swap buttons and Start', async () => {
    renderPlan('calm')
    expect(await screen.findByRole('heading', { name: /-minute session/ })).toBeInTheDocument()
    expect(repo.getPlan).toHaveBeenCalledWith('u1', 'calm-15')
    expect(repo.savePlan).toHaveBeenCalledTimes(1)
    expect(repo.savePlan.mock.calls[0][1]).toMatchObject({ id: 'calm-15', generation: 0 })
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items.length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByRole('button', { name: /^Swap / }).length).toBe(items.length)
    expect(screen.getByRole('link', { name: /Start/ }).getAttribute('href')).toMatch(
      /routine=plan.*/,
    )
    expect(
      screen.getAllByText(/Focus: |Favourite|New for you|Calm|Variety|which you like/).length,
    ).toBeGreaterThan(0)
  })

  it('names today’s class in a new plan, and waits for the schedule', async () => {
    const yoga = {
      id: 'y',
      kind: 'class' as const,
      name: 'Yoga',
      type: 'yoga' as const,
      days: [1, 2, 3, 4, 5, 6, 7] as (1 | 2 | 3 | 4 | 5 | 6 | 7)[],
      start: '23:00',
      minutes: 60,
    }
    renderPlan('calm', EMPTY_HISTORY, {}, { items: [yoga], attendance: null })
    expect(repo.savePlan).not.toHaveBeenCalled()
    cleanup()
    renderPlan('calm', EMPTY_HISTORY, {}, { items: [yoga], attendance: [] })
    expect(await screen.findByText('Lighter on yoga: Yoga today.')).toBeInTheDocument()
    expect(repo.savePlan.mock.calls[0][1]).toMatchObject({
      notes: ['Lighter on yoga: Yoga today.'],
    })
  })

  it('shows a kept plan exactly as it was, with the day it was planned', async () => {
    state.plans = [keptCalm()]
    renderPlan('calm')
    await screen.findByRole('heading', { name: /-minute session/ })
    expect(names()).toEqual(['About Cat–cow', 'About Glute bridge', 'About Pelvic tilts'])
    expect(screen.getByText(/^Planned /)).toBeInTheDocument()
    expect(repo.savePlan).not.toHaveBeenCalled()
    expect(repo.updatePlanItems).not.toHaveBeenCalled()
    expect(repo.markPlanViewed).toHaveBeenCalledWith('u1', 'calm-15')
  })

  it('Swap changes only that item, and keeps the change', async () => {
    state.plans = [keptCalm()]
    renderPlan('calm')
    await userEvent.click(await screen.findByRole('button', { name: 'Swap Glute bridge' }))
    expect(repo.updatePlanItems).toHaveBeenCalledTimes(1)
    const [, id, items, notes] = repo.updatePlanItems.mock.calls[0]
    expect(id).toBe('calm-15')
    expect(items[1].exerciseId).not.toBe('glute-bridge')
    expect(items[1].passed).toEqual(['glute-bridge'])
    expect(items[0]).toEqual(keptCalm().items[0])
    expect(items[2]).toEqual(keptCalm().items[2])
    expect(notes).toEqual([])
    expect(names()[1]).not.toBe('About Glute bridge')
  })

  it('Reshuffle keeps a new generation', async () => {
    state.plans = [keptCalm()]
    renderPlan('calm')
    await userEvent.click(await screen.findByRole('button', { name: 'Reshuffle' }))
    expect(repo.savePlan).toHaveBeenCalledTimes(1)
    expect(repo.savePlan.mock.calls[0][1]).toMatchObject({ id: 'calm-15', generation: 3 })
  })

  it('replaces an item marked Not for me and says so', async () => {
    state.plans = [keptCalm()]
    state.marks = { 'glute-bridge': 'notForMe' }
    renderPlan('calm')
    expect(await screen.findByText(/Glute bridge is now Not for me/)).toBeInTheDocument()
    expect(names()[0]).toBe('About Cat–cow')
    expect(names()[1]).not.toBe('About Glute bridge')
    expect(repo.updatePlanItems).toHaveBeenCalledTimes(1)
  })

  it('makes a new plan once the kept one has been used', async () => {
    state.plans = [{ ...keptCalm(), usedAt: new Date() }]
    renderPlan('calm')
    await screen.findByRole('heading', { name: /-minute session/ })
    expect(repo.savePlan.mock.calls[0][1]).toMatchObject({ generation: 3, usedAt: null })
  })

  it('says when the library cannot fill a routine yet', async () => {
    // With every technique but strength set to None, Cardio has nothing to plan.
    renderPlan('cardio', EMPTY_HISTORY, {
      techniques: {
        yoga: 'none',
        taichi: 'none',
        strength: 'some',
        mobility: 'none',
        stretching: 'none',
        cardio: 'none',
      },
    })
    expect(await screen.findByText(/aren’t enough exercises/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /instead/ })).toBeInTheDocument()
    expect(repo.savePlan).not.toHaveBeenCalled()
  })

  it('waits for history before planning', () => {
    renderPlan('calm', null)
    expect(screen.getByText('Planning…')).toBeInTheDocument()
    expect(repo.getPlan).not.toHaveBeenCalled()
  })
})
