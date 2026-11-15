// "Add to set" from an exercise page: choose the part, then a set (or a new one) (spec 004 FR-006).
import { useState } from 'react'
import { href } from '../app/router'
import { useSets } from '../app/setsContext'
import { getExercise } from '../exercises'
import type { Phase, VersionKey } from '../exercises/types'
import { MAX_SET_ITEMS, PHASE_ORDER, addItem } from '../sets/edit'
import { Segmented } from './controls'

const PHASE_LABEL: Record<Phase, string> = {
  warmup: 'Warm-up',
  main: 'Main',
  cooldown: 'Cool-down',
}

export function AddToSet({
  exerciseId,
  version,
  defaultPhase,
  onDone,
}: {
  exerciseId: string
  version: VersionKey
  defaultPhase: Phase
  onDone: () => void
}) {
  const { sets, create, saveItems } = useSets()
  const [phase, setPhase] = useState<Phase>(defaultPhase)
  const [added, setAdded] = useState<{ id: string; name: string } | null>(null)
  const exercise = getExercise(exerciseId)!
  const item = { exerciseId, version, phase, dose: (exercise[version] ?? exercise.standard).dose }

  if (added) {
    return (
      <div className="card stack-sm" role="status">
        <p>
          Added to <strong>{added.name}</strong> ({PHASE_LABEL[phase].toLowerCase()}).
        </p>
        <div className="row-wrap">
          <a className="btn btn--primary" href={href({ name: 'set', id: added.id })}>
            Open set
          </a>
          <button type="button" className="btn btn--outline" onClick={onDone}>
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card stack" aria-label="Add to set">
      <div className="row-between">
        <h2>Add to set</h2>
        <button type="button" className="btn btn--link" onClick={onDone}>
          Cancel
        </button>
      </div>
      <Segmented
        label="Part"
        options={PHASE_ORDER}
        labels={PHASE_LABEL}
        value={phase}
        onChange={setPhase}
      />
      <ul className="set-cards">
        {(sets ?? []).map((s) => {
          const full = s.items.length >= MAX_SET_ITEMS
          return (
            <li key={s.id}>
              <button
                type="button"
                className="set-card"
                disabled={full}
                onClick={() => {
                  saveItems(s.id, addItem(s.items, item))
                  setAdded({ id: s.id, name: s.name })
                }}
              >
                <span className="set-card__name">{s.name}</span>
                <span className="muted small">{full ? 'Full' : `${s.items.length} exercises`}</span>
              </button>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            className="set-card set-card--new"
            onClick={() => {
              const name = `My set with ${exercise.name}`.slice(0, 60)
              const id = create(name, [item], 'manual')
              setAdded({ id, name })
            }}
          >
            <span className="set-card__name">+ New set</span>
          </button>
        </li>
      </ul>
    </div>
  )
}
