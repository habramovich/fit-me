import { limbs, seatedFigure } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Shibashi 11, front view. Bent forward over soft knees, the hands come together low, palms up,
// scooping water; rising tall they lift crossed overhead, open out wide to the sides, and sweep
// down as the body bends forward to scoop again. N = the figure's right.
const scoop: Pose = {
  head: [125, 62],
  sh: [125, 70],
  hip: [125, 100],
  N: limbs([108, 94], [126, 118], [114, 124], [114, 150], [104, 151]),
  F: limbs([142, 94], [124, 118], [136, 124], [136, 150], [146, 151]),
}
const overhead: Pose = {
  head: [125, 26],
  sh: [125, 48],
  hip: [125, 94],
  N: limbs([105, 26], [130, 8], [118, 122], [116, 150], [106, 151]),
  F: limbs([145, 26], [120, 8], [132, 122], [134, 150], [144, 151]),
}
const open: Pose = {
  ...overhead,
  N: { ...overhead.N, el: [84, 42], wr: [60, 34] },
  F: { ...overhead.F, el: [166, 42], wr: [190, 34] },
}

const figure: FigureSpec = {
  view: 'front',
  keyframes: [scoop, overhead, open],
  arrows: [
    [
      { p: [100, 122], q: [102, 12], bend: -12 },
      { p: [150, 122], q: [148, 12], bend: 12 },
    ],
    [
      { p: [110, 0], q: [54, 26], bend: 14 },
      { p: [140, 0], q: [196, 26], bend: -14 },
    ],
    [
      { p: [54, 46], q: [108, 120], bend: 14 },
      { p: [196, 46], q: [142, 120], bend: -14 },
    ],
  ],
  labels: [
    'Scoop the water and rise, hands overhead',
    'Open the arms out wide',
    'Bend forward, hands sweep down to scoop',
  ],
  breath: ['in', 'out', 'out'],
  alt: 'Seen from the front: bending forward over soft knees, the hands meet low, palms up, scooping water; the body rises as the hands lift overhead, the arms open wide to the sides, and they sweep down as the body bends to scoop again.',
}

const seated = seatedFigure(
  figure,
  'Sitting on a chair, seen from the front: leaning forward, the hands meet low between the knees, palms up; sitting tall they lift overhead, open wide and sweep down to scoop again.',
)

const breathing = 'Breathe in as you scoop and rise, out as the arms open and you bend to scoop.'

const steps = [
  'Stand with your left foot a step forward, knees soft, weight slightly on the front foot.',
  'Breathe in: bend forward over the front knee, bring the hands together palms up, and scoop up, rising as the hands lift overhead and the weight moves to the back foot.',
  'Breathe out: open the arms out wide and bend forward again to scoop.',
  'Bend only as far as is comfortable. Change feet halfway.',
]

export const scoopingFromTheSea: Exercise = {
  id: 'scooping-from-the-sea',
  name: 'Scooping from the sea',
  technique: 'taichi',
  worksAreas: ['hamstrings', 'lowerBack', 'shoulders', 'hips'],
  loadsAreas: ['lowerBack'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 6, range: [4, 8], sets: 1, perSide: false },
    steps,
    cues: ['Bend from the hips', 'Scoop up, open wide', 'Knees soft'],
    breathing,
    figure,
    secondsPerRep: 10,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: false },
    steps: [
      'Sit near the front of a chair, feet flat and apart.',
      'Lean forward a little and bring the hands together low, palms up.',
      'Sit tall as the hands lift overhead, then open the arms wide and lean forward to scoop again.',
    ],
    cues: ['Seated', 'Small lean', 'Open wide'],
    breathing,
    figure: seated,
    secondsPerRep: 10,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Take a longer step, bend the front knee more, and let the back heel lift as you scoop.',
    ],
    cues: ['Longer stance', 'Deeper scoop', 'Back long'],
    breathing,
    figure,
    secondsPerRep: 11,
  },
}
