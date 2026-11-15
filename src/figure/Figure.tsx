import { useEffect, useRef, useState } from 'react'
import type { FigureSpec, Pace } from '../exercises/types'
import './Figure.css'
import {
  WIDTH,
  arrowPaths,
  breathFor,
  holdEntrySeconds,
  holdPhaseAt,
  labelFor,
  limbSegments,
  phaseAt,
  poseAt,
  ringDot,
  ringPaths,
  timingFor,
  transitionArrows,
  type Phase,
} from './geometry'

const REDUCED_STEP_SECONDS = 2.5

function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false,
  )
  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia(query)
    const update = () => setReduced(mq.matches)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

/** Seconds of animation time, advancing only while `playing`, up to `limit`. */
function useAnimationClock(playing: boolean, limit = Infinity): number {
  const [elapsed, setElapsed] = useState(0)
  const last = useRef<number | null>(null)
  useEffect(() => {
    if (!playing) {
      last.current = null
      return
    }
    let frame = 0
    const tick = (now: number) => {
      if (last.current !== null) {
        const dt = Math.min(0.1, (now - last.current) / 1000)
        // Unchanged state (at the limit) doesn't re-render.
        setElapsed((e) => Math.min(limit, e + dt))
      }
      last.current = now
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, limit])
  return elapsed
}

export interface FigureProps {
  spec: FigureSpec
  /** Animate (default true). Pausing freezes the current pose. */
  playing?: boolean
  /** Static first pose with no arrows or captions, for cards. */
  thumbnail?: boolean
  /** Shown when the figure has no per-movement breath (holds, cardio). */
  breathing?: string
  className?: string
  /** Freeze at the start of this transition, showing its arrows (for review renders). */
  still?: number
  /** How fast to move (spec 006 US2); without it, the original fixed timing. */
  pace?: Pace
  /** The version's seconds per repetition, which sets the speed of slow and flowing moves. */
  secondsPerRep?: number
}

export function Figure({
  spec,
  playing = true,
  thumbnail = false,
  breathing,
  className,
  still,
  pace,
  secondsPerRep,
}: FigureProps) {
  const reduced = usePrefersReducedMotion()
  const n = spec.keyframes.length
  const holdAt = spec.holdAt ?? 1
  const timing = pace ? timingFor(pace, n, secondsPerRep) : undefined
  const animate = playing && !thumbnail && still === undefined
  // A hold's clock stops at its pose, so a still figure doesn't re-render every frame.
  const holding = pace === 'hold'
  const limit = holding && timing ? holdEntrySeconds(holdAt, timing) : Infinity
  const elapsed = useAnimationClock(animate, limit)

  let phase: Phase
  if (still !== undefined) phase = { transition: still % n, k: 0, moving: true }
  else if (thumbnail) phase = { transition: 0, k: 0, moving: false }
  else if (holding && reduced) phase = { transition: holdAt % n, k: 0, moving: false, held: true }
  else if (holding && timing) phase = holdPhaseAt(elapsed, n, holdAt, timing)
  else if (reduced) {
    phase = { transition: Math.floor(elapsed / REDUCED_STEP_SECONDS) % n, k: 0, moving: false }
  } else phase = phaseAt(elapsed, n, timing)

  const pose = poseAt(spec, phase)
  const segs = limbSegments(pose, spec.view)
  const isLeg = (s: { part: string }) =>
    s.part === 'thigh' || s.part === 'shin' || s.part === 'foot'
  // Side view: far limbs behind the torso, near limbs in front.
  // Front view: both sides are in front of the torso, legs in one tone and arms in the other.
  const front = spec.view === 'front'
  const behind = front ? [] : segs.filter((s) => s.side === 'F')
  const shown = front ? segs : segs.filter((s) => s.side === 'N')
  const frontLegs = shown.filter(isLeg)
  const frontArms = shown.filter((s) => !isLeg(s))
  const frontHands = front ? [pose.N.wr, pose.F.wr] : [pose.N.wr]

  const arrows = thumbnail || phase.held ? [] : transitionArrows(spec, phase.transition)
  const ring = spec.ring ? ringPaths(spec.ring) : null
  const dot = spec.ring ? ringDot(spec.ring, n, phase) : null
  const dotEl = dot && (
    <circle
      cx={dot.point[0]}
      cy={dot.point[1]}
      r="5.5"
      fill="var(--arrow)"
      stroke="#fff"
      strokeWidth="2"
    />
  )
  // Once a hold is in its pose, there's no next move: just the breathing line.
  const label = phase.held ? null : labelFor(spec, phase.transition)
  const breath = phase.held ? undefined : breathFor(spec, phase.transition)
  const f = (x: number) => x.toFixed(1)
  const torso = `M${f(pose.sh[0])} ${f(pose.sh[1])} Q${f(pose.ctrl[0])} ${f(pose.ctrl[1])} ${f(pose.hip[0])} ${f(pose.hip[1])}`

  return (
    <figure
      className={['fm-figure', thumbnail ? 'fm-figure--thumb' : '', className ?? ''].join(' ')}
    >
      {!thumbnail && (
        <div className="fm-figure__breath" aria-live="polite">
          {breath ? (
            <span
              className={`fm-breath fm-breath--${breath}${phase.moving ? '' : ' fm-breath--next'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d={breath === 'in' ? 'M12 19V5M6 11l6-6 6 6' : 'M12 5v14M6 13l6 6 6-6'} />
              </svg>
              {phase.moving ? '' : 'Next: '}
              {breath === 'in' ? 'Breathe in' : 'Breathe out'}
            </span>
          ) : breathing ? (
            <span className="fm-breath fm-breath--note">{breathing}</span>
          ) : null}
        </div>
      )}
      <svg viewBox="0 0 250 180" role="img" aria-label={spec.alt} className="fm-figure__svg">
        <rect x="8" y="152" width="234" height="9" rx="4.5" fill="var(--figure-mat)" />
        {spec.props?.wall !== undefined && (
          <line
            x1={spec.props.wall}
            y1="14"
            x2={spec.props.wall}
            y2="152"
            stroke="var(--figure-prop)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        )}
        {spec.props?.seat && (
          <path
            d={`M${spec.props.seat[1]} ${spec.props.seat[0]}H${spec.props.seat[2]}M${spec.props.seat[1] + 4} ${spec.props.seat[0]}V152M${spec.props.seat[2] - 4} ${spec.props.seat[0]}V152`}
            stroke="var(--figure-prop)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        )}
        {spec.props?.chair && (
          <g stroke="var(--figure-prop)" strokeWidth="6" strokeLinecap="round" fill="none">
            <path
              d={`M${spec.props.chair[0]} ${spec.props.chair[1]}H${spec.props.chair[0] + 48}V${spec.props.chair[1] - 56}`}
            />
            <path
              d={`M${spec.props.chair[0] + 4} ${spec.props.chair[1]}V152M${spec.props.chair[0] + 48} ${spec.props.chair[1]}V152`}
            />
          </g>
        )}
        {ring && (
          <path
            d={ring.back}
            stroke="var(--arrow)"
            strokeWidth="3"
            strokeDasharray="1 6"
            strokeLinecap="round"
            fill="none"
            opacity="0.45"
          />
        )}
        {dot && !dot.front && dotEl}
        <g stroke="var(--figure-far)" strokeLinecap="round" fill="none">
          {behind.map((s) => (
            <line
              key={s.part}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              strokeWidth={WIDTH[s.part]}
            />
          ))}
        </g>
        {!front && <circle cx={pose.F.wr[0]} cy={pose.F.wr[1]} r="5.5" fill="var(--figure-far)" />}
        {front && (
          <g stroke="var(--figure-near)" strokeLinecap="round">
            <line
              x1={pose.sh[0] - 15}
              y1={pose.sh[1] + 3}
              x2={pose.sh[0] + 15}
              y2={pose.sh[1] + 3}
              strokeWidth="13"
            />
            <line
              x1={pose.hip[0] - 10}
              y1={pose.hip[1]}
              x2={pose.hip[0] + 10}
              y2={pose.hip[1]}
              strokeWidth="18"
            />
          </g>
        )}
        <path
          d={torso}
          stroke="var(--figure-near)"
          strokeWidth={front ? 26 : WIDTH.torso}
          strokeLinecap="round"
          fill="none"
        />
        <line
          x1={pose.sh[0]}
          y1={pose.sh[1]}
          x2={pose.head[0]}
          y2={pose.head[1]}
          stroke="var(--figure-near)"
          strokeWidth={WIDTH.neck}
          strokeLinecap="round"
        />
        <circle cx={pose.head[0]} cy={pose.head[1]} r="12.5" fill="var(--figure-near)" />
        <g stroke="var(--figure-near)" strokeLinecap="round" fill="none">
          {frontLegs.map((s) => (
            <line
              key={s.side + s.part}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              strokeWidth={WIDTH[s.part]}
            />
          ))}
        </g>
        <g stroke="var(--figure-near-arm)" strokeLinecap="round" fill="none">
          {frontArms.map((s) => (
            <line
              key={s.side + s.part}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              strokeWidth={WIDTH[s.part]}
            />
          ))}
        </g>
        {frontHands.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="5.5" fill="var(--figure-near-arm)" />
        ))}
        {ring && (
          <path
            d={ring.front}
            stroke="var(--arrow)"
            strokeWidth="3"
            strokeDasharray="1 6"
            strokeLinecap="round"
            fill="none"
          />
        )}
        {dot && dot.front && dotEl}
        {arrows.length > 0 && (
          <g opacity={phase.moving || reduced ? 1 : 0.4}>
            {arrows.map((a, i) => {
              const { line, head } = arrowPaths(a)
              return (
                <g key={i}>
                  <path
                    d={line}
                    stroke="var(--arrow)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="1 6"
                    fill="none"
                  />
                  <path d={head} fill="var(--arrow)" />
                </g>
              )
            })}
          </g>
        )}
      </svg>
      {!thumbnail && label && (
        <figcaption className="fm-figure__label">
          {phase.moving ? '' : 'Next: '}
          {label}
        </figcaption>
      )}
    </figure>
  )
}
