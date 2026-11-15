import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Strength, side view facing left, back against a wall. Slide down until the knees are bent and
// hold, then slide back up.
const WALL = 156
const standing: Pose = {
  head: [140, 26],
  sh: [142, 50],
  hip: [142, 98],
  N: limbs([128, 64], [112, 58], [124, 124], [112, 150], [100, 151]),
  F: limbs([130, 62], [114, 56], [126, 124], [116, 150], [104, 151]),
}
const sitting: Pose = {
  head: [140, 56],
  sh: [142, 80],
  hip: [142, 126],
  N: limbs([128, 94], [112, 88], [104, 120], [104, 150], [92, 151]),
  F: limbs([130, 92], [114, 86], [106, 118], [108, 150], [96, 151]),
}
const figure: FigureSpec = {
  view: 'side',
  props: { wall: WALL },
  keyframes: [standing, sitting],
  arrows: [[{ p: [166, 92], q: [166, 120], bend: 0 }]],
  labels: ['Slide down the wall and hold', 'Slide back up'],
  alt: 'Standing with the back against a wall and arms crossed, seen from the side; sliding down until the knees are bent, holding, then sliding back up.',
}

const steps = [
  'Stand with your back against a wall, feet about a foot in front of you, hip-width apart.',
  'Slide down until your knees are bent, as far as is comfortable (no lower than 90°).',
  'Keep your knees over your ankles and your back flat on the wall.',
  'Hold, breathing steadily, then slide back up.',
]

export const wallSit: Exercise = {
  id: 'wall-sit',
  name: 'Wall sit',
  technique: 'strength',
  worksAreas: ['quads', 'glutes', 'core'],
  loadsAreas: ['knees'],
  equipment: ['wall'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'moderate',
  tags: ['boneLoading'],
  batch: 4,
  standard: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps,
    cues: ['Knees over ankles', 'Back flat on the wall', 'Breathe; don’t hold your breath'],
    breathing: 'Breathe steadily throughout; never hold your breath in the hold.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: false },
    steps: [
      steps[0],
      'Slide down only a little, keeping the knees only slightly bent.',
      'Hold, then slide up.',
    ],
    cues: ['Shallow bend', 'Back on the wall', 'Steady breath'],
    breathing: 'Breathe steadily.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps: [...steps.slice(0, 3), 'Hold lower and longer, or lift one heel and switch halfway.'],
    cues: ['Lower and longer', 'Heel lifts', 'Breathe'],
    breathing: 'Breathe steadily throughout.',
    figure,
  },
}
