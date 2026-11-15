import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MarksProvider } from '../app/marks'
import { EMPTY_HISTORY } from '../planner/plan'
import { DEFAULT_PROFILE } from '../profile/types'
import { PlanView } from './PlanView'

vi.mock('../data/repo/marks', () => ({ watchMarks: () => () => {}, setMark: vi.fn() }))

const profile = {
  ...DEFAULT_PROFILE,
  setupDone: true,
  focusAreas: ['shoulders' as const, 'hips' as const],
}

function renderPlan(routine: 'calm' | 'cardio', history = EMPTY_HISTORY) {
  render(
    <MarksProvider uid="u1">
      <PlanView
        params={{ routine, minutes: 15, shuffle: 0, swaps: {} }}
        profile={profile}
        history={history}
      />
    </MarksProvider>,
  )
}

describe('PlanView', () => {
  it('shows a calm morning plan with reasons, swap links and Start', () => {
    renderPlan('calm')
    expect(screen.getByRole('heading', { name: /-minute session/ })).toBeInTheDocument()
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items.length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByRole('link', { name: /^Swap / })[0].getAttribute('href')).toContain(
      'w=0.1',
    )
    expect(screen.getByRole('link', { name: /Start/ }).getAttribute('href')).toMatch(/routine=plan/)
    expect(
      screen.getAllByText(/Focus: |Favourite|New for you|Calm|Variety|which you like/).length,
    ).toBeGreaterThan(0)
  })

  it('says when the library cannot fill a routine yet', () => {
    renderPlan('cardio')
    expect(screen.getByText(/aren’t enough exercises/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /instead/ })).toBeInTheDocument()
  })

  it('waits for history before planning', () => {
    render(
      <MarksProvider uid="u1">
        <PlanView
          params={{ routine: 'calm', minutes: 15, shuffle: 0, swaps: {} }}
          profile={profile}
          history={null}
        />
      </MarksProvider>,
    )
    expect(screen.getByText('Planning…')).toBeInTheDocument()
  })
})
