import { SIDE_CHAIR, SIDE_SEATED, SIDE_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Side view facing left. Arms wrapped round the body, hands on the opposite shoulders; the upper
// back rounds and the chin drops a little, widening the space between the shoulder blades.
const hug: Pose = withPose(SIDE_STANDING, {
  N: limbs([76, 66], [98, 54], SIDE_STANDING.N.kn, SIDE_STANDING.N.an, SIDE_STANDING.N.to),
  F: limbs([80, 64], [101, 52], SIDE_STANDING.F.kn, SIDE_STANDING.F.an, SIDE_STANDING.F.to),
})
const rounded: Pose = withPose(hug, {
  head: [91, 38],
  sh: [104, 54],
  ctrl: [114, 76],
  N: limbs([80, 72], [102, 58], SIDE_STANDING.N.kn, SIDE_STANDING.N.an, SIDE_STANDING.N.to),
  F: limbs([84, 70], [105, 56], SIDE_STANDING.F.kn, SIDE_STANDING.F.an, SIDE_STANDING.F.to),
})

const labels = ['Round the upper back, chin drops a little', 'Sit or stand tall again']
const figure: FigureSpec = {
  view: 'side',
  keyframes: [hug, rounded],
  arrows: [[{ p: [120, 44], q: [128, 70], bend: -8 }]],
  labels,
  alt: 'Standing, seen from the side, arms wrapped round the body with the hands on the opposite shoulders; the upper back rounds and the chin drops a little.',
}

const S = SIDE_SEATED
const seatedHug: Pose = withPose(S, {
  N: limbs([90, 68], [112, 56], S.N.kn, S.N.an, S.N.to),
  F: limbs([94, 66], [115, 54], S.F.kn, S.F.an, S.F.to),
})
const seatedRounded: Pose = withPose(S, {
  head: [104, 40],
  sh: [118, 56],
  ctrl: [130, 80],
  N: limbs([94, 74], [116, 60], S.N.kn, S.N.an, S.N.to),
  F: limbs([98, 72], [119, 58], S.F.kn, S.F.an, S.F.to),
})
const seatedFigure: FigureSpec = {
  view: 'side',
  props: { chair: SIDE_CHAIR },
  keyframes: [seatedHug, seatedRounded],
  arrows: [[{ p: [132, 46], q: [138, 70], bend: -8 }]],
  labels,
  alt: 'Sitting on a chair, seen from the side, arms wrapped round the body; the upper back rounds and the chin drops a little.',
}

const steps = [
  'Stand or sit tall.',
  'Wrap your arms around yourself and hold the opposite shoulders.',
  'Breathe out and gently round your upper back, letting your chin drop a little.',
  'Breathe into the space between your shoulder blades. Hold, then slowly come back up tall.',
]
const breathing = 'Breathe into your back, between the shoulder blades.'

export const upperBackHug: Exercise = {
  id: 'upper-back-hug',
  name: 'Upper-back hug stretch',
  technique: 'stretching',
  worksAreas: ['upperBack', 'shoulders'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: false },
    steps,
    cues: ['Hug yourself', 'Round the upper back', 'Breathe into the back'],
    breathing,
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 15, range: [10, 20], perSide: false },
    steps: [
      'Sit tall on a chair, feet flat.',
      'Wrap your arms around yourself as far as is comfortable; hands can rest on the upper arms.',
      'Round your upper back gently and breathe into it. Hold, then sit tall.',
    ],
    cues: ['Seated', 'Hands where they reach', 'Gentle rounding'],
    breathing,
    figure: seatedFigure,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Breathe into your back, then halfway through swap which arm is on top. Come back up tall slowly.',
    ],
    cues: ['Round the upper back', 'Swap arms halfway', 'Breathe into the back'],
    breathing,
    figure,
  },
}
