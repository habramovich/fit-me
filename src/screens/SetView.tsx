// A saved set: arrange, rename, delete, start (spec 004 US1, US2).
import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { goBack, href, navigate } from '../app/router'
import { useSets } from '../app/setsContext'
import { formatDose, getExercise } from '../exercises'
import type { Phase } from '../exercises/types'
import { Figure } from '../figure/Figure'
import { PHASE_ORDER, moveDown, moveTo, moveUp, removeItem, type SetItem } from '../sets/edit'
import { setMinutes } from '../sets/minutes'

const PHASE_LABEL: Record<Phase, string> = {
  warmup: 'Warm-up',
  main: 'Main',
  cooldown: 'Cool-down',
}

interface Drag {
  from: number
  startY: number
  y: number
  target: { phase: Phase; pos: number }
}

export function SetView({ id }: { id: string }) {
  const { sets, saveItems, rename, remove } = useSets()
  const [renaming, setRenaming] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const sectionRefs = useRef<Partial<Record<Phase, HTMLElement | null>>>({})
  const rowRefs = useRef(new Map<number, HTMLElement>())

  const back = (
    <button
      type="button"
      className="back-link back-link--button"
      onClick={() => goBack({ name: 'today' })}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      Back
    </button>
  )

  if (sets === null) {
    return (
      <main className="screen">
        {back}
        <p className="muted">Loading your set…</p>
      </main>
    )
  }
  const set = sets.find((s) => s.id === id)
  if (!set) {
    return (
      <main className="screen">
        {back}
        <p>That set isn’t there any more.</p>
        <a href="#/today">Back to Today</a>
      </main>
    )
  }
  const items = set.items
  const save = (next: SetItem[]) => {
    if (next !== items) saveItems(set.id, next)
  }

  // ----- Drag and drop (pointer events; the handle captures the pointer) -----
  const targetAt = (from: number, y: number): Drag['target'] => {
    let phase: Phase = 'warmup'
    for (const p of PHASE_ORDER) {
      const el = sectionRefs.current[p]
      if (el && el.getBoundingClientRect().top <= y) phase = p
    }
    const rows = items
      .map((it, i) => ({ it, i }))
      .filter((r) => r.it.phase === phase && r.i !== from)
    let pos = rows.findIndex((r) => {
      const rect = rowRefs.current.get(r.i)?.getBoundingClientRect()
      return rect ? y < rect.top + rect.height / 2 : false
    })
    if (pos === -1) pos = rows.length
    return { phase, pos }
  }
  const onHandleDown = (e: ReactPointerEvent<HTMLButtonElement>, from: number) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDrag({ from, startY: e.clientY, y: e.clientY, target: targetAt(from, e.clientY) })
  }
  const onHandleMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!drag) return
    const y = e.clientY
    // Scroll when dragging near the top or bottom of the screen.
    if (y < 70) window.scrollBy(0, -12)
    else if (y > window.innerHeight - 110) window.scrollBy(0, 12)
    setDrag({ ...drag, y, target: targetAt(drag.from, y) })
  }
  const onHandleUp = () => {
    if (!drag) return
    save(moveTo(items, drag.from, drag.target.phase, drag.target.pos))
    setDrag(null)
  }

  const indicator = <li className="drop-indicator" aria-hidden="true" />

  return (
    <main className="screen">
      {back}
      <header className="stack-sm">
        {renaming === null ? (
          <div className="row-between">
            <h1>{set.name}</h1>
            <button type="button" className="btn btn--link" onClick={() => setRenaming(set.name)}>
              Rename
            </button>
          </div>
        ) : (
          <form
            className="rename"
            onSubmit={(e) => {
              e.preventDefault()
              const name = renaming.trim().slice(0, 60)
              if (name) rename(set.id, name)
              setRenaming(null)
            }}
          >
            <label htmlFor="set-name" className="visually-hidden">
              Set name
            </label>
            <input
              id="set-name"
              value={renaming}
              maxLength={60}
              autoFocus
              onChange={(e) => setRenaming(e.target.value)}
            />
            <button type="submit" className="btn btn--primary">
              Save
            </button>
          </form>
        )}
        <p className="muted">
          {items.length} exercises · about {setMinutes(items)} min
        </p>
        <p className="muted small">
          Drag the handle to reorder, or use the arrows. Changes save as you go.
        </p>
      </header>

      {PHASE_ORDER.map((phase) => {
        const rows = items.map((it, i) => ({ it, i })).filter((r) => r.it.phase === phase)
        const visible = rows.filter((r) => r.i !== drag?.from)
        const showAt = drag && drag.target.phase === phase ? drag.target.pos : -1
        return (
          <section
            key={phase}
            ref={(el) => void (sectionRefs.current[phase] = el)}
            className="set-part"
            aria-label={PHASE_LABEL[phase]}
          >
            <div className="row-between">
              <h2>{PHASE_LABEL[phase]}</h2>
              <a
                className="btn btn--link small"
                href={href({ name: 'library', addTo: set.id, phase })}
              >
                + Add
              </a>
            </div>
            <ol className="set-list">
              {rows.length === 0 && showAt === -1 && (
                <li className="set-empty muted small">
                  Nothing here yet. Drag an exercise here or add one.
                </li>
              )}
              {visible.map((r, k) => (
                <SetRow
                  key={`${r.i}-${r.it.exerciseId}`}
                  item={r.it}
                  index={r.i}
                  before={showAt === k ? indicator : null}
                  rowRef={(el) => {
                    if (el) rowRefs.current.set(r.i, el)
                    else rowRefs.current.delete(r.i)
                  }}
                  onHandleDown={onHandleDown}
                  onHandleMove={onHandleMove}
                  onHandleUp={onHandleUp}
                  onUp={() => save(moveUp(items, r.i))}
                  onDown={() => save(moveDown(items, r.i))}
                  onRemove={() => save(removeItem(items, r.i))}
                />
              ))}
              {showAt === visible.length && indicator}
            </ol>
          </section>
        )
      })}

      {drag && (
        <div className="drag-ghost" style={{ top: drag.y - 28 }} aria-hidden="true">
          {getExercise(items[drag.from].exerciseId)?.name ?? ''}
        </div>
      )}

      <div className="stack-sm">
        {items.length > 0 ? (
          <a
            className="btn btn--primary btn--big"
            href={href({ name: 'player', routine: `set:${set.id}` })}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />
            </svg>
            Start
          </a>
        ) : (
          <p className="muted">Add some exercises to start this set.</p>
        )}
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => {
            if (window.confirm(`Delete “${set.name}”? This can’t be undone.`)) {
              remove(set.id)
              navigate({ name: 'today' })
            }
          }}
        >
          Delete set
        </button>
      </div>
    </main>
  )
}

