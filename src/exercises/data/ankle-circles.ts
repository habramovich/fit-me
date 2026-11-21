import { SIDE_CHAIR, SIDE_SEATED, SIDE_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec, Point, Pose } from '../types'

// Side view facing left. The near foot is lifted just off the floor and the toes draw a circle
// under it, shown as a flat ring: toes back, toward you, forward, away.
const WALL = 56
const farOnWall = limbs([80, 64], [60, 70], [105, 126], [105, 150], [93, 151])
const ANKLE: Point = [70, 132]
const toes: Point[] = [
  [74, 140],
  [64, 144],
  [56, 140],
  [64, 136],
]
const lifted = (to: Point, far = farOnWall): Pose =>
  withPose(SIDE_STANDING, {
    N: limbs([100, 76], [98, 100], [84, 116], ANKLE, to),
    F: far,
  })
const ring = { center: [64, 140] as Point, rx: 9, ry: 4, start: 0, dir: 1 as const }
const labels = ['Toes circle toward you', 'Forward', 'Away', 'And back']
const breath: ('in' | 'out')[] = ['in', 'in', 'out', 'out']

const figure: FigureSpec = {
  view: 'side',
  props: { wall: WALL },
  ring,
  keyframes: toes.map((t) => lifted(t)),
  arrows: [[], [], [], []],
  labels,
  breath,
  alt: 'Standing side-on to a wall with one hand on it, one foot lifted just off the floor; the toes draw slow circles, one way and then the other.',
}

// Harder: no support, hands on the hips.
const farOnHip = limbs([118, 72], [106, 96], [105, 126], [105, 150], [93, 151])
const harderFigure: FigureSpec = {
  ...figure,
  props: undefined,
  keyframes: toes.map((t) =>
    withPose(lifted(t, farOnHip), {
      N: limbs([116, 74], [104, 98], [84, 116], ANKLE, t),
    }),
  ),
  alt: 'Standing without support, hands on the hips, one foot lifted just off the floor; the toes draw slow circles, one way and then the other.',
}

// Easier: seated, the near leg reaching forward so the foot is off the floor.
const SEATED_ANKLE: Point = [54, 132]
const seatedToes: Point[] = [
  [56, 142],
  [48, 146],
  [40, 142],
  [48, 138],
]
const seatedFigure: FigureSpec = {
  view: 'side',
  props: { chair: SIDE_CHAIR },
  ring: { center: [48, 142], rx: 8, ry: 4, start: 0, dir: 1 },
  keyframes: seatedToes.map((t) =>
    withPose(SIDE_SEATED, { N: limbs([110, 80], [96, 98], [84, 104], SEATED_ANKLE, t) }),
  ),
  arrows: [[], [], [], []],
  labels,
  breath,
  alt: 'Sitting on a chair, seen from the side, one foot reaching forward off the floor; the toes draw slow circles, one way and then the other.',
}

const steps = [
  'Stand tall and hold a wall or sturdy chair with one hand.',
  'Lift your right foot slightly off the floor.',
  'Slowly circle the ankle, drawing big circles with your toes: all the circles one way, then the other.',
  'Switch feet.',
]
const breathing = 'Breathe easily: in for half a circle, out for the other half.'

export const ankleCircles: Exercise = {
  id: 'ankle-circles',
  name: 'Ankle circles',
  technique: 'mobility',
  worksAreas: ['ankles', 'calves'],
  loadsAreas: [],
  equipment: ['wall'],
  level: 'beginner',
  phases: ['warmup'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: {
      kind: 'reps',
      reps: 10,
      range: [8, 12],
      sets: 1,
      perSide: true,
      repsNote: 'each direction',
    },
    steps,
    cues: ['Big, slow circles', 'Move only the ankle', 'Stand tall'],
    breathing,
    figure,
    secondsPerRep: 5,
  },
  easier: {
    dose: {
      kind: 'reps',
      reps: 8,
      range: [6, 10],
      sets: 1,
      perSide: true,
      repsNote: 'each direction',
    },
    steps: [
      'Sit tall on a chair and reach your right foot forward, just off the floor.',
      'Slowly circle the ankle: all the circles one way, then the other.',
      'Switch feet.',
    ],
    cues: ['Seated', 'Slow circles', 'Move only the ankle'],
    breathing,
    figure: seatedFigure,
    secondsPerRep: 5,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: {
      kind: 'reps',
      reps: 12,
      range: [10, 15],
      sets: 1,
      perSide: true,
      repsNote: 'each direction',
    },
    steps: [
      'Stand tall without support, hands on your hips; fix your gaze on one point.',
      steps[1],
      steps[2],
      'Switch feet. Touch the wall whenever you need to.',
    ],
    cues: ['No hands', 'Eyes on one point', 'Big, slow circles'],
    breathing,
    figure: harderFigure,
    secondsPerRep: 5,
    equipment: ['none'],
  },
}
