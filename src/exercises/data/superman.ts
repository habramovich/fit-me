import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Back-of-body strength, lying face down (head left), arms reaching past the head. Lift the arms,
// chest and legs together, hold briefly, lower. Easier: one arm and the opposite leg at a time.
const down: Pose = {
  head: [46, 138],
  sh: [70, 140],
  hip: [126, 141],
  N: limbs([41, 145], [14, 147], [168, 144], [210, 146], [220, 150]),
  F: limbs([43, 143], [16, 145], [166, 142], [208, 144], [218, 148]),
}
const lifted: Pose = {
  head: [50, 124],
  sh: [72, 131],
  hip: [126, 142],
  ctrl: [100, 140],
  N: limbs([43, 124], [16, 118], [167, 136], [208, 127], [219, 130]),
  F: limbs([45, 122], [18, 116], [165, 134], [206, 125], [217, 128]),
}

const figure: FigureSpec = {
  view: 'side',
  keyframes: [down, lifted],
  arrows: [
    [
      { p: [22, 140], q: [18, 112], bend: 0 },
      { p: [212, 140], q: [212, 120], bend: 0 },
    ],
  ],
  labels: ['Lift the arms, chest and legs together, and hold', 'Lower slowly'],
  breath: ['out', 'in'],
  alt: 'Lying face down with the arms reaching past the head, seen from the side; breathing out, the arms, chest and legs lift off the mat together and hold; breathing in, they lower.',
}

// Easier: near arm with far leg, then far arm with near leg.
const chestLow: Pick<Pose, 'head' | 'sh'> = { head: [48, 132], sh: [71, 137] }
const liftNearArm: Pose = {
  ...down,
  ...chestLow,
  N: { ...down.N, el: [43, 129], wr: [16, 124] },
  F: { ...down.F, el: [44, 141], wr: [17, 144], kn: [165, 136], an: [206, 128], to: [217, 131] },
}
const liftFarArm: Pose = {
  ...down,
  ...chestLow,
  N: { ...down.N, el: [42, 143], wr: [15, 146], kn: [167, 137], an: [208, 129], to: [219, 132] },
  F: { ...down.F, el: [45, 127], wr: [18, 122] },
}

const alternating: FigureSpec = {
  view: 'side',
  keyframes: [down, liftNearArm, down, liftFarArm],
  arrows: [
    [
      { p: [22, 140], q: [18, 118], bend: 0 },
      { p: [210, 140], q: [210, 122], bend: 0 },
    ],
    [
      { p: [26, 118], q: [26, 140], bend: 0 },
      { p: [216, 124], q: [216, 144], bend: 0 },
    ],
    [
      { p: [24, 140], q: [20, 116], bend: 0 },
      { p: [212, 142], q: [212, 124], bend: 0 },
    ],
    [
      { p: [28, 116], q: [28, 140], bend: 0 },
      { p: [218, 126], q: [218, 146], bend: 0 },
    ],
  ],
  labels: ['Lift one arm and the opposite leg', 'Lower', 'Lift the other arm and leg', 'Lower'],
  breath: ['out', 'in', 'out', 'in'],
  alt: 'Lying face down with the arms reaching past the head, seen from the side; one arm and the opposite leg lift a little and lower, then the other arm and leg.',
}

const steps = [
  'Lie face down, arms reaching past your head, legs long, forehead just off the mat.',
  'Breathe out and lift your arms, chest and legs a little off the mat together.',
  'Hold for about two seconds, reaching long through your hands and feet.',
  'Breathe in and lower slowly.',
]

export const superman: Exercise = {
  id: 'superman',
  name: 'Superman',
  technique: 'strength',
  worksAreas: ['lowerBack', 'glutes', 'upperBack', 'shoulders'],
  loadsAreas: ['lowerBack'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['main'],
  position: 'lying',
  intensity: 'moderate',
  tags: [],
  batch: 7,
  standard: {
    dose: { kind: 'reps', reps: 8, range: [6, 12], sets: 2, perSide: false },
    steps,
    cues: ['Reach long, not high', 'Neck long, eyes down', 'Squeeze the glutes'],
    breathing: 'Breathe out as you lift, in as you lower.',
    figure,
    secondsPerRep: 5,
  },
  easier: {
    dose: { kind: 'reps', reps: 6, range: [4, 10], sets: 2, perSide: true },
    steps: [
      steps[0],
      'Breathe out and lift one arm and the opposite leg a little.',
      'Breathe in and lower, then lift the other arm and leg.',
    ],
    cues: ['Opposite arm and leg', 'Hips stay down', 'Small, slow lifts'],
    breathing: 'Breathe out as you lift, in as you lower.',
    figure: alternating,
    secondsPerRep: 4,
  },
  harder: {
    dose: { kind: 'reps', reps: 6, range: [5, 10], sets: 3, perSide: false },
    steps: [steps[0], steps[1], 'Hold for five seconds, breathing steadily.', steps[3]],
    cues: ['Five-second hold', 'Reach long', 'Breathe in the hold'],
    breathing: 'Breathe out as you lift, breathe steadily in the hold, in as you lower.',
    figure,
    secondsPerRep: 8,
  },
}