function SetRow({
  item,
  index,
  before,
  rowRef,
  onHandleDown,
  onHandleMove,
  onHandleUp,
  onUp,
  onDown,
  onRemove,
}: {
  item: SetItem
  index: number
  before: React.ReactNode
  rowRef: (el: HTMLElement | null) => void
  onHandleDown: (e: ReactPointerEvent<HTMLButtonElement>, index: number) => void
  onHandleMove: (e: ReactPointerEvent<HTMLButtonElement>) => void
  onHandleUp: () => void
  onUp: () => void
  onDown: () => void
  onRemove: () => void
}) {
  const e = getExercise(item.exerciseId)
  const v = e?.[item.version] ?? e?.standard
  const name = e?.name ?? 'No longer available'
  return (
    <>
      {before}
      <li ref={rowRef} className="set-row">
        <button
          type="button"
          className="set-row__handle"
          aria-label={`Drag to reorder ${name}`}
          onPointerDown={(ev) => onHandleDown(ev, index)}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" />
          </svg>
        </button>
        {v ? (
          <a
            className="set-row__figure"
            href={href({ name: 'exercise', id: item.exerciseId })}
            aria-label={`About ${name}`}
          >
            <Figure spec={v.figure} thumbnail />
          </a>
        ) : (
          <span className="set-row__figure" />
        )}
        <div className="set-row__body">
          <span className="set-row__name">{name}</span>
          <span className="small muted">
            {formatDose(item.dose)}
            {item.version !== 'standard' && ` · ${item.version}`}
          </span>
        </div>
        <div className="set-row__actions">
          <button type="button" className="mini-btn" aria-label={`Move ${name} up`} onClick={onUp}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 15l6-6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            className="mini-btn"
            aria-label={`Move ${name} down`}
            onClick={onDown}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            className="mini-btn"
            aria-label={`Remove ${name}`}
            onClick={onRemove}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </li>
    </>
  )
}
