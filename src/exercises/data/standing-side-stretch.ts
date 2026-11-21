import { FRONT_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Front view. Both arms overhead, the right hand holding the left wrist; the body leans to the
// right (the viewer's left), stretching the left side. N = the figure's right.
const legs = FRONT_STANDING
const armsUp = withPose(FRONT_STANDING, {
  N: limbs([110, 24], [122, 4], legs.N.kn, legs.N.an, legs.N.to),
  F: limbs([140, 24], [128, 4], legs.F.kn, legs.F.an, legs.F.to),
})
const lean = withPose(FRONT_STANDING, {
  head: [103, 33],
  sh: [112, 53],
  hip: [126, 94],
  ctrl: [124, 74],
  N: limbs([86, 36], [86, 12], legs.N.kn, legs.N.an, legs.N.to),
  F: limbs([114, 28], [91, 12], legs.F.kn, legs.F.an, legs.F.to),
})
// Easier: the right hand on the hip, only the left arm reaches up and over.
const oneArmUp = withPose(FRONT_STANDING, {
  N: limbs([98, 74], [112, 92], legs.N.kn, legs.N.an, legs.N.to),
  F: limbs([146, 26], [140, 4], legs.F.kn, legs.F.an, legs.F.to),
})
const oneArmLean = withPose(FRONT_STANDING, {
  head: [108, 31],
  sh: [116, 51],
  hip: [126, 94],
  ctrl: [124, 72],
  N: limbs([96, 74], [112, 92], legs.N.kn, legs.N.an, legs.N.to),
  F: limbs([124, 30], [100, 14], legs.F.kn, legs.F.an, legs.F.to),
})

const figure: FigureSpec = {
  view: 'front',
  keyframes: [armsUp, lean],
  arrows: [[{ p: [136, 2], q: [84, 4], bend: -10 }]],
  labels: ['Lean to the side, reaching up and over', 'Back to upright'],
  alt: 'Standing, seen from the front, both arms overhead with one hand holding the other wrist; the body leans to the side, stretching the opposite side, then returns upright.',
}
const easierFigure: FigureSpec = {
  view: 'front',
  keyframes: [oneArmUp, oneArmLean],
  arrows: [[{ p: [146, 2], q: [98, 6], bend: -10 }]],
  labels: ['Lean to the side, reaching up and over', 'Back to upright'],
  alt: 'Standing, seen from the front, one hand on the hip and the other arm overhead; the body leans toward the hand on the hip, reaching up and over, then returns upright.',
}

const steps = [
  'Stand tall, feet hip-width apart, knees soft.',
  'Raise both arms overhead and hold your left wrist with your right hand.',
  'Breathe out and gently lean to the right, reaching up and over.',
  'Hold, breathing into your left side. Come back up and switch sides.',
]
const breathing = 'Breathe into the stretched side; ease a little further on each breath out.'

export const standingSideStretch: Exercise = {
  id: 'standing-side-stretch',
  name: 'Standing side stretch',
  technique: 'mobility',
  worksAreas: ['core', 'shoulders', 'lowerBack', 'upperBack'],
  loadsAreas: ['shoulders'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'time', seconds: 15, range: [10, 30], perSide: true },
    steps,
    cues: ['Reach up, then over', 'Lean sideways, not forward', 'Hips stay level'],
    breathing,
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 15, range: [10, 20], perSide: true },
    steps: [
      steps[0],
      'Rest your right hand on your hip and raise your left arm overhead.',
      'Breathe out and lean a little to the right, reaching up and over.',
      'Hold, then come back up and switch sides.',
    ],
    cues: ['Hand on hip', 'Small lean', 'Lean sideways, not forward'],
    breathing,
    figure: easierFigure,
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps: [
      'Stand tall with your feet together.',
      steps[1],
      'Breathe out and lean to the right; gently draw the left wrist up and over.',
      steps[3],
    ],
    cues: ['Feet together', 'Long through the side', 'Lean sideways, not forward'],
    breathing,
    figure,
  },
}
