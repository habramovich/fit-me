import { limbs, seatedFigure } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Shibashi 12, side view facing left, one foot a step ahead. Weight back, hands by the shoulders
// with palms forward; the weight rolls onto the front foot as both hands push forward like a wave,
// then the palms turn down and the weight comes back. The far arm is drawn a little behind.
const back: Pose = {
  head: [106, 29],
  sh: [109, 52],
  hip: [112, 102],
  N: limbs([114, 78], [96, 56], [96, 126], [84, 150], [72, 151]),
  F: limbs([118, 77], [100, 55], [120, 127], [122, 150], [112, 151]),
}
const forward: Pose = {
  head: [90, 29],
  sh: [94, 52],
  hip: [98, 102],
  N: limbs([70, 58], [46, 54], [84, 124], [84, 150], [72, 151]),
  F: limbs([74, 57], [50, 53], [110, 126], [122, 150], [112, 151]),
}

const figure: FigureSpec = {
  view: 'side',
  keyframes: [back, forward],
  arrows: [
    [
      { p: [92, 46], q: [42, 44], bend: 0 },
      { p: [120, 114], q: [100, 114], bend: 0 },
    ],
  ],
  labels: [
    'Push the hands forward, weight onto the front foot',
    'Palms turn down, weight comes back',
  ],
  breath: ['out', 'in'],
  alt: 'Standing with one foot a step ahead, seen from the side; from the weight back with the hands by the shoulders, palms forward, the body rolls onto the front foot as both hands push forward like a wave, then the weight comes back.',
}

// Seated, the hips stay put: only the arm arrow.
const seatedBase = seatedFigure(
  figure,
  'Sitting tall on a chair, seen from the side; the hands start by the shoulders, palms forward, push forward like a wave, then draw back.',
)
const seated: FigureSpec = {
  ...seatedBase,
  arrows: seatedBase.arrows.map((list) => list.slice(0, 1)),
}

const breathing = 'Breathe in as the weight comes back, out as you push forward.'

const steps = [
  'Stand with your left foot a step forward, knees soft.',
  'Breathe in: bend the elbows and bring the hands to your shoulders, palms forward, with the weight on the back leg.',
  'Breathe out: push the arms forward and shift the weight onto the front leg.',
  'Breathe in: turn the palms down and bring the weight back. Change feet halfway.',
]

export const playingWithWaves: Exercise = {
  id: 'playing-with-waves',
  name: 'Playing with waves',
  technique: 'taichi',
  worksAreas: ['quads', 'hips', 'shoulders', 'arms'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing', 'balance'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: true },
    steps,
    cues: ['Push from the legs', 'Palms forward', 'Back foot stays down'],
    breathing,
    figure,
    secondsPerRep: 7,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: false },
    steps: [
      'Sit tall near the front of a chair, hands by your shoulders, palms forward.',
      'Lean a little forward as you push both hands out in front.',
      'Turn the palms down and draw the hands back as you sit tall.',
    ],
    cues: ['Seated', 'Push forward', 'Draw back slowly'],
    breathing,
    figure: seated,
    secondsPerRep: 7,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: true },
    steps: [
      'Stand with your left foot a longer step forward, knees bent.',
      ...steps.slice(1, 3),
      'Sink lower as the weight comes back, keeping the body upright. Change feet halfway.',
    ],
    cues: ['Longer stance', 'Sink low', 'Upright body'],
    breathing,
    figure,
    secondsPerRep: 8,
  },
}
