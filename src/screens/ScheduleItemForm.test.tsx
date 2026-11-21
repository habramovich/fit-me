// Add and edit form for schedule items (010).
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScheduleContext, type ScheduleValue } from '../app/scheduleContext'
import { DEFAULT_PROFILE } from '../profile/types'
import type { ClassItem } from '../schedule/types'
import { ScheduleItemForm } from './ScheduleItemForm'

const goBack = vi.hoisted(() => vi.fn())
vi.mock('../app/router', async (orig) => ({
  ...(await orig<typeof import('../app/router')>()),
  goBack,
}))

const pilates: ClassItem = {
  id: 'p',
  kind: 'class',
  name: 'Pilates',
  type: 'strength',
  days: [2, 4],
  start: '18:00',
  minutes: 60,
}

function renderForm(props: { id?: string; kind?: 'class' | 'home' }, items = [pilates]) {
  const value: ScheduleValue = {
    uid: 'u1',
    items,
    attendance: [],
    add: vi.fn(() => 'new'),
    update: vi.fn(),
    remove: vi.fn(),
    setAttendance: vi.fn(),
    clearAttendance: vi.fn(),
  }
  render(
    <ScheduleContext.Provider value={value}>
      <ScheduleItemForm {...props} profile={DEFAULT_PROFILE} />
    </ScheduleContext.Provider>,
  )
  return value
}

afterEach(() => {
  goBack.mockClear()
  vi.restoreAllMocks()
})

describe('ScheduleItemForm', () => {
  it('blocks saving without a name or days and shows why', async () => {
    const value = renderForm({ kind: 'class' })
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('Give the class a name.')).toBeInTheDocument()
    expect(screen.getByText('Pick at least one day.')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toHaveFocus()
    expect(value.add).not.toHaveBeenCalled()
  })

  it('adds a valid class', async () => {
    const value = renderForm({ kind: 'class' })
    await userEvent.type(screen.getByLabelText('Name'), '  Yoga flow ')
    await userEvent.click(screen.getByRole('button', { name: 'Yoga' }))
    await userEvent.click(screen.getByRole('button', { name: 'Thursday' }))
    await userEvent.click(screen.getByRole('button', { name: 'Monday' }))
    await userEvent.click(screen.getByRole('button', { name: '45 min' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(value.add).toHaveBeenCalledWith({
      kind: 'class',
      name: 'Yoga flow',
      type: 'yoga',
      days: [1, 4],
      start: '18:00',
      minutes: 45,
    })
    expect(goBack).toHaveBeenCalled()
  })

  it('presets a home session’s length from the routine', async () => {
    const value = renderForm({ kind: 'home' })
    expect(screen.getByLabelText('Length in minutes')).toHaveValue(15)
    await userEvent.click(screen.getByRole('button', { name: /Strength keeper/ }))
    expect(screen.getByLabelText('Length in minutes')).toHaveValue(20)
    await userEvent.click(screen.getByRole('button', { name: 'Saturday' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(value.add).toHaveBeenCalledWith({
      kind: 'home',
      routine: 'strength',
      days: [6],
      start: '07:30',
      minutes: 20,
    })
  })

  it('updates only the changed fields', async () => {
    const value = renderForm({ id: 'p' })
    const start = screen.getByLabelText('Start')
    await userEvent.clear(start)
    await userEvent.type(start, '19:15')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(value.update).toHaveBeenCalledWith('p', { start: '19:15' })
  })

  it('confirms before deleting', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const value = renderForm({ id: 'p' })
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(confirm).toHaveBeenCalledWith('Delete Pilates? Attended classes stay in Progress.')
    expect(value.remove).toHaveBeenCalledWith('p')
  })

  it('says when the item no longer exists', () => {
    renderForm({ id: 'gone' })
    expect(screen.getByText('This item no longer exists.')).toBeInTheDocument()
  })
})
