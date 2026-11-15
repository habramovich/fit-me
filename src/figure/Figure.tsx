import { useEffect, useMemo, useRef, useState } from 'react'
import type { FigureSpec, Point, Pose } from '../exercises/types'
import './Figure.css'
import {
  HEAD_R,
  WIDTH,
  arrowPaths,
  breathFor,
  collar,
  face,
  facingFor,
  labelFor,
  limbPath,
  limbSegments,
  phaseAt,
  poseAt,
  ringDot,
  ringPaths,
  torsoOutline,
  transitionArrows,
  type Phase,
  type Segment,
} from './geometry'
import { useFigureStyle, type FigureStyle } from './style'

const REDUCED_STEP_SECONDS = 2.5

/** Doodle: the thin line has no thickness to reach a seat, so seats are drawn this much higher. */
const DOODLE_SEAT_LIFT = 6

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

/** Seconds of animation time, advancing only while `playing`. */
function useAnimationClock(playing: boolean): number {
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
        setElapsed((e) => e + dt)
      }
      last.current = now
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing])
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
  /** Drawing style; defaults to the person's choice from the shell. */
  figureStyle?: FigureStyle
}

export function Figure({
  spec,
  playing = true,
  thumbnail = false,
  breathing,
  className,
  still,
  figureStyle,
}: FigureProps) {
  const chosen = useFigureStyle()
  const doodle = (figureStyle ?? chosen) === 'doodle'
  const reduced = usePrefersReducedMotion()
  const animate = playing && !thumbnail && still === undefined
  const elapsed = useAnimationClock(animate)
  const n = spec.keyframes.length

  let phase: Phase
  if (still !== undefined) phase = { transition: still % n, k: 0, moving: true }
  else if (thumbnail) phase = { transition: 0, k: 0, moving: false }
  else if (reduced) {
    phase = { transition: Math.floor(elapsed / REDUCED_STEP_SECONDS) % n, k: 0, moving: false }
  } else phase = phaseAt(elapsed, n)

  const pose = poseAt(spec, phase)
  const segs = limbSegments(pose, spec.view)
  const facing = useMemo(() => facingFor(spec), [spec])
  const lift = doodle ? DOODLE_SEAT_LIFT : 0

  const arrows = thumbnail ? [] : transitionArrows(spec, phase.transition)
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
  const label = labelFor(spec, phase.transition)
  const breath = breathFor(spec, phase.transition)

  return (
    <figure
      className={[
        'fm-figure',
        thumbnail ? 'fm-figure--thumb' : '',
        className ?? '',
        ...(doodle ? ['fm-figure--doodle'] : []),
      ].join(' ')}
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
            d={`M${spec.props.seat[1]} ${spec.props.seat[0] - lift}H${spec.props.seat[2]}M${spec.props.seat[1] + 4} ${spec.props.seat[0] - lift}V152M${spec.props.seat[2] - 4} ${spec.props.seat[0] - lift}V152`}
            stroke="var(--figure-prop)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
        )}
        {spec.props?.chair && (
          <g stroke="var(--figure-prop)" strokeWidth="6" strokeLinecap="round" fill="none">
            <path
              d={`M${spec.props.chair[0]} ${spec.props.chair[1] - lift}H${spec.props.chair[0] + 48}V${spec.props.chair[1] - 56}`}
            />
            <path
              d={`M${spec.props.chair[0] + 4} ${spec.props.chair[1] - lift}V152M${spec.props.chair[0] + 48} ${spec.props.chair[1] - lift}V152`}
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
        {doodle ? (
          <DoodleBody
            pose={pose}
            segs={segs}
            view={spec.view}
            facing={facing}
            thumbnail={thumbnail}
          />
        ) : (
          <ClassicBody pose={pose} segs={segs} view={spec.view} />
        )}
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

interface BodyProps {
  pose: Required<Pose>
  segs: Segment[]
  view: 'side' | 'front'
}

const isLeg = (s: { part: string }) => s.part === 'thigh' || s.part === 'shin' || s.part === 'foot'

/** The original solid figure: thick rounded limbs and torso, solid head and hands. */
function ClassicBody({ pose, segs, view }: BodyProps) {
  // Side view: far limbs behind the torso, near limbs in front.
  // Front view: both sides are in front of the torso, legs in one tone and arms in the other.
  const front = view === 'front'
  const behind = front ? [] : segs.filter((s) => s.side === 'F')
  const shown = front ? segs : segs.filter((s) => s.side === 'N')
  const frontLegs = shown.filter(isLeg)
  const frontArms = shown.filter((s) => !isLeg(s))
  const frontHands = front ? [pose.N.wr, pose.F.wr] : [pose.N.wr]
  const f = (x: number) => x.toFixed(1)
  const torso = `M${f(pose.sh[0])} ${f(pose.sh[1])} Q${f(pose.ctrl[0])} ${f(pose.ctrl[1])} ${f(pose.hip[0])} ${f(pose.hip[1])}`

  return (
    <>
      <g stroke="var(--figure-far)" strokeLinecap="round" fill="none">
        {behind.map((s) => (
          <line key={s.part} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} strokeWidth={WIDTH[s.part]} />
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
    </>
  )
}

/**
 * A line drawing: outlined shirt and head with a face, single-stroke limbs, loops for hands and
 * feet. Thumbnails use a heavier line and solid hands and feet so they survive being small.
 */
function DoodleBody({
  pose,
  segs,
  view,
  facing,
  thumbnail,
}: BodyProps & { facing: 1 | -1; thumbnail: boolean }) {
  const front = view === 'front'
  const looks = face(pose, view, facing)
  const neck = collar(pose)
  const ink = thumbnail ? 4.6 : 2.5
  const paper = 'var(--doodle-paper)'
  const near = 'var(--doodle-ink)'
  // Side view: the far limbs go behind the shirt, in a lighter line. Front view: both in front.
  const far = front ? near : 'var(--doodle-far)'
  const start = (side: 'N' | 'F', part: 'upperArm' | 'thigh'): Point => {
    const s = segs.find((x) => x.side === side && x.part === part)!
    return [s.x1, s.y1]
  }
  const leg = (side: 'N' | 'F', color: string) => {
    const l = pose[side]
    return (
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={limbPath([start(side, 'thigh'), l.kn, l.an])} strokeWidth={ink} />
        <line x1={l.an[0]} y1={l.an[1]} x2={l.to[0]} y2={l.to[1]} strokeWidth="7.6" />
        {!thumbnail && (
          <line
            x1={l.an[0]}
            y1={l.an[1]}
            x2={l.to[0]}
            y2={l.to[1]}
            stroke={paper}
            strokeWidth={7.6 - 2 * ink}
          />
        )}
      </g>
    )
  }
  const arm = (side: 'N' | 'F', color: string) => {
    const l = pose[side]
    return (
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={limbPath([start(side, 'upperArm'), l.el, l.wr])} strokeWidth={ink} />
        <circle
          cx={l.wr[0]}
          cy={l.wr[1]}
          r="3.6"
          fill={thumbnail ? color : paper}
          strokeWidth={thumbnail ? 2 : ink * 0.9}
        />
      </g>
    )
  }

  return (
    <>
      {!front && leg('F', far)}
      {!front && arm('F', far)}
      <path
        d={torsoOutline(pose, view)}
        fill={paper}
        stroke={near}
        strokeWidth={ink}
        strokeLinejoin="round"
      />
      <line
        x1={neck[0]}
        y1={neck[1]}
        x2={pose.head[0]}
        y2={pose.head[1]}
        stroke={near}
        strokeWidth={ink}
        strokeLinecap="round"
      />
      {looks.nose && (
        <circle
          cx={looks.nose[0]}
          cy={looks.nose[1]}
          r="2.2"
          fill={paper}
          stroke={near}
          strokeWidth={ink * 0.8}
        />
      )}
      <circle
        cx={pose.head[0]}
        cy={pose.head[1]}
        r={HEAD_R - ink / 2}
        fill={paper}
        stroke={near}
        strokeWidth={ink}
      />
      {looks.eyes.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={thumbnail ? 2.2 : 1.6} fill={near} />
      ))}
      <path
        d={looks.mouth}
        stroke={near}
        strokeWidth={ink * 0.75}
        strokeLinecap="round"
        fill="none"
      />
      {front && leg('F', far)}
      {leg('N', near)}
      {front && arm('F', far)}
      {arm('N', near)}
    </>
  )
}
