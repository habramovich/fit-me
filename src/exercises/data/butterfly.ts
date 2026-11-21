import { limbs, mirrorArrow } from '../build'
import type { Arrow, Exercise, FigureSpec, Pose } from '../types'

// Front view, sitting on the floor with the soles of the feet together and the hands holding the
// feet; the knees fall gently outward. N = the figure's right (the viewer's left).
const kneesUp: Pose = {
  head: [125, 70],
  sh: [125, 92],
  hip: [125, 138],
  N: limbs([104, 118], [118, 144], [102, 112], [118, 146], [122, 150]),
  F: limbs([146, 118], [132, 144], [148, 112], [132, 146], [128, 150]),
}
const kneesOpen: Pose = {
  ...kneesUp,
  N: limbs([104, 118], [118, 144], [88, 132], [118, 146], [122, 150]),
  F: limbs([146, 118], [132, 144], [162, 132], [132, 146], [128, 150]),
}

const knee: Arrow = { p: [96, 104], q: [78, 124], bend: 6 }
const figure: FigureSpec = {
  view: 'front',
  keyframes: [kneesUp, kneesOpen],
  arrows: [[knee, mirrorArrow(knee)]],
  labels: ['Let the knees fall gently outward', 'Bring the knees up'],
  alt: 'Sitting on the floor, seen from the front, soles of the feet together and hands holding the feet; the knees fall gently outward.',
}

const steps = [
  'Sit on the floor with the soles of your feet together, knees bent.',
  'Hold your feet or ankles and let your knees fall gently outward.',
  'Sit tall with your back comfortably upright.',
  'Hold, breathing slowly.',
]

export const butterfly: Exercise = {
  id: 'butterfly',
  name: 'Butterfly stretch',
  technique: 'yoga',
  worksAreas: ['hips', 'lowerBack'],
  loadsAreas: ['knees'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['cooldown'],
  position: 'seated',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps,
    cues: ['Soles together', 'Let the knees fall', 'Sit tall'],
    breathing: 'Slow breaths; let the knees soften down on each breath out.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: false },
    steps: [
      'Sit on a folded blanket or cushion with the soles of your feet together, feet well away from you.',
      'Rest your hands on your shins or behind you on the floor. Put cushions under your knees if they feel strained.',
      'Sit tall and hold, breathing slowly.',
    ],
    cues: ['Sit on a cushion', 'Feet further away', 'Support the knees'],
    breathing: 'Slow, easy breaths.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps: [
      steps[0],
      'Draw your heels a little closer and hold your feet.',
      'Sit tall, then lean forward from your hips with a long back.',
      'Hold, breathing slowly; sit up slowly.',
    ],
    cues: ['Heels closer', 'Lean from the hips', 'Back long'],
    breathing: 'Slow breaths; ease forward a little on each breath out.',
    figure,
  },
}
