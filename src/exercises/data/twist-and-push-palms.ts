import { SIDE_STANDING, limbs, seatedFigure, withPose } from '../build'
import type { Arrow, Exercise, FigureSpec, Pose } from '../types'

// Shibashi 9, side view facing left. Palms rest at the waist, facing up. Turning the waist, one
// hand pushes forward at shoulder height, palm out ("stop traffic"), while the other elbow draws
// back. Back to the middle, then the other hand.
type P = [number, number]
const legs = {
  N: [
    [98, 127],
    [100, 150],
    [88, 151],
  ] as [P, P, P],
  F: [
    [103, 127],
    [105, 150],
    [93, 151],
  ] as [P, P, P],
}
const atWaist = { el: [110, 76] as P, wr: [92, 90] as P }
const drawnBack = { el: [124, 72] as P, wr: [108, 90] as P }
const push = { el: [76, 56] as P, wr: [54, 48] as P }
const pose = (n: { el: P; wr: P }, f: { el: P; wr: P }, lean = 0): Pose =>
  withPose(SIDE_STANDING, {
    head: [97 - lean, 27],
    sh: [100 - lean, 50],
    hip: [104, 102],
    N: limbs(n.el, n.wr, ...legs.N),
    F: limbs([f.el[0] + 4, f.el[1] - 1], [f.wr[0] + 4, f.wr[1] - 1], ...legs.F),
  })

const middle = pose(atWaist, atWaist)
const pushNear = pose(push, drawnBack, 3)
const pushFar = pose(drawnBack, push, 3)

const out: Arrow[] = [
  { p: [88, 84], q: [46, 44], bend: -6 },
  { p: [114, 90], q: [134, 80], bend: 0 },
]
const back: Arrow[] = out.map((a) => ({ p: a.q, q: a.p, bend: -a.bend }))

const figure: FigureSpec = {
  view: 'side',
  keyframes: [middle, pushNear, middle, pushFar],
  arrows: [out, back, out, back],
  labels: [
    'Turn: one palm pushes forward, the other elbow draws back',
    'Back to the middle, palms at the waist',
    'Turn the other way: the other palm pushes',
    'Back to the middle, palms at the waist',
  ],
  breath: ['out', 'in', 'out', 'in'],
  alt: 'Standing, seen from the side, palms resting at the waist; turning the waist, one hand pushes forward at shoulder height with the palm out while the other elbow draws back; back to the middle, then the other hand.',
}

const seated = seatedFigure(
  figure,
  'Sitting tall on a chair, seen from the side, palms at the waist; one hand pushes forward with the palm out while the other elbow draws back, then they change.',
)

const breathing = 'Breathe out as the palm pushes, in as you come back to the middle.'

const steps = [
  'Stand with feet shoulder-width apart, knees soft. Draw the palms to your waist, facing up.',
  'Breathe out: turn your body to the left. Draw the left elbow back and push the right palm forward, as if stopping traffic.',
  'Breathe in: come back to the middle with the weight even.',
  'Breathe out: turn to the right, drawing the right elbow back and pushing the left palm forward.',
]

export const twistAndPushPalms: Exercise = {
  id: 'twist-and-push-palms',
  name: 'Twisting waist and pushing palms',
  technique: 'taichi',
  worksAreas: ['shoulders', 'arms', 'core', 'upperBack'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 6, range: [4, 8], sets: 1, perSide: true },
    steps,
    cues: ['Turn from the waist', 'Palm pushes, elbow draws back', 'Knees soft'],
    breathing,
    figure,
    secondsPerRep: 7,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: true },
    steps: [
      'Sit tall near the front of a chair, palms at your waist.',
      'Turn gently and push one palm forward while the other elbow draws back.',
      'Come back to the middle and change hands. Practise one arm at a time if that helps.',
    ],
    cues: ['Seated', 'Gentle turn', 'One arm at a time is fine'],
    breathing,
    figure: seated,
    secondsPerRep: 7,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Bend the knees a little more and shift the weight gently from side to side with each push.',
    ],
    cues: ['Deeper knees', 'Weight shifts with the push', 'Smooth and even'],
    breathing,
    figure,
    secondsPerRep: 8,
  },
}
