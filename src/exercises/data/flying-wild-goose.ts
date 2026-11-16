import { FRONT_STANDING, limbs, seatedFigure } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Shibashi 15, front view. Rising onto the balls of the feet, the arms lift wide to above the
// head, wrists leading; then they float down like wings, wrists up, as the knees sink.
// N = the figure's right.
const ready = FRONT_STANDING
const risen: Pose = {
  head: [125, 22],
  sh: [125, 44],
  hip: [125, 90],
  N: limbs([88, 28], [72, 10], [118, 118], [116, 145], [106, 151]),
  F: limbs([162, 28], [178, 10], [132, 118], [134, 145], [144, 151]),
}
const sunk: Pose = {
  head: [125, 32],
  sh: [125, 54],
  hip: [125, 100],
  N: limbs([84, 62], [58, 58], [114, 124], [116, 150], [106, 151]),
  F: limbs([166, 62], [192, 58], [136, 124], [134, 150], [144, 151]),
}

const figure: FigureSpec = {
  view: 'front',
  keyframes: [ready, risen, sunk],
  arrows: [
    [
      { p: [96, 96], q: [66, 12], bend: -14 },
      { p: [154, 96], q: [184, 12], bend: 14 },
    ],
    [
      { p: [62, 6], q: [52, 50], bend: 10 },
      { p: [188, 6], q: [198, 50], bend: -10 },
    ],
    [
      { p: [54, 68], q: [96, 100], bend: 8 },
      { p: [196, 68], q: [154, 100], bend: -8 },
    ],
  ],
  labels: [
    'Rise onto the balls of the feet, arms lift wide overhead',
    'Arms float down like wings, knees sink',
    'Arms settle by the sides',
  ],
  breath: ['in', 'out', 'out'],
  alt: 'Standing, seen from the front; rising onto the balls of the feet, the arms lift wide to above the head; then they float down like wings, wrists up, as the knees sink, and settle by the sides.',
}

const seated = seatedFigure(
  figure,
  'Sitting tall on a chair, seen from the front; the arms lift wide to above the head, then float down like wings, wrists up, and settle on the thighs.',
)

const breathing = 'Breathe in as the arms lift, out as they float down.'

const steps = [
  'Stand with feet shoulder-width apart, weight even, arms by your sides.',
  'Breathe in: shift forward onto the balls of the feet and lift the arms out to the sides and above your head, palms down, wrists leading.',
  'Breathe out: float the arms down the sides, wrists up, and sink through the knees.',
  'Keep the arms relaxed, like a wild goose in flight.',
]

export const flyingWildGoose: Exercise = {
  id: 'flying-wild-goose',
  name: 'Flying like a wild goose',
  technique: 'taichi',
  worksAreas: ['shoulders', 'upperBack', 'calves', 'quads'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing', 'balance'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 6, range: [4, 8], sets: 1, perSide: false },
    steps,
    cues: ['Wrists lead the arms', 'Rise, then sink', 'Shoulders relaxed'],
    breathing,
    figure,
    secondsPerRep: 9,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: false },
    steps: [
      'Sit tall near the front of a chair, hands resting on your thighs.',
      'Lift the arms out to the sides and up, wrists leading, then float them down like wings.',
      'Raise them only as high as feels easy.',
    ],
    cues: ['Seated', 'Wrists lead', 'Float down'],
    breathing,
    figure: seated,
    secondsPerRep: 9,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Rise higher onto the toes and sink lower each time, staying upright and steady.',
    ],
    cues: ['Higher rise', 'Deeper sink', 'Steady balance'],
    breathing,
    figure,
    secondsPerRep: 10,
  },
}
