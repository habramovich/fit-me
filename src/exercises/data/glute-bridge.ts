import { limbs, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Lying on the back, knees bent, feet flat. Hips lift to a straight line from shoulders to knees.
const down: Pose = {
  head: [40, 138],
  sh: [64, 137],
  hip: [122, 137],
  N: limbs([90, 145], [116, 147], [152, 102], [168, 146], [186, 148]),
  F: limbs([88, 143], [114, 145], [148, 102], [162, 146], [180, 148]),
}
const up = withPose(down, {
  hip: [120, 104],
  ctrl: [92, 124],
  N: limbs([90, 145], [116, 147], [162, 100], [168, 146], [186, 148]),
  F: limbs([88, 143], [114, 145], [158, 100], [162, 146], [180, 148]),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [down, up],
  arrows: [[{ p: [104, 120], q: [104, 84], bend: 0 }]],
  labels: ['Lift the hips', 'Lower slowly'],
  breath: ['out', 'in'],
  alt: 'Lying on the back with knees bent and feet flat; breathing out, the hips lift into a straight line from shoulders to knees; breathing in, they lower.',
}

// Single-leg bridge: the near leg stays straight and lifted.
const singleDown = withPose(down, {
  N: limbs([90, 145], [116, 147], [164, 128], [204, 118], [208, 108]),
})
const singleUp = withPose(up, { N: limbs([90, 145], [116, 147], [162, 96], [202, 88], [206, 78]) })
const singleLeg: FigureSpec = {
  view: 'side',
  keyframes: [singleDown, singleUp],
  arrows: [[{ p: [104, 120], q: [104, 84], bend: 0 }]],
  labels: ['Lift the hips on one leg', 'Lower slowly'],
  breath: ['out', 'in'],
  alt: 'Lying on the back with one foot flat and the other leg straight; breathing out, the hips lift on one leg; breathing in, they lower.',
}

const steps = [
  'Lie on your back, knees bent, feet flat and hip-width apart, arms by your sides.',
  'Breathe out, press through your heels and lift your hips until shoulders, hips and knees line up.',
  'Squeeze your glutes at the top without arching your lower back.',
  'Breathe in and lower slowly.',
]

export const gluteBridge: Exercise = {
  id: 'glute-bridge',
  name: 'Glute bridge',
  technique: 'strength',
  worksAreas: ['glutes', 'hamstrings', 'core'],
  loadsAreas: ['lowerBack', 'knees'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['main'],
  batch: 1,
  standard: {
    dose: { kind: 'reps', reps: 12, range: [10, 15], sets: 2, perSide: false },
    steps,
    cues: ['Press through your heels', 'Squeeze at the top', 'Lower slowly'],
    breathing: 'Breathe out as you lift, in as you lower.',
    figure,
    secondsPerRep: 4,
  },
  easier: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 2, perSide: false },
    steps: [
      steps[0],
      'Breathe out and lift your hips only halfway.',
      'Breathe in and lower slowly.',
    ],
    cues: ['Lift halfway', 'Press through your heels', 'Lower slowly'],
    breathing: 'Breathe out as you lift, in as you lower.',
    figure,
    secondsPerRep: 4,
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 2, perSide: true },
    steps: [
      'Lie on your back, one foot flat, the other leg straight and lifted.',
      'Breathe out and lift your hips on the bent leg, keeping the hips level.',
      'Breathe in and lower slowly. Finish all reps, then switch legs.',
    ],
    cues: ['Hips stay level', 'Push through the heel', 'Switch legs after the set'],
    breathing: 'Breathe out as you lift, in as you lower.',
    figure: singleLeg,
    secondsPerRep: 4,
  },
}
