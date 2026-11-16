import { FRONT_STANDING, mirror, mirrorArrow, seatedFigure, withPose } from '../build'
import type { Arrow, Exercise, FigureSpec, Pose } from '../types'

// Shibashi 7, front view. Turning to the left, the right hand sweeps across the body and lifts,
// palm up, to shoulder height in front of the left shoulder, as if holding a ball; the left hand
// stays low. Back to the centre, then the other side. N = the figure's right.
const centre = FRONT_STANDING
const left: Pose = withPose(FRONT_STANDING, {
  head: [129, 26],
  hip: [127, 94],
  N: { ...FRONT_STANDING.N, el: [134, 64], wr: [160, 50] },
  F: { ...FRONT_STANDING.F, el: [148, 74], wr: [152, 96] },
})
const right = mirror(left)

const toLeft: Arrow[] = [{ p: [100, 102], q: [162, 38], bend: 12 }]
const back: Arrow[] = [{ p: [162, 38], q: [100, 102], bend: -12 }]

const figure: FigureSpec = {
  view: 'front',
  keyframes: [centre, left, centre, right],
  arrows: [toLeft, back, toLeft.map(mirrorArrow), back.map(mirrorArrow)],
  labels: [
    'Turn left: the right hand lifts the ball across to the left shoulder',
    'Lower the hand, back to the centre',
    'Turn right: the left hand lifts the ball across',
    'Lower the hand, back to the centre',
  ],
  breath: ['in', 'out', 'in', 'out'],
  alt: 'Standing, seen from the front; turning the waist, one hand sweeps across the body and lifts, palm up, to shoulder height in front of the other shoulder as if holding a ball; it lowers and the other side follows.',
}

const seated = seatedFigure(
  figure,
  'Sitting on a chair, seen from the front; turning the waist, one hand lifts palm up across the body to shoulder height as if holding a ball, lowers, and the other side follows.',
)

const breathing = 'Breathe in as you turn and lift the ball, out as you lower and come back.'

const steps = [
  'Stand with feet shoulder-width apart, knees soft, arms relaxed.',
  'Breathe in: turn your waist to the left as the right hand sweeps across and lifts, palm up, to shoulder height, as if holding a ball.',
  'Breathe out: lower the hand and turn back to the centre.',
  'Turn to the right and lift the ball with the left hand. You don’t need a real ball.',
]

export const holdingABall: Exercise = {
  id: 'holding-a-ball',
  name: 'Holding a ball',
  technique: 'taichi',
  worksAreas: ['shoulders', 'core', 'upperBack'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 4, range: [3, 6], sets: 1, perSide: true },
    steps,
    cues: ['Turn from the waist', 'Palm up, holding the ball', 'Eyes follow the hand'],
    breathing,
    figure,
    secondsPerRep: 8,
  },
  easier: {
    dose: { kind: 'reps', reps: 3, range: [2, 5], sets: 1, perSide: true },
    steps: [
      'Sit tall near the front of a chair. You can hold a light ball if it helps.',
      'Turn gently and lift one hand across the body to shoulder height, palm up.',
      'Lower and change sides. Lift only as high as is comfortable.',
    ],
    cues: ['Seated', 'Gentle turn', 'Palm up'],
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
      'Let the weight shift onto the side you turn toward and lift the heel of the other foot.',
    ],
    cues: ['Weight follows the turn', 'Back heel lifts', 'Slow and even'],
    breathing,
    figure,
    secondsPerRep: 9,
  },
}
