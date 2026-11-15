import { useEffect, useRef, useState } from 'react'
import { useMarks } from '../app/marksContext'
import type { PlanParams } from '../app/router'
import { formatRange, getExercise, paceOf } from '../exercises'
import type { PlayItem } from './machine'
import { estimateMinutes, sampleRoutine, singleRoutine } from '../exercises/sample'
import type { Phase, VersionKey } from '../exercises/types'
import { Figure } from '../figure/Figure'
import { PaceTag, TechniqueTag } from '../screens/parts'
import { summary } from './machine'
import { usePlayer } from './usePlayer'
import './player.css'

const PHASE_LABEL: Record<Phase, string> = {
  warmup: 'Warm-up',
  main: 'Main',
  cooldown: 'Cool-down',
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export function PlayerScreen({
  routine,
  version,
  plan,
  setItems,
  planId,
  uid,
}: {
  routine: string
  version?: string
  plan?: PlanParams
  /** The items to play, for a saved set (`set:<id>`) or a kept plan (`plan`). */
  setItems?: PlayItem[]
  /** The kept plan being played, marked used on the first exercise done (spec 006 FR-004). */
  planId?: string
  uid: string
}) {
  const { marks, setMark } = useMarks()
  /** "… won't be suggested again", shown for a few seconds after Skip next time. */
  const [notice, setNotice] = useState<string | null>(null)
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 6000)
    return () => clearTimeout(timer)
  }, [notice])
  // The routine is fixed when the player opens; later changes (marks, history) don't change it.
  const [items] = useState<PlayItem[]>(() => {
    if (routine.startsWith('set:') || routine === 'plan') return setItems ?? []
    if (routine.startsWith('single:'))
      return singleRoutine(routine.slice(7), (version as VersionKey) ?? 'standard')
    return sampleRoutine(marks)
  })
  const sessionRoutine = routine === 'plan' && plan ? `plan:${plan.routine}` : routine

  const { state, dispatch, wakeLock } = usePlayer(items, sessionRoutine, uid, planId)

  if (items.length === 0) {
    return (
      <main className="screen">
        <p>There’s nothing to play.</p>
        <a href="#/today">Back to Today</a>
      </main>
    )
  }

  if (state.phase === 'finished') {
    const s = summary(state)
    return (
      <main className="player player--done">
        <div className="done-badge" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 24 24">
            <path d="M5 12l5 5 9-10" />
          </svg>
        </div>
        <h1>Session done</h1>
        <p className="muted">
          {s.minutes} min · {s.done} done · {s.skipped} skipped · {s.rated} rated
        </p>
        {notice && <p className="small">{notice}</p>}
        <p className="muted small">Ratings are saved; you’ll see them in Progress.</p>
        <a className="btn btn--primary btn--big" href="#/today">
          Done
        </a>
      </main>
    )
  }

  const item = state.items[state.index]
  const exercise = getExercise(item.exerciseId)!
  const v = exercise[item.version] ?? exercise.standard
  const dose = item.dose
  const isTime = dose.kind === 'time'

  const big = isTime ? clock(state.remaining) : String(dose.reps)
  const detail = [
    isTime
      ? dose.perSide
        ? 'per side'
        : 'remaining'
      : `reps${dose.repsNote ? ` ${dose.repsNote}` : ''}`,
    !isTime && dose.sets > 1 ? `set ${state.set} of ${dose.sets}` : '',
    dose.perSide ? `side ${state.side} of 2` : '',
  ]
    .filter(Boolean)
    .join(' · ')
  const mainLabel = isTime
    ? 'Finish early'
    : state.set < (dose.kind === 'reps' ? dose.sets : 1)
      ? 'Set done'
      : 'Done'
  const mainEvent = isTime ? ({ type: 'finishEarly' } as const) : ({ type: 'setDone' } as const)

  return (
    <main className="player">
      <div className="player__top">
        <a href="#/today" className="icon-btn" aria-label="End session">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </a>
        <div className="player__progress">
          <div className="segments" aria-hidden="true">
            {state.items.map((_, i) => (
              <span
                key={i}
                className={
                  i < state.index ? 'seg seg--done' : i === state.index ? 'seg seg--now' : 'seg'
                }
              />
            ))}
          </div>
          <span className="muted small">
            {state.index + 1} of {state.items.length} · {PHASE_LABEL[exercise.phases[0]]}
            {state.items.length > 1 && ` · about ${estimateMinutes(state.items)} min`}
          </span>
        </div>
      </div>

      <div className="player__body">
        <div className="card player__figure">
          <Figure
            key={`${state.index}-${state.side}`}
            spec={v.figure}
            breathing={v.breathing}
            playing={!state.paused && state.phase === 'doing'}
            pace={paceOf(exercise, v)}
            secondsPerRep={v.secondsPerRep}
          />
        </div>

        <div className="player__info">
          <div className="player__title">
            <div className="stack-sm">
              <div className="row-wrap">
                <TechniqueTag technique={exercise.technique} />
                <PaceTag pace={paceOf(exercise, v)} />
              </div>
              <h1>{exercise.name}</h1>
            </div>
            <div className="player__count" aria-live="polite">
              <div className="player__big">{big}</div>
              <div className="muted small">{detail}</div>
            </div>
          </div>
          <p className="muted small">{formatRange(dose)}</p>
          <ul className="cues">
            {v.cues.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          {notice && (
            <div className="card notice notice--row" role="status">
              <span className="small">{notice}</span>
              <button type="button" className="btn btn--link" onClick={() => setNotice(null)}>
                OK
              </button>
            </div>
          )}
          {state.paused && <p className="paused-note">Paused</p>}
          {(wakeLock === 'unsupported' || wakeLock === 'refused') && (
            <p className="muted small">
              Your screen may dim during the session. A longer screen timeout helps.
            </p>
          )}

          <div className="player__controls">
            <div className="player__row">
              <button
                type="button"
                className="round-btn"
                aria-label="Previous exercise"
                onClick={() => dispatch({ type: 'back' })}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 6l-8 6 8 6V6zM6 6v12" />
                </svg>
              </button>
              <button
                type="button"
                className="round-btn round-btn--main"
                aria-label={state.paused ? 'Resume' : 'Pause'}
                onClick={() => dispatch({ type: state.paused ? 'resume' : 'pause' })}
              >
                {state.paused ? (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="filled"
                  >
                    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
                  </svg>
                ) : (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="filled"
                  >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                className="round-btn"
                aria-label="Skip exercise"
                onClick={() => dispatch({ type: 'skip' })}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l8 6-8 6V6zM18 6v12" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--big"
              onClick={() => dispatch(mainEvent)}
            >
              {mainLabel}
            </button>
          </div>
        </div>
      </div>

      {state.phase === 'switchSide' && (
        <Sheet title="Switch sides">
          <p className="muted">Starting the other side in {state.remaining} s.</p>
          <button
            type="button"
            className="btn btn--primary btn--big"
            onClick={() => dispatch({ type: 'continueSide' })}
          >
            Start other side now
          </button>
        </Sheet>
      )}

      {state.phase === 'rating' && (
        <Sheet title={`How was ${exercise.name}?`}>
          <button
            type="button"
            className="rate-btn"
            onClick={() => dispatch({ type: 'rate', rating: 'easy' })}
          >
            <strong>Too easy</strong>
          </button>
          <button
            type="button"
            className="rate-btn rate-btn--mid"
            onClick={() => dispatch({ type: 'rate', rating: 'right' })}
          >
            <strong>Just right</strong>
          </button>
          <button
            type="button"
            className="rate-btn"
            onClick={() => dispatch({ type: 'rate', rating: 'hard' })}
          >
            <strong>Too hard</strong>
          </button>
          <button
            type="button"
            className="rate-btn rate-btn--skip"
            onClick={() => {
              setMark(exercise.id, 'notForMe')
              setNotice(
                `${exercise.name} won’t be suggested again. Undo from its page in the Library.`,
              )
              dispatch({ type: 'rate', rating: null })
            }}
          >
            <strong>Skip next time</strong>
            <span className="muted small">Not for me: won’t be suggested again</span>
          </button>
        </Sheet>
      )}
    </main>
  )
}

function Sheet({ title, children }: { title: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.querySelector('button')?.focus()
  }, [title])
  return (
    <div className="sheet-backdrop">
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  )
}
