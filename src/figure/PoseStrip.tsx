// The still row of key poses (011 US6): each key pose numbered, with the move that starts there,
// so the person can see where a movement begins and ends. Shown or hidden by the person's choice.
import type { FigureSpec } from '../exercises/types'
import { Figure } from './Figure'
import { usePosesPref } from './poses'

export function PoseStrip({ spec, compact = false }: { spec: FigureSpec; compact?: boolean }) {
  const n = spec.keyframes.length
  return (
    <ol
      className={compact ? 'pose-strip pose-strip--compact' : 'pose-strip'}
      aria-label="Key poses"
      style={{ '--poses': n } as React.CSSProperties}
    >
      {spec.keyframes.map((_, i) => {
        const next = (i + 1) % n
        return (
          <li key={i} className="pose-strip__pose" aria-label={`Pose ${i + 1} of ${n}`}>
            <span className="pose-strip__num" aria-hidden="true">
              {i + 1}
            </span>
            <Figure spec={spec} frame={i} />
            {/* In the player the moving figure already names the current move. */}
            {compact ? (
              <span className="visually-hidden">{spec.labels[i]}</span>
            ) : (
              <p className="pose-strip__label">
                <span className="pose-strip__to">
                  <span aria-hidden="true">→</span>
                  <span className="visually-hidden">to pose</span> {next + 1}
                </span>{' '}
                {spec.labels[i]}
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}

const posesIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="2.5" y="6" width="5" height="12" rx="1.5" />
    <rect x="9.5" y="6" width="5" height="12" rx="1.5" />
    <rect x="16.5" y="6" width="5" height="12" rx="1.5" />
  </svg>
)

/** The Show poses / Hide poses button: text under a figure, or an icon in the player's top bar. */
export function PosesToggle({ icon = false }: { icon?: boolean }) {
  const { show, setShow } = usePosesPref()
  if (icon) {
    return (
      <button
        type="button"
        className={show ? 'icon-btn poses-btn poses-btn--on' : 'icon-btn poses-btn'}
        aria-label="Show poses"
        aria-pressed={show}
        title={show ? 'Hide poses' : 'Show poses'}
        onClick={() => setShow(!show)}
      >
        {posesIcon}
      </button>
    )
  }
  return (
    <button
      type="button"
      className="poses-toggle"
      aria-pressed={show}
      onClick={() => setShow(!show)}
    >
      {posesIcon}
      {show ? 'Hide poses' : 'Show poses'}
    </button>
  )
}

/** The strip, when the person has it on. */
export function PoseStripIfShown({ spec, compact }: { spec: FigureSpec; compact?: boolean }) {
  const { show } = usePosesPref()
  return show ? <PoseStrip spec={spec} compact={compact} /> : null
}
