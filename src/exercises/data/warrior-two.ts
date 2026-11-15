import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Yoga, front view, wide stance. Bend the right knee over the ankle as the arms reach out to the
// sides at shoulder height. N = the figure's right (viewer's left).
const wide: Pose = {
  head: [125, 26],
  sh: [125, 48],
  hip: [125, 96],
  N: limbs([106, 72], [104, 96], [104, 124], [86, 150], [74, 151]),
  F: limbs([144, 72], [146, 96], [148, 124], [168, 150], [176, 151]),
}
const warrior: Pose = {
  head: [121, 34],
  sh: [121, 56],
  hip: [121, 106],
  N: limbs([96, 58], [66, 56], [88, 118], [86, 150], [74, 151]),
  F: limbs([146, 58], [176, 56], [146, 128], [168, 150], [176, 151]),
}
const figure: FigureSpec = {
  view: 'front',
  keyframes: [wide, warrior],
  arrows: [
    [
      { p: [100, 104], q: [62, 60], bend: -10 },
      { p: [150, 104], q: [180, 60], bend: 10 },
    ],
    [
      { p: [62, 60], q: [100, 104], bend: 10 },
      { p: [180, 60], q: [150, 104], bend: -10 },
    ],
  ],
  labels: ['Bend the front knee, arms reach out', 'Straighten and lower the arms'],
  breath: ['out', 'in'],
  alt: 'Standing in a wide stance seen from the front; breathing out, the front knee bends over the ankle and the arms reach out to the sides at shoulder height; breathing in, return.',
}

const steps = [
  'Stand with feet wide, right toes turned out, left toes slightly in.',
  'Breathe out and bend the right knee over the right ankle.',
  'Reach the arms out at shoulder height and look over the right hand.',
  'Hold, keeping the knee over the ankle, then switch sides.',
]

export const warriorTwo: Exercise = {
  id: 'warrior-two',
  name: 'Warrior II',
  technique: 'yoga',
  worksAreas: ['hips', 'quads', 'shoulders', 'glutes'],
  loadsAreas: ['knees'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'moderate',
  tags: ['balance', 'boneLoading'],
  batch: 4,
  standard: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps,
    cues: ['Knee over ankle', 'Arms long at shoulder height', 'Shoulders soft'],
    breathing: 'Breathe out as you bend into the pose; slow breaths while you hold.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: true },
    steps: [
      steps[0],
      'Bend the front knee only a little.',
      'Hands on hips if the arms tire. Switch sides.',
    ],
    cues: ['Small bend', 'Hands on hips is fine', 'Tall spine'],
    breathing: 'Slow breaths while you hold.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Sink until the front thigh is nearly level with the floor. Switch sides.',
    ],
    cues: ['Deeper bend', 'Back leg strong', 'Steady gaze'],
    breathing: 'Slow breaths while you hold.',
    figure,
  },
}
