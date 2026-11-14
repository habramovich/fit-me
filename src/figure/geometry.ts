// Pure figure maths: timing, pose interpolation, arrows and limb segments.
// See specs/002-exercise-library-player/research.md (R3).
import type { Arrow, Breath, FigureSpec, Limbs, Point, Pose } from '../exercises/types'

export interface Timing {
  /** Seconds holding each key pose before moving on. */
  hold: number
  /** Seconds moving between two key poses. */
  move: number
}

export const DEFAULT_TIMING: Timing = { hold: 0.7, move: 1.5 }

export function smoothstep(x: number): number {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

export interface Phase {
  /** Transition index: keyframe i → i+1 (last → first). */
  transition: number
  /** Eased progress of the transition, 0..1. */
  k: number
  /** False while holding the starting pose of the transition. */
  moving: boolean
}

/** Where in the loop we are after `elapsed` seconds, for a figure with `count` keyframes. */
export function phaseAt(elapsed: number, count: number, timing: Timing = DEFAULT_TIMING): Phase {
  const step = timing.hold + timing.move
  const t = ((elapsed % (step * count)) + step * count) % (step * count)
  const transition = Math.floor(t / step)
  const within = t - transition * step
  if (within < timing.hold) return { transition, k: 0, moving: false }
  return { transition, k: smoothstep((within - timing.hold) / timing.move), moving: true }
}

const lerp = (a: Point, b: Point, k: number): Point => [
  a[0] + (b[0] - a[0]) * k,
  a[1] + (b[1] - a[1]) * k,
]
const mid = (a: Point, b: Point): Point => lerp(a, b, 0.5)

function lerpLimbs(a: Limbs, b: Limbs, k: number): Limbs {
  return {
    el: lerp(a.el, b.el, k),
    wr: lerp(a.wr, b.wr, k),
    kn: lerp(a.kn, b.kn, k),
    an: lerp(a.an, b.an, k),
    to: lerp(a.to, b.to, k),
  }
}

/** Blend two poses; the spine control defaults to the straight shoulder–hip midpoint. */
export function interpolatePose(a: Pose, b: Pose, k: number): Required<Pose> {
  return {
    head: lerp(a.head, b.head, k),
    sh: lerp(a.sh, b.sh, k),
    hip: lerp(a.hip, b.hip, k),
    ctrl: lerp(a.ctrl ?? mid(a.sh, a.hip), b.ctrl ?? mid(b.sh, b.hip), k),
    N: lerpLimbs(a.N, b.N, k),
    F: lerpLimbs(a.F, b.F, k),
  }
}

export function poseAt(spec: FigureSpec, phase: Phase): Required<Pose> {
  const n = spec.keyframes.length
  const from = spec.keyframes[phase.transition % n]
  const to = spec.keyframes[(phase.transition + 1) % n]
  return interpolatePose(from, to, phase.k)
}

/**
 * Arrows for a transition. A two-pose figure may give arrows for the outward move only; the
 * return reuses them reversed.
 */
export function transitionArrows(spec: FigureSpec, transition: number): Arrow[] {
  const given = spec.arrows[transition]
  if (given) return given
  if (spec.keyframes.length === 2 && transition === 1 && spec.arrows[0]) {
    return spec.arrows[0].map((a) => ({ p: a.q, q: a.p, bend: -a.bend }))
  }
  return []
}

export function labelFor(spec: FigureSpec, transition: number): string {
  return spec.labels[transition] ?? ''
}

export function breathFor(spec: FigureSpec, transition: number): Breath | undefined {
  return spec.breath?.[transition]
}

const fmt = (p: Point) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`

/** A dotted arc from p to q with a filled arrowhead at q. */
export function arrowPaths(arrow: Arrow): { line: string; head: string } {
  const { p, q, bend } = arrow
  const dx = q[0] - p[0]
  const dy = q[1] - p[1]
  const len = Math.hypot(dx, dy) || 1
  const c: Point = [(p[0] + q[0]) / 2 + (-dy / len) * bend, (p[1] + q[1]) / 2 + (dx / len) * bend]
  const tx = q[0] - c[0]
  const ty = q[1] - c[1]
  const tl = Math.hypot(tx, ty) || 1
  const ux = tx / tl
  const uy = ty / tl
  const end: Point = [q[0] - ux * 7, q[1] - uy * 7]
  const hw = 5.5
  const left: Point = [end[0] - uy * hw, end[1] + ux * hw]
  const right: Point = [end[0] + uy * hw, end[1] - ux * hw]
  return {
    line: `M${fmt(p)} Q${fmt(c)} ${fmt(end)}`,
    head: `M${fmt(q)} L${fmt(left)} L${fmt(right)} Z`,
  }
}

export type LimbPart = 'upperArm' | 'forearm' | 'thigh' | 'shin' | 'foot'

export interface Segment {
  side: 'N' | 'F'
  part: LimbPart
  x1: number
  y1: number
  x2: number
  y2: number
}

/** Stroke widths in figure units (box is 250 x 180). */
export const WIDTH: Record<LimbPart | 'torso' | 'neck', number> = {
  torso: 30,
  neck: 11,
  upperArm: 11,
  forearm: 9,
  thigh: 17,
  shin: 12,
  foot: 7,
}

/** Front view: half the shoulder and hip widths, so limbs start beside the torso. */
const FRONT_SHOULDER = 15
const FRONT_HIP = 9

export function limbSegments(pose: Pose, view: 'side' | 'front'): Segment[] {
  const out: Segment[] = []
  for (const side of ['F', 'N'] as const) {
    const l = pose[side]
    // In front view N is the figure's right, which appears on the viewer's left.
    const dir = view === 'front' ? (side === 'N' ? -1 : 1) : 0
    const sh: Point = [pose.sh[0] + dir * FRONT_SHOULDER, pose.sh[1] + (dir ? 3 : 0)]
    const hip: Point = [pose.hip[0] + dir * FRONT_HIP, pose.hip[1]]
    const seg = (part: LimbPart, a: Point, b: Point) =>
      out.push({ side, part, x1: a[0], y1: a[1], x2: b[0], y2: b[1] })
    seg('upperArm', sh, l.el)
    seg('forearm', l.el, l.wr)
    seg('thigh', hip, l.kn)
    seg('shin', l.kn, l.an)
    seg('foot', l.an, l.to)
  }
  return out
}
