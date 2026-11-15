import { limbs, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Lying on the back, arms up, knees over hips at 90°. One arm reaches back, the opposite leg out.
const start: Pose = {
  head: [44, 138],
  sh: [68, 137],
  hip: [128, 137],
  N: limbs([70, 108], [72, 80], [132, 95], [174, 97], [182, 91]),
  F: limbs([66, 108], [68, 80], [126, 95], [168, 97], [176, 91]),
}
const extended = withPose(start, {
  N: limbs([40, 122], [12, 126], [132, 95], [174, 97], [182, 91]),
  F: limbs([66, 108], [68, 80], [170, 128], [212, 134], [222, 128]),
})
const legOnly = withPose(start, {
  F: limbs([66, 108], [68, 80], [146, 120], [166, 148], [178, 144]),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [start, extended],
  arrows: [
    [
      { p: [62, 66], q: [8, 112], bend: -18 },
      { p: [184, 88], q: [228, 120], bend: -14 },
    ],
  ],
  labels: ['Reach one arm back and the opposite leg out', 'Return to the start'],
  breath: ['out', 'in'],
  alt: 'Lying on the back with arms up and knees bent over the hips; breathing out, one arm reaches overhead while the opposite leg straightens; breathing in, both return.',
}

const easierFigure: FigureSpec = {
  view: 'side',
  keyframes: [start, legOnly],
  arrows: [[{ p: [180, 96], q: [186, 140], bend: -10 }]],
  labels: ['Lower one foot to tap the floor', 'Bring the knee back over the hip'],
  breath: ['out', 'in'],
  alt: 'Lying on the back with arms up and knees over hips; breathing out, one foot lowers to tap the floor; breathing in, it returns.',
}

const steps = [
  'Lie on your back, arms straight up, knees bent over your hips.',
  'Press your lower back gently into the mat.',
  'Breathe out and reach one arm back and the opposite leg out, just above the floor.',
  'Breathe in and return. Switch sides each rep.',
]

export const deadBug: Exercise = {
  id: 'dead-bug',
  name: 'Dead bug',
  technique: 'strength',
  worksAreas: ['core', 'hips', 'shoulders'],
  loadsAreas: ['lowerBack'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['main'],
  position: 'lying',
  intensity: 'moderate',
  tags: [],
  batch: 1,
  standard: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 2, perSide: true },
    steps,
    cues: ['Lower back stays on the mat', 'Breathe out as you reach', 'Slow and controlled'],
    breathing: 'Breathe out as you reach the arm and leg away, in as you return.',
    figure,
    secondsPerRep: 4,
  },
  easier: {
    dose: { kind: 'reps', reps: 6, range: [5, 8], sets: 2, perSide: true },
    steps: [
      steps[0],
      steps[1],
      'Breathe out and lower one foot to tap the floor; arms stay up.',
      'Breathe in and bring the knee back. Switch legs each rep.',
    ],
    cues: ['Arms stay up', 'Tap one foot down', 'Back stays on the mat'],
    breathing: 'Breathe out as the foot lowers, in as it returns.',
    figure: easierFigure,
    secondsPerRep: 3,
  },
  harder: {
    dose: { kind: 'reps', reps: 10, range: [8, 12], sets: 3, perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Hold the long position for 2 seconds, then breathe in and return.',
    ],
    cues: ['Hold 2 seconds at full reach', 'Back stays on the mat', 'Keep breathing'],
    breathing: 'Breathe out as you reach, keep breathing in the hold, in as you return.',
    figure,
    secondsPerRep: 6,
  },
}
