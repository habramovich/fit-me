import { FRONT_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Low-impact cardio and core, front view. Hands by the head; one knee lifts across as the
// opposite elbow comes down to meet it; then the other side. N = the figure's right.
const ready = withPose(FRONT_STANDING, {
  N: limbs([94, 40], [112, 28], [118, 122], [116, 150], [106, 151]),
  F: limbs([156, 40], [138, 28], [132, 122], [134, 150], [144, 151]),
})
const leftKnee = withPose(FRONT_STANDING, {
  head: [118, 32],
  sh: [121, 54],
  ctrl: [124, 76],
  N: limbs([120, 84], [110, 58], [118, 122], [116, 150], [106, 151]),
  F: limbs([152, 46], [136, 34], [124, 96], [138, 122], [130, 128]),
})
const rightKnee = withPose(FRONT_STANDING, {
  head: [132, 32],
  sh: [129, 54],
  ctrl: [126, 76],
  N: limbs([98, 46], [114, 34], [126, 96], [112, 122], [120, 128]),
  F: limbs([130, 84], [140, 58], [132, 122], [134, 150], [144, 151]),
})

const figure: FigureSpec = {
  view: 'front',
  keyframes: [ready, leftKnee, ready, rightKnee],
  arrows: [
    [{ p: [150, 126], q: [124, 98], bend: -8 }],
    [{ p: [124, 98], q: [148, 126], bend: 8 }],
    [{ p: [100, 126], q: [126, 98], bend: 8 }],
    [{ p: [126, 98], q: [102, 126], bend: -8 }],
  ],
  labels: [
    'Left knee up to the right elbow',
    'Back to standing',
    'Right knee up to the left elbow',
    'Back to standing',
  ],
  breath: ['out', 'in', 'out', 'in'],
  alt: 'Standing with hands by the head, seen from the front; one knee lifts across the body as the opposite elbow comes down to meet it, then the other side.',
}

const steps = [
  'Stand tall with your hands lightly by your head, elbows wide.',
  'Lift your left knee across your body as your right elbow comes down to meet it.',
  'Return to standing, then lift the right knee to the left elbow.',
  'Keep alternating at a steady pace.',
]

export const crossBodyKneeLifts: Exercise = {
  id: 'cross-body-knee-lifts',
  name: 'Cross-body knee lifts',
  technique: 'cardio',
  worksAreas: ['heart', 'core', 'hips'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'moderate',
  tags: ['balance'],
  batch: 3,
  standard: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps,
    cues: ['Knee across to elbow', 'Tall between reps', 'Steady pace'],
    breathing: 'Breathe out as knee and elbow meet, in as you stand tall.',
    figure,
    lowImpact: true,
  },
  easier: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps: [
      'Hold a chair with one hand.',
      'Lift the opposite knee and touch it with your free hand.',
      'Switch hands and sides halfway.',
    ],
    cues: ['Hold a chair', 'Hand to knee', 'Small lifts'],
    breathing: 'Breathe out as you lift.',
    figure,
    lowImpact: true,
  },
  harder: {
    dose: { kind: 'time', seconds: 60, range: [45, 90], perSide: false },
    steps: [...steps.slice(0, 3), 'Go faster with a small hop between sides.'],
    cues: ['Faster', 'Small hop', 'Elbows wide'],
    breathing: 'Breathe out each time knee and elbow meet.',
    figure,
    lowImpact: false,
  },
}
