import { limbs, seatedFigure } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Shibashi 13, side view facing left, one foot a step ahead. Coming forward, both arms reach out
// in front at chest height, hands facing, and the back heel may lift; moving back onto the back
// foot, the arms open out and back like wings (short here, as they spread toward the sides).
const wings: Pose = {
  head: [106, 29],
  sh: [109, 52],
  hip: [112, 102],
  N: limbs([124, 58], [140, 50], [96, 126], [84, 150], [72, 151]),
  F: limbs([128, 57], [144, 49], [120, 127], [122, 150], [112, 151]),
}
const reach: Pose = {
  head: [90, 29],
  sh: [94, 52],
  hip: [98, 102],
  N: limbs([70, 62], [46, 62], [84, 124], [84, 150], [72, 151]),
  F: limbs([74, 61], [50, 61], [110, 124], [124, 144], [114, 151]),
}

const figure: FigureSpec = {
  view: 'side',
  keyframes: [wings, reach],
  arrows: [
    [
      { p: [146, 42], q: [42, 54], bend: 12 },
      { p: [120, 114], q: [100, 114], bend: 0 },
    ],
  ],
  labels: ['Come forward, arms reach out in front', 'Move back, arms spread back like wings'],
  breath: ['in', 'out'],
  alt: 'Standing with one foot a step ahead, seen from the side; coming forward, both arms reach out in front at chest height and the back heel lifts; moving back onto the back foot, the arms open out and back like wings.',
}

// Seated, the hips stay put: only the arm arrow.
const seatedBase = seatedFigure(
  figure,
  'Sitting tall on a chair, seen from the side; both arms reach out in front at chest height, then open out and back like wings.',
)
const seated: FigureSpec = {
  ...seatedBase,
  arrows: seatedBase.arrows.map((list) => list.slice(0, 1)),
}

const breathing = 'Breathe in as you reach forward, out as the arms spread back.'

const steps = [
  'Stand with your left foot a step forward, knees soft.',
  'Breathe in: come forward and reach both arms out in front at chest height, elbows soft, hands facing. Let the back heel lift if you feel steady.',
  'Breathe out: move back onto the back foot as the arms open out and back like wings, palms forward.',
  'Keep the shoulders relaxed. Change feet halfway.',
]

export const spreadingTheWings: Exercise = {
  id: 'spreading-the-wings',
  name: 'Spreading the wings',
  technique: 'taichi',
  worksAreas: ['chest', 'shoulders', 'upperBack', 'calves'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing', 'balance'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: true },
    steps,
    cues: ['Reach forward, open back', 'Elbows soft', 'Shoulders relaxed'],
    breathing,
    figure,
    secondsPerRep: 7,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: false },
    steps: [
      'Sit tall near the front of a chair.',
      'Reach both arms out in front at chest height, hands facing.',
      'Open the arms out and back like wings, as far as is comfortable.',
    ],
    cues: ['Seated', 'Reach, then open', 'Chest broad'],
    breathing,
    figure: seated,
    secondsPerRep: 7,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Take a longer step, lift the back heel each time you come forward, and sink into the back leg as the wings open.',
    ],
    cues: ['Longer stance', 'Heel lifts', 'Wide wings'],
    breathing,
    figure,
    secondsPerRep: 8,
  },
}
