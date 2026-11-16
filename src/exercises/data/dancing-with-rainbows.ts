import { limbs, mirror, mirrorArrow, seatedFigure } from '../build'
import type { Arrow, Exercise, FigureSpec, Pose } from '../types'

// Shibashi 3, front view. From the centre with both arms overhead, the weight shifts onto the
// right leg (viewer's left) and the body bends to the left: the right arm curves over the head,
// the left arm reaches out to the side, palm up. Back to the centre, then the other side.
// The feet stay put. N = the figure's right.
const centre: Pose = {
  head: [125, 26],
  sh: [125, 48],
  hip: [125, 94],
  N: limbs([108, 24], [116, 4], [116, 122], [110, 150], [100, 151]),
  F: limbs([142, 24], [134, 4], [134, 122], [140, 150], [150, 151]),
}
const right: Pose = {
  head: [136, 30],
  sh: [131, 51],
  hip: [117, 97],
  ctrl: [119, 72],
  N: limbs([106, 28], [130, 12], [104, 124], [110, 150], [100, 151]),
  F: limbs([172, 58], [198, 64], [133, 123], [140, 150], [150, 151]),
}
const left = mirror(right)

const toRight: Arrow[] = [
  { p: [146, 2], q: [200, 54], bend: -14 },
  { p: [126, 112], q: [110, 112], bend: 0 },
]
const backFromRight: Arrow[] = [
  { p: [200, 54], q: [146, 2], bend: 14 },
  { p: [110, 112], q: [126, 112], bend: 0 },
]

const figure: FigureSpec = {
  view: 'front',
  keyframes: [centre, right, centre, left],
  arrows: [toRight, backFromRight, toRight.map(mirrorArrow), backFromRight.map(mirrorArrow)],
  labels: [
    'Shift right: right arm curves overhead, left arm reaches out',
    'Back to the centre, both arms overhead',
    'Shift left: left arm curves overhead, right arm reaches out',
    'Back to the centre, both arms overhead',
  ],
  breath: ['out', 'in', 'out', 'in'],
  alt: 'Standing, seen from the front, arms overhead; the weight shifts to one side as that arm curves over the head and the other arm reaches out to the side, palm up, like a teapot; back to the centre, then the other side.',
}

// Seated, the hips stay put: only the arm arrows.
const seatedBase = seatedFigure(
  figure,
  'Sitting on a chair, seen from the front, arms overhead; the body bends to one side as one arm curves over the head and the other reaches out to the side; back to the centre, then the other side.',
)
const seated: FigureSpec = {
  ...seatedBase,
  arrows: seatedBase.arrows.map((list) => list.slice(0, 1)),
  labels: [
    'Bend right: right arm curves overhead, left arm reaches out',
    'Back to the centre, both arms overhead',
    'Bend left: left arm curves overhead, right arm reaches out',
    'Back to the centre, both arms overhead',
  ],
}

const steps = [
  'Stand with feet shoulder-width apart, knees soft, arms raised overhead, palms facing.',
  'Breathe out: shift your weight onto your right foot. Curve the right arm over your head and reach the left arm out to the side, palm up.',
  'Breathe in: come back to the centre with both arms overhead.',
  'Breathe out: shift onto your left foot and mirror the shape. Keep the feet still.',
]

export const dancingWithRainbows: Exercise = {
  id: 'dancing-with-rainbows',
  name: 'Dancing with rainbows',
  technique: 'taichi',
  worksAreas: ['shoulders', 'core', 'hips', 'upperBack'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing', 'balance'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 4, range: [3, 6], sets: 1, perSide: true },
    steps,
    cues: ['Weight shifts, feet stay', 'Upper arm curves over the head', 'Eyes on the open palm'],
    breathing: 'Breathe out as you shift to the side, in as you come back to the centre.',
    figure,
    secondsPerRep: 8,
  },
  easier: {
    dose: { kind: 'reps', reps: 3, range: [2, 5], sets: 1, perSide: true },
    steps: [
      'Sit tall near the front of a chair, arms raised overhead (or as high as is comfortable).',
      'Bend gently to one side: one arm curves over the head, the other reaches out, palm up.',
      'Come back to the centre, then bend to the other side.',
    ],
    cues: ['Seated', 'Gentle side bend', 'Both sit bones down'],
    breathing: 'Breathe out as you bend to the side, in as you come back to the centre.',
    figure: seated,
    secondsPerRep: 8,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 6, range: [4, 8], sets: 1, perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Bend the standing knee a little more and let the other leg straighten, toes on the floor.',
    ],
    cues: ['Deeper knee bend', 'Long side stretch', 'Slow and even'],
    breathing: 'Breathe out as you shift to the side, in as you come back to the centre.',
    figure,
    secondsPerRep: 10,
  },
}
