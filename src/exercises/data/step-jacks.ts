import { FRONT_STANDING, limbs, withPose } from '../build'
import type { Arrow, Exercise, FigureSpec } from '../types'

// Low-impact jumping jacks, front view. Step one foot out as the arms rise, back in, then the
// other side. N = the figure's right (viewer's left).
const centre = FRONT_STANDING
const right = withPose(FRONT_STANDING, {
  hip: [121, 94],
  N: limbs([100, 26], [88, 8], [106, 122], [94, 150], [84, 151]),
  F: limbs([150, 26], [162, 8], [132, 122], [134, 150], [144, 151]),
})
const left = withPose(FRONT_STANDING, {
  hip: [129, 94],
  N: limbs([100, 26], [88, 8], [118, 122], [116, 150], [106, 151]),
  F: limbs([150, 26], [162, 8], [144, 122], [156, 150], [166, 151]),
})

const armsUp: Arrow[] = [
  { p: [100, 98], q: [84, 4], bend: -14 },
  { p: [150, 98], q: [166, 4], bend: 14 },
]
const down = (side: 'N' | 'F'): Arrow[] => [
  { p: [84, 4], q: [100, 98], bend: 14 },
  side === 'N'
    ? { p: [90, 154], q: [114, 154], bend: 0 }
    : { p: [160, 154], q: [136, 154], bend: 0 },
]

const figure: FigureSpec = {
  view: 'front',
  keyframes: [centre, right, centre, left],
  arrows: [armsUp, down('N'), armsUp, down('F')],
  labels: ['Step out, arms up', 'Step in, arms down', 'Other side: step out, arms up', 'Step in'],
  alt: 'Standing, seen from the front; one foot steps out to the side as both arms sweep overhead, then back in; then the other side.',
}

const jumpOut = withPose(FRONT_STANDING, {
  N: limbs([100, 26], [88, 8], [106, 122], [94, 150], [84, 151]),
  F: limbs([150, 26], [162, 8], [144, 122], [156, 150], [166, 151]),
})
const jumping: FigureSpec = {
  view: 'front',
  keyframes: [centre, jumpOut],
  arrows: [
    [
      { p: [100, 98], q: [84, 4], bend: -14 },
      { p: [150, 98], q: [166, 4], bend: 14 },
    ],
  ],
  labels: ['Jump the feet out, arms up', 'Jump in, arms down'],
  alt: 'Jumping jacks seen from the front: feet jump apart as the arms sweep overhead, then together as they lower.',
}

const steps = [
  'Stand tall, feet together, arms by your sides.',
  'Step your right foot out to the side as both arms sweep up overhead.',
  'Step back in as the arms come down.',
  'Repeat to the left, and keep alternating at a steady pace.',
]

export const stepJacks: Exercise = {
  id: 'step-jacks',
  name: 'Step jacks',
  technique: 'cardio',
  worksAreas: ['heart', 'shoulders', 'hips', 'calves'],
  loadsAreas: ['shoulders'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'moderate',
  tags: [],
  batch: 3,
  standard: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps,
    cues: ['Step out, arms up', 'Step in, arms down', 'Alternate sides'],
    breathing: 'Breathe steadily; in as the arms rise, out as they lower, if it helps.',
    figure,
    lowImpact: true,
  },
  easier: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps: [
      steps[0],
      'Step out to the side as your arms rise to shoulder height only.',
      'Step in and lower the arms. Alternate.',
    ],
    cues: ['Arms to shoulder height', 'Small steps', 'Easy pace'],
    breathing: 'Breathe easily.',
    figure,
    lowImpact: true,
  },
  harder: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps: [
      'Stand tall, feet together.',
      'Jump the feet apart as the arms sweep overhead.',
      'Jump them together as the arms lower. Land softly.',
    ],
    cues: ['Light, soft landings', 'Arms all the way up', 'Steady rhythm'],
    breathing: 'Breathe rhythmically; it’s fine to be a little out of breath.',
    figure: jumping,
    lowImpact: false,
  },
}
