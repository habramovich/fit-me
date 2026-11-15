import { SIDE_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Tai chi balance, side view facing left. From standing, one knee rises to hip height as the
// same-side hand rises palm-up in front of the face and the other hand presses down by the hip.
const standing = withPose(SIDE_STANDING, {
  hip: [102, 102],
  N: limbs([100, 78], [96, 100], [98, 127], [100, 150], [88, 151]),
  F: limbs([104, 77], [100, 99], [104, 127], [105, 150], [93, 151]),
})
const rooster = withPose(SIDE_STANDING, {
  N: limbs([88, 60], [84, 38], [82, 100], [88, 128], [78, 132]),
  F: limbs([108, 78], [112, 98], [104, 126], [104, 150], [92, 151]),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [standing, rooster],
  arrows: [
    [
      { p: [100, 120], q: [78, 96], bend: -8 },
      { p: [94, 96], q: [80, 32], bend: 10 },
    ],
  ],
  labels: ['Knee and hand rise together', 'Lower slowly'],
  breath: ['in', 'out'],
  alt: 'Standing seen from the side; breathing in, one knee rises to hip height as the same-side hand rises in front of the face and the other presses down by the hip; breathing out, both lower.',
}

const easierFigure: FigureSpec = {
  view: 'side',
  props: { wall: 56 },
  keyframes: [
    withPose(standing, {
      F: limbs([84, 66], [60, 70], [104, 127], [105, 150], [93, 151]),
    }),
    withPose(rooster, {
      N: limbs([94, 76], [96, 98], [88, 112], [92, 138], [82, 142]),
      F: limbs([84, 66], [60, 70], [104, 126], [104, 150], [92, 151]),
    }),
  ],
  arrows: [[{ p: [100, 124], q: [84, 110], bend: -6 }]],
  labels: ['Lift the knee a little, hand on the wall', 'Lower slowly'],
  breath: ['in', 'out'],
  alt: 'Standing side-on to a wall with one hand on it; breathing in, one knee lifts a little; breathing out, it lowers.',
}

const steps = [
  'Stand tall, knees soft, weight on your left foot.',
  'Breathe in as your right knee rises toward hip height and your right hand rises palm-up in front of your face.',
  'Your left hand presses gently down beside your left hip.',
  'Hold steady, then lower as you breathe out. Switch sides halfway.',
]

export const goldenRooster: Exercise = {
  id: 'golden-rooster',
  name: 'Golden rooster stands on one leg',
  technique: 'taichi',
  worksAreas: ['hips', 'ankles', 'core', 'quads'],
  loadsAreas: ['ankles'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['balance'],
  batch: 3,
  standard: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: true },
    steps,
    cues: ['Knee and hand rise together', 'Eyes on one point', 'Standing knee soft'],
    breathing: 'Breathe in as you rise, slowly in the hold, out as you lower.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 15, range: [10, 20], perSide: true },
    steps: [
      'Stand beside a wall with one hand on it.',
      'Lift the outside knee just a little and hold.',
      'Lower and switch sides halfway.',
    ],
    cues: ['Hand on the wall', 'Small lift', 'Breathe'],
    breathing: 'Breathe in as you lift, out as you lower.',
    figure: easierFigure,
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps: [...steps.slice(0, 3), 'Hold longer with a soft gaze, then switch sides.'],
    cues: ['Longer hold', 'Soft gaze', 'Tall through the crown'],
    breathing: 'Breathe in as you rise, slowly in the hold, out as you lower.',
    figure,
  },
}
