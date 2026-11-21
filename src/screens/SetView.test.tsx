import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SetsContext, type SetsValue } from '../app/setsContext'
import type { SavedSet } from '../data/repo/sets'
import type { Dose } from '../exercises/types'
import { SetView } from './SetView'

const dose: Dose = { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false }
const set: SavedSet = {
  id: 's1',
  name: 'My calm morning',
  source: 'plan:calm',
  updatedAt: new Date(),
  items: [
    { exerciseId: 'pelvic-tilts', version: 'standard', phase: 'warmup', dose },
    { exerciseId: 'cat-cow', version: 'standard', phase: 'main', dose },
    { exerciseId: 'figure-four', version: 'standard', phase: 'cooldown', dose },
  ],
}

function renderSet(over: Partial<SetsValue> = {}) {
  const value: SetsValue = {
    sets: [set],
    create: vi.fn(() => 'new'),
    saveItems: vi.fn(),
    rename: vi.fn(),
    remove: vi.fn(),
    ...over,
  }
  render(
    <SetsContext.Provider value={value}>
      <SetView id="s1" />
    </SetsContext.Provider>,
  )
  return value
}

afterEach(() => vi.restoreAllMocks())

describe('SetView', () => {
  it('shows the set grouped by part with Start', () => {
    renderSet()
    expect(screen.getByRole('heading', { name: 'My calm morning' })).toBeInTheDocument()
    for (const part of ['Warm-up', 'Main', 'Cool-down']) {
      expect(screen.getByRole('region', { name: part })).toBeInTheDocument()
    }
    expect(
      within(screen.getByRole('region', { name: 'Main' })).getByText('Cat–cow'),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Start/ })).toHaveAttribute(
      'href',
      '#/player?routine=set%3As1',
    )
  })

  it('Move up on the first main item moves cat-cow into the warm-up', async () => {
    const v = renderSet()
    await userEvent.click(screen.getByRole('button', { name: 'Move Cat–cow up' }))
    expect(v.saveItems).toHaveBeenCalledWith('s1', [
      set.items[0],
      { ...set.items[1], phase: 'warmup' },
      set.items[2],
    ])
  })

  it('removes an item', async () => {
    const v = renderSet()
    await userEvent.click(screen.getByRole('button', { name: 'Remove Figure four stretch' }))
    expect(v.saveItems).toHaveBeenCalledWith('s1', set.items.slice(0, 2))
  })

  it('renames the set', async () => {
    const v = renderSet()
    await userEvent.click(screen.getByRole('button', { name: 'Rename' }))
    const input = screen.getByLabelText('Set name')
    await userEvent.clear(input)
    await userEvent.type(input, 'Morning favourites{Enter}')
    expect(v.rename).toHaveBeenCalledWith('s1', 'Morning favourites')
  })

  it('asks before deleting', async () => {
    const v = renderSet()
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    await userEvent.click(screen.getByRole('button', { name: 'Delete set' }))
    expect(v.remove).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Delete set' }))
    expect(v.remove).toHaveBeenCalledWith('s1')
  })

  it('links each part to the Library in add mode', () => {
    renderSet()
    const add = within(screen.getByRole('region', { name: 'Cool-down' })).getByRole('link', {
      name: '+ Add',
    })
    expect(add).toHaveAttribute('href', '#/library?addTo=s1&phase=cooldown')
  })

  it('says when the set is gone', () => {
    renderSet({ sets: [] })
    expect(screen.getByText(/isn’t there any more/)).toBeInTheDocument()
  })
})

describe('SetView amounts (011 US3)', () => {
  it('changes a rep item’s reps and sets', async () => {
    const user = userEvent.setup()
    const v = renderSet()
    await user.click(screen.getByRole('button', { name: /change amount for Cat–cow/ }))
    const editor = screen.getByRole('listitem', { name: 'Amount for Cat–cow' })
    expect(within(editor).getByText('Recommended 6–10')).toBeInTheDocument()
    await user.click(within(editor).getByRole('button', { name: 'More reps' }))
    expect(v.saveItems).toHaveBeenLastCalledWith('s1', [
      set.items[0],
      { ...set.items[1], dose: { ...dose, reps: 9 } },
      set.items[2],
    ])
    await user.click(within(editor).getByRole('button', { name: 'More sets' }))
    expect(v.saveItems).toHaveBeenLastCalledWith('s1', [
      set.items[0],
      { ...set.items[1], dose: { ...dose, sets: 2 } },
      set.items[2],
    ])
  })

  it('steps a timed item by 5 seconds and flags an amount outside the range', async () => {
    const user = userEvent.setup()
    const timed: Dose = { kind: 'time', seconds: 45, range: [20, 45], perSide: true }
    const v = renderSet({
      sets: [{ ...set, items: [{ ...set.items[2], dose: timed }] }],
    })
    await user.click(screen.getByRole('button', { name: /change amount for Figure four/ }))
    expect(screen.queryByRole('button', { name: 'More reps' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'More seconds' }))
    expect(v.saveItems).toHaveBeenLastCalledWith('s1', [
      { ...set.items[2], dose: { ...timed, seconds: 50 } },
    ])
    expect(screen.getByText(/Recommended 20–45 s per side/)).not.toHaveClass('dose-hint--out')
  })

  it('emphasises the hint when the amount is outside the range', async () => {
    const user = userEvent.setup()
    renderSet({
      sets: [{ ...set, items: [{ ...set.items[1], dose: { ...dose, reps: 15 } }] }],
    })
    await user.click(screen.getByRole('button', { name: /change amount for Cat–cow/ }))
    expect(screen.getByText(/Recommended 6–10/)).toHaveClass('dose-hint--out')
  })
})
