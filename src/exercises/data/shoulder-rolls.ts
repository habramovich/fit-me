import { SIDE_STANDING, limbs, seatedFigure, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Side view facing left, arms hanging. The shoulders lift toward the ears, roll back (the chest
// opens) and drop down again; the arms follow the shoulders.
const legsN = SIDE_STANDING.N
const legsF = SIDE_STANDING.F
function shoulders(sh: [number, number]): Pose {
  const [dx, dy] = [sh[0] - 100, sh[1] - 50]
  return withPose(SIDE_STANDING, {
    sh,
    N: limbs([100 + dx, 76 + dy], [98 + dx, 100 + dy], legsN.kn, legsN.an, legsN.to),
    F: limbs([104 + dx, 75 + dy], [102 + dx, 99 + dy], legsF.kn, legsF.an, legsF.to),
  })
}
const rest = shoulders([100, 50])
const up = shoulders([101, 41])
const back = shoulders([106, 48])

const figure: FigureSpec = {
  view: 'side',
  keyframes: [rest, up, back],
  arrows: [
    [{ p: [116, 66], q: [116, 44], bend: 0 }],
    [{ p: [118, 36], q: [132, 48], bend: -6 }],
    [{ p: [132, 56], q: [118, 66], bend: -6 }],
  ],
  labels: ['Shoulders up toward the ears', 'Roll them back', 'And down'],
  breath: ['in', 'out', 'out'],
  alt: 'Standing, seen from the side, arms relaxed; breathing in, the shoulders lift toward the ears; breathing out, they roll back and down, opening the chest.',
}

const seated = seatedFigure(
  figure,
  'Sitting tall on a chair, seen from the side; the shoulders lift toward the ears, then roll back and down.',
)

const steps = [
  'Stand or sit tall, arms relaxed by your sides.',
  'Breathe in and lift both shoulders toward your ears.',
  'Breathe out and roll them back and down, letting the shoulder blades draw together.',
  'Do all the rolls backward, then the same number forward.',
]
const breathing = 'Breathe in as the shoulders lift, out as they roll back and down.'

export const shoulderRolls: Exercise = {
  id: 'shoulder-rolls',
  name: 'Shoulder rolls',
  technique: 'mobility',
  worksAreas: ['shoulders', 'neck', 'upperBack'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: {
      kind: 'reps',
      reps: 10,
      range: [8, 12],
      sets: 1,
      perSide: false,
      repsNote: 'backward, then forward',
    },
    steps,
    cues: ['Up toward the ears', 'Back and down', 'Slow and smooth'],
    breathing,
    figure,
    secondsPerRep: 6,
  },
  easier: {
    dose: {
      kind: 'reps',
      reps: 8,
      range: [6, 10],
      sets: 1,
      perSide: false,
      repsNote: 'backward, then forward',
    },
    steps: [
      'Sit tall on a chair, arms relaxed.',
      'Lift the shoulders a little, roll them back and let them drop.',
      'Do all the rolls backward, then forward.',
    ],
    cues: ['Seated', 'Small and easy', 'Let them drop'],
    breathing,
    figure: seated,
    secondsPerRep: 5,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: {
      kind: 'reps',
      reps: 12,
      range: [10, 15],
      sets: 1,
      perSide: false,
      repsNote: 'backward, then forward',
    },
    steps: [
      steps[0],
      'Breathe in and lift the shoulders as high as you can; pause for a moment.',
      'Breathe out and squeeze the shoulder blades back and down before you relax.',
      steps[3],
    ],
    cues: ['As high as you can', 'Squeeze back and down', 'Slow'],
    breathing,
    figure,
    secondsPerRep: 8,
  },
}
