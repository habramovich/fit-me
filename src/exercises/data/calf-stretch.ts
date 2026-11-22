import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Side view facing a wall on the left, both hands on it at shoulder height. The far leg steps
// back with the knee straight and the heel down; the front knee bends and the body leans in.
const WALL = 40
const together: Pose = {
  head: [86, 28],
  sh: [92, 50],
  hip: [100, 99],
  N: limbs([66, 54], [42, 54], [98, 125], [98, 150], [86, 151]),
  F: limbs([68, 53], [44, 53], [103, 125], [103, 150], [91, 151]),
}
const stepped: Pose = {
  head: [76, 34],
  sh: [88, 54],
  hip: [112, 98],
  N: limbs([65, 56], [42, 56], [92, 122], [92, 150], [80, 151]),
  F: limbs([67, 55], [44, 55], [126, 124], [140, 150], [128, 151]),
}
const figure: FigureSpec = {
  view: 'side',
  props: { wall: WALL },
  keyframes: [together, stepped],
  arrows: [[{ p: [112, 138], q: [140, 140], bend: -6 }]],
  labels: ['Step one leg back, heel down, and lean in', 'Step the feet together'],
  alt: 'Standing facing a wall, seen from the side, both hands on it; one leg steps back with the knee straight and the heel pressed down while the front knee bends and the body leans in.',
}
const steps = [
  'Stand facing a wall and place both hands on it at shoulder height.',
  'Step your left leg back and bend the front knee; keep the back leg straight.',
  'Press the back heel into the floor until you feel the calf; toes point forward.',
  'Hold, then switch legs.',
]
const breathing = 'Slow breaths; lean in a little on each breath out.'

export const calfStretch: Exercise = {
  id: 'calf-stretch',
  name: 'Calf stretch',
  technique: 'stretching',
  worksAreas: ['calves', 'ankles'],
  loadsAreas: [],
  equipment: ['wall'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: true },
    steps,
    cues: ['Back heel down', 'Back knee straight', 'Toes forward'],
    breathing,
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 15, range: [10, 20], perSide: true },
    steps: [
      steps[0],
      'Take a short step back with your left leg; keep it straight.',
      'Press the back heel down gently; lean in only a little.',
      'Hold, then switch legs.',
    ],
    cues: ['Short step', 'Heel down', 'Lean in a little'],
    breathing,
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Halfway through, bend the back knee a little, heel still down, to stretch the lower calf.',
      'Switch legs.',
    ],
    cues: ['Longer step', 'Then bend the back knee', 'Heel stays down'],
    breathing,
    figure,
  },
}
