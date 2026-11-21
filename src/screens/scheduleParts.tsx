// Rows and attendance controls shared by Schedule and Today (010, contracts/ui.md).
import { useId, useState } from 'react'
import { ROUTINES } from '../planner/routines'
import {
  CLASS_MINUTES,
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
  WEEKDAYS,
  type Attendance,
  type AttendanceStatus,
  type ClassItem,
  type Weekday,
} from '../schedule/types'
import { isoWeekday, itemName, type EntryStatus, type TodayEntry } from '../schedule/week'

const STATUS_WORD: Record<EntryStatus, string> = {
  open: '',
  done: 'done',
  attended: 'attended',
  skipped: 'not this time',
}

/** One scheduled item: time, name, length and kind, linking to `to`; `children` sit below. */
export function ScheduleRow({
  entry,
  to,
  showStatus = true,
  children,
}: {
  entry: TodayEntry
  to: string
  showStatus?: boolean
  children?: React.ReactNode
}) {
  const { item, startsAt } = entry.occurrence
  const name = itemName(item, (r) => ROUTINES[r].name)
  const kind = item.kind === 'class' ? 'Class' : 'Home'
  const status = showStatus ? STATUS_WORD[entry.status] : ''
  const label = [
    `${WEEKDAY_LONG[isoWeekday(startsAt)]} ${item.start}`,
    name,
    kind.toLowerCase() === 'home' ? 'home session' : 'class',
    `${item.minutes} minutes`,
    status,
  ]
    .filter(Boolean)
    .join(', ')
  return (
    <li className={entry.passed ? 'sched-row sched-row--passed' : 'sched-row'}>
      <a className="sched-row__main" href={to} aria-label={label}>
        <span className="sched-row__time">{item.start}</span>
        <span className="sched-row__name">{name}</span>
        <span className="sched-row__meta">
          {item.minutes} min
          <span className={item.kind === 'class' ? 'tag tag--plain' : 'tag tag--mobility'}>
            {kind}
          </span>
          {showStatus && entry.status === 'done' && <span className="sched-row__done">✓ Done</span>}
        </span>
      </a>
      {children}
    </li>
  )
}

/** Attended? Yes / Not this time, or the recorded status with Change (FR-008). */
export function AttendanceControls({
  item,
  date,
  record,
  onSet,
  onClear,
}: {
  item: ClassItem
  date: string
  record: Attendance | undefined
  onSet: (status: AttendanceStatus, minutes?: number) => void
  onClear: () => void
}) {
  const [changing, setChanging] = useState(false)
  if (changing && record) {
    return (
      <ChangeSheet
        record={record}
        onSet={onSet}
        onClear={() => {
          onClear()
          setChanging(false)
        }}
        onDone={() => setChanging(false)}
      />
    )
  }
  if (!record) {
    return (
      <div className="sched-attend" role="group" aria-label={`${item.name} on ${date}: attended?`}>
        <span className="small">Attended?</span>
        <button type="button" className="chip" onClick={() => onSet('attended')}>
          Yes
        </button>
        <button type="button" className="chip" onClick={() => onSet('skipped')}>
          Not this time
        </button>
      </div>
    )
  }
  return (
    <div className="sched-attend">
      <span className="small">
        {record.status === 'attended' ? `✓ Attended · ${record.minutes} min` : 'Not this time'}
      </span>
      <button
        type="button"
        className="btn btn--link"
        aria-label={`Change attendance for ${item.name}`}
        onClick={() => setChanging(true)}
      >
        Change
      </button>
    </div>
  )
}

function ChangeSheet({
  record,
  onSet,
  onClear,
  onDone,
}: {
  record: Attendance
  onSet: (status: AttendanceStatus, minutes?: number) => void
  onClear: () => void
  onDone: () => void
}) {
  const id = useId()
  const [minutes, setMinutes] = useState(String(record.minutes))
  const value = Number(minutes)
  const valid = Number.isInteger(value) && value >= CLASS_MINUTES.min && value <= CLASS_MINUTES.max
  const saveMinutes = () => {
    if (valid && value !== record.minutes) onSet('attended', value)
  }
  return (
    <div className="sched-sheet" role="group" aria-label={`Attendance for ${record.name}`}>
      {record.status === 'attended' && (
        <div className="field">
          <label htmlFor={`${id}-min`}>Minutes you did</label>
          <input
            id={`${id}-min`}
            type="number"
            inputMode="numeric"
            min={CLASS_MINUTES.min}
            max={CLASS_MINUTES.max}
            value={minutes}
            aria-invalid={!valid}
            aria-describedby={valid ? undefined : `${id}-err`}
            onChange={(e) => setMinutes(e.target.value)}
            onBlur={saveMinutes}
          />
          {!valid && (
            <p id={`${id}-err`} className="sched-error small">
              Between {CLASS_MINUTES.min} and {CLASS_MINUTES.max} minutes.
            </p>
          )}
        </div>
      )}
      <div className="row-wrap">
        <button
          type="button"
          className={record.status === 'attended' ? 'chip chip--on' : 'chip'}
          aria-pressed={record.status === 'attended'}
          onClick={() => onSet('attended')}
        >
          Attended
        </button>
        <button
          type="button"
          className={record.status === 'skipped' ? 'chip chip--on' : 'chip'}
          aria-pressed={record.status === 'skipped'}
          onClick={() => onSet('skipped')}
        >
          Not this time
        </button>
        <button type="button" className="btn btn--link" onClick={onClear}>
          Undo
        </button>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => {
            saveMinutes()
            onDone()
          }}
        >
          Done
        </button>
      </div>
    </div>
  )
}

/** Toggle chips Mon–Sun. */
export function WeekdayChips({
  value,
  onChange,
  invalid,
  describedBy,
  firstRef,
}: {
  value: readonly Weekday[]
  onChange: (next: Weekday[]) => void
  invalid?: boolean
  describedBy?: string
  firstRef?: React.Ref<HTMLButtonElement>
}) {
  return (
    <div
      className="chips"
      role="group"
      aria-label="Days"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
    >
      {WEEKDAYS.map((d, i) => {
        const on = value.includes(d)
        return (
          <button
            key={d}
            ref={i === 0 ? firstRef : undefined}
            type="button"
            className={on ? 'chip chip--on' : 'chip'}
            aria-pressed={on}
            aria-label={WEEKDAY_LONG[d]}
            onClick={() => onChange(on ? value.filter((v) => v !== d) : [...value, d])}
          >
            {WEEKDAY_SHORT[d]}
          </button>
        )
      })}
    </div>
  )
}
