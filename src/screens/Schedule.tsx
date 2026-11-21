// Schedule tab (010): this week's classes and planned home sessions, and class attendance.
import { useMemo, useState } from 'react'
import { href } from '../app/router'
import { useSchedule } from '../app/scheduleContext'
import { useSessionsSince } from '../schedule/useToday'
import { WEEKDAY_LONG } from '../schedule/types'
import {
  addDays,
  attendanceFor,
  canMarkAttendance,
  dateKey,
  dayEntries,
  mondayOf,
  weekOccurrences,
  weekRange,
} from '../schedule/week'
import { Segmented } from './controls'
import { AttendanceControls, ScheduleRow } from './scheduleParts'
import '../schedule/schedule.css'

type Which = 'this' | 'last'
const WHICH_LABEL: Record<Which, string> = { this: 'This week', last: 'Last week' }

export function Schedule() {
  const { uid, items, attendance, setAttendance, clearAttendance } = useSchedule()
  const [now] = useState(() => new Date())
  const [which, setWhich] = useState<Which>('this')
  const thisMonday = mondayOf(now)
  const lastMonday = addDays(thisMonday, -7)
  const sessions = useSessionsSince(uid, lastMonday)
  const monday = which === 'this' ? thisMonday : lastMonday
  const today = dateKey(now)

  const days = useMemo(
    () =>
      weekOccurrences(items ?? [], monday).map((d) => ({
        ...d,
        entries: dayEntries(items ?? [], attendance ?? [], sessions ?? [], d.date, now),
      })),
    // monday is derived from `which` and the fixed `now`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, attendance, sessions, which, now],
  )

  const addButtons = (
    <div className="row-wrap">
      <a className="btn btn--primary" href={href({ name: 'scheduleItem', kind: 'class' })}>
        Add a class
      </a>
      <a className="btn btn--outline" href={href({ name: 'scheduleItem', kind: 'home' })}>
        Plan a home session
      </a>
    </div>
  )

  if (items === null) {
    return (
      <main className="screen">
        <h1>Schedule</h1>
        <p className="muted">Loading your schedule…</p>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="screen">
        <h1>Schedule</h1>
        <section className="card stack-sm">
          <p>Add the classes you go to and plan your home sessions. Today will remind you.</p>
          {addButtons}
        </section>
      </main>
    )
  }

  return (
    <main className="screen">
      <header className="screen__head">
        <h1>Schedule</h1>
        <p className="muted">{weekRange(monday)}</p>
      </header>
      <Segmented
        label="Week"
        options={['this', 'last'] as const}
        labels={WHICH_LABEL}
        value={which}
        onChange={setWhich}
      />

      <div className="sched-week">
        {days.map((d) => {
          const isToday = d.dateKey === today
          const headingId = `day-${d.dateKey}`
          return (
            <section
              key={d.dateKey}
              className={isToday ? 'sched-day sched-day--today' : 'sched-day'}
              aria-labelledby={headingId}
            >
              <h2 id={headingId} className="sched-day__head">
                {WEEKDAY_LONG[d.weekday]}
                <span className="muted small"> {d.date.getDate()}</span>
                {isToday && <span className="sched-day__today">Today</span>}
              </h2>
              {d.entries.length === 0 ? (
                <p className="muted small">Nothing planned</p>
              ) : (
                <ul className="sched-list">
                  {d.entries.map((e) => {
                    const { item } = e.occurrence
                    const record =
                      item.kind === 'class'
                        ? attendanceFor(item, d.dateKey, attendance ?? [])
                        : undefined
                    return (
                      <ScheduleRow
                        key={item.id}
                        entry={e}
                        to={href({ name: 'scheduleItem', id: item.id })}
                        showStatus={d.dateKey <= today}
                      >
                        {item.kind === 'class' && canMarkAttendance(d.dateKey, now) && (
                          <AttendanceControls
                            item={item}
                            date={d.dateKey}
                            record={record}
                            onSet={(status, minutes) =>
                              setAttendance(item, d.dateKey, status, minutes)
                            }
                            onClear={() => record && clearAttendance(record.id)}
                          />
                        )}
                      </ScheduleRow>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
      </div>

      {addButtons}
    </main>
  )
}
