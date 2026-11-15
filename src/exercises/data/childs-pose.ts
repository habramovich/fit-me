import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Side view, facing left. Kneeling, sitting back on the heels, then folding forward with the
// arms reaching along the mat.
const upright: Pose = {
  head: [130, 54],
  sh: [134, 78],
  hip: [138, 128],
  N: limbs([132, 104], [114, 122], [100, 148], [140, 150], [152, 150]),
  F: limbs([136, 104], [118, 122], [104, 147], [144, 150], [156, 150]),
}
const folded: Pose = {
  head: [70, 138],
  sh: [92, 134],
  hip: [138, 126],
  ctrl: [116, 104],
  N: limbs([64, 144], [36, 148], [100, 148], [140, 150], [152, 150]),
  F: limbs([66, 142], [38, 146], [104, 147], [144, 150], [156, 150]),
}

const figure: FigureSpec = {
  view: 'side',
  keyframes: [upright, folded],
  arrows: [[{ p: [148, 70], q: [90, 116], bend: 16 }]],
  labels: ['Fold forward, arms reaching along the mat', 'Rise slowly'],
  alt: 'Kneeling and sitting back on the heels, seen from the side; the body folds forward with the forehead toward the mat and the arms reaching forward, then rises slowly.',
}

const steps = [
  'Kneel with big toes together and knees apart; sit back toward your heels.',
  'Fold forward and rest your forehead on the mat or a cushion.',
  'Reach your arms forward, or rest them alongside your body.',
  'Breathe into your back; let each breath out soften you further.',
]

export const childsPose: Exercise = {
  id: 'childs-pose',
  name: 'Child’s pose',
  technique: 'yoga',
  worksAreas: ['lowerBack', 'hips', 'shoulders'],
  loadsAreas: ['knees'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['cooldown'],
  position: 'kneeling',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 2,
  standard: {
    dose: { kind: 'time', seconds: 60, range: [30, 90], perSide: false },
    steps,
    cues: ['Hips toward heels', 'Forehead down', 'Breathe into your back'],
    breathing: 'Slow breaths into the back; let each breath out soften you further.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps: [
      'Kneel with knees wide and a cushion between your heels and hips.',
      'Fold forward onto a pillow or folded blanket.',
      'Rest and breathe slowly.',
    ],
    cues: ['Cushion under the hips', 'Pillow under the chest', 'Rest'],
    breathing: 'Slow breaths into the back.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 90, range: [60, 120], perSide: false },
    steps: [
      ...steps.slice(0, 2),
      'Walk your hands to one side, hold, then to the other.',
      steps[3],
    ],
    cues: ['Walk hands to one side', 'Then the other', 'Long breaths out'],
    breathing: 'Slow breaths; longer breaths out.',
    figure,
  },
}
