import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Strength and bone loading. Side view facing left, chair behind. From sitting, lean forward
// slightly and stand up through the heels, arms crossed on the chest; sit back down slowly.
const CHAIR: [number, number] = [100, 117]
const seated: Pose = {
  head: [112, 34],
  sh: [118, 56],
  hip: [124, 104],
  N: limbs([102, 74], [114, 64], [88, 106], [86, 150], [72, 151]),
  F: limbs([106, 72], [118, 62], [92, 106], [90, 150], [76, 151]),
}
const standing: Pose = {
  head: [92, 14],
  sh: [98, 36],
  hip: [106, 80],
  N: limbs([84, 56], [96, 46], [92, 116], [86, 150], [72, 151]),
  F: limbs([88, 54], [100, 44], [96, 116], [90, 150], [76, 151]),
}

const figure: FigureSpec = {
  view: 'side',
  props: { chair: CHAIR },
  keyframes: [seated, standing],
  arrows: [[{ p: [138, 98], q: [118, 66], bend: -10 }]],
  labels: ['Stand up through your heels', 'Sit back down slowly'],
  breath: ['out', 'in'],
  alt: 'Sitting on a chair with arms crossed on the chest, seen from the side; breathing out, the person stands up through the heels; breathing in, sits back down slowly.',
}

const steps = [
  'Sit near the front of a sturdy chair, feet flat and hip-width apart, arms crossed on your chest.',
  'Lean forward slightly and breathe out as you stand up through your heels.',
  'Stand tall, then breathe in as you sit back down slowly, hips first.',
  'Touch the seat lightly and go again.',
]

export const sitToStand: Exercise = {
  id: 'sit-to-stand',
  name: 'Sit-to-stand',
  technique: 'strength',
  worksAreas: ['quads', 'glutes', 'hamstrings', 'core'],
  loadsAreas: ['knees'],
  equipment: ['chair'],
  level: 'beginner',
  phases: ['main'],
  position: 'seated',
  intensity: 'moderate',
  tags: ['boneLoading'],
  batch: 2,
  standard: {
    dose: { kind: 'reps', reps: 10, range: [8, 12], sets: 2, perSide: false },
    steps,
    cues: ['Nose over toes, then stand', 'Push through the heels', 'Sit down slowly'],
    breathing: 'Breathe out as you stand, in as you sit.',
    figure,
    secondsPerRep: 4,
  },
  easier: {
    dose: { kind: 'reps', reps: 8, range: [5, 10], sets: 2, perSide: false },
    steps: [
      'Use a higher seat, or a cushion on the chair.',
      'Push off your thighs with your hands as you stand.',
      'Sit back down slowly.',
    ],
    cues: ['Higher seat', 'Hands on thighs', 'Slow down'],
    breathing: 'Breathe out as you stand, in as you sit.',
    figure,
    secondsPerRep: 4,
  },
  harder: {
    dose: { kind: 'reps', reps: 12, range: [10, 15], sets: 3, perSide: false },
    steps: [
      ...steps.slice(0, 2),
      'Take three seconds to sit back down, and only tap the seat.',
      steps[3],
    ],
    cues: ['Three seconds down', 'Just tap the seat', 'Arms crossed'],
    breathing: 'Breathe out as you stand, in as you lower slowly.',
    figure,
    secondsPerRep: 6,
  },
}
