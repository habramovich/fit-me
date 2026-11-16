// Small pieces shared by several screens.
import { useMarks } from '../app/marksContext'
import { PACE_LABEL, TECHNIQUE_LABEL, type Pace, type Technique } from '../exercises/types'

export function TechniqueTag({ technique }: { technique: Technique }) {
  return <span className={`tag tag--${technique}`}>{TECHNIQUE_LABEL[technique]}</span>
}

/** How fast to move, in words (spec 006 US2). */
export function PaceTag({ pace }: { pace: Pace }) {
  return (
    <span className="tag tag--plain" aria-label={`Pace: ${PACE_LABEL[pace]}`}>
      {PACE_LABEL[pace]}
    </span>
  )
}

export function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={filled ? 'heart heart--on' : 'heart'}
    >
      <path d="M12 20s-7-4.5-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.5-9 9-9 9z" />
    </svg>
  )
}

/** Favourite / Not for me toggles for one exercise (mutually exclusive). */
export function MarkButtons({ id, name }: { id: string; name: string }) {
  const { marks, setMark } = useMarks()
  const mark = marks[id]
  return (
    <div className="mark-buttons">
      <button
        type="button"
        className={mark === 'favourite' ? 'btn btn--fav-on' : 'btn btn--outline'}
        aria-pressed={mark === 'favourite'}
        onClick={() => setMark(id, mark === 'favourite' ? null : 'favourite')}
      >
        <Heart filled={mark === 'favourite'} />
        {mark === 'favourite' ? 'Favourite' : 'Add to favourites'}
        <span className="visually-hidden"> {name}</span>
      </button>
      <button
        type="button"
        className={mark === 'notForMe' ? 'btn btn--dark' : 'btn btn--outline'}
        aria-pressed={mark === 'notForMe'}
        onClick={() => setMark(id, mark === 'notForMe' ? null : 'notForMe')}
      >
        Not for me<span className="visually-hidden"> {name}</span>
      </button>
    </div>
  )
}

export const ADVICE_NOTE =
  'General fitness guidance, not medical advice. Stop if anything hurts, and check with a professional if you have an injury.'
