import { useState } from 'react'
import { href } from '../app/router'
import { ROUTINES, ROUTINE_ORDER, routineForTime } from '../planner/routines'
import type { Profile, RoutineId } from '../profile/types'

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const MINUTES = [5, 10, 15, 20, 30, 45]

export function Today({ name, profile }: { name: string; profile: Profile }) {
  const [now] = useState(() => new Date())
  const [routine, setRoutine] = useState<RoutineId>(() => routineForTime(now))
  const [minutes, setMinutes] = useState(() => profile.routineMinutes[routineForTime(now)])

  const pickRoutine = (id: RoutineId) => {
    setRoutine(id)
    setMinutes(profile.routineMinutes[id])
  }
  const minuteOptions = [...new Set([...MINUTES, minutes])].sort((a, b) => a - b)

  return (
    <main className="screen">
      <header className="screen__head">
        <p className="muted">{dateFormat.format(now)}</p>
        <h1>Hi, {name}</h1>
      </header>

      {profile.goals.length === 0 && (
        <a className="card notice" href={href({ name: 'setup', step: 1 })}>
          <strong>Finish your profile</strong>
          <span className="muted small">So sessions fit your goals and focus areas.</span>
        </a>
      )}

      <section className="stack" aria-labelledby="routine-h">
        <h2 id="routine-h">What kind of session?</h2>
        <div className="routine-grid" role="group" aria-label="Routine">
          {ROUTINE_ORDER.map((id) => (
            <button
              key={id}
              type="button"
              className={routine === id ? 'routine routine--on' : 'routine'}
              aria-pressed={routine === id}
              onClick={() => pickRoutine(id)}
            >
              <span className="routine__name">{ROUTINES[id].name}</span>
              <span className="routine__hint">{ROUTINES[id].hint}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="stack" aria-labelledby="time-h">
        <h2 id="time-h">How much time do you have?</h2>
        <div className="chips" role="group" aria-label="Minutes">
          {minuteOptions.map((m) => (
            <button
              key={m}
              type="button"
              className={minutes === m ? 'chip chip--on' : 'chip'}
              aria-pressed={minutes === m}
              onClick={() => setMinutes(m)}
            >
              {m} min
            </button>
          ))}
        </div>
      </section>

      <a
        className="btn btn--primary btn--big"
        href={href({ name: 'plan', plan: { routine, minutes, shuffle: 0, swaps: {} } })}
      >
        Plan my {minutes}-minute {ROUTINES[routine].name.toLowerCase()}
      </a>
      <a className="btn btn--link" href={href({ name: 'player', routine: 'sample' })}>
        Or play your eight favourites
      </a>
    </main>
  )
}
