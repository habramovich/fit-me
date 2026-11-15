import { SIDE_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Low-impact cardio, side view facing left. Heels flick up behind toward the seat in turn, arms
// swinging.
const nearHeel = withPose(SIDE_STANDING, {
  N: limbs([92, 70], [80, 86], [104, 128], [128, 112], [138, 116]),
  F: limbs([112, 72], [120, 92], [105, 126], [105, 150], [93, 151]),
})
const farHeel = withPose(SIDE_STANDING, {
  N: limbs([112, 74], [120, 94], [100, 126], [100, 150], [88, 151]),
  F: limbs([94, 68], [82, 84], [108, 128], [132, 112], [142, 116]),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [nearHeel, farHeel],
  arrows: [[{ p: [146, 106], q: [120, 148], bend: -10 }]],
  labels: ['Change legs: heel flicks up behind', 'And again'],
  alt: 'Seen from the side, stepping on the spot while each heel flicks up behind toward the seat in turn, arms swinging.',
}

const steps = [
  'Stand tall, feet hip-width apart.',
  'Step on the spot, flicking each heel up behind you toward your seat.',
  'Swing the arms naturally.',
  'Stay light and keep a pace where you can still talk.',
]

export const heelFlicks: Exercise = {
  id: 'heel-flicks',
  name: 'Heel flicks',
  technique: 'cardio',
  worksAreas: ['heart', 'hamstrings', 'quads', 'calves'],
  loadsAreas: ['knees'],
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
    cues: ['Heels toward the seat', 'Arms swing', 'Light feet'],
    breathing: 'Breathe steadily; you should still be able to talk in short sentences.',
    figure,
    lowImpact: true,
  },
  easier: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps: [
      'Hold the back of a chair.',
      'Bend one knee to lift the heel behind, then the other, slowly.',
    ],
    cues: ['Hold a chair', 'Slow heel lifts', 'Easy pace'],
    breathing: 'Breathe easily.',
    figure,
    lowImpact: true,
  },
  harder: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps: [
      'Jog on the spot, kicking the heels up behind.',
      'Pump the arms.',
      'Slow to a step if you get out of breath.',
    ],
    cues: ['Jog', 'Heels up', 'Pump the arms'],
    breathing: 'Breathe rhythmically; a little out of breath is fine.',
    figure,
    lowImpact: false,
  },
}
