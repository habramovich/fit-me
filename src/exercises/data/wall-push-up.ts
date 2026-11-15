import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Upper-body strength and bone loading. Side view facing left, hands on a wall, body in a
// straight line from head to heels; bend the elbows to bring the chest toward the wall.
const WALL = 40
const straight: Pose = {
  head: [84, 46],
  sh: [96, 66],
  hip: [124, 108],
  N: limbs([70, 66], [46, 66], [138, 129], [152, 150], [162, 151]),
  F: limbs([72, 64], [48, 64], [140, 129], [156, 150], [166, 151]),
}
const bent: Pose = {
  head: [68, 58],
  sh: [82, 74],
  hip: [116, 112],
  N: limbs([72, 94], [46, 68], [134, 131], [152, 150], [162, 151]),
  F: limbs([74, 92], [48, 66], [136, 131], [156, 150], [166, 151]),
}

const figure: FigureSpec = {
  view: 'side',
  props: { wall: WALL },
  keyframes: [straight, bent],
  arrows: [[{ p: [110, 22], q: [86, 28], bend: 0 }]],
  labels: ['Bend the elbows, chest toward the wall', 'Push back to straight arms'],
  breath: ['in', 'out'],
  alt: 'Leaning on a wall with straight arms, body straight from head to heels; breathing in, the elbows bend and the chest comes toward the wall; breathing out, the arms push back to straight.',
}

const steps = [
  'Stand an arm’s length from a wall; hands on the wall at chest height, a little wider than the shoulders.',
  'Keep your body straight from head to heels.',
  'Breathe in and bend your elbows (about 45° from your sides) to bring your chest toward the wall.',
  'Breathe out and push back to straight arms.',
]

export const wallPushUp: Exercise = {
  id: 'wall-push-up',
  name: 'Wall push-up',
  technique: 'strength',
  worksAreas: ['chest', 'arms', 'shoulders', 'core'],
  loadsAreas: ['wrists', 'shoulders'],
  equipment: ['wall'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'moderate',
  tags: ['boneLoading'],
  batch: 2,
  standard: {
    dose: { kind: 'reps', reps: 10, range: [8, 15], sets: 2, perSide: false },
    steps,
    cues: ['Body in one line', 'Elbows at 45°', 'Push the wall away'],
    breathing: 'Breathe in as you lower toward the wall, out as you push away.',
    figure,
    secondsPerRep: 4,
  },
  easier: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 2, perSide: false },
    steps: ['Stand closer to the wall so you lean less.', steps[2], steps[3]],
    cues: ['Stand closer', 'Small bend', 'Push away'],
    breathing: 'Breathe in as you lower, out as you push away.',
    figure,
    secondsPerRep: 4,
  },
  harder: {
    dose: { kind: 'reps', reps: 10, range: [8, 15], sets: 3, perSide: false },
    steps: [
      'Use a kitchen counter or sturdy table instead of the wall, so you lean further.',
      'Keep your body straight; lower over three seconds.',
      'Breathe out and push back up.',
    ],
    cues: ['Counter height', 'Three seconds down', 'Body in one line'],
    breathing: 'Breathe in as you lower, out as you push away.',
    figure,
    secondsPerRep: 5,
  },
}
