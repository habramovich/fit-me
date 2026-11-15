// The planned session: reasons, Swap, Reshuffle, Save as set, Start (spec 003 US2; 004 US1).
import { useState } from 'react'
import { href, navigate, type PlanParams } from '../app/router'
import { useSets } from '../app/setsContext'
import { fromPlan } from '../sets/edit'
import { formatDose, getExercise } from '../exercises'
import type { Phase } from '../exercises/types'
import { Figure } from '../figure/Figure'
import type { HistorySummary } from '../planner/plan'
import { ROUTINES } from '../planner/routines'
import { handOffPlan, usePlan } from '../planner/usePlan'
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
  profile: Profile
  history: HistorySummary | null
}) {
  const result = usePlan(params, profile, history)
  const routine = ROUTINES[params.routine]
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

  if (result === null) {
    return (
      <main className="screen">
        {back}
        <p className="muted">Planning…</p>
      </main>
    )
  }

  if (result.kind === 'insufficient') {
    const s = result.suggestion
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
              href={href({ name: 'plan', plan: { ...params, routine: s, shuffle: 0, swaps: {} } })}
            >
              Plan a {ROUTINES[s].name.toLowerCase()} instead
            </a>
          )}
        </div>
      </main>
    )
  }

  const minutes = Math.round(result.totalSeconds / 60)
  const swap = (i: number) =>
    href({
      name: 'plan',
      plan: { ...params, swaps: { ...params.swaps, [i]: (params.swaps[i] ?? 0) + 1 } },
    })
  const reshuffle = href({
    name: 'plan',
    plan: { ...params, shuffle: params.shuffle + 1, swaps: {} },
  })
  const startHref = href({ name: 'player', routine: 'plan', plan: params })

  return (
    <main className="screen">
      {back}
      <header className="stack-sm">
        <p className="muted">{routine.name}</p>
        <h1>Your {minutes}-minute session</h1>
        {result.shortOfTime && (
          <p className="muted small">
            Shorter than {params.minutes} minutes: that’s all the library has for this routine right
            now.
          </p>
        )}
      </header>

      <ol className="plan-list">
        {result.items.map((item, i) => {
          const e = getExercise(item.exerciseId)!
          const v = e[item.version] ?? e.standard
          const heading =
            i === 0 || result.items[i - 1].phase !== item.phase ? PHASE_LABEL[item.phase] : null
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
                <a className="plan-item__swap" href={swap(i)} aria-label={`Swap ${e.name}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
                  </svg>
                  <span aria-hidden="true">Swap</span>
                </a>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="stack-sm">
        <a
          className="btn btn--primary btn--big"
          href={startHref}
          onClick={() => handOffPlan(params, result)}
        >
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
              const id = create(name, fromPlan(result.items), `plan:${params.routine}`)
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
        <a className="btn btn--outline" href={reshuffle}>
          Reshuffle
        </a>
      </div>
    </main>
  )
}
