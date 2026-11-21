import { FRONT_SEAT, FRONT_SEATED, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Front view, sitting on a chair, arms crossed with the hands on the shoulders. The upper body
// turns to the right (the viewer's left): the crossed elbows swing round while the knees still
// face forward. N = the figure's right.
const legs = FRONT_SEATED
const crossed = withPose(FRONT_SEATED, {
  N: limbs([118, 88], [136, 66], legs.N.kn, legs.N.an, legs.N.to),
  F: limbs([132, 92], [114, 68], legs.F.kn, legs.F.an, legs.F.to),
})
const turned = withPose(FRONT_SEATED, {
  head: [121, 40],
  sh: [122, 62],
  N: limbs([100, 82], [120, 64], legs.N.kn, legs.N.an, legs.N.to),
  F: limbs([114, 90], [98, 70], legs.F.kn, legs.F.an, legs.F.to),
})

const figure: FigureSpec = {
  view: 'front',
  props: { seat: FRONT_SEAT },
  keyframes: [crossed, turned],
  arrows: [[{ p: [150, 100], q: [96, 100], bend: 10 }]],
  labels: ['Turn your upper body to the side', 'Back to the middle'],
  alt: 'Sitting tall on a chair, seen from the front, arms crossed with the hands on the shoulders; the upper body turns slowly to one side while the knees face forward, then returns.',
}

const steps = [
  'Sit tall near the front of a chair, feet flat and hip-width apart.',
  'Cross your arms and rest your hands gently on your shoulders.',
  'Breathe in to grow tall; breathe out and slowly turn your upper body to the right.',
  'Hold, then come back to the middle and repeat to the left.',
]
const breathing = 'Breathe in to grow tall, out as you turn; slow breaths in the hold.'

export const seatedSpinalTwist: Exercise = {
  id: 'seated-spinal-twist',
  name: 'Seated spinal twist',
  technique: 'mobility',
  worksAreas: ['upperBack', 'lowerBack', 'core'],
  loadsAreas: ['lowerBack'],
  equipment: ['chair'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'seated',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'time', seconds: 15, range: [10, 30], perSide: true },
    steps,
    cues: ['Tall first, then turn', 'Knees face forward', 'Turn from the ribs, not the neck'],
    breathing,
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 10, range: [10, 20], perSide: true },
    steps: [
      steps[0],
      steps[1],
      'Turn only a little to the right, keeping it easy on the back.',
      'Come back to the middle and repeat to the left.',
    ],
    cues: ['Small turn', 'Knees face forward', 'Easy on the back'],
    breathing,
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Let your head follow and look over your right shoulder. Grow taller on each breath in, turn a little more on each breath out.',
      'Come back to the middle and repeat to the left.',
    ],
    cues: ['Look over the shoulder', 'Taller on the breath in', 'Knees face forward'],
    breathing,
    figure,
  },
}
