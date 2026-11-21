import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Side view, lying on the back with knees bent and feet flat a little apart. Both knees lower a
// little to one side (toward the viewer) and come back to the middle; then the other side.
const middle: Pose = {
  head: [40, 138],
  sh: [64, 137],
  hip: [122, 137],
  N: limbs([90, 145], [116, 147], [152, 102], [168, 146], [186, 148]),
  F: limbs([88, 143], [114, 145], [148, 102], [162, 146], [180, 148]),
}
const lowered: Pose = {
  ...middle,
  hip: [122, 136],
  N: limbs([90, 145], [116, 147], [156, 118], [168, 146], [184, 146]),
  F: limbs([88, 143], [114, 145], [152, 114], [162, 144], [178, 144]),
}

const figure: FigureSpec = {
  view: 'side',
  keyframes: [middle, lowered],
  arrows: [[{ p: [164, 96], q: [166, 116], bend: -8 }]],
  labels: ['Lower both knees a little to one side', 'Back to the middle'],
  breath: ['out', 'in'],
  nose: 'up',
  alt: 'Lying on the back with knees bent and feet flat, seen from the side; breathing out, both knees lower a little to one side; breathing in, they come back to the middle.',
}

const steps = [
  'Lie on your back, knees bent, feet flat and a little wider than your hips; arms out to the sides.',
  'Breathe out and slowly lower both knees a little to the right.',
  'Breathe in and bring them back to the middle.',
  'Then lower them to the left. Keep the movement small and easy.',
]
const breathing = 'Breathe out as the knees lower, in as they come back to the middle.'

export const windshieldWipers: Exercise = {
  id: 'windshield-wipers',
  name: 'Windshield wipers',
  technique: 'mobility',
  worksAreas: ['lowerBack', 'hips'],
  loadsAreas: ['lowerBack'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['warmup', 'cooldown'],
  position: 'lying',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: true },
    steps,
    cues: ['Small and easy', 'Shoulders stay down', 'Move with the breath'],
    breathing,
    figure,
    secondsPerRep: 5,
  },
  easier: {
    dose: { kind: 'reps', reps: 6, range: [4, 8], sets: 1, perSide: true },
    steps: [
      'Lie on your back, knees bent, feet flat and together.',
      'Let both knees tip just a little to the right, then back to the middle.',
      'Then a little to the left. Keep it very small.',
    ],
    cues: ['Feet together', 'Very small', 'Shoulders down'],
    breathing,
    figure,
    secondsPerRep: 4,
  },
  harder: {
    dose: { kind: 'reps', reps: 10, range: [8, 12], sets: 1, perSide: true },
    steps: [
      steps[0],
      'Breathe out and lower both knees further to the right while turning your head to the left.',
      'Breathe in and bring them back to the middle.',
      'Then to the left, head turning right. Keep the shoulders down.',
    ],
    cues: ['Knees further', 'Head turns the other way', 'Shoulders down'],
    breathing,
    figure,
    secondsPerRep: 6,
  },
}
