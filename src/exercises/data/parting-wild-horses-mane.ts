import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Tai chi, side view facing left. Gather: weight back, hands holding an imaginary ball. Part:
// step into a bow stance as the front hand rises forward to eye level and the back hand presses
// down beside the hip.
const gather: Pose = {
  head: [110, 30],
  sh: [112, 53],
  hip: [116, 103],
  N: limbs([104, 80], [96, 96], [96, 126], [86, 150], [76, 146]),
  F: limbs([100, 68], [94, 62], [124, 128], [126, 150], [116, 151]),
}
const part: Pose = {
  head: [98, 28],
  sh: [101, 51],
  hip: [104, 101],
  N: limbs([82, 58], [60, 46], [84, 122], [80, 150], [68, 151]),
  F: limbs([116, 78], [124, 96], [122, 126], [140, 150], [148, 151]),
}

const figure: FigureSpec = {
  view: 'side',
  keyframes: [gather, part],
  arrows: [
    [
      { p: [96, 100], q: [56, 40], bend: 12 },
      { p: [128, 92], q: [108, 92], bend: 0 },
    ],
  ],
  labels: ['Step and part: front hand rises, back hand presses down', 'Gather back, hold the ball'],
  breath: ['out', 'in'],
  alt: 'Tai chi seen from the side: from holding an imaginary ball with the weight back, the body steps into a bow stance as the front hand rises forward to eye level and the back hand presses down beside the hip.',
}

const steps = [
  'Stand with knees soft, weight on the back foot, hands as if holding a ball in front of you.',
  'Step forward with the heel and shift into a bow stance: front knee bent, back leg long.',
  'As you shift, the front hand rises forward to eye level and the back hand presses down by your hip.',
  'Gather back and repeat, stepping with the other foot each time.',
]

export const partingWildHorsesMane: Exercise = {
  id: 'parting-wild-horses-mane',
  name: 'Parting the wild horse’s mane',
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
    cues: ['Heel first, then shift', 'Front hand to eye level', 'Back hand presses down'],
    breathing: 'Breathe in as you gather, out as you step and part the hands.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps: [steps[0], 'Take small steps and keep the stance high.', steps[2], steps[3]],
    cues: ['Small steps', 'High stance', 'Smooth hands'],
    breathing: 'Breathe in as you gather, out as you part the hands.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 120, range: [90, 180], perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Sink lower into the stance and move continuously across the room and back.',
    ],
    cues: ['Lower stance', 'Continuous movement', 'Eyes over the front hand'],
    breathing: 'Breathe in as you gather, out as you part the hands.',
    figure,
  },
}
