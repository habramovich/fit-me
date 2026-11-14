import { limbs } from '../build'
import type { Exercise, FigureSpec, Point, Pose } from '../types'

// Front view, standing, fingertips on shoulders; the elbows draw circles.
// N is the figure's right (viewer's left). Wrists stay at the shoulders.
const legsN = { kn: [118, 122] as Point, an: [116, 150] as Point, to: [106, 151] as Point }
const legsF = { kn: [132, 122] as Point, an: [134, 150] as Point, to: [144, 151] as Point }
function elbows(n: Point, f: Point): Pose {
  return {
    head: [125, 26],
    sh: [125, 48],
    hip: [125, 94],
    N: limbs(n, [113, 52], legsN.kn, legsN.an, legsN.to),
    F: limbs(f, [137, 52], legsF.kn, legsF.an, legsF.to),
  }
}

// Mirror x around the centre line for the left elbow's arrows.
const m = (p: Point): Point => [250 - p[0], p[1]]
const path: Point[] = [
  [96, 90],
  [110, 78],
  [94, 22],
  [80, 58],
]
const arrowsFor = (i: number) => {
  const p = path[i]
  const q = path[(i + 1) % path.length]
  return [
    { p, q, bend: -10 },
    { p: m(p), q: m(q), bend: 10 },
  ]
}

const figure: FigureSpec = {
  view: 'front',
  keyframes: [
    elbows([104, 80], [146, 80]),
    elbows([111, 66], [139, 66]),
    elbows([100, 30], [150, 30]),
    elbows([90, 56], [160, 56]),
  ],
  arrows: [arrowsFor(0), arrowsFor(1), arrowsFor(2), arrowsFor(3)],
  labels: ['Elbows together in front', 'Elbows up', 'Elbows back and open', 'Elbows down'],
  alt: 'Standing with fingertips on the shoulders, the elbows draw big circles: together in front, up, back and open, and down.',
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
    figure: { ...figure, breath: ['in', 'in', 'out', 'out'] },
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
    breathing: 'Breathe slowly and naturally.',
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
    figure: { ...figure, breath: ['in', 'in', 'out', 'out'] },
    secondsPerRep: 5,
  },
}
