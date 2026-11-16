// Small helpers for writing exercise data.
import type { Arrow, FigureSpec, Limbs, Point, Pose } from './types'

/** One side's limbs: elbow, wrist, knee, ankle, toe. */
export const limbs = (el: Point, wr: Point, kn: Point, an: Point, to: Point): Limbs => ({
  el,
  wr,
  kn,
  an,
  to,
})

/** Copy a pose with some parts replaced. */
export const withPose = (base: Pose, change: Partial<Pose>): Pose => ({ ...base, ...change })

/** Copy a side's limbs with some joints replaced. */
export const withLimbs = (base: Limbs, change: Partial<Limbs>): Limbs => ({ ...base, ...change })

/** Move every point of a pose by dx, dy. */
export function shift(p: Pose, dx: number, dy: number): Pose {
  const m = (q: Point): Point => [q[0] + dx, q[1] + dy]
  const ml = (l: Limbs): Limbs => limbs(m(l.el), m(l.wr), m(l.kn), m(l.an), m(l.to))
  return {
    head: m(p.head),
    sh: m(p.sh),
    hip: m(p.hip),
    ctrl: p.ctrl && m(p.ctrl),
    N: ml(p.N),
    F: ml(p.F),
  }
}

// Base poses, so figures share proportions. Box 250 × 180, mat top at y = 152.

/** Standing, side view, facing left, arms by the sides. */
export const SIDE_STANDING: Pose = {
  head: [97, 27],
  sh: [100, 50],
  hip: [102, 100],
  N: limbs([100, 76], [98, 100], [100, 126], [100, 150], [88, 151]),
  F: limbs([104, 75], [102, 99], [105, 126], [105, 150], [93, 151]),
}

/** Standing, front view, arms by the sides. N = the figure's right (viewer's left). */
export const FRONT_STANDING: Pose = {
  head: [125, 26],
  sh: [125, 48],
  hip: [125, 94],
  N: limbs([106, 72], [104, 96], [118, 122], [116, 150], [106, 151]),
  F: limbs([144, 72], [146, 96], [132, 122], [134, 150], [144, 151]),
}

/** Sitting tall on a chair, side view, facing left, hands on the thighs. Use with SIDE_CHAIR. */
export const SIDE_SEATED: Pose = {
  head: [100, 30],
  sh: [114, 52],
  hip: [124, 102],
  N: limbs([110, 80], [96, 98], [84, 104], [84, 150], [70, 150]),
  F: limbs([114, 80], [100, 98], [88, 104], [88, 150], [74, 150]),
}
export const SIDE_CHAIR: Point = [96, 117]

/** The chair seat for FRONT_SEATED (props.seat). */
export const FRONT_SEAT: [number, number, number] = [116, 98, 152]

/** Sitting on a chair, front view; knees toward the viewer. Use with FRONT_SEAT. */
export const FRONT_SEATED: Pose = {
  head: [125, 40],
  sh: [125, 62],
  hip: [125, 108],
  N: limbs([106, 86], [104, 108], [112, 120], [110, 150], [102, 151]),
  F: limbs([144, 86], [146, 108], [138, 120], [140, 150], [148, 151]),
}

const mirrorPoint = (q: Point): Point => [250 - q[0], q[1]]
const mirrorLimbs = (l: Limbs): Limbs =>
  limbs(
    mirrorPoint(l.el),
    mirrorPoint(l.wr),
    mirrorPoint(l.kn),
    mirrorPoint(l.an),
    mirrorPoint(l.to),
  )

/** Front view: the same pose to the other side (the figure's right becomes its left). */
export function mirror(p: Pose): Pose {
  return {
    head: mirrorPoint(p.head),
    sh: mirrorPoint(p.sh),
    hip: mirrorPoint(p.hip),
    ctrl: p.ctrl && mirrorPoint(p.ctrl),
    N: mirrorLimbs(p.F),
    F: mirrorLimbs(p.N),
  }
}

/** Front view: mirror an arrow to go with `mirror`. */
export const mirrorArrow = (a: Arrow): Arrow => ({
  p: mirrorPoint(a.p),
  q: mirrorPoint(a.q),
  bend: -a.bend,
})

const moveArrow = (a: Arrow, dx: number, dy: number): Arrow => ({
  p: [a.p[0] + dx, a.p[1] + dy],
  q: [a.q[0] + dx, a.q[1] + dy],
  bend: a.bend,
})

/**
 * Front view: a standing pose sitting on FRONT_SEAT. The upper body drops 14 and is centred over
 * the seat (a standing weight shift becomes nothing); the legs come from FRONT_SEATED.
 */
export function seatedFront(p: Pose): Pose {
  const dx = FRONT_SEATED.hip[0] - p.hip[0]
  const dy = FRONT_SEATED.hip[1] - p.hip[1]
  const m = (q: Point): Point => [q[0] + dx, q[1] + dy]
  return {
    head: m(p.head),
    sh: m(p.sh),
    hip: FRONT_SEATED.hip,
    ctrl: p.ctrl && m(p.ctrl),
    N: { ...FRONT_SEATED.N, el: m(p.N.el), wr: m(p.N.wr) },
    F: { ...FRONT_SEATED.F, el: m(p.F.el), wr: m(p.F.wr) },
  }
}

/**
 * Side view: a standing pose's arms on SIDE_SEATED, moved with the shoulder. The seated torso,
 * head and legs come from SIDE_SEATED.
 */
export function seatedSide(p: Pose): Pose {
  const dx = SIDE_SEATED.sh[0] - p.sh[0]
  const dy = SIDE_SEATED.sh[1] - p.sh[1]
  const m = (q: Point): Point => [q[0] + dx, q[1] + dy]
  return {
    ...SIDE_SEATED,
    N: { ...SIDE_SEATED.N, el: m(p.N.el), wr: m(p.N.wr) },
    F: { ...SIDE_SEATED.F, el: m(p.F.el), wr: m(p.F.wr) },
  }
}

/**
 * The seated version of a standing figure: poses via `seatedFront` / `seatedSide`, arrows moved
 * with the upper body, and the chair. Labels, breath and holds carry over; give a new `alt`.
 */
export function seatedFigure(spec: FigureSpec, alt: string): FigureSpec {
  const front = spec.view === 'front'
  const [dx, dy] = front
    ? [0, FRONT_SEATED.hip[1] - FRONT_STANDING.hip[1]]
    : [SIDE_SEATED.sh[0] - SIDE_STANDING.sh[0], SIDE_SEATED.sh[1] - SIDE_STANDING.sh[1]]
  return {
    ...spec,
    props: front ? { seat: FRONT_SEAT } : { chair: SIDE_CHAIR },
    keyframes: spec.keyframes.map(front ? seatedFront : seatedSide),
    arrows: spec.arrows.map((list) => list.map((a) => moveArrow(a, dx, dy))),
    alt,
  }
}
