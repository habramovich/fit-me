import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Yoga shoulder opener, side view facing left. From hands and knees, walk the hands forward and
// let the chest melt toward the mat, hips staying over the knees.
const allFours: Pose = {
  head: [52, 80],
  sh: [76, 90],
  hip: [150, 90],
  N: limbs([76, 120], [76, 148], [150, 148], [194, 150], [204, 150]),
  F: limbs([82, 120], [82, 148], [144, 148], [188, 150], [198, 150]),
}
const puppy: Pose = {
  head: [72, 134],
  sh: [92, 130],
  hip: [148, 104],
  ctrl: [118, 126],
  N: limbs([66, 140], [36, 146], [150, 148], [194, 150], [204, 150]),
  F: limbs([70, 138], [40, 144], [144, 148], [188, 150], [198, 150]),
}
const figure: FigureSpec = {
  view: 'side',
  keyframes: [allFours, puppy],
  arrows: [[{ p: [110, 82], q: [104, 118], bend: 0 }]],
  labels: ['Walk the hands forward, chest melts down', 'Come back to all fours'],
  alt: 'From hands and knees, seen from the side, the hands walk forward and the chest sinks toward the mat while the hips stay above the knees, stretching the shoulders.',
}

const steps = [
  'Start on hands and knees.',
  'Walk your hands forward, keeping your hips above your knees.',
  'Let your chest melt toward the mat; rest your forehead down.',
  'Keep the arms active and breathe into the upper back, then walk back.',
]

export const puppyPose: Exercise = {
  id: 'puppy-pose',
  name: 'Puppy pose',
  technique: 'yoga',
  worksAreas: ['shoulders', 'upperBack', 'chest'],
  loadsAreas: ['shoulders', 'knees'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['warmup', 'cooldown'],
  position: 'kneeling',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 4,
  standard: {
    dose: { kind: 'time', seconds: 30, range: [20, 60], perSide: false },
    steps,
    cues: ['Hips over knees', 'Chest melts down', 'Arms active'],
    breathing: 'Slow breaths into the upper back; soften on each breath out.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps: [
      steps[0],
      'Walk the hands only a little forward, or rest the chest on a pillow.',
      'Breathe and relax.',
    ],
    cues: ['Small walk forward', 'Pillow under the chest', 'Relax'],
    breathing: 'Slow breaths.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 60, range: [45, 90], perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Rest the elbows on a low block and bring the palms together behind your head.',
    ],
    cues: ['Elbows on a block', 'Palms together', 'Chest down'],
    breathing: 'Long breaths into the upper back.',
    figure,
  },
}
