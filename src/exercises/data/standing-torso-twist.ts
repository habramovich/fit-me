import { FRONT_STANDING, limbs, withPose } from '../build'
import type { Arrow, Exercise, FigureSpec, Limbs, Pose } from '../types'

// Warm-up for the spine, front view. Feet apart, arms out at shoulder height; turn the upper body
// to one side, letting the back heel lift and the knee turn in, back through the centre, then the
// other side. N = the figure's right (viewer's left). Turning to the figure's left, the right arm
// sweeps across the chest and the left arm reaches back (shorter, as it goes away from us).
const legN: Pick<Limbs, 'kn' | 'an' | 'to'> = { kn: [112, 122], an: [108, 150], to: [98, 151] }
const legF: Pick<Limbs, 'kn' | 'an' | 'to'> = { kn: [138, 122], an: [142, 150], to: [152, 151] }

const centre: Pose = withPose(FRONT_STANDING, {
  N: limbs([82, 52], [54, 52], legN.kn, legN.an, legN.to),
  F: limbs([168, 52], [196, 52], legF.kn, legF.an, legF.to),
})
// Turned to the figure's left (viewer's right); the right heel lifts.
const turnLeft: Pose = withPose(FRONT_STANDING, {
  head: [127, 26],
  sh: [128, 48],
  hip: [127, 94],
  N: limbs([128, 60], [156, 57], [119, 121], [113, 146], [106, 152]),
  F: limbs([166, 50], [190, 54], legF.kn, legF.an, legF.to),
})
// Turned to the figure's right (viewer's left); the left heel lifts.
const turnRight: Pose = withPose(FRONT_STANDING, {
  head: [123, 26],
  sh: [122, 48],
  hip: [123, 94],
  N: limbs([84, 50], [60, 54], legN.kn, legN.an, legN.to),
  F: limbs([122, 60], [94, 57], [131, 121], [137, 146], [144, 152]),
})

const toLeft: Arrow[] = [{ p: [56, 62], q: [150, 66], bend: -16 }]
const fromLeft: Arrow[] = [{ p: [150, 66], q: [64, 62], bend: 16 }]
const toRight: Arrow[] = [{ p: [194, 62], q: [100, 66], bend: 16 }]
const fromRight: Arrow[] = [{ p: [100, 66], q: [186, 62], bend: -16 }]

const figure: FigureSpec = {
  view: 'front',
  keyframes: [centre, turnLeft, centre, turnRight],
  arrows: [toLeft, fromLeft, toRight, fromRight],
  labels: [
    'Turn to the left, right heel lifts',
    'Swing back through the centre',
    'Turn to the right, left heel lifts',
    'Swing back through the centre',
  ],
  alt: 'Standing with feet apart and arms out at shoulder height, seen from the front; the upper body turns to one side, one arm sweeping across the chest as the back heel lifts, swings back through the centre, then turns to the other side.',
}

// Easier: a smaller turn with both feet flat.
const smallLeft: Pose = withPose(centre, {
  sh: [127, 48],
  N: limbs([100, 56], [74, 58], legN.kn, legN.an, legN.to),
  F: limbs([170, 51], [196, 54], legF.kn, legF.an, legF.to),
})
const smallRight: Pose = withPose(centre, {
  sh: [123, 48],
  N: limbs([80, 51], [54, 54], legN.kn, legN.an, legN.to),
  F: limbs([150, 56], [176, 58], legF.kn, legF.an, legF.to),
})
const gentle: FigureSpec = {
  view: 'front',
  keyframes: [centre, smallLeft, centre, smallRight],
  arrows: [
    [{ p: [56, 62], q: [90, 66], bend: -8 }],
    [{ p: [80, 68], q: [58, 62], bend: 8 }],
    [{ p: [194, 62], q: [160, 66], bend: 8 }],
    [{ p: [170, 68], q: [192, 62], bend: -8 }],
  ],
  labels: [
    'A small turn to the left, feet flat',
    'Back to the centre',
    'A small turn to the right',
    'Back to the centre',
  ],
  alt: 'Standing with feet apart and arms out at shoulder height, seen from the front; the upper body turns a little to one side and back, then to the other side, feet staying flat.',
}

const steps = [
  'Stand with your feet a little wider than your hips, knees soft, arms out at shoulder height.',
  'Turn your chest and arms to the left, letting the right heel lift and the knee turn in.',
  'Swing back through the centre and turn to the right, letting the left heel lift.',
  'Keep turning side to side in an easy rhythm, hips following a little.',
]

export const standingTorsoTwist: Exercise = {
  id: 'standing-torso-twist',
  name: 'Standing torso twist',
  technique: 'mobility',
  worksAreas: ['core', 'upperBack', 'shoulders'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 7,
  // A steady swinging rhythm; Brisk is kept for cardio.
  pace: 'flowing',
  standard: {
    dose: { kind: 'time', seconds: 40, range: [30, 60], perSide: false },
    steps,
    cues: ['Turn from the waist', 'Let the back heel lift', 'Arms soft, shoulders down'],
    breathing: 'Breathe easily and keep a steady rhythm.',
    figure,
    secondsPerRep: 4,
  },
  easier: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps: [
      steps[0],
      'Turn your chest and arms a little to the left, feet staying flat.',
      'Come back to the centre and turn a little to the right.',
    ],
    cues: ['Small turns', 'Feet flat', 'Easy rhythm'],
    breathing: 'Breathe easily and keep the movement smooth.',
    figure: gentle,
    secondsPerRep: 4,
  },
}
