import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Tai chi, front view, wide stance, knees soft. One hand passes at face height while the other
// passes at belly height; the weight shifts with the hands. N = the figure's right.
const legs = {
  N: {
    kn: [108, 124] as [number, number],
    an: [100, 150] as [number, number],
    to: [90, 151] as [number, number],
  },
  F: {
    kn: [142, 124] as [number, number],
    an: [150, 150] as [number, number],
    to: [160, 151] as [number, number],
  },
}
function pose(shiftX: number, rightHigh: boolean): Pose {
  const hi = (side: 'N' | 'F') =>
    side === 'N'
      ? { el: [100 + shiftX, 58] as [number, number], wr: [110 + shiftX, 36] as [number, number] }
      : { el: [150 + shiftX, 58] as [number, number], wr: [140 + shiftX, 36] as [number, number] }
  const lo = (side: 'N' | 'F') =>
    side === 'N'
      ? { el: [102 + shiftX, 84] as [number, number], wr: [116 + shiftX, 96] as [number, number] }
      : { el: [148 + shiftX, 84] as [number, number], wr: [134 + shiftX, 96] as [number, number] }
  const n = rightHigh ? hi('N') : lo('N')
  const f = rightHigh ? lo('F') : hi('F')
  return {
    head: [125 + shiftX * 0.6, 30],
    sh: [125 + shiftX * 0.6, 52],
    hip: [125 + shiftX, 98],
    N: limbs(n.el, n.wr, [legs.N.kn[0] + shiftX * 0.5, legs.N.kn[1]], legs.N.an, legs.N.to),
    F: limbs(f.el, f.wr, [legs.F.kn[0] + shiftX * 0.5, legs.F.kn[1]], legs.F.an, legs.F.to),
  }
}

const figure: FigureSpec = {
  view: 'front',
  keyframes: [pose(-6, true), pose(6, false)],
  arrows: [
    [
      { p: [104, 30], q: [112, 92], bend: 14 },
      { p: [140, 100], q: [146, 32], bend: 14 },
    ],
  ],
  labels: [
    'Upper hand sinks, lower hand rises; shift to the left',
    'Shift to the right, hands change',
  ],
  alt: 'Standing in a wide stance with soft knees, seen from the front; one hand passes in front of the face while the other passes in front of the belly, and the hands change places as the weight shifts from side to side.',
}

const steps = [
  'Stand with feet wider than your hips, knees soft.',
  'One hand at face height, palm in; the other at belly height, palm down.',
  'Shift your weight to one side as the upper hand sinks and the lower hand rises.',
  'Let the waist turn the arms; keep the movement continuous and slow.',
]

export const waveHandsLikeClouds: Exercise = {
  id: 'wave-hands-like-clouds',
  name: 'Wave hands like clouds',
  technique: 'taichi',
  worksAreas: ['shoulders', 'hips', 'core', 'upperBack'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['balance'],
  batch: 2,
  standard: {
    dose: { kind: 'time', seconds: 60, range: [45, 120], perSide: false },
    steps,
    cues: ['Weight shifts with the hands', 'Waist turns the arms', 'Continuous, like clouds'],
    breathing: 'Slow, easy breaths; roughly one breath to each side.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps: [
      steps[0],
      'Keep the stance narrower and move only the arms, with a small weight shift.',
      steps[3],
    ],
    cues: ['Narrower stance', 'Small shifts', 'Relaxed shoulders'],
    breathing: 'Slow, easy breaths.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 120, range: [90, 180], perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Add a side step with each shift, moving sideways across the room and back.',
    ],
    cues: ['Side step with each shift', 'Knees stay soft', 'Eyes follow the upper hand'],
    breathing: 'Slow, easy breaths; one breath to each side.',
    figure,
  },
}
