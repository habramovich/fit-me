import { SIDE_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Desk break, side view facing left. Hands clasp behind the back; the chest lifts and the
// shoulder blades squeeze together as the arms reach back.
const relaxed = withPose(SIDE_STANDING, {
  N: limbs([108, 76], [112, 100], [100, 126], [100, 150], [88, 151]),
  F: limbs([112, 75], [116, 99], [105, 126], [105, 150], [93, 151]),
})
const opened = withPose(SIDE_STANDING, {
  head: [95, 25],
  sh: [100, 50],
  ctrl: [96, 74],
  N: limbs([118, 74], [130, 96], [100, 126], [100, 150], [88, 151]),
  F: limbs([122, 73], [134, 95], [105, 126], [105, 150], [93, 151]),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [relaxed, opened],
  arrows: [
    [
      { p: [118, 106], q: [140, 98], bend: -6 },
      { p: [84, 66], q: [80, 50], bend: 0 },
    ],
  ],
  labels: ['Arms reach back, chest lifts', 'Relax'],
  breath: ['in', 'out'],
  alt: 'Standing, seen from the side, hands clasped behind the back; breathing in, the arms reach back and the chest lifts; breathing out, relax.',
}

const steps = [
  'Stand tall and clasp your hands behind your back (or hold a strap).',
  'Breathe in: draw the shoulder blades together and reach the hands back; let the chest lift.',
  'Hold for a moment, chin level.',
  'Breathe out and relax.',
]

export const chestOpener: Exercise = {
  id: 'chest-opener',
  name: 'Chest opener',
  technique: 'mobility',
  worksAreas: ['chest', 'shoulders', 'upperBack'],
  loadsAreas: ['shoulders'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 2,
  standard: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps,
    cues: ['Shoulder blades together', 'Chest lifts, chin level', 'Relax between'],
    breathing: 'Breathe in as the chest opens, out as you relax.',
    figure,
    secondsPerRep: 6,
  },
  easier: {
    dose: { kind: 'reps', reps: 6, range: [5, 8], sets: 1, perSide: false },
    steps: [
      'Sit or stand tall with your hands on your lower back, fingers down.',
      'Breathe in: draw the elbows back toward each other and lift the chest.',
      'Breathe out and relax.',
    ],
    cues: ['Hands on lower back', 'Elbows back', 'Chest lifts'],
    breathing: 'Breathe in as the chest opens, out as you relax.',
    figure,
    secondsPerRep: 6,
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 12], sets: 2, perSide: false },
    steps: [
      ...steps.slice(0, 2),
      'Hold for three breaths, lifting the hands a little away from the back.',
      steps[3],
    ],
    cues: ['Hold three breaths', 'Hands lift away', 'Neck long'],
    breathing: 'Breathe in as the chest opens, breathe steadily in the hold, out as you relax.',
    figure,
    secondsPerRep: 12,
  },
}
