import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Hip strength (glute medius), lying on one side, knees bent, feet together. The top knee opens
// like a clamshell and closes. Near side = the top side (dark).
const closed: Pose = {
  head: [40, 128],
  sh: [66, 138],
  hip: [128, 138],
  N: limbs([92, 136], [104, 150], [162, 128], [140, 146], [150, 146]),
  F: limbs([50, 148], [28, 140], [164, 134], [142, 148], [152, 148]),
}
const open: Pose = {
  ...closed,
  N: limbs([92, 136], [104, 150], [158, 104], [140, 144], [150, 144]),
}
const figure: FigureSpec = {
  view: 'side',
  keyframes: [closed, open],
  arrows: [[{ p: [172, 122], q: [168, 96], bend: -6 }]],
  labels: ['Open the top knee, feet together', 'Close slowly'],
  breath: ['out', 'in'],
  alt: 'Lying on one side with knees bent and feet together, seen from the front; breathing out, the top knee opens upward like a clamshell; breathing in, it closes.',
}

const steps = [
  'Lie on your side, head on your lower arm, hips and knees bent, feet together.',
  'Keep your feet touching and your hips stacked.',
  'Breathe out and open the top knee as far as you can without rolling back.',
  'Breathe in and close slowly. Finish the set, then switch sides.',
]

export const clamshells: Exercise = {
  id: 'clamshells',
  name: 'Clamshells',
  technique: 'strength',
  worksAreas: ['hips', 'glutes'],
  loadsAreas: [],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'lying',
  intensity: 'gentle',
  tags: [],
  batch: 4,
  standard: {
    dose: { kind: 'reps', reps: 12, range: [10, 15], sets: 2, perSide: true },
    steps,
    cues: ['Feet together', 'Don’t roll back', 'Close slowly'],
    breathing: 'Breathe out as the knee opens, in as it closes.',
    figure,
    secondsPerRep: 3,
  },
  easier: {
    dose: { kind: 'reps', reps: 10, range: [8, 12], sets: 1, perSide: true },
    steps: [steps[0], 'Open the knee only partway.', 'Close slowly. Switch sides.'],
    cues: ['Partway open', 'Feet together', 'Slow'],
    breathing: 'Breathe out as the knee opens, in as it closes.',
    figure,
    secondsPerRep: 3,
  },
  harder: {
    dose: { kind: 'reps', reps: 15, range: [12, 20], sets: 3, perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Loop a resistance band above the knees, or hold the top for two seconds.',
    ],
    cues: ['Band or pause', 'Hips stacked', 'Slow return'],
    breathing: 'Breathe out as the knee opens, in as it closes.',
    figure,
    secondsPerRep: 5,
  },
}
