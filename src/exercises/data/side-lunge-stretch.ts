import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Front view, feet wide, hands on the hips. The right knee (N, the viewer's left) bends and the
// hips shift toward it while the left leg stays long, stretching the inner thigh.
const wide: Pose = {
  head: [125, 30],
  sh: [125, 52],
  hip: [125, 98],
  N: limbs([100, 74], [114, 96], [104, 124], [90, 150], [80, 151]),
  F: limbs([150, 74], [136, 96], [146, 124], [160, 150], [170, 151]),
}
const shifted: Pose = {
  head: [108, 38],
  sh: [110, 60],
  hip: [110, 106],
  N: limbs([86, 82], [100, 104], [88, 126], [90, 150], [80, 151]),
  F: limbs([134, 82], [120, 104], [136, 128], [160, 150], [170, 151]),
}

const figure: FigureSpec = {
  view: 'front',
  keyframes: [wide, shifted],
  arrows: [[{ p: [134, 86], q: [104, 92], bend: -6 }]],
  labels: ['Bend one knee and shift the hips toward it', 'Back to the middle'],
  alt: 'Standing with the feet wide, seen from the front, hands on the hips; one knee bends and the hips shift toward it while the other leg stays long, then back to the middle.',
}

const steps = [
  'Stand with your feet wide apart, toes turned slightly out, hands on your hips.',
  'Bend your right knee and shift your hips toward the right; keep the left leg straight.',
  'Keep your chest up and the right knee in line with the toes.',
  'Hold, then come back to the middle and repeat on the other side.',
]
const breathing = 'Slow breaths; sink a little deeper on each breath out.'

export const sideLungeStretch: Exercise = {
  id: 'side-lunge-stretch',
  name: 'Standing side lunge stretch',
  technique: 'stretching',
  worksAreas: ['hips', 'quads', 'hamstrings'],
  loadsAreas: ['knees'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: true },
    steps,
    cues: ['Knee over the toes', 'Other leg long', 'Chest up'],
    breathing,
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 15, range: [10, 20], perSide: true },
    steps: [
      'Stand with your feet a little wider than your hips; hold the back of a chair if you like.',
      'Bend your right knee a little and shift your hips only slightly to the right.',
      'Hold, then repeat on the other side.',
    ],
    cues: ['Narrower stance', 'Small bend', 'Hold a chair if you like'],
    breathing,
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps: [
      'Stand with your feet wide apart, toes turned slightly out.',
      'Bend your right knee more deeply and sit your hips back and to the right, as if sitting on a low stool.',
      'Rest your hands on the bent thigh; chest up, knee in line with the toes.',
      'Hold, then come back to the middle and repeat on the other side.',
    ],
    cues: ['Sit the hips back', 'Knee over the toes', 'Chest up'],
    breathing,
    figure,
  },
}
