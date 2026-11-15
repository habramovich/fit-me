import { useState } from 'react'
import { useMarks } from '../app/marksContext'
import { href } from '../app/router'
import { getExercise } from '../exercises'
import { estimateMinutes, sampleRoutine } from '../exercises/sample'

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function Today({ name }: { name: string }) {
  const { marks } = useMarks()
  const [today] = useState(() => dateFormat.format(new Date()))
  const items = sampleRoutine(marks)
  const minutes = estimateMinutes(items)

  return (
    <main className="screen">
      <header className="screen__head">
        <p className="muted">{today}</p>
        <h1>Hi, {name}</h1>
      </header>

      <section className="card stack" aria-labelledby="sample-h">
        <div className="row-between">
          <h2 id="sample-h">Your favourites</h2>
          <span className="muted">{items.length > 0 ? `About ${minutes} min` : ''}</span>
        </div>
        {items.length > 0 ? (
          <>
            <p className="muted">
              {items.length} exercises: warm-up, main and cool-down. The planner that fits sessions
              to your time comes in a later update.
            </p>
            <ol className="plain-list">
              {items.map((item) => (
                <li key={item.exerciseId}>
                  <a href={href({ name: 'exercise', id: item.exerciseId })}>
                    {getExercise(item.exerciseId)?.name}
                  </a>
                </li>
              ))}
            </ol>
            <a
              className="btn btn--primary btn--big"
              href={href({ name: 'player', routine: 'sample' })}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
              </svg>
              Start
            </a>
          </>
        ) : (
          <p>
            You’ve marked all of these “Not for me”. <a href="#/library">Browse the library</a> to
            change that.
          </p>
        )}
      </section>
    </main>
  )
}
