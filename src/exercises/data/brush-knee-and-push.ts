import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Tai chi, side view facing left. Gather with one hand by the ear; step into a bow stance as that
// hand pushes forward and the other brushes past the front knee to rest beside the hip.
const gather: Pose = {
  head: [110, 30],
  sh: [112, 53],
  hip: [116, 103],
  N: limbs([118, 62], [110, 44], [96, 126], [86, 150], [76, 146]),
  F: limbs([100, 74], [96, 62], [124, 128], [126, 150], [116, 151]),
}
const push: Pose = {
  head: [98, 28],
  sh: [101, 51],
  hip: [104, 101],
  N: limbs([80, 62], [58, 60], [84, 122], [80, 150], [68, 151]),
  F: limbs([112, 84], [104, 106], [122, 126], [140, 150], [148, 151]),
}

const figure: FigureSpec = {
  view: 'side',
  keyframes: [gather, push],
  arrows: [
    [
      { p: [112, 36], q: [52, 54], bend: -10 },
      { p: [88, 66], q: [98, 114], bend: 8 },
    ],
  ],
  labels: ['Step, brush past the knee and push', 'Gather back, hand by the ear'],
  breath: ['out', 'in'],
  alt: 'Tai chi seen from the side: with one hand by the ear and the weight back, the body steps into a bow stance as that hand pushes forward and the other sweeps down past the front knee to the hip.',
}

const steps = [
  'Stand with knees soft, weight back; one hand by your ear, the other in front of your chest.',
  'Step forward with the heel and shift into a bow stance.',
  'As you shift, push forward with the hand by your ear, and brush the other hand down past your front knee.',
  'Gather back and repeat on the other side.',
]

export const brushKneeAndPush: Exercise = {
  id: 'brush-knee-and-push',
  name: 'Brush knee and push',
  technique: 'taichi',
  worksAreas: ['hips', 'quads', 'shoulders', 'core'],
  loadsAreas: ['knees'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['balance'],
  batch: 3,
  standard: {
    dose: { kind: 'time', seconds: 60, range: [45, 120], perSide: false },
    steps,
    cues: ['Heel first, then shift', 'Push from the hips', 'Brush past the knee'],
    breathing: 'Breathe in as you gather, out as you step and push.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps: [
      'Stand with feet hip-width apart, no stepping.',
      'Shift your weight forward as you push and brush; shift back as you gather.',
    ],
    cues: ['No stepping', 'Shift the weight', 'Smooth hands'],
    breathing: 'Breathe in as you gather, out as you push.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 120, range: [90, 180], perSide: false },
    steps: [...steps.slice(0, 3), 'Move continuously, alternating sides as you travel forward.'],
    cues: ['Lower stance', 'Continuous', 'Relaxed shoulders'],
    breathing: 'Breathe in as you gather, out as you push.',
    figure,
  },
}
