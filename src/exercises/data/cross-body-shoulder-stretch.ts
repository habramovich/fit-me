import { FRONT_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Front view. The right arm (N, the viewer's left) comes across the chest at shoulder height;
// the left hand holds it above the elbow and draws it closer.
const legs = FRONT_STANDING
const across = withPose(FRONT_STANDING, {
  N: limbs([134, 60], [158, 62], legs.N.kn, legs.N.an, legs.N.to),
  F: limbs([152, 76], [132, 62], legs.F.kn, legs.F.an, legs.F.to),
})

const figure: FigureSpec = {
  view: 'front',
  keyframes: [FRONT_STANDING, across],
  arrows: [[{ p: [98, 100], q: [164, 54], bend: 14 }]],
  labels: ['Arm across the chest, other hand draws it in', 'Release'],
  alt: 'Standing, seen from the front; one arm comes across the chest at shoulder height and the other hand, above the elbow, draws it gently closer.',
}

const steps = [
  'Stand or sit tall, shoulders relaxed.',
  'Bring your right arm across your chest at shoulder height or a little lower.',
  'Hold it above the elbow with your left hand and draw it gently closer.',
  'Hold, then switch arms.',
]
const breathing = 'Slow breaths; ease the arm a little closer on each breath out.'

export const crossBodyShoulderStretch: Exercise = {
  id: 'cross-body-shoulder-stretch',
  name: 'Cross-body shoulder stretch',
  technique: 'mobility',
  worksAreas: ['shoulders', 'upperBack'],
  loadsAreas: ['shoulders'],
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
    cues: ['Hand above the elbow', 'Shoulder stays down', 'Gentle pull'],
    breathing,
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 15, range: [10, 20], perSide: true },
    steps: [
      steps[0],
      'Bring your right arm across your body, as low as is comfortable.',
      'Rest your left hand on it above the elbow, with no pulling.',
      'Hold, then switch arms.',
    ],
    cues: ['Arm low', 'Rest, no pulling', 'Shoulder down'],
    breathing,
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Turn your head gently away from the stretching arm. Hold, then switch arms.',
    ],
    cues: ['Draw the arm closer', 'Head turns away', 'Shoulder stays down'],
    breathing,
    figure,
  },
}
