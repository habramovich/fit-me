import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Hip strength, lying on one side (head left, head resting on the lower arm), legs stacked. The
// top leg lifts and lowers. Near side = the top side (dark).
const down: Pose = {
  head: [40, 128],
  sh: [66, 138],
  hip: [128, 138],
  N: limbs([92, 136], [104, 150], [172, 138], [214, 138], [222, 130]),
  F: limbs([50, 148], [28, 140], [170, 142], [212, 142], [220, 134]),
}
const up: Pose = {
  ...down,
  N: limbs([92, 136], [104, 150], [170, 122], [210, 106], [218, 98]),
}
const figure: FigureSpec = {
  view: 'side',
  keyframes: [down, up],
  arrows: [[{ p: [226, 124], q: [222, 92], bend: -6 }]],
  labels: ['Lift the top leg', 'Lower slowly'],
  breath: ['out', 'in'],
  alt: 'Lying on one side with the head on the lower arm and legs stacked, seen from the front; breathing out, the top leg lifts; breathing in, it lowers slowly.',
}

const steps = [
  'Lie on your side, head resting on your lower arm, legs long and stacked.',
  'Place the top hand on the floor in front of you for balance.',
  'Breathe out and lift the top leg, toes pointing forward, not up.',
  'Breathe in and lower slowly. Finish the set, then switch sides.',
]

export const sideLyingLegLifts: Exercise = {
  id: 'side-lying-leg-lifts',
  name: 'Side-lying leg lifts',
  technique: 'strength',
  worksAreas: ['hips', 'glutes'],
  loadsAreas: ['hips'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['main'],
  position: 'lying',
  intensity: 'moderate',
  tags: [],
  batch: 4,
  standard: {
    dose: { kind: 'reps', reps: 12, range: [10, 15], sets: 2, perSide: true },
    steps,
    cues: ['Toes forward', 'Lift from the hip', 'Lower slowly'],
    breathing: 'Breathe out as you lift, in as you lower.',
    figure,
    secondsPerRep: 3,
  },
  easier: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 2, perSide: true },
    steps: [
      steps[0],
      'Bend the bottom knee for stability.',
      'Lift the top leg a little, then lower. Switch sides.',
    ],
    cues: ['Bottom knee bent', 'Small lift', 'Slow'],
    breathing: 'Breathe out as you lift, in as you lower.',
    figure,
    secondsPerRep: 3,
  },
  harder: {
    dose: { kind: 'reps', reps: 15, range: [12, 20], sets: 3, perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Pause for two seconds at the top, then lower over three seconds.',
    ],
    cues: ['Two-second pause', 'Three seconds down', 'Hips stacked'],
    breathing: 'Breathe out as you lift, in as you lower.',
    figure,
    secondsPerRep: 6,
  },
}
