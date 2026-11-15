import { limbs, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// On hands and knees; the far arm reaches forward while the near leg extends back.
const allFours: Pose = {
  head: [52, 80],
  sh: [76, 90],
  hip: [150, 90],
  N: limbs([76, 120], [76, 148], [150, 148], [194, 150], [204, 150]),
  F: limbs([82, 120], [82, 148], [144, 148], [188, 150], [198, 150]),
}
const reach = withPose(allFours, {
  head: [50, 80],
  N: limbs([76, 120], [76, 148], [192, 90], [234, 92], [242, 100]),
  F: limbs([48, 86], [20, 82], [144, 148], [188, 150], [198, 150]),
})
const legOnly = withPose(allFours, {
  N: limbs([76, 120], [76, 148], [192, 90], [234, 92], [242, 100]),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [allFours, reach],
  arrows: [
    [
      { p: [66, 136], q: [16, 70], bend: 16 },
      { p: [168, 140], q: [238, 80], bend: -16 },
    ],
  ],
  labels: ['Reach one arm forward and the opposite leg back', 'Return to all fours'],
  breath: ['out', 'in'],
  alt: 'On hands and knees; breathing out, one arm reaches forward while the opposite leg extends back; breathing in, both return.',
}

const easierFigure: FigureSpec = {
  view: 'side',
  keyframes: [allFours, legOnly],
  arrows: [[{ p: [168, 140], q: [238, 80], bend: -16 }]],
  labels: ['Slide one leg back and lift it', 'Return to all fours'],
  breath: ['out', 'in'],
  alt: 'On hands and knees; breathing out, one leg extends back to hip height; breathing in, it returns.',
}

const steps = [
  'Come to hands and knees: hands under shoulders, knees under hips.',
  'Breathe out and reach your right arm forward and left leg back, to shoulder and hip height.',
  'Keep your hips level and your back flat.',
  'Breathe in and return. Switch sides each rep.',
]

export const birdDog: Exercise = {
  id: 'bird-dog',
  name: 'Bird dog',
  technique: 'strength',
  worksAreas: ['core', 'glutes', 'lowerBack', 'shoulders'],
  loadsAreas: ['wrists', 'knees'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['main'],
  position: 'kneeling',
  intensity: 'moderate',
  tags: ['balance'],
  batch: 1,
  standard: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 2, perSide: true },
    steps,
    cues: ['Hips level', 'Reach long, not high', 'Breathe out as you reach'],
    breathing: 'Breathe out as you reach the arm and leg away, in as you return.',
    figure,
    secondsPerRep: 4,
  },
  easier: {
    dose: { kind: 'reps', reps: 6, range: [5, 8], sets: 2, perSide: true },
    steps: [
      steps[0],
      'Breathe out and extend one leg back; hands stay down.',
      'Breathe in and return. Switch legs each rep.',
    ],
    cues: ['Hands stay down', 'One leg back', 'Hips level'],
    breathing: 'Breathe out as the leg extends, in as it returns.',
    figure: easierFigure,
    secondsPerRep: 3,
  },
  harder: {
    dose: { kind: 'reps', reps: 10, range: [8, 12], sets: 2, perSide: true },
    steps: [...steps.slice(0, 3), 'Hold the reach for 3 seconds, then breathe in and return.'],
    cues: ['Hold 3 seconds', 'Hips level', 'Keep breathing in the hold'],
    breathing: 'Breathe out as you reach, breathe gently in the hold, in as you return.',
    figure,
    secondsPerRep: 7,
  },
}
