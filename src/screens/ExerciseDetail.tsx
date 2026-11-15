import { useState } from 'react'
import { href } from '../app/router'
import { formatDose, formatRange, getExercise } from '../exercises'
import { BODY_AREA_LABEL, type VersionKey } from '../exercises/types'
import { Figure } from '../figure/Figure'
import { ADVICE_NOTE, MarkButtons, TechniqueTag } from './parts'

const VERSION_LABEL: Record<VersionKey, string> = {
  easier: 'Easier',
  standard: 'Standard',
  harder: 'Harder',
}
const LEVEL_LABEL = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }
const EQUIPMENT_LABEL = {
  none: 'No equipment',
  mat: 'Mat',
  chair: 'Chair',
  wall: 'Wall',
  band: 'Resistance band',
}

export function ExerciseDetail({ id }: { id: string }) {
  const exercise = getExercise(id)
  const [versionKey, setVersionKey] = useState<VersionKey>('standard')

  if (!exercise) {
    return (
      <main className="screen">
        <a href="#/library" className="back-link">
          Library
        </a>
        <p>That exercise isn’t in the library.</p>
      </main>
    )
  }

  const version = exercise[versionKey] ?? exercise.standard
  const missing = !exercise[versionKey]

  return (
    <main className="screen">
      <a href="#/library" className="back-link">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Library
      </a>

      <div className="card figure-card">
        <Figure key={versionKey} spec={version.figure} breathing={version.breathing} />
      </div>

      <header className="stack-sm">
        <div className="row-wrap">
          <TechniqueTag technique={exercise.technique} />
          <span className="tag tag--plain">{LEVEL_LABEL[exercise.level]}</span>
        </div>
        <h1>{exercise.name}</h1>
        <p className="dose-line">
          <strong>{formatDose(version.dose)}</strong>{' '}
          <span className="muted">· {formatRange(version.dose)}</span>
        </p>
      </header>

      <section className="stack-sm" aria-labelledby="ver-h">
        <h2 id="ver-h">Version</h2>
        <div className="segmented" role="group" aria-label="Version">
          {(['easier', 'standard', 'harder'] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={versionKey === k}
              onClick={() => setVersionKey(k)}
            >
              {VERSION_LABEL[k]}
            </button>
          ))}
        </div>
        {missing && (
          <p className="muted">
            There’s no {VERSION_LABEL[versionKey].toLowerCase()} version yet; showing the standard
            one.
          </p>
        )}
      </section>

      <section className="stack-sm" aria-labelledby="how-h">
        <h2 id="how-h">How to</h2>
        <ol className="steps">
          {version.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="breath-note" aria-label="Breathing">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 10h11a3 3 0 1 0-3-3M4 14h14a3 3 0 1 1-3 3" />
        </svg>
        <p>{version.breathing}</p>
      </section>

      <dl className="facts">
        <div>
          <dt>Works</dt>
          <dd>{exercise.worksAreas.map((a) => BODY_AREA_LABEL[a]).join(', ')}</dd>
        </div>
        <div>
          <dt>Equipment</dt>
          <dd>{exercise.equipment.map((q) => EQUIPMENT_LABEL[q]).join(', ')}</dd>
        </div>
      </dl>

      <MarkButtons id={exercise.id} name={exercise.name} />

      <a
        className="btn btn--primary btn--big"
        href={href({
          name: 'player',
          routine: `single:${exercise.id}`,
          version: missing ? 'standard' : versionKey,
        })}
      >
        Try it
      </a>

      <p className="muted small">{ADVICE_NOTE}</p>
    </main>
  )
}
