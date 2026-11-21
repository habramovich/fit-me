// Schedule tab (010): week view, empty state and attendance controls.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ScheduleContext, type ScheduleValue } from '../app/scheduleContext'
import type { Attendance, ClassItem, HomeItem } from '../schedule/types'
import { addDays, dateKey, mondayOf, weekRange } from '../schedule/week'
import { Schedule } from './Schedule'

vi.mock('../data/repo/sessions', () => ({
  watchSessionsSince: (_uid: string, _since: Date, onData: (s: unknown[]) => void) => {
    onData([])
    return () => {}
  },
}))

const everyDay = [1, 2, 3, 4, 5, 6, 7] as ClassItem['days']
const pilates: ClassItem = {
  id: 'p',
  kind: 'class',
  name: 'Pilates',
  type: 'strength',
  days: everyDay,
  start: '18:00',
  minutes: 60,
}
const calm: HomeItem = {
  id: 'c',
  kind: 'home',
  routine: 'calm',
  days: everyDay,
  start: '07:30',
  minutes: 15,
}

function renderWith(over: Partial<ScheduleValue> = {}) {
  const value: ScheduleValue = {
    uid: 'u1',
    items: [pilates, calm],
    attendance: [],
    add: vi.fn(() => 'new'),
    update: vi.fn(),
    remove: vi.fn(),
    setAttendance: vi.fn(),
    clearAttendance: vi.fn(),
    ...over,
  }
  render(
    <ScheduleContext.Provider value={value}>
      <Schedule />
    </ScheduleContext.Provider>,
  )
  return value
}

const todaySection = () => screen.getByText('Today').closest('section') as HTMLElement

describe('Schedule', () => {
  it('shows the empty state with both add buttons', () => {
    renderWith({ items: [] })
    expect(screen.getByRole('link', { name: 'Add a class' })).toHaveAttribute(
      'href',
      '#/schedule/new/class',
    )
    expect(screen.getByRole('link', { name: 'Plan a home session' })).toHaveAttribute(
      'href',
      '#/schedule/new/home',
    )
  })

  it('lists each day’s items in time order, linking to their forms', () => {
    renderWith()
    const rows = within(todaySection()).getAllByRole('link')
    expect(rows[0]).toHaveAccessibleName(/07:30, Calm morning, home session, 15 minutes/)
    expect(rows[1]).toHaveAccessibleName(/18:00, Pilates, class, 60 minutes/)
    expect(rows[1]).toHaveAttribute('href', '#/schedule/p')
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(7)
  })

  it('switches to last week', async () => {
    renderWith()
    const monday = mondayOf(new Date())
    // The locale's range format may use thin spaces; the DOM matcher normalises whitespace.
    const range = (d: Date) => weekRange(d).replace(/\s+/g, ' ')
    expect(screen.getByText(range(monday))).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Last week' }))
    expect(screen.getByText(range(addDays(monday, -7)))).toBeInTheDocument()
  })

  it('marks a class attended today', async () => {
    const value = renderWith()
    await userEvent.click(within(todaySection()).getByRole('button', { name: 'Yes' }))
    expect(value.setAttendance).toHaveBeenCalledWith(
      pilates,
      dateKey(new Date()),
      'attended',
      undefined,
    )
  })

  it('offers no attendance on future days', () => {
    renderWith()
    const sections = screen.getAllByRole('region')
    const todayIndex = sections.indexOf(todaySection())
    for (const s of sections.slice(todayIndex + 1)) {
      expect(within(s).queryByText('Attended?')).toBeNull()
    }
  })

  it('changes and undoes recorded attendance', async () => {
    const today = dateKey(new Date())
    const record: Attendance = {
      id: `p_${today}`,
      classId: 'p',
      date: today,
      status: 'attended',
      minutes: 60,
      name: 'Pilates',
      type: 'strength',
      start: '18:00',
    }
    const value = renderWith({ attendance: [record] })
    const section = todaySection()
    expect(within(section).getByText('✓ Attended · 60 min')).toBeInTheDocument()
    await userEvent.click(within(section).getByRole('button', { name: /Change attendance/ }))
    await userEvent.click(within(section).getByRole('button', { name: 'Undo' }))
    expect(value.clearAttendance).toHaveBeenCalledWith(record.id)
  })
})
