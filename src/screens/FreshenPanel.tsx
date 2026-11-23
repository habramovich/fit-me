// "Try something new" on a set (spec 012): suggested Adds and Replaces that keep the set balanced,
// each accepted (with Undo) or skipped, plus Another idea and a short review of the set.
import { useEffect, useMemo, useState } from 'react'
import { href } from '../app/router'
import type { Marks } from '../data/repo/marks'
import type { SavedSet } from '../data/repo/sets'
import { allExercises, formatDose, getExercise } from '../exercises'
import { BODY_AREA_LABEL, TECHNIQUE_LABEL } from '../exercises/types'
import { Figure } from '../figure/Figure'
import { todayKey } from '../planner/history'
import type { Profile } from '../profile/types'
import type { SetItem } from '../sets/edit'
import {
  anotherIdea,
  applySuggestion,
  changeText,
  PHASE_LABEL,
  revalidate,
  reviewSet,
  suggest,
  type FreshenInput,
  type SetReview,
  type Suggestion,
} from '../sets/freshen'
import { keepFreshen, recallFreshen, type FreshenState } from './freshenMemory'

const nameOf = (id: string) => getExercise(id)?.name ?? 'An exercise'
const same = (a: SetItem[], b: SetItem[]) => a === b || JSON.stringify(a) === JSON.stringify(b)

