// Add or edit a class or planned home session (010, contracts/ui.md).
import { useId, useRef, useState } from 'react'
import { goBack, href } from '../app/router'
import { useSchedule } from '../app/scheduleContext'
import { ROUTINES, ROUTINE_ORDER } from '../planner/routines'
import type { Profile, RoutineId } from '../profile/types'
import {
  CLASS_TYPES,
  CLASS_TYPE_LABEL,
  type ClassType,
  type ScheduleDraft,
  type ScheduleItem,
  type Weekday,
} from '../schedule/types'
import { cleanDraft, validateItem, type DraftErrors } from '../schedule/week'
import { WeekdayChips } from './scheduleParts'
import '../schedule/schedule.css'

const CLASS_LENGTHS = [30, 45, 60, 90]
const HOME_LENGTHS = [5, 10, 15, 20, 30, 45]

const backToWeek = () => goBack({ name: 'schedule' })

export function ScheduleItemForm({
  id,
  kind,
  profile,
}: {
  id?: string
  kind?: 'class' | 'home'
  profile: Profile
}) {
  const { items } = useSchedule()
  if (id && items === null) {
    return (
      <main className="screen">
        <p className="muted">Loading…</p>
      </main>
    )
  }
  const item = id ? items?.find((i) => i.id === id) : undefined
  if (id && !item) {
    return (
      <main className="screen">
        <h1>Schedule</h1>
        <p className="card">This item no longer exists.</p>
        <a className="btn btn--outline" href={href({ name: 'schedule' })}>
          Back to the week
        </a>
      </main>
    )
  }
  return (
    <Form key={id ?? kind} item={item} kind={item?.kind ?? kind ?? 'class'} profile={profile} />
  )
}

