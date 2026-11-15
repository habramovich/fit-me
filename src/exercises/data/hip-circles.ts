import { limbs } from '../build'
import type { Exercise, FigureSpec, Point, Pose } from '../types'

// Front view, standing, hands on hips. Hips trace a circle: right, forward, left, back.
// N is the figure's right (drawn on the viewer's left).
function stance(dx: number, dy: number): Pose {
  const hip: Point = [125 + dx, 94 + dy]
  return {
    head: [125 + dx * 0.2, 26 + dy * 0.3],
    sh: [125 + dx * 0.2, 48 + dy * 0.4],
    hip,
    N: limbs(
      [96 + dx * 0.5, 72],
      [112 + dx, 92 + dy],
      [113 + dx * 0.5, 122 + dy * 0.5],
      [112, 150],
      [101, 151],
    ),
    F: limbs(
      [154 + dx * 0.5, 72],
      [138 + dx, 92 + dy],
      [137 + dx * 0.5, 122 + dy * 0.5],
      [138, 150],
      [149, 151],
    ),
  }
}

const figure: FigureSpec = {
  view: 'front',
  keyframes: [stance(-10, 0), stance(0, 4), stance(10, 0), stance(0, -3)],
  // A hoop at hip height shows the horizontal circle; the dot moves with the hips.
  ring: { center: [125, 97], rx: 34, ry: 10, start: Math.PI, dir: -1 },
  arrows: [[], [], [], []],
  labels: ['Hips forward', 'Hips to the left', 'Hips back', 'Hips to the right'],
  alt: 'Standing with hands on hips, feet hip-width apart, drawing a slow circle with the hips: right, forward, left and back.',
}

const steps = [
  'Stand with feet hip-width apart, knees soft, hands on your hips.',
  'Draw a slow, wide circle with your hips, keeping your shoulders still.',
  'Do all reps in one direction, then the other.',
]

export const hipCircles: Exercise = {
  id: 'hip-circles',
  name: 'Hip circles',
  technique: 'mobility',
  worksAreas: ['hips', 'lowerBack', 'core'],
  loadsAreas: ['hips'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 1,
  standard: {
    dose: {
      kind: 'reps',
      reps: 8,
      range: [6, 10],
      sets: 1,
      perSide: false,
      repsNote: 'each direction',
    },
    steps,
    cues: ['Big, slow circles', 'Shoulders stay quiet', 'Switch direction halfway'],
    breathing: 'Breathe slowly and naturally; don’t hold your breath.',
    figure,
    secondsPerRep: 4,
  },
  easier: {
    dose: {
      kind: 'reps',
      reps: 6,
      range: [5, 8],
      sets: 1,
      perSide: false,
      repsNote: 'each direction',
    },
    steps: [
      ...steps.slice(0, 1),
      'Hold a chair or wall with one hand for balance.',
      ...steps.slice(1),
    ],
    cues: ['Smaller circles', 'Hold a chair for balance', 'Switch direction halfway'],
    breathing: 'Breathe slowly and naturally.',
    figure,
    secondsPerRep: 4,
  },
  harder: {
    dose: {
      kind: 'reps',
      reps: 10,
      range: [8, 12],
      sets: 2,
      perSide: false,
      repsNote: 'each direction',
    },
    steps: [
      ...steps.slice(0, 1),
      'Bend your knees a little more and make the circle as wide as you can.',
      ...steps.slice(2),
    ],
    cues: [
      'Wider circles, deeper knees',
      'Slow at the back of the circle',
      'Switch direction halfway',
    ],
    breathing: 'Breathe slowly and naturally.',
    figure,
    secondsPerRep: 5,
  },
}