export function Freshen({
  set,
  profile,
  marks,
  saveItems,
}: {
  set: SavedSet
  /** Null until the person's profile and marks have loaded. */
  profile: Profile | null
  marks: Marks | null
  saveItems: (id: string, items: SetItem[]) => void
}) {
  const [state, setState] = useState<FreshenState>(() => recallFreshen(set.id))
  const [today] = useState(() => todayKey())
  useEffect(() => keepFreshen(set.id, state), [set.id, state])

  const input = useMemo<FreshenInput | null>(
    () =>
      profile && marks
        ? { set, library: allExercises, profile, marks, today, skipped: state.skipped }
        : null,
    [set, profile, marks, today, state.skipped],
  )

  // After any change to the set, profile or marks: drop the cards that no longer apply, and the
  // Undo once the set has moved on from the accepted change.
  useEffect(() => {
    if (!input) return
    setState((s) => {
      if (!s.open) return s
      const list = revalidate(input, s.list)
      const undo = s.undo && same(set.items, s.undo.after) ? s.undo : null
      return list.length === s.list.length && undo === s.undo ? s : { ...s, list, undo }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [set.items, profile, marks])

  if (!input) {
    return (
      <button type="button" className="btn btn--outline" disabled>
        Loading your profile…
      </button>
    )
  }

  const open = () =>
    setState((s) => ({ ...s, open: true, list: suggest(input), undo: null, handled: false }))

  if (!state.open) {
    return (
      <button type="button" className="btn btn--outline" onClick={open}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="freshen__icon"
        >
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
        </svg>
        Try something new
      </button>
    )
  }

  const accept = (s: Suggestion) => {
    const before = set.items
    const after = applySuggestion(before, s)
    if (after === before) return
    saveItems(set.id, after)
    const text =
      s.change.kind === 'add'
        ? `Added ${nameOf(s.item.exerciseId)}.`
        : `Replaced ${nameOf(s.change.target.exerciseId)} with ${nameOf(s.item.exerciseId)}.`
    setState((st) => ({
      ...st,
      list: st.list.filter((x) => x !== s),
      undo: { before, after, list: st.list, text },
      handled: true,
    }))
  }
  const undo = () => {
    const u = state.undo
    if (!u) return
    saveItems(set.id, u.before)
    setState((st) => ({ ...st, list: u.list, undo: null }))
  }
  const skip = (s: Suggestion) =>
    setState((st) => ({
      ...st,
      list: st.list.filter((x) => x !== s),
      skipped: [...st.skipped, s.item.exerciseId],
      handled: true,
    }))
  const another = (s: Suggestion) =>
    setState((st) => ({ ...st, list: anotherIdea(input, st.list, s.key) }))
  const close = () => setState((st) => ({ ...st, open: false, list: [], undo: null }))

  const review = reviewSet(set, allExercises, input.profile)

  return (
    <section className="freshen card" aria-label="Try something new">
      <div className="row-between">
        <h2>Try something new</h2>
        <button type="button" className="btn btn--link" onClick={close}>
          Done
        </button>
      </div>
      <Review review={review} empty={set.items.length === 0} />

      <div className="freshen__live" aria-live="polite">
        {state.undo && (
          <p className="freshen__undo">
            <span>{state.undo.text}</span>
            <button type="button" className="btn btn--link" onClick={undo}>
              Undo
            </button>
          </p>
        )}
      </div>

      {state.list.length > 0 ? (
        <ul className="freshen__list">
          {state.list.map((s) => (
            <li key={s.key}>
              <Card
                s={s}
                onAccept={() => accept(s)}
                onSkip={() => skip(s)}
                onAnother={() => another(s)}
              />
            </li>
          ))}
        </ul>
      ) : state.handled ? (
        <div className="stack-sm">
          <p className="muted">That’s all for now.</p>
          <button type="button" className="btn btn--outline" onClick={open}>
            More ideas
          </button>
        </div>
      ) : (
        <p className="muted">Nothing new fits this set right now.</p>
      )}
    </section>
  )
}

function Card({
  s,
  onAccept,
  onSkip,
  onAnother,
}: {
  s: Suggestion
  onAccept: () => void
  onSkip: () => void
  onAnother: () => void
}) {
  const e = getExercise(s.item.exerciseId)
  const v = e?.[s.item.version]
  if (!e || !v) return null
  const link = href({ name: 'exercise', id: e.id })
  const title =
    s.change.kind === 'add' ? (
      <>
        Add <a href={link}>{e.name}</a> to {PHASE_LABEL[s.change.phase]}
      </>
    ) : (
      <>
        Replace {nameOf(s.change.target.exerciseId)} with <a href={link}>{e.name}</a>
      </>
    )
  return (
    <article className="freshen-card" aria-label={changeText(s)}>
      <a className="set-row__figure" href={link} aria-label={`About ${e.name}`}>
        <Figure spec={v.figure} thumbnail />
      </a>
      <div className="freshen-card__body">
        <h3 className="freshen-card__title">{title}</h3>
        <p className="small">{s.reason}</p>
        <p className="small muted">
          Amount: {formatDose(s.item.dose)}
          {s.item.version !== 'standard' && ` · ${s.item.version}`}
        </p>
      </div>
      <div className="freshen-card__actions">
        <button type="button" className="btn btn--primary" onClick={onAccept}>
          {s.change.kind === 'add' ? 'Add' : 'Replace'}
        </button>
        {s.hasAnother && (
          <button type="button" className="btn btn--outline" onClick={onAnother}>
            Another idea
          </button>
        )}
        <button type="button" className="btn btn--link" onClick={onSkip}>
          Skip
        </button>
      </div>
    </article>
  )
}

const MAX_AREAS = 5

function list(names: string[], word: 'and' | 'or'): string {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} ${word} ${names[names.length - 1]}`
}

function minutes(seconds: number): string {
  if (seconds === 0) return 'none'
  return `${Math.max(1, Math.round(seconds / 60))} min`
}

/** Three short lines: areas, part times, techniques (US3). */
function Review({ review, empty }: { review: SetReview; empty: boolean }) {
  if (empty) return <p className="small muted">This set is empty, so every idea is an Add.</p>
  const worked = review.worked.map((a) => BODY_AREA_LABEL[a])
  const shown =
    worked.length > MAX_AREAS
      ? [...worked.slice(0, MAX_AREAS), `${worked.length - MAX_AREAS} more`]
      : worked
  const missing = review.missing.map((a) => BODY_AREA_LABEL[a])
  return (
    <div className="freshen__review small" aria-label="How the set is balanced">
      <p>
        Works {list(shown, 'and')}.{missing.length > 0 && ` Nothing for ${list(missing, 'or')}.`}
      </p>
      <p>
        {review.parts
          .map(
            (p) => `${PHASE_LABEL[p.phase]} ${minutes(p.seconds)}${p.flag ? ` (${p.flag})` : ''}`,
          )
          .join(' · ')}
      </p>
      <p className="muted">
        {review.techniques.map(([t, n]) => `${TECHNIQUE_LABEL[t]} ${n}`).join(' · ')}
      </p>
    </div>
  )
}