function Form({
  item,
  kind,
  profile,
}: {
  item: ScheduleItem | undefined
  kind: 'class' | 'home'
  profile: Profile
}) {
  const { add, update, remove } = useSchedule()
  const uid = useId()
  const isClass = kind === 'class'
  const [name, setName] = useState(item?.kind === 'class' ? item.name : '')
  const [type, setType] = useState<ClassType>(item?.kind === 'class' ? item.type : 'other')
  const [routine, setRoutine] = useState<RoutineId>(item?.kind === 'home' ? item.routine : 'calm')
  const [days, setDays] = useState<Weekday[]>(item?.days ?? [])
  const [start, setStart] = useState(item?.start ?? (isClass ? '18:00' : '07:30'))
  const [minutes, setMinutes] = useState(
    String(item?.minutes ?? (isClass ? 60 : profile.routineMinutes.calm)),
  )
  // A new home session's length follows the routine until the person sets it.
  const [lengthTouched, setLengthTouched] = useState(Boolean(item))
  const [errors, setErrors] = useState<DraftErrors>({})

  const nameRef = useRef<HTMLInputElement>(null)
  const daysRef = useRef<HTMLButtonElement>(null)
  const startRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)

  const pickRoutine = (r: RoutineId) => {
    setRoutine(r)
    if (!lengthTouched) setMinutes(String(profile.routineMinutes[r]))
  }
  const setLength = (v: string) => {
    setMinutes(v)
    setLengthTouched(true)
  }

  const draft = (): ScheduleDraft => {
    const base = { days, start, minutes: minutes === '' ? NaN : Number(minutes) }
    return isClass ? { kind: 'class', name, type, ...base } : { kind: 'home', routine, ...base }
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const d = draft()
    const found = validateItem(d)
    setErrors(found)
    const first = (['name', 'days', 'start', 'minutes'] as const).find((k) => found[k])
    if (first) {
      const refs = { name: nameRef, days: daysRef, start: startRef, minutes: minutesRef }
      refs[first].current?.focus()
      return
    }
    const clean = cleanDraft(d)
    if (item) {
      const changed = Object.fromEntries(
        Object.entries(clean).filter(
          ([k, v]) => JSON.stringify(v) !== JSON.stringify(item[k as keyof ScheduleItem]),
        ),
      ) as Partial<ScheduleDraft>
      if (Object.keys(changed).length > 0) update(item.id, changed)
    } else {
      add(clean)
    }
    backToWeek()
  }

  const del = () => {
    if (!item) return
    const label = item.kind === 'class' ? item.name : ROUTINES[item.routine].name
    const note = item.kind === 'class' ? ' Attended classes stay in Progress.' : ''
    if (window.confirm(`Delete ${label}?${note}`)) {
      remove(item.id)
      backToWeek()
    }
  }

  const err = (k: keyof DraftErrors) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className="sched-error small">
        {errors[k]}
      </p>
    ) : null
  const described = (k: keyof DraftErrors) => (errors[k] ? `${uid}-${k}-err` : undefined)
  const lengths = isClass ? CLASS_LENGTHS : HOME_LENGTHS
  const title = item
    ? isClass
      ? 'Edit class'
      : 'Edit home session'
    : isClass
      ? 'Add a class'
      : 'Plan a home session'

  return (
    <main className="screen">
      <button type="button" className="back-link back-link--button" onClick={backToWeek}>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Back
      </button>
      <h1>{title}</h1>
      <form className="stack sched-form" onSubmit={save} noValidate>
        {isClass && (
          <>
            <div className="field">
              <label htmlFor={`${uid}-name`}>Name</label>
              <input
                id={`${uid}-name`}
                ref={nameRef}
                value={name}
                maxLength={60}
                placeholder="e.g. Pilates"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={described('name')}
                onChange={(e) => setName(e.target.value)}
              />
              {err('name')}
            </div>
            <fieldset className="sched-fieldset">
              <legend>Type</legend>
              <div className="chips" role="group" aria-label="Type">
                {CLASS_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={type === t ? 'chip chip--on' : 'chip'}
                    aria-pressed={type === t}
                    onClick={() => setType(t)}
                  >
                    {CLASS_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {!isClass && (
          <fieldset className="sched-fieldset">
            <legend>Routine</legend>
            <div className="routine-grid" role="group" aria-label="Routine">
              {ROUTINE_ORDER.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={routine === r ? 'routine routine--on' : 'routine'}
                  aria-pressed={routine === r}
                  onClick={() => pickRoutine(r)}
                >
                  <span className="routine__name">{ROUTINES[r].name}</span>
                  <span className="routine__hint">{ROUTINES[r].hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <fieldset className="sched-fieldset">
          <legend>Days</legend>
          <WeekdayChips
            value={days}
            onChange={setDays}
            invalid={Boolean(errors.days)}
            describedBy={described('days')}
            firstRef={daysRef}
          />
          {err('days')}
        </fieldset>

        <div className="field">
          <label htmlFor={`${uid}-start`}>Start</label>
          <input
            id={`${uid}-start`}
            ref={startRef}
            type="time"
            value={start}
            aria-invalid={Boolean(errors.start)}
            aria-describedby={described('start')}
            onChange={(e) => setStart(e.target.value)}
          />
          {err('start')}
        </div>

        <div className="field">
          <label htmlFor={`${uid}-minutes`}>Length in minutes</label>
          <input
            id={`${uid}-minutes`}
            ref={minutesRef}
            type="number"
            inputMode="numeric"
            value={minutes}
            aria-invalid={Boolean(errors.minutes)}
            aria-describedby={described('minutes')}
            onChange={(e) => setLength(e.target.value)}
          />
          <div className="chips" role="group" aria-label="Common lengths">
            {lengths.map((m) => (
              <button
                key={m}
                type="button"
                className={minutes === String(m) ? 'chip chip--on' : 'chip'}
                aria-pressed={minutes === String(m)}
                onClick={() => setLength(String(m))}
              >
                {m} min
              </button>
            ))}
          </div>
          {err('minutes')}
        </div>

        <div className="row-wrap">
          <button type="submit" className="btn btn--primary">
            Save
          </button>
          <button type="button" className="btn btn--outline" onClick={backToWeek}>
            Cancel
          </button>
          {item && (
            <button type="button" className="btn btn--link sched-delete" onClick={del}>
              Delete
            </button>
          )}
        </div>
      </form>
    </main>
  )
}
