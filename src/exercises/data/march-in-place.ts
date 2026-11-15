import { SIDE_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Low-impact cardio, side view facing left. Knees lift in turn with opposite arms swinging.
const nearUp = withPose(SIDE_STANDING, {
  N: limbs([112, 74], [120, 94], [84, 104], [90, 132], [78, 136]),
  F: limbs([92, 70], [80, 86], [105, 126], [105, 150], [93, 151]),
})
const farUp = withPose(SIDE_STANDING, {
  N: limbs([92, 70], [80, 86], [100, 126], [100, 150], [88, 151]),
  F: limbs([114, 72], [122, 92], [88, 104], [94, 132], [82, 136]),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [nearUp, farUp],
  arrows: [[{ p: [72, 100], q: [76, 136], bend: 8 }]],
  labels: ['Change legs, swing the arms', 'And again'],
  alt: 'Marching on the spot seen from the side, knees lifting in turn to hip height with the opposite arm swinging forward.',
}

const steps = [
  'Stand tall, feet hip-width apart.',
  'March on the spot, lifting each knee toward hip height.',
  'Swing the opposite arm forward with each knee.',
  'Land softly; keep a pace where you can still talk.',
]

export const marchInPlace: Exercise = {
  id: 'march-in-place',
  name: 'March in place',
  technique: 'cardio',
  worksAreas: ['heart', 'quads', 'hips', 'core'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'moderate',
  tags: [],
  batch: 3,
  standard: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps,
    cues: ['Knees toward hip height', 'Opposite arm swings', 'Land softly'],
    breathing: 'Breathe steadily; you should still be able to talk in short sentences.',
    figure,
    lowImpact: true,
  },
  easier: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps: [
      'Hold the back of a chair.',
      'March slowly with small knee lifts.',
      'Keep breathing easily.',
    ],
    cues: ['Hold a chair', 'Small lifts', 'Easy pace'],
    breathing: 'Breathe easily; this should feel comfortable.',
    figure,
    lowImpact: true,
  },
  harder: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps: [
      'Jog on the spot, driving the knees up high.',
      'Pump the arms and stay light on the balls of your feet.',
      'Slow to a march if you get out of breath.',
    ],
    cues: ['High knees', 'Light feet', 'Pump the arms'],
    breathing: 'Breathe rhythmically; it’s fine to be a little out of breath.',
    figure,
    lowImpact: false,
  },
}
