// The planned session: reasons, Swap, Reshuffle, Save as set, Start (spec 003 US2; 004 US1).
// The plan is kept until it's done or changed here (spec 006 US1).
import { useEffect, useRef, useState } from 'react'
import { usePlans } from '../app/plansContext'
import { href, navigate, type PlanParams } from '../app/router'
import { useSets } from '../app/setsContext'
import { fromPlan } from '../sets/edit'
import { formatDose, getExercise } from '../exercises'
import type { Phase } from '../exercises/types'
import { Figure } from '../figure/Figure'
import { plannedLabel } from '../planner/history'
import type { HistorySummary } from '../planner/plan'
import { ROUTINES } from '../planner/routines'
import { useKeptPlan } from '../planner/usePlan'
import type { Profile } from '../profile/types'
import { TechniqueTag } from './parts'

const dayFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' })

const PHASE_LABEL: Record<Phase, string> = {
  warmup: 'Warm-up',
  main: 'Main',
  cooldown: 'Cool-down',
}

export function PlanView({
  params,
  profile,
  history,
}: {
  params: PlanParams
  /** null until the person's record has loaded. */
  profile: Profile | null
  history: HistorySummary | null
}) {
  const kept = useKeptPlan(params.routine, params.minutes, profile, history)
  const { viewed } = usePlans()
  const routine = ROUTINES[params.routine]
  const ready = kept.status === 'ready'
  const keptId = ready ? kept.plan.id : null
  // Remember when it was last looked at, so Today offers the latest (once per visit).
  const marked = useRef<string | null>(null)
  useEffect(() => {
    if (keptId && marked.current !== keptId) {
      marked.current = keptId
      viewed(keptId)
    }
  }, [keptId, viewed])
  const { create } = useSets()
  /** The name being typed for "Save as set", or null when not saving. */
  const [saving, setSaving] = useState<string | null>(null)

  const back = (
    <a href="#/today" className="back-link">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      Today
    </a>
  )

  if (kept.status === 'loading') {
    return (
      <main className="screen">
        {back}
        <p className="muted">Planning…</p>
      </main>
    )
  }

  if (kept.status === 'insufficient') {
    const s = kept.suggestion
    return (
      <main className="screen">
        {back}
        <h1>{routine.name}</h1>
        <div className="card stack">
          <p>
            There aren’t enough exercises in the library for a good {routine.name.toLowerCase()}{' '}
            yet. More are coming.
          </p>
          {s && (
            <a
              className="btn btn--primary"
              href={href({ name: 'plan', plan: { ...params, routine: s } })}
            >
              Plan a {ROUTINES[s].name.toLowerCase()} instead
            </a>
          )}
        </div>
      </main>
    )
  }

  const { plan } = kept
  const minutes = Math.round(kept.totalSeconds / 60)
  const planned = plannedLabel(plan.plannedAt)
  const startHref = href({ name: 'player', routine: 'plan', plan: params })

  return (
    <main className="screen">
      {back}
      <header className="stack-sm">
        <p className="muted">{routine.name}</p>
        <h1>Your {minutes}-minute session</h1>
        {planned && <p className="muted small">{planned}</p>}
        {plan.shortOfTime && (
          <p className="muted small">
            Shorter than {params.minutes} minutes: that’s all the library has for this routine right
            now.
          </p>
        )}
      </header>

      {plan.notes.length > 0 && (
        <div className="card notice" role="status">
          {plan.notes.map((n) => (
            <p key={n} className="small">
              {n}
            </p>
          ))}
        </div>
      )}

      <ol className="plan-list">
        {plan.items.map((item, i) => {
          const e = getExercise(item.exerciseId)!
          const v = e[item.version] ?? e.standard
          const heading =
            i === 0 || plan.items[i - 1].phase !== item.phase ? PHASE_LABEL[item.phase] : null
          return (
            <li key={`${i}-${item.exerciseId}`}>
              {heading && <h2 className="plan-list__phase">{heading}</h2>}
              <div className="plan-item">
                <a
                  href={href({ name: 'exercise', id: e.id })}
                  className="plan-item__figure"
                  aria-label={`About ${e.name}`}
                >
                  <Figure spec={v.figure} thumbnail />
                </a>
                <div className="plan-item__body">
                  <span className="plan-item__name">
                    {e.name}
                    {item.version !== 'standard' && (
                      <span className="muted small"> · {item.version}</span>
                    )}
                  </span>
                  <span className="small">
                    {formatDose(item.dose)} · <TechniqueTag technique={e.technique} />
                  </span>
                  <span className="plan-item__reason">{item.reason}</span>
                </div>
                <button
                  type="button"
                  className="plan-item__swap"
                  aria-label={`Swap ${e.name}`}
                  onClick={() => kept.swap(i)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
                  </svg>
                  <span aria-hidden="true">Swap</span>
                </button>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="stack-sm">
        <a className="btn btn--primary btn--big" href={startHref}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
          </svg>
          Start
        </a>
        {saving === null ? (
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => setSaving(`${routine.name}, ${dayFormat.format(new Date())}`)}
          >
            Save as set
          </button>
        ) : (
          <form
            className="rename"
            onSubmit={(e) => {
              e.preventDefault()
              const name = saving.trim().slice(0, 60) || routine.name
              const id = create(name, fromPlan(plan.items), `plan:${params.routine}`)
              setSaving(null)
              navigate({ name: 'set', id })
            }}
          >
            <label htmlFor="set-name" className="visually-hidden">
              Name for this set
            </label>
            <input
              id="set-name"
              value={saving}
              maxLength={60}
              autoFocus
              onChange={(e) => setSaving(e.target.value)}
            />
            <button type="submit" className="btn btn--primary">
              Save
            </button>
          </form>
        )}
        <button type="button" className="btn btn--outline" onClick={kept.reshuffle}>
          Reshuffle
        </button>
      </div>
    </main>
  )
}
