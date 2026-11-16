import { FRONT_STANDING, seatedFigure, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Shibashi 4, front view. Wrists crossed in front of the belly, palms in; the crossed arms rise up
// the middle to overhead, then open and circle down the outside back to the start.
// N = the figure's right; crossed, its wrist is on the viewer's right of centre.
const crossedLow: Pose = withPose(FRONT_STANDING, {
  N: { ...FRONT_STANDING.N, el: [110, 78], wr: [132, 94] },
  F: { ...FRONT_STANDING.F, el: [140, 78], wr: [118, 94] },
})
const crossedHigh: Pose = withPose(FRONT_STANDING, {
  N: { ...FRONT_STANDING.N, el: [105, 26], wr: [130, 8] },
  F: { ...FRONT_STANDING.F, el: [145, 26], wr: [120, 8] },
})
const open: Pose = withPose(FRONT_STANDING, {
  N: { ...FRONT_STANDING.N, el: [82, 50], wr: [56, 52] },
  F: { ...FRONT_STANDING.F, el: [168, 50], wr: [194, 52] },
})

const figure: FigureSpec = {
  view: 'front',
  keyframes: [crossedLow, crossedHigh, open],
  arrows: [
    [
      { p: [94, 92], q: [96, 14], bend: -6 },
      { p: [156, 92], q: [154, 14], bend: 6 },
    ],
    [
      { p: [110, 0], q: [52, 42], bend: 14 },
      { p: [140, 0], q: [198, 42], bend: -14 },
    ],
    [
      { p: [52, 64], q: [104, 106], bend: 14 },
      { p: [198, 64], q: [146, 106], bend: -14 },
    ],
  ],
  labels: [
    'Crossed arms rise up the middle',
    'Open and circle out to the sides',
    'Circle down and cross again',
  ],
  breath: ['in', 'out', 'out'],
  alt: 'Standing, seen from the front, wrists crossed in front of the belly; the crossed arms rise up the middle to overhead, then open and circle down the outside to cross again.',
}

const seated = seatedFigure(
  figure,
  'Sitting on a chair, seen from the front, wrists crossed in front of the belly; the arms rise up the middle to overhead, then open and circle down the outside.',
)

const steps = [
  'Stand with feet shoulder-width apart, arms loose, wrists crossed in front of your belly, palms in.',
  'Breathe in: raise the crossed arms up the front of the body to overhead, or as high as is comfortable.',
  'Breathe out: open the arms and circle them down the outside of the body.',
  'Cross the wrists again at the bottom and keep the circle smooth.',
]

export const circlingArms: Exercise = {
  id: 'circling-arms',
  name: 'Circling arms',
  technique: 'taichi',
  worksAreas: ['shoulders', 'chest', 'upperBack'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 6, range: [4, 8], sets: 1, perSide: false },
    steps,
    cues: ['Up the middle, down the outside', 'Elbows soft', 'One smooth circle'],
    breathing: 'Breathe in as the arms rise, out as they circle down.',
    figure,
    secondsPerRep: 9,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: false },
    steps: [
      'Sit tall near the front of a chair, wrists crossed in front of your belly.',
      'Raise the crossed arms up the middle, then open and circle them down the sides.',
      'Raise them only as high as feels easy.',
    ],
    cues: ['Seated', 'Up the middle', 'Down the outside'],
    breathing: 'Breathe in as the arms rise, out as they circle down.',
    figure: seated,
    secondsPerRep: 9,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Soften the knees as the arms circle down and straighten them as the arms rise.',
    ],
    cues: ['Knees soften on the way down', 'Wide circle', 'Very slow'],
    breathing: 'Breathe in as the arms rise, out as they circle down.',
    figure,
    secondsPerRep: 11,
  },
}
