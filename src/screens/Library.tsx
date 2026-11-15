import { useState } from 'react'
import { useMarks } from '../app/marksContext'
import { href, navigate } from '../app/router'
import { useSets } from '../app/setsContext'
import type { Phase } from '../exercises/types'
import { addItem } from '../sets/edit'
import { allExercises, formatDose, formatRange, searchExercises } from '../exercises'
import { TECHNIQUES, TECHNIQUE_LABEL, type Technique } from '../exercises/types'
import { Figure } from '../figure/Figure'
import { Heart, TechniqueTag } from './parts'

type Filter = 'all' | 'favourites' | Technique

const PHASE_WORD: Record<Phase, string> = { warmup: 'warm-up', main: 'main', cooldown: 'cool-down' }

/** The Library; with `addTo`, each card adds the exercise to that set (spec 004 FR-006). */
export function Library({ addTo, phase = 'main' }: { addTo?: string; phase?: Phase } = {}) {
  const { marks, setMark } = useMarks()
  const { sets, saveItems } = useSets()
  const target = addTo ? sets?.find((s) => s.id === addTo) : undefined
  const [addedCount, setAddedCount] = useState<Record<string, number>>({})
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const shown = searchExercises(query).filter((e) => {
    if (filter === 'all') return true
    if (filter === 'favourites') return marks[e.id] === 'favourite'
    return e.technique === filter
  })

  const chips: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'favourites', label: 'Favourites' },
    ...TECHNIQUES.map((t) => ({ id: t, label: TECHNIQUE_LABEL[t] })),
  ]

  return (
    <main className="screen">
      {target && (
        <div className="card notice notice--row" role="status">
          <span>
            Adding to <strong>{target.name}</strong> · {PHASE_WORD[phase]}
          </span>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate({ name: 'set', id: target.id })}
          >
            Done
          </button>
        </div>
      )}
      <header className="row-between">
        <h1>Library</h1>
        <span className="muted" aria-live="polite">
          {shown.length} of {allExercises.length}
        </span>
      </header>

      <div className="field">
        <label htmlFor="lib-search">Search exercises</label>
        <input
          id="lib-search"
          type="search"
          placeholder="Name or body area, e.g. hips"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="chips" role="group" aria-label="Filter">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            className={filter === c.id ? 'chip chip--on' : 'chip'}
            aria-pressed={filter === c.id}
            onClick={() => setFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="card stack">
          <p>No exercises match.</p>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => {
              setQuery('')
              setFilter('all')
            }}
          >
            Clear search and filters
          </button>
        </div>
      ) : (
        <ul className="ex-grid">
          {shown.map((e) => {
            const mark = marks[e.id]
            return (
              <li key={e.id} className={mark === 'notForMe' ? 'ex-card ex-card--muted' : 'ex-card'}>
                <a href={href({ name: 'exercise', id: e.id })} className="ex-card__link">
                  <Figure spec={e.standard.figure} thumbnail className="ex-card__figure" />
                  <span className="ex-card__name">{e.name}</span>
                  <span className="ex-card__meta">
                    <TechniqueTag technique={e.technique} />
                    {mark === 'notForMe' && <span className="tag tag--plain">Not for me</span>}
                  </span>
                  <span className="ex-card__dose">
                    {formatDose(e.standard.dose)}
                    <span className="muted"> · {formatRange(e.standard.dose)}</span>
                  </span>
                </a>
                {target ? (
                  <button
                    type="button"
                    className="ex-card__add"
                    aria-label={`Add ${e.name} to ${target.name}`}
                    onClick={() => {
                      const latest = sets?.find((s) => s.id === target.id) ?? target
                      saveItems(
                        target.id,
                        addItem(latest.items, {
                          exerciseId: e.id,
                          version: 'standard',
                          phase,
                          dose: e.standard.dose,
                        }),
                      )
                      setAddedCount((c) => ({ ...c, [e.id]: (c[e.id] ?? 0) + 1 }))
                    }}
                  >
                    {addedCount[e.id] ? `Added ×${addedCount[e.id]}` : '+ Add'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ex-card__fav"
                    aria-pressed={mark === 'favourite'}
                    aria-label={
                      mark === 'favourite'
                        ? `Remove ${e.name} from favourites`
                        : `Add ${e.name} to favourites`
                    }
                    onClick={() => setMark(e.id, mark === 'favourite' ? null : 'favourite')}
                  >
                    <Heart filled={mark === 'favourite'} />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
