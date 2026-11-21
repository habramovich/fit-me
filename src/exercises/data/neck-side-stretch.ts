import { FRONT_STANDING, limbs, seatedFigure, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Front view. The head tilts, ear toward the shoulder, while both shoulders stay down. The
// figure's right (N) is on the viewer's left.
const tall = FRONT_STANDING
const tilt = withPose(FRONT_STANDING, { head: [110, 31] })
// Harder: the right hand rests on the head, the left arm reaches toward the floor.
const tiltAssisted = withPose(FRONT_STANDING, {
  head: [110, 31],
  N: limbs([94, 32], [116, 18], [118, 122], [116, 150], [106, 151]),
  F: limbs([148, 72], [154, 96], [132, 122], [134, 150], [144, 151]),
})

const figure: FigureSpec = {
  view: 'front',
  keyframes: [tall, tilt],
  arrows: [[{ p: [136, 8], q: [104, 12], bend: -8 }]],
  labels: ['Tilt your ear toward your shoulder', 'Back to the middle'],
  alt: 'Standing, seen from the front; the head tilts slowly to one side, ear toward the shoulder, while both shoulders stay down, then returns to the middle.',
}

const seated = seatedFigure(
  figure,
  'Sitting tall on a chair, seen from the front; the head tilts slowly to one side, ear toward the shoulder, then returns to the middle.',
)

const harderFigure: FigureSpec = {
  view: 'front',
  keyframes: [tall, tiltAssisted],
  arrows: [
    [
      { p: [136, 8], q: [104, 12], bend: -8 },
      { p: [152, 100], q: [158, 112], bend: 0 },
    ],
  ],
  labels: ['Tilt, hand resting on the head, other arm long', 'Back to the middle'],
  alt: 'Standing, seen from the front; the head tilts to one side with that hand resting lightly on it, while the other arm reaches toward the floor.',
}

const steps = [
  'Sit or stand tall, shoulders relaxed.',
  'Slowly tilt your right ear toward your right shoulder. Keep both shoulders down.',
  'Hold, breathing slowly.',
  'Come back to the middle and repeat on the left.',
]
const breathing = 'Slow breaths; let the opposite shoulder sink a little on each breath out.'

export const neckSideStretch: Exercise = {
  id: 'neck-side-stretch',
  name: 'Neck side stretch',
  technique: 'stretching',
  worksAreas: ['neck', 'shoulders'],
  loadsAreas: ['neck'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: true },
    steps,
    cues: ['Ear toward shoulder', 'Shoulders stay down', 'Gentle, no bouncing'],
    breathing,
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 15, range: [10, 20], perSide: true },
    steps: [
      'Sit tall on a chair, feet flat, hands resting on your thighs.',
      'Tilt your right ear toward your right shoulder only as far as is comfortable.',
      'Hold, then come back to the middle and repeat on the left.',
    ],
    cues: ['Seated', 'Small tilt', 'Shoulders down'],
    breathing,
    figure: seated,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps: [
      steps[0],
      steps[1],
      'Rest your right hand lightly on your head (no pulling) and reach your left hand toward the floor.',
      'Hold, then come back to the middle and repeat on the left.',
    ],
    cues: ['Hand rests, never pulls', 'Other arm long', 'Shoulders down'],
    breathing,
    figure: harderFigure,
  },
}
