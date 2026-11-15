import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Tai chi, side view facing left, stepping backward. One hand is forward; as the front foot steps
// back, the other hand circles up past the ear and pushes forward while the first draws back to
// the hip.
const reach: Pose = {
  head: [108, 30],
  sh: [110, 53],
  hip: [112, 103],
  N: limbs([82, 62], [60, 62], [92, 126], [84, 150], [72, 150]),
  F: limbs([126, 62], [138, 50], [120, 128], [122, 150], [112, 151]),
}
const stepBack: Pose = {
  head: [110, 30],
  sh: [113, 53],
  hip: [116, 103],
  N: limbs([112, 82], [120, 98], [122, 126], [134, 150], [126, 151]),
  F: limbs([90, 58], [64, 58], [100, 126], [94, 150], [82, 151]),
}

const figure: FigureSpec = {
  view: 'side',
  keyframes: [reach, stepBack],
  arrows: [
    [
      { p: [140, 44], q: [60, 50], bend: -14 },
      { p: [58, 70], q: [120, 104], bend: 10 },
    ],
  ],
  labels: ['Step back: one hand pushes forward, the other draws to the hip', 'Change hands'],
  breath: ['out', 'in'],
  alt: 'Tai chi seen from the side, stepping backward: as one foot steps back, the rear hand circles up past the ear and pushes forward while the front hand draws back to the hip.',
}

const steps = [
  'Stand with one foot slightly forward, its hand reaching forward palm down.',
  'Let the other hand circle back and up beside your ear.',
  'Step the front foot back as that hand pushes forward and the front hand draws back to the hip.',
  'Repeat, stepping back on alternate sides. Keep the steps small and the body upright.',
]

export const repulseMonkey: Exercise = {
  id: 'repulse-monkey',
  name: 'Repulse monkey',
  technique: 'taichi',
  worksAreas: ['shoulders', 'upperBack', 'hips', 'core'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['balance'],
  batch: 3,
  standard: {
    dose: { kind: 'time', seconds: 60, range: [45, 120], perSide: false },
    steps,
    cues: ['Small steps back', 'Push past the ear', 'Draw to the hip'],
    breathing: 'Breathe in as the hand circles up, out as it pushes forward.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps: [
      'Stand still with feet hip-width apart.',
      'Alternate the arms only: one pushes forward past the ear as the other draws back to the hip.',
    ],
    cues: ['No stepping', 'Arms only', 'Slow and even'],
    breathing: 'Breathe in as the hand circles up, out as it pushes.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 120, range: [90, 180], perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Move continuously backward across the room, turning the waist with each push.',
    ],
    cues: ['Continuous', 'Turn the waist', 'Eyes on the front hand'],
    breathing: 'Breathe in as the hand circles up, out as it pushes.',
    figure,
  },
}
