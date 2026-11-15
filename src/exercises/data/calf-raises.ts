import { SIDE_STANDING, limbs, shift, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Strength, balance and bone loading. Side view facing left, one hand on a wall for balance.
// Rise onto the balls of the feet, then lower slowly.
const WALL = 56
const flat = withPose(SIDE_STANDING, {
  N: limbs([80, 64], [60, 70], [100, 126], [100, 150], [88, 151]),
  F: limbs([104, 75], [102, 99], [105, 126], [105, 150], [93, 151]),
})
// On the toes: everything rises 10 except the toes.
const up = withPose(shift(flat, 0, -10), {
  N: limbs([80, 54], [60, 62], [100, 116], [100, 140], [88, 151]),
  F: limbs([104, 65], [102, 89], [105, 116], [105, 140], [93, 151]),
})

const figure: FigureSpec = {
  view: 'side',
  props: { wall: WALL },
  keyframes: [flat, up],
  arrows: [[{ p: [116, 148], q: [116, 124], bend: 0 }]],
  labels: ['Rise onto the balls of your feet', 'Lower slowly'],
  breath: ['out', 'in'],
  alt: 'Standing side-on to a wall with one hand on it; breathing out, the heels rise high onto the balls of the feet; breathing in, they lower slowly.',
}

const steps = [
  'Stand tall with feet hip-width apart, one hand on a wall or chair back.',
  'Breathe out and rise onto the balls of your feet, as high as you can.',
  'Pause, then breathe in and lower your heels slowly.',
]

export const calfRaises: Exercise = {
  id: 'calf-raises',
  name: 'Calf raises',
  technique: 'strength',
  worksAreas: ['calves', 'ankles'],
  loadsAreas: ['ankles'],
  equipment: ['wall'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['boneLoading', 'balance'],
  batch: 2,
  standard: {
    dose: { kind: 'reps', reps: 12, range: [10, 15], sets: 2, perSide: false },
    steps,
    cues: ['Rise high', 'Pause at the top', 'Lower slowly'],
    breathing: 'Breathe out as you rise, in as you lower.',
    figure,
    secondsPerRep: 3,
  },
  easier: {
    dose: { kind: 'reps', reps: 10, range: [8, 12], sets: 1, perSide: false },
    steps: ['Hold a wall or chair with both hands.', 'Rise only halfway, then lower.'],
    cues: ['Both hands on the wall', 'Halfway up', 'Steady'],
    breathing: 'Breathe out as you rise, in as you lower.',
    figure,
    secondsPerRep: 3,
  },
  harder: {
    dose: { kind: 'reps', reps: 10, range: [8, 12], sets: 2, perSide: true },
    steps: [
      'Stand on one foot, fingertips on the wall for balance.',
      'Rise high onto the ball of the foot, then lower over three seconds.',
      'Finish the set, then switch feet.',
    ],
    cues: ['One foot', 'Three seconds down', 'Fingertips only'],
    breathing: 'Breathe out as you rise, in as you lower.',
    figure,
    secondsPerRep: 5,
  },
}
