import { limbs } from '../build'
import type { Exercise, FigureSpec, Point, Pose } from '../types'

// Side view (facing left), standing, fingertips on the shoulders. The elbows draw a circle
// forward, up, back and down, which is easiest to see from the side.
const SH: Point = [100, 50]
const HAND: Point = [94, 48]
function elbows(el: Point): Pose {
  return {
    head: [97, 27],
    sh: SH,
    hip: [102, 100],
    N: limbs(el, HAND, [100, 126], [100, 150], [88, 151]),
    F: limbs([el[0] + 4, el[1] - 2], [HAND[0] + 4, HAND[1] - 1], [105, 126], [105, 150], [93, 151]),
  }
}

// Elbow positions around the shoulder, and the arrow path just outside them.
const down: Point = [98, 80]
const forward: Point = [70, 60]
// Up and slightly forward, so the forearm clears the head.
const up: Point = [74, 24]
const back: Point = [128, 48]
const path: Point[] = [
  [96, 94],
  [56, 60],
  [66, 8],
  [142, 44],
]
const arrow = (i: number) => [{ p: path[i], q: path[(i + 1) % 4], bend: -14 }]

const figure: FigureSpec = {
  view: 'side',
  keyframes: [elbows(down), elbows(forward), elbows(up), elbows(back)],
  arrows: [arrow(0), arrow(1), arrow(2), arrow(3)],
  labels: ['Elbows forward', 'Elbows up', 'Elbows back', 'Elbows down'],
  breath: ['in', 'in', 'out', 'out'],
  alt: 'Standing, seen from the side, fingertips on the shoulders; the elbows draw a big circle forward, up, back and down. Breathe in as they rise, out as they come down.',
}

const steps = [
  'Stand tall with fingertips resting on your shoulders.',
  'Draw big circles with your elbows: forward, up, back and down.',
  'Do all reps forward, then the same number backward.',
  'Keep the circles pain-free; make them smaller if anything pinches.',
]

export const shoulderRotations: Exercise = {
  id: 'shoulder-rotations',
  name: 'Shoulder rotations',
  technique: 'mobility',
  worksAreas: ['shoulders', 'upperBack', 'neck'],
  loadsAreas: ['shoulders'],
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
      reps: 10,
      range: [8, 15],
      sets: 1,
      perSide: false,
      repsNote: 'forward, then backward',
    },
    steps,
    cues: ['Big, slow elbow circles', 'Shoulders away from ears', 'Then reverse direction'],
    breathing: 'Breathe in as the elbows rise, out as they come down.',
    figure,
    secondsPerRep: 4,
  },
  easier: {
    dose: {
      kind: 'reps',
      reps: 8,
      range: [6, 10],
      sets: 1,
      perSide: false,
      repsNote: 'forward, then backward',
    },
    steps: [steps[0], 'Make small circles, staying well below shoulder height.', steps[2]],
    cues: ['Small circles', 'Stay below shoulder height', 'Pain-free range only'],
    breathing: 'Breathe in as the elbows rise, out as they come down.',
    figure,
    secondsPerRep: 3,
  },
  harder: {
    dose: {
      kind: 'reps',
      reps: 12,
      range: [10, 15],
      sets: 2,
      perSide: false,
      repsNote: 'forward, then backward',
    },
    steps: [
      steps[0],
      'Make the biggest circles you comfortably can, slowly, squeezing your shoulder blades at the back.',
      steps[2],
    ],
    cues: [
      'As big as is comfortable',
      'Squeeze shoulder blades at the back',
      'Slow and controlled',
    ],
    breathing: 'Breathe in as the elbows rise, out as they come down.',
    figure,
    secondsPerRep: 5,
  },
}
