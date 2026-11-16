import { SIDE_STANDING, limbs, seatedFigure, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Shibashi 5, side view facing left (the body turned toward the working arm). Like a front-crawl
// stroke: the arm hangs palm up, draws back and up with the elbow high and the hand by the ear,
// then the palm turns forward and the arm reaches out in front as the weight comes forward.
type P = [number, number]
const near: [P, P, P] = [
  [98, 127],
  [100, 150],
  [88, 151],
]
const far: [P, P, P] = [
  [103, 127],
  [105, 150],
  [93, 151],
]

const hang: Pose = withPose(SIDE_STANDING, {
  hip: [104, 102],
  N: limbs([100, 76], [94, 99], ...near),
  F: limbs([106, 76], [106, 100], ...far),
})
const drawBack: Pose = withPose(SIDE_STANDING, {
  hip: [106, 102],
  N: limbs([126, 54], [114, 32], ...near),
  F: limbs([106, 76], [104, 100], ...far),
})
const reach: Pose = withPose(SIDE_STANDING, {
  head: [94, 27],
  sh: [97, 50],
  hip: [101, 101],
  N: limbs([71, 54], [45, 56], ...near),
  F: limbs([106, 75], [112, 98], ...far),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [hang, drawBack, reach],
  arrows: [
    [{ p: [96, 106], q: [130, 40], bend: 16 }],
    [{ p: [112, 22], q: [44, 46], bend: 12 }],
    [{ p: [42, 66], q: [88, 108], bend: 12 }],
  ],
  labels: [
    'Draw the arm back and up, elbow high',
    'Palm turns forward, the arm reaches out in front',
    'Let it sweep down to your side',
  ],
  breath: ['in', 'out', 'out'],
  alt: 'Standing, seen from the side, knees soft; one arm draws back and up with the elbow high and the hand by the ear, then reaches forward to shoulder height as the weight comes forward, like a front-crawl stroke, and sweeps down to the side.',
}

const seated = seatedFigure(
  figure,
  'Sitting tall on a chair, seen from the side; one arm draws back and up with the elbow high, then reaches forward to shoulder height and sweeps down, like a front-crawl stroke.',
)

const breathing = 'Breathe in as the arm draws back, out as it reaches forward and sweeps down.'

const steps = [
  'Stand with feet shoulder-width apart, knees soft. Turn your body a little toward the right.',
  'Breathe in: with the right arm by your side, palm up, draw it back in an arc, lifting the elbow toward shoulder height.',
  'Breathe out: turn the palm forward and bring the arm and your weight forward until the arm is out in front, like front crawl.',
  'Repeat, then turn to the left and use the left arm.',
]

export const twistAndSwingArms: Exercise = {
  id: 'twist-and-swing-arms',
  name: 'Twisting waist and swinging arms',
  technique: 'taichi',
  worksAreas: ['shoulders', 'upperBack', 'core'],
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
    cues: ['Elbow lifts as the arm draws back', 'Palm turns forward', 'Weight follows the arm'],
    breathing,
    figure,
    secondsPerRep: 8,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: true },
    steps: [
      'Sit tall near the front of a chair, turned a little toward the working arm.',
      'Draw the arm back and up, elbow high, then reach it forward and let it sweep down.',
      'Lift the elbow only as high as is comfortable.',
    ],
    cues: ['Seated', 'Elbow high', 'Reach forward'],
    breathing,
    figure: seated,
    secondsPerRep: 8,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps: [
      'Stand with feet shoulder-width apart, knees soft.',
      'Swing both arms in turn, like front crawl: as one draws back and up, the other reaches forward.',
      'Let the waist turn with each arm and the weight shift gently from side to side.',
    ],
    cues: ['Both arms in turn', 'Waist turns', 'Smooth and continuous'],
    breathing: 'Breathe in as one arm draws back, out as it reaches forward.',
    figure,
    secondsPerRep: 8,
  },
}
