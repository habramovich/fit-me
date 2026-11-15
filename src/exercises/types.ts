// Exercise content model. See specs/002-exercise-library-player/data-model.md.

export type Technique = 'yoga' | 'taichi' | 'strength' | 'mobility' | 'cardio'

export const TECHNIQUES: readonly Technique[] = ['yoga', 'taichi', 'strength', 'mobility', 'cardio']

export const TECHNIQUE_LABEL: Record<Technique, string> = {
  yoga: 'Yoga',
  taichi: 'Tai chi',
  strength: 'Strength',
  mobility: 'Mobility',
  cardio: 'Cardio',
}

export type BodyArea =
  | 'neck'
  | 'shoulders'
  | 'upperBack'
  | 'lowerBack'
  | 'core'
  | 'hips'
  | 'glutes'
  | 'hamstrings'
  | 'quads'
  | 'knees'
  | 'calves'
  | 'ankles'
  | 'wrists'
  | 'chest'
  | 'arms'
  | 'heart'

export const BODY_AREA_LABEL: Record<BodyArea, string> = {
  neck: 'neck',
  shoulders: 'shoulders',
  upperBack: 'upper back',
  lowerBack: 'lower back',
  core: 'core',
  hips: 'hips',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  quads: 'thighs',
  knees: 'knees',
  calves: 'calves',
  ankles: 'ankles',
  wrists: 'wrists',
  chest: 'chest',
  arms: 'arms',
  heart: 'heart rate',
}

export type Equipment = 'none' | 'mat' | 'chair' | 'wall' | 'band'
export type Position = 'standing' | 'seated' | 'kneeling' | 'lying'
export type Intensity = 'gentle' | 'moderate' | 'vigorous'
/** Extra traits the planner looks for. */
export type Tag = 'breathing' | 'balance' | 'boneLoading'
export type Level = 'beginner' | 'intermediate' | 'advanced'
export type Phase = 'warmup' | 'main' | 'cooldown'
export type VersionKey = 'easier' | 'standard' | 'harder'

export interface RepsDose {
  kind: 'reps'
  reps: number
  /** Recommended range; `reps` is the target inside it. */
  range: [number, number]
  sets: number
  perSide: boolean
  /** e.g. "each direction" for circles; shown after the rep count. */
  repsNote?: string
}

export interface TimeDose {
  kind: 'time'
  seconds: number
  range: [number, number]
  perSide: boolean
}

export type Dose = RepsDose | TimeDose

/** A point in the figure's 250 x 180 box. Mat top is at y = 152. */
export type Point = [number, number]

/** One side's limbs: elbow, wrist, knee, ankle, toe. */
export interface Limbs {
  el: Point
  wr: Point
  kn: Point
  an: Point
  to: Point
}

export interface Pose {
  head: Point
  /** Shoulder (side view) or shoulder midpoint (front view). */
  sh: Point
  /** Hip (side view) or hip midpoint (front view). */
  hip: Point
  /** Spine bend control point; default is the straight line. */
  ctrl?: Point
  /** Near side (side view) or the figure's right (front view). */
  N: Limbs
  /** Far side (side view) or the figure's left (front view). */
  F: Limbs
}

export interface Arrow {
  p: Point
  q: Point
  /** Sideways bulge of the arc; 0 = straight. */
  bend: number
}

export type Breath = 'in' | 'out'

/** Furniture drawn behind the figure. */
export interface Props {
  /** Chair: front edge of the seat at [x, y]; seat runs to the right, backrest on the right. */
  chair?: Point
  /** Wall: vertical line at this x. */
  wall?: number
  /** Chair seen from the front: seat edge at height y from x1 to x2, with legs to the floor. */
  seat?: [y: number, x1: number, x2: number]
}

/**
 * A flat ellipse (a "hoop" seen from slightly above) for movements that circle in the horizontal
 * plane, e.g. hip circles. A dot travels round it in step with the keyframes.
 */
export interface Ring {
  center: Point
  rx: number
  ry: number
  /** Dot angle at keyframe 0, in radians (0 = right, π/2 = front/bottom, π = left). */
  start: number
  /** +1 or -1: which way the dot travels. */
  dir: 1 | -1
}

export interface FigureSpec {
  view: 'side' | 'front'
  props?: Props
  ring?: Ring
  /** 2–4 key poses, looped A → B (→ C …) → A. */
  keyframes: Pose[]
  /** One list per transition (i → i+1, last → first). May be empty when a `ring` shows the path. */
  arrows: Arrow[][]
  /** One short phrase per transition, e.g. "Lift the hips". */
  labels: string[]
  /** One per transition for repeated movements; omitted for holds and cardio. */
  breath?: Breath[]
  /** Screen-reader description of the whole movement. */
  alt: string
}

export interface Version {
  dose: Dose
  steps: string[]
  cues: string[]
  /** The breathing line, e.g. "Breathe out as you lift, in as you lower". */
  breathing: string
  figure: FigureSpec
  /** For time estimates of rep exercises. */
  secondsPerRep?: number
  /** Cardio: no jumping. */
  lowImpact?: boolean
  /** When this version is done in a different position, e.g. seated cat-cow. */
  position?: Position
  /** Equipment for this version if different from the exercise's. */
  equipment?: Equipment[]
}

export interface Exercise {
  id: string
  name: string
  technique: Technique
  worksAreas: BodyArea[]
  loadsAreas: BodyArea[]
  equipment: Equipment[]
  level: Level
  phases: Phase[]
  position: Position
  intensity: Intensity
  tags: Tag[]
  standard: Version
  easier?: Version
  harder?: Version
  batch: number
}
