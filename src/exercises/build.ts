// Small helpers for writing exercise data.
import type { Limbs, Point, Pose } from './types'

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
