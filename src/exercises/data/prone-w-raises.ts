import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Upper-back strength and posture, lying face down (head left), arms bent in a "W". Lift the
// chest and arms a little, squeezing the shoulder blades together, then lower.
const down: Pose = {
  head: [44, 140],
  sh: [68, 140],
  hip: [126, 141],
  N: limbs([92, 150], [68, 150], [168, 144], [210, 146], [220, 150]),
  F: limbs([94, 148], [70, 148], [166, 142], [208, 144], [218, 148]),
}
const lifted: Pose = {
  head: [46, 128],
  sh: [70, 132],
  hip: [126, 141],
  ctrl: [98, 140],
  N: limbs([94, 108], [70, 100], [168, 144], [210, 146], [220, 150]),
  F: limbs([96, 106], [72, 98], [166, 142], [208, 144], [218, 148]),
}
const figure: FigureSpec = {
  view: 'side',
  keyframes: [down, lifted],
  arrows: [[{ p: [110, 140], q: [110, 98], bend: 0 }]],
  labels: ['Lift the chest and arms, squeeze the shoulder blades', 'Lower slowly'],
  breath: ['out', 'in'],
  alt: 'Lying face down with arms bent in a W shape, seen from the side; breathing out, the chest and arms lift a little as the shoulder blades squeeze together; breathing in, they lower.',
}

const steps = [
  'Lie face down, forehead on a small towel, arms bent in a “W” beside you.',
  'Breathe out and lift your arms and chest a little, squeezing the shoulder blades together and down.',
  'Keep your neck long, looking at the floor.',
  'Breathe in and lower slowly.',
]

export const proneWRaises: Exercise = {
  id: 'prone-w-raises',
  name: 'Prone W raises',
  technique: 'strength',
  worksAreas: ['upperBack', 'shoulders', 'neck'],
  loadsAreas: ['lowerBack'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['main'],
  position: 'lying',
  intensity: 'moderate',
  tags: [],
  batch: 4,
  standard: {
    dose: { kind: 'reps', reps: 10, range: [8, 12], sets: 2, perSide: false },
    steps,
    cues: ['Shoulder blades together and down', 'Neck long', 'Small lift'],
    breathing: 'Breathe out as you lift, in as you lower.',
    figure,
    secondsPerRep: 4,
  },
  easier: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps: [steps[0], 'Lift only the arms, keeping the chest down.', 'Lower slowly.'],
    cues: ['Arms only', 'Squeeze the blades', 'Chest down'],
    breathing: 'Breathe out as you lift, in as you lower.',
    figure,
    secondsPerRep: 3,
  },
  harder: {
    dose: { kind: 'reps', reps: 12, range: [10, 15], sets: 3, perSide: false },
    steps: [...steps.slice(0, 3), 'Hold the top for three seconds before lowering.'],
    cues: ['Three-second hold', 'Neck long', 'Breathe'],
    breathing: 'Breathe out as you lift, breathe steadily in the hold, in as you lower.',
    figure,
    secondsPerRep: 7,
  },
}
