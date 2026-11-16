import { FRONT_STANDING, mirror, mirrorArrow, seatedFigure, withPose } from '../build'
import type { Arrow, Exercise, FigureSpec, Pose } from '../types'

// Shibashi 8, front view. Turning to the left, both arms swing up together to the upper left,
// elbows soft, and the eyes follow the hands, as if lifting the moon. They lower to the centre,
// then the other side. N = the figure's right.
const centre = FRONT_STANDING
const left: Pose = withPose(FRONT_STANDING, {
  head: [131, 25],
  sh: [127, 48],
  N: { ...FRONT_STANDING.N, el: [136, 42], wr: [160, 28] },
  F: { ...FRONT_STANDING.F, el: [166, 38], wr: [186, 20] },
})
const right = mirror(left)

const toLeft: Arrow[] = [{ p: [124, 106], q: [194, 12], bend: 18 }]
const back: Arrow[] = [{ p: [194, 12], q: [124, 106], bend: -18 }]

const figure: FigureSpec = {
  view: 'front',
  keyframes: [centre, left, centre, right],
  arrows: [toLeft, back, toLeft.map(mirrorArrow), back.map(mirrorArrow)],
  labels: [
    'Turn left: both arms swing up to the upper left',
    'Bring the hands down to the centre',
    'Turn right: both arms swing up to the upper right',
    'Bring the hands down to the centre',
  ],
  breath: ['in', 'out', 'in', 'out'],
  alt: 'Standing, seen from the front; turning the waist, both arms swing up together to one side above shoulder height with the eyes on the hands, as if carrying the moon; they lower to the centre and swing up to the other side.',
}

const seated = seatedFigure(
  figure,
  'Sitting on a chair, seen from the front; turning the waist, both arms swing up together to one side, eyes on the hands, then lower and swing up to the other side.',
)

const breathing = 'Breathe in as the arms swing up, out as they come down.'

const steps = [
  'Stand with feet shoulder-width apart, knees soft, arms relaxed in front of you.',
  'Breathe in: turn your waist to the left and swing both arms up toward the upper left, elbows soft. Look at your hands.',
  'Breathe out: bring the hands down to the centre.',
  'Turn to the right and repeat. Keep the shoulders relaxed.',
]

export const carryingTheMoon: Exercise = {
  id: 'carrying-the-moon',
  name: 'Carrying the moon',
  technique: 'taichi',
  worksAreas: ['shoulders', 'core', 'upperBack', 'neck'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 4, range: [3, 6], sets: 1, perSide: true },
    steps,
    cues: ['Turn from the waist', 'Elbows soft', 'Eyes on the hands'],
    breathing,
    figure,
    secondsPerRep: 8,
  },
  easier: {
    dose: { kind: 'reps', reps: 3, range: [2, 5], sets: 1, perSide: true },
    steps: [
      'Sit tall near the front of a chair.',
      'Turn gently and swing both arms up to one side, looking at your hands.',
      'Bring them down and change sides. Lift only as high as is comfortable.',
    ],
    cues: ['Seated', 'Gentle turn', 'Eyes on the hands'],
    breathing,
    figure: seated,
    secondsPerRep: 8,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 6, range: [4, 8], sets: 1, perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Turn further, let the weight shift onto the side you turn toward, and lift the other heel.',
    ],
    cues: ['Bigger turn', 'Back heel lifts', 'Look up past the hands'],
    breathing,
    figure,
    secondsPerRep: 9,
  },
}
