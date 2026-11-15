import { FRONT_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Front view. From standing, one foot rests on the inner calf or thigh, knee open to the side,
// hands meeting overhead. N = the figure's right (standing leg).
const standing = FRONT_STANDING
const tree = withPose(FRONT_STANDING, {
  N: limbs([108, 24], [124, 6], [120, 122], [120, 150], [110, 151]),
  F: limbs([142, 24], [126, 6], [162, 126], [124, 124], [120, 132]),
})
const lowTree = withPose(FRONT_STANDING, {
  N: limbs([106, 72], [104, 96], [120, 122], [120, 150], [110, 151]),
  F: limbs([144, 72], [146, 96], [150, 132], [124, 146], [128, 152]),
})

const figure: FigureSpec = {
  view: 'front',
  keyframes: [standing, tree],
  arrows: [
    [
      { p: [140, 142], q: [166, 120], bend: -8 },
      { p: [98, 92], q: [110, 14], bend: 12 },
    ],
  ],
  labels: ['Foot to the inner leg, hands overhead', 'Back to standing'],
  alt: 'Standing, seen from the front; one foot rests on the inner leg with the knee opening to the side and the hands meet overhead, then return.',
}

const easierFigure: FigureSpec = {
  view: 'front',
  keyframes: [standing, lowTree],
  arrows: [[{ p: [140, 142], q: [154, 130], bend: -6 }]],
  labels: ['Heel to the ankle, toes on the floor', 'Back to standing'],
  alt: 'Standing, seen from the front; one heel rests against the other ankle with the toes on the floor and the knee opening to the side.',
}

const steps = [
  'Stand tall, weight on your right foot; fix your gaze on one point.',
  'Place your left foot on the inner calf or thigh, never on the knee.',
  'Bring your palms together at your chest, or raise them overhead.',
  'Hold, then switch sides.',
]

export const treePose: Exercise = {
  id: 'tree-pose',
  name: 'Tree pose',
  technique: 'yoga',
  worksAreas: ['hips', 'ankles', 'core'],
  loadsAreas: ['ankles'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['balance'],
  batch: 2,
  standard: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps,
    cues: ['Foot off the knee', 'Eyes on one point', 'Grow tall'],
    breathing: 'Steady, slow breaths; a wobble is part of it.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: true },
    steps: [
      'Stand next to a wall or chair and rest one hand on it.',
      'Rest your left heel against your right ankle, toes on the floor, knee open.',
      'Hold, then switch sides.',
    ],
    cues: ['Hand on a wall', 'Toes stay down', 'Knee opens'],
    breathing: 'Steady, slow breaths.',
    figure: easierFigure,
  },
  harder: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Try a slow blink or a soft gaze upward. Hold, then switch sides.',
    ],
    cues: ['Arms overhead', 'Soft gaze up', 'Breathe'],
    breathing: 'Steady, slow breaths.',
    figure,
  },
}
