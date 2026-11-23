import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SetsContext, type SetsValue } from '../app/setsContext'
import type { SavedSet } from '../data/repo/sets'
import { allExercises, getExercise } from '../exercises'
import type { Dose, Phase } from '../exercises/types'
import { todayKey } from '../planner/history'
import { DEFAULT_PROFILE, type Profile } from '../profile/types'
import type { SetItem } from '../sets/edit'
import { applySuggestion, changeText, PHASE_LABEL, suggest, type Suggestion } from '../sets/freshen'
import { forgetFreshen } from './freshenMemory'
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

function renderSet(over: Partial<SetsValue> = {}, profile: Profile | null = DEFAULT_PROFILE) {
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
      <SetView id="s1" profile={profile} />
    </SetsContext.Provider>,
  )
  return value
}

afterEach(() => {
  vi.restoreAllMocks()
  forgetFreshen()
})

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

// ---------- Try something new (012) ----------

function real(exerciseId: string, phase: Phase): SetItem {
  return { exerciseId, version: 'standard', phase, dose: getExercise(exerciseId)!.standard.dose }
}
const fresh: SavedSet = {
  id: 'f1',
  name: 'Short calm',
  source: 'plan:calm',
  updatedAt: new Date(),
  items: [real('pelvic-tilts', 'warmup'), real('butterfly', 'main'), real('childs-pose', 'main')],
}
const expected = (items: SetItem[] = fresh.items) =>
  suggest({
    set: { ...fresh, items },
    library: allExercises,
    profile: DEFAULT_PROFILE,
    marks: {},
    today: todayKey(),
    skipped: [],
  })

/** Renders the set with a provider that keeps edits, as the real one does. */
function renderFresh() {
  const saveItems = vi.fn()
  function Provider() {
    const [items, setItems] = useState(fresh.items)
    const value: SetsValue = {
      sets: [{ ...fresh, items }],
      create: vi.fn(() => 'new'),
      saveItems: (id, next) => {
        saveItems(id, next)
        setItems(next)
      },
      rename: vi.fn(),
      remove: vi.fn(),
    }
    return (
      <SetsContext.Provider value={value}>
        <SetView id="f1" profile={DEFAULT_PROFILE} />
      </SetsContext.Provider>
    )
  }
  render(<Provider />)
  return saveItems
}

const card = (s: Suggestion) => screen.getByRole('article', { name: changeText(s) })
const accept = (s: Suggestion) => (s.change.kind === 'add' ? 'Add' : 'Replace')

describe('SetView: Try something new (012)', () => {
  it('waits for the profile', () => {
    renderSet({}, null)
    expect(screen.getByRole('button', { name: 'Loading your profile…' })).toBeDisabled()
  })

  it('shows the suggestions as cards (US1)', async () => {
    renderFresh()
    await userEvent.click(screen.getByRole('button', { name: 'Try something new' }))
    const list = expected()
    expect(list.length).toBeGreaterThan(1)
    expect(screen.getAllByRole('article')).toHaveLength(list.length)
    for (const s of list) {
      expect(within(card(s)).getByText(s.reason)).toBeInTheDocument()
      expect(within(card(s)).getByRole('button', { name: accept(s) })).toBeInTheDocument()
    }
  })

  it('accepts an Add and a Replace, saving the set at once', async () => {
    const user = userEvent.setup()
    const saveItems = renderFresh()
    await user.click(screen.getByRole('button', { name: 'Try something new' }))
    const list = expected()
    const add = list.find((s) => s.change.kind === 'add')!
    const replace = list.find((s) => s.change.kind === 'replace')!
    await user.click(within(card(add)).getByRole('button', { name: 'Add' }))
    const afterAdd = applySuggestion(fresh.items, add)
    expect(saveItems).toHaveBeenLastCalledWith('f1', afterAdd)
    expect(screen.queryByRole('article', { name: changeText(add) })).not.toBeInTheDocument()
    await user.click(within(card(replace)).getByRole('button', { name: 'Replace' }))
    expect(saveItems).toHaveBeenLastCalledWith('f1', applySuggestion(afterAdd, replace))
  })

  it('Undo restores the set and the card', async () => {
    const user = userEvent.setup()
    const saveItems = renderFresh()
    await user.click(screen.getByRole('button', { name: 'Try something new' }))
    const [first] = expected()
    await user.click(within(card(first)).getByRole('button', { name: accept(first) }))
    expect(screen.getByText(/^(Added|Replaced) /)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(saveItems).toHaveBeenLastCalledWith('f1', fresh.items)
    // Every card is back, including any the accept made obsolete.
    const labels = screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'))
    expect(labels).toEqual(expected().map(changeText))
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument()
  })

  it('Skip removes a card without changing the set; Done closes', async () => {
    const user = userEvent.setup()
    const saveItems = renderFresh()
    await user.click(screen.getByRole('button', { name: 'Try something new' }))
    const [first] = expected()
    await user.click(within(card(first)).getByRole('button', { name: 'Skip' }))
    expect(screen.queryByRole('article', { name: changeText(first) })).not.toBeInTheDocument()
    expect(saveItems).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.queryByRole('region', { name: 'Try something new' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try something new' })).toBeInTheDocument()
  })

  it('Another idea keeps the change with a different exercise (US2)', async () => {
    const user = userEvent.setup()
    renderFresh()
    await user.click(screen.getByRole('button', { name: 'Try something new' }))
    const s = expected().find((x) => x.hasAnother)!
    await user.click(within(card(s)).getByRole('button', { name: 'Another idea' }))
    expect(screen.queryByRole('article', { name: changeText(s) })).not.toBeInTheDocument()
    const change = s.change
    const same = (label: string) =>
      change.kind === 'add'
        ? label.startsWith('Add ') && label.endsWith(` to ${PHASE_LABEL[change.phase]}`)
        : label.startsWith(`Replace ${getExercise(change.target.exerciseId)!.name} with `)
    const labels = screen.getAllByRole('article').map((a) => a.getAttribute('aria-label')!)
    expect(labels.filter(same)).toHaveLength(1)
  })

  it('the review updates after a change (US3)', async () => {
    const user = userEvent.setup()
    renderFresh()
    await user.click(screen.getByRole('button', { name: 'Try something new' }))
    const before = screen.getByLabelText('How the set is balanced').textContent
    const add = expected().find((x) => x.change.kind === 'add')!
    await user.click(within(card(add)).getByRole('button', { name: 'Add' }))
    expect(screen.getByLabelText('How the set is balanced').textContent).not.toBe(before)
  })
})
