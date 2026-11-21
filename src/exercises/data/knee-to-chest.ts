import { SIDE_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Lying on the back, knees bent, feet flat; the near knee is drawn toward the chest with both
// hands below the knee while the other foot stays down.
const down: Pose = {
  head: [40, 138],
  sh: [64, 137],
  hip: [122, 137],
  N: limbs([90, 145], [116, 147], [152, 102], [168, 146], [186, 148]),
  F: limbs([88, 143], [114, 145], [148, 102], [162, 146], [180, 148]),
}
const hugOne = withPose(down, {
  N: limbs([86, 114], [112, 102], [110, 98], [146, 108], [158, 100]),
  F: limbs([84, 112], [110, 100], [148, 102], [162, 146], [180, 148]),
})
const hugBoth = withPose(down, {
  N: limbs([86, 114], [112, 102], [110, 98], [146, 108], [158, 100]),
  F: limbs([84, 112], [110, 100], [106, 98], [142, 106], [154, 98]),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [down, hugOne],
  arrows: [[{ p: [156, 94], q: [114, 88], bend: -8 }]],
  labels: ['Draw one knee toward your chest', 'Lower the foot'],
  nose: 'up',
  alt: 'Lying on the back with knees bent and feet flat, seen from the side; the hands draw one knee gently toward the chest while the other foot stays on the floor.',
}
const harderFigure: FigureSpec = {
  view: 'side',
  keyframes: [down, hugBoth],
  arrows: [[{ p: [156, 94], q: [114, 88], bend: -8 }]],
  labels: ['Draw both knees toward your chest', 'Lower the feet'],
  nose: 'up',
  alt: 'Lying on the back with knees bent, seen from the side; the hands draw both knees gently toward the chest.',
}

// Standing, one hand on a wall, the near knee lifted and held below the knee.
const WALL = 56
const stand = withPose(SIDE_STANDING, {
  F: limbs([80, 64], [60, 70], [105, 126], [105, 150], [93, 151]),
})
const lift = withPose(SIDE_STANDING, {
  N: limbs([88, 72], [74, 86], [74, 84], [80, 108], [68, 110]),
  F: limbs([80, 64], [60, 70], [105, 126], [105, 150], [93, 151]),
})
const standingFigure: FigureSpec = {
  view: 'side',
  props: { wall: WALL },
  keyframes: [stand, lift],
  arrows: [[{ p: [90, 126], q: [74, 82], bend: 8 }]],
  labels: ['Lift one knee toward your chest', 'Lower the foot'],
  alt: 'Standing side-on to a wall with one hand on it; the other hand draws one knee up toward the chest and holds it there.',
}

const steps = [
  'Lie on your back, knees bent, feet flat.',
  'Bring your right knee toward your chest and hold it gently with both hands, below the knee or behind the thigh.',
  'Keep your head and shoulders relaxed on the floor.',
  'Hold, then lower the foot and change legs.',
]
const breathing = 'Slow breaths; let the knee come a little closer on each breath out.'

export const kneeToChest: Exercise = {
  id: 'knee-to-chest',
  name: 'Knee to chest',
  technique: 'yoga',
  worksAreas: ['lowerBack', 'hips', 'glutes'],
  loadsAreas: [],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['warmup', 'cooldown'],
  position: 'lying',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: true },
    steps,
    cues: ['Hold below the knee', 'Head and shoulders down', 'Draw in gently'],
    breathing,
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 15, range: [10, 20], perSide: true },
    steps: [
      'Stand tall beside a wall or sturdy chair and hold it with one hand.',
      'Lift your right knee toward your chest and hold it with your right hand, below the knee.',
      'Stand tall on the other leg, knee soft.',
      'Hold, then lower the foot and switch legs.',
    ],
    cues: ['Hold the support', 'Stand tall', 'Only as high as is easy'],
    breathing: 'Slow, steady breaths.',
    figure: standingFigure,
    position: 'standing',
    equipment: ['wall'],
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps: [
      steps[0],
      'Bring both knees toward your chest and hold them with your hands or forearms.',
      'Keep your head down. Rock gently from side to side if it feels good.',
      'Hold, then lower one foot at a time.',
    ],
    cues: ['Both knees in', 'Head down', 'Rock gently if you like'],
    breathing: 'Slow breaths into the lower back.',
    figure: harderFigure,
  },
}
