import { FRONT_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Low-impact cardio, front view. Step to one side and tap the other foot in, arms swinging
// across with the step; then back the other way. N = the figure's right (viewer's left).
const toRight = withPose(FRONT_STANDING, {
  head: [113, 26],
  sh: [113, 48],
  hip: [113, 94],
  N: limbs([94, 66], [76, 58], [104, 122], [96, 150], [86, 151]),
  F: limbs([132, 66], [112, 60], [120, 122], [116, 146], [112, 150]),
})
const toLeft = withPose(FRONT_STANDING, {
  head: [137, 26],
  sh: [137, 48],
  hip: [137, 94],
  N: limbs([118, 66], [138, 60], [130, 122], [134, 146], [138, 150]),
  F: limbs([156, 66], [174, 58], [146, 122], [154, 150], [164, 151]),
})

const figure: FigureSpec = {
  view: 'front',
  keyframes: [toRight, toLeft],
  arrows: [
    [
      { p: [100, 160], q: [150, 160], bend: 0 },
      { p: [80, 52], q: [168, 52], bend: -16 },
    ],
  ],
  labels: ['Step to the other side, arms swing across', 'And back'],
  alt: 'Seen from the front: a step to one side with the other foot tapping in and both arms swinging across, then the same to the other side.',
}

const steps = [
  'Stand with feet hip-width apart, knees soft.',
  'Step to the right and tap the left foot in beside it, swinging both arms to the right.',
  'Step to the left and tap the right foot in, swinging the arms left.',
  'Find a steady rhythm; music helps.',
]

export const stepTouch: Exercise = {
  id: 'step-touch',
  name: 'Step-touch with arm swing',
  technique: 'cardio',
  worksAreas: ['heart', 'hips', 'shoulders', 'calves'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'moderate',
  tags: ['balance'],
  batch: 3,
  standard: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps,
    cues: ['Step and tap', 'Arms swing across', 'Steady rhythm'],
    breathing: 'Breathe steadily with the rhythm.',
    figure,
    lowImpact: true,
  },
  easier: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps: [
      steps[0],
      'Make small side steps with the arms relaxed by your sides.',
      'Keep it gentle.',
    ],
    cues: ['Small steps', 'Arms relaxed', 'Gentle pace'],
    breathing: 'Breathe easily.',
    figure,
    lowImpact: true,
  },
  harder: {
    dose: { kind: 'time', seconds: 60, range: [45, 90], perSide: false },
    steps: [
      steps[0],
      'Take two wide steps each way (step-together-step) with bigger arm swings.',
      'Bend the knees a little deeper on each step.',
    ],
    cues: ['Two steps each way', 'Bigger arm swings', 'Deeper knees'],
    breathing: 'Breathe rhythmically.',
    figure,
    lowImpact: true,
  },
}
