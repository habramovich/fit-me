// Batch review (research R4): every exercise and version animating side by side, for the owner to
// approve. Shown in development and on Firebase Hosting preview channels only.
import { useState } from 'react'
import { allExercises, formatDose, formatRange, paceOf } from '../exercises'
import { PACE_LABEL, TECHNIQUE_LABEL, type VersionKey } from '../exercises/types'
import { Figure } from '../figure/Figure'

export function Review() {
  const batches = [...new Set(allExercises.map((e) => e.batch))].sort((a, b) => a - b)
  const [batch, setBatch] = useState(batches[batches.length - 1])
  const shown = allExercises.filter((e) => e.batch === batch)

  return (
    <main className="screen screen--wide">
      <header className="stack-sm">
        <h1>Figure review</h1>
        <p className="muted">
          Check each figure, its arrows, breathing and dose. Not visible in the live app.
        </p>
        <div className="chips" role="group" aria-label="Batch">
          {batches.map((b) => (
            <button
              key={b}
              type="button"
              className={b === batch ? 'chip chip--on' : 'chip'}
              aria-pressed={b === batch}
              onClick={() => setBatch(b)}
            >
              Batch {b}
            </button>
          ))}
        </div>
      </header>
      {shown.map((e) => (
        <section key={e.id} className="card stack" aria-labelledby={`r-${e.id}`}>
          <h2 id={`r-${e.id}`}>
            {e.name} <span className="muted small">· {TECHNIQUE_LABEL[e.technique]}</span>
          </h2>
          <div className="review-grid">
            {(['easier', 'standard', 'harder'] as VersionKey[]).map((k) => {
              const v = e[k]
              if (!v) return null
              return (
                <div key={k} className="stack-sm">
                  <h3 className="small">{k[0].toUpperCase() + k.slice(1)}</h3>
                  <Figure
                    spec={v.figure}
                    breathing={v.breathing}
                    pace={paceOf(e, v)}
                    secondsPerRep={v.secondsPerRep}
                  />
                  <p className="small">Pace: {PACE_LABEL[paceOf(e, v)]}</p>
                  <p>
                    <strong>{formatDose(v.dose)}</strong>{' '}
                    <span className="muted">· {formatRange(v.dose)}</span>
                  </p>
                  <p className="small">{v.breathing}</p>
                  <ul className="small">
                    {v.cues.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </main>
  )
}
