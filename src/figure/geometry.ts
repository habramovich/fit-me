// Pure figure maths: timing, pose interpolation, arrows and limb segments.
// See specs/002-exercise-library-player/research.md (R3).
import type { Arrow, Breath, FigureSpec, Limbs, Point, Pose, Ring } from '../exercises/types'

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

/** Where the ring's dot is: it moves a quarter turn per transition for 4 keyframes, etc. */
export function ringDot(ring: Ring, count: number, phase: Phase): { point: Point; front: boolean } {
  const angle = ring.start + ring.dir * ((phase.transition + phase.k) / count) * 2 * Math.PI
  const point: Point = [
    ring.center[0] + ring.rx * Math.cos(angle),
    ring.center[1] + ring.ry * Math.sin(angle),
  ]
  return { point, front: Math.sin(angle) > 0 }
}

/** SVG paths for the back (upper) and front (lower) halves of the ring. */
export function ringPaths(ring: Ring): { back: string; front: string } {
  const [cx, cy] = ring.center
  const l = `${(cx - ring.rx).toFixed(1)} ${cy.toFixed(1)}`
  const r = `${(cx + ring.rx).toFixed(1)} ${cy.toFixed(1)}`
  const arc = `A${ring.rx} ${ring.ry} 0 0 0`
  return { back: `M${r} ${arc} ${l}`, front: `M${l} ${arc} ${r}` }
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

/** Classic: stroke widths in figure units (box is 250 x 180). */
export const WIDTH: Record<LimbPart | 'torso' | 'neck', number> = {
  torso: 30,
  neck: 11,
  upperArm: 11,
  forearm: 9,
  thigh: 17,
  shin: 12,
  foot: 7,
}

// Doodle: a line drawing (see specs/007-figure-style/research.md).

/** Doodle head radius. */
export const HEAD_R = 14

/** Half-widths of the doodle shirt at the collar and the hem; side view about as wide as the head. */
const SHIRT = { side: [12, 13], front: [17, 12] } as const
/** How far the shirt reaches up from the shoulder point toward the head. */
const COLLAR = 4

const unit = (a: Point, b: Point): Point => {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l]
}

/** Sine of the turn at b when walking a → b → c (positive = clockwise on screen). */
function turn(a: Point, b: Point, c: Point): number {
  const u = unit(a, b)
  const v = unit(b, c)
  return u[0] * v[1] - u[1] * v[0]
}

/**
 * Which way a side-view figure faces, read from how its joints bend: knees fold one way, ankles
 * and elbows the other. +1 = standing it would face left (the default), -1 = right. Taken over
 * all key poses, because a figure never turns round mid-movement.
 */
export function sideFacing(keyframes: Pose[]): 1 | -1 {
  let votes = 0
  for (const p of keyframes)
    for (const l of [p.N, p.F])
      votes += turn(l.kn, l.an, l.to) - turn(p.hip, l.kn, l.an) + 0.5 * turn(p.sh, l.el, l.wr)
  return votes >= 0 ? 1 : -1
}

const NOSE: Record<NonNullable<FigureSpec['nose']>, Point> = {
  left: [-1, 0],
  right: [1, 0],
  up: [0, -1],
  down: [0, 1],
}

/**
 * The facing to draw a figure with: from `spec.nose` (where the nose points in keyframe 0) when
 * given, otherwise guessed by `sideFacing`. Front view always faces the viewer (1).
 */
export function facingFor(spec: FigureSpec): 1 | -1 {
  if (spec.view === 'front') return 1
  if (!spec.nose) return sideFacing(spec.keyframes)
  const k = spec.keyframes[0]
  const up = unit(k.sh, k.head)
  const [dx, dy] = NOSE[spec.nose]
  // The face's "across" for facing f is f·(up.y, −up.x); pick f so it points along the nose.
  return up[1] * dx - up[0] * dy >= 0 ? 1 : -1
}

export interface Face {
  /** One eye in side view, two in front view. */
  eyes: Point[]
  /** The smile, as an SVG path. */
  mouth: string
  /** Side view only: centre of the nose bump on the edge of the head. */
  nose?: Point
}

/** Eyes, smile and nose, turned with the head (its "up" runs from the shoulders to the head). */
export function face(pose: Pose, view: 'side' | 'front', facing: 1 | -1 = 1): Face {
  const up = unit(pose.sh, pose.head)
  // Front view: "across" is the viewer's right. Side view: it is the way the figure faces.
  const across: Point = view === 'front' ? [-up[1], up[0]] : [facing * up[1], -facing * up[0]]
  const at = (a: number, u: number): Point => [
    pose.head[0] + (across[0] * a + up[0] * u) * HEAD_R,
    pose.head[1] + (across[1] * a + up[1] * u) * HEAD_R,
  ]
  if (view === 'front') {
    return {
      eyes: [at(-0.36, 0.1), at(0.36, 0.1)],
      mouth: `M${fmt(at(-0.4, -0.3))} Q${fmt(at(0, -0.74))} ${fmt(at(0.4, -0.3))}`,
    }
  }
  return {
    eyes: [at(0.44, 0.14)],
    mouth: `M${fmt(at(0.8, -0.36))} Q${fmt(at(0.58, -0.64))} ${fmt(at(0.28, -0.48))}`,
    nose: at(1.04, -0.04),
  }
}

/** Where the neck meets the shirt: a little above the shoulder point, toward the head. */
export function collar(pose: Pose): Point {
  const up = unit(pose.sh, pose.head)
  return [pose.sh[0] + up[0] * COLLAR, pose.sh[1] + up[1] * COLLAR]
}

/** The shirt: a closed outline around the spine curve from the collar to the hips. */
export function torsoOutline(pose: Required<Pose>, view: 'side' | 'front'): string {
  const [top, hem] = SHIRT[view]
  const steps = 8
  const spine: Point[] = [collar(pose)]
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    spine.push([
      (1 - t) ** 2 * pose.sh[0] + 2 * (1 - t) * t * pose.ctrl[0] + t * t * pose.hip[0],
      (1 - t) ** 2 * pose.sh[1] + 2 * (1 - t) * t * pose.ctrl[1] + t * t * pose.hip[1],
    ])
  }
  const left: Point[] = []
  const right: Point[] = []
  spine.forEach((p, i) => {
    const d = unit(spine[Math.max(0, i - 1)], spine[Math.min(spine.length - 1, i + 1)])
    const w = top + ((hem - top) * i) / (spine.length - 1)
    left.push([p[0] - d[1] * w, p[1] + d[0] * w])
    right.push([p[0] + d[1] * w, p[1] - d[0] * w])
  })
  return `M${[...left, ...right.reverse()].map(fmt).join(' L')} Z`
}

/** A limb as one stroke through its joints, each bone bowed slightly so it reads as hand-drawn. */
export function limbPath(points: Point[]): string {
  let d = `M${fmt(points[0])}`
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const bow = (i % 2 ? 1 : -1) * 0.04
    const c: Point = [
      (a[0] + b[0]) / 2 - (b[1] - a[1]) * bow,
      (a[1] + b[1]) / 2 + (b[0] - a[0]) * bow,
    ]
    d += ` Q${fmt(c)} ${fmt(b)}`
  }
  return d
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
