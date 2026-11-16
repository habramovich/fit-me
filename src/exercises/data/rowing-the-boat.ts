import { SIDE_STANDING, limbs, seatedFigure, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Shibashi 6, side view facing left. Both arms circle forward together: up overhead, palms
// forward, then pushed forward and down like rowing, and back to the sides. The far arm is drawn
// a little behind the near one.
const legs = (bend: number) => ({
  N: [
    [100 - bend, 126],
    [100, 150],
    [88, 151],
  ],
  F: [
    [105 - bend, 126],
    [105, 150],
    [93, 151],
  ],
})
type P = [number, number]
const arms = (el: P, wr: P, bend = 0): Pick<Pose, 'N' | 'F'> => {
  const l = legs(bend) as { N: [P, P, P]; F: [P, P, P] }
  return {
    N: limbs(el, wr, ...l.N),
    F: limbs([el[0] + 4, el[1] - 1], [wr[0] + 4, wr[1] - 1], ...l.F),
  }
}

const down: Pose = withPose(SIDE_STANDING, arms([104, 76], [108, 99]))
const overhead: Pose = withPose(SIDE_STANDING, arms([105, 26], [112, 6]))
const forward: Pose = withPose(SIDE_STANDING, {
  hip: [103, 103],
  ...arms([74, 56], [50, 62], 4),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [down, overhead, forward],
  arrows: [
    [{ p: [120, 96], q: [116, 8], bend: 16 }],
    [{ p: [100, 2], q: [42, 50], bend: 14 }],
    [{ p: [44, 72], q: [100, 110], bend: 12 }],
  ],
  labels: [
    'Lift the arms back and overhead',
    'Palms forward, push forward and down like rowing',
    'Arms sweep down to the sides',
  ],
  breath: ['in', 'out', 'out'],
  alt: 'Standing, seen from the side; both arms lift back and up overhead with the palms forward, then push forward and down like rowing a boat and sweep back to the sides.',
}

const seated = seatedFigure(
  figure,
  'Sitting tall on a chair, seen from the side; both arms lift overhead, then push forward and down like rowing and sweep back to the sides.',
)

const breathing = 'Breathe in as the arms lift overhead, out as you push forward and down.'

const steps = [
  'Stand with feet shoulder-width apart, knees soft, arms by your sides.',
  'Breathe in: lift the arms back and up overhead, palms facing forward.',
  'Breathe out: push the arms forward and down, as if rowing a boat, softening the knees.',
  'Let the arms sweep back past your sides and begin again.',
]

export const rowingTheBoat: Exercise = {
  id: 'rowing-the-boat',
  name: 'Rowing the boat',
  technique: 'taichi',
  worksAreas: ['shoulders', 'upperBack', 'chest'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 6, range: [4, 8], sets: 1, perSide: false },
    steps,
    cues: ['Palms face forward', 'Push forward and down', 'Knees soften as you row'],
    breathing,
    figure,
    secondsPerRep: 9,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: false },
    steps: [
      'Sit tall near the front of a chair, arms by your sides.',
      'Lift the arms up overhead, palms forward, then push them forward and down like rowing.',
      'Raise the arms only as high as feels easy.',
    ],
    cues: ['Seated', 'Overhead, then row', 'Shoulders relaxed'],
    breathing,
    figure: seated,
    secondsPerRep: 9,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps: [
      ...steps.slice(0, 2),
      'Breathe out: push forward and down, bending the knees and hinging a little at the hips as the hands sweep past the knees.',
      'Rise tall again as the arms lift.',
    ],
    cues: ['Deeper knee bend', 'Hinge at the hips', 'Back long'],
    breathing,
    figure,
    secondsPerRep: 10,
  },
}
