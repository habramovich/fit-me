import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Yoga cool-down, side view, lying on the back. Knees bent and together, then let both knees
// lower to one side while the shoulders stay down.
const knees: Pose = {
  head: [40, 138],
  sh: [64, 137],
  hip: [122, 137],
  N: limbs([90, 145], [116, 147], [150, 100], [176, 116], [188, 112]),
  F: limbs([88, 143], [114, 145], [146, 100], [172, 116], [184, 112]),
}
const twisted: Pose = {
  head: [40, 138],
  sh: [64, 137],
  hip: [122, 136],
  N: limbs([90, 145], [116, 147], [146, 126], [168, 140], [178, 136]),
  F: limbs([88, 143], [114, 145], [144, 122], [166, 136], [176, 132]),
}
const figure: FigureSpec = {
  view: 'side',
  keyframes: [knees, twisted],
  arrows: [[{ p: [164, 94], q: [160, 122], bend: -12 }]],
  labels: ['Let both knees lower to one side', 'Bring the knees back to the middle'],
  alt: 'Lying on the back with knees bent and together, seen from the side; both knees lower slowly to one side and return.',
}

const steps = [
  'Lie on your back, knees bent and together, feet lifted or on the floor.',
  'Spread your arms out wide on the floor.',
  'Let both knees lower to the right while your shoulders stay down; turn your head left if comfortable.',
  'Hold and breathe, then bring the knees back and switch sides.',
]

export const supineTwist: Exercise = {
  id: 'supine-twist',
  name: 'Supine twist',
  technique: 'yoga',
  worksAreas: ['lowerBack', 'hips', 'upperBack', 'chest'],
  loadsAreas: ['lowerBack'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['cooldown'],
  position: 'lying',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 4,
  standard: {
    dose: { kind: 'time', seconds: 30, range: [20, 60], perSide: true },
    steps,
    cues: ['Knees together', 'Shoulders stay down', 'Let gravity do it'],
    breathing: 'Long breaths; let each breath out take you a little deeper.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps: [
      steps[0],
      'Lower the knees only partway, or onto a cushion.',
      'Breathe, then switch sides.',
    ],
    cues: ['Cushion under the knees', 'Small range', 'Relax'],
    breathing: 'Long, slow breaths.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 60, range: [45, 90], perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Straighten the top leg and hold the foot, if comfortable. Switch sides.',
    ],
    cues: ['Top leg long', 'Shoulders down', 'Breathe'],
    breathing: 'Long breaths into the side ribs.',
    figure,
  },
}
