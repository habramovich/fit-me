import { FRONT_STANDING, mirror, mirrorArrow, seatedFigure, withPose } from '../build'
import type { Arrow, Exercise, FigureSpec, Pose } from '../types'

// Shibashi 16, front view. Both arms, palms facing and a steady distance apart, draw one big
// circle in front of the body: reaching out to the right, up overhead, down the left side and
// across the bottom. The body turns and the weight shifts with the arms. N = the figure's right.
const right: Pose = withPose(FRONT_STANDING, {
  head: [117, 27],
  sh: [119, 49],
  hip: [121, 95],
  N: { ...FRONT_STANDING.N, el: [78, 58], wr: [52, 62] },
  F: { ...FRONT_STANDING.F, el: [110, 70], wr: [84, 78] },
})
const overhead: Pose = withPose(FRONT_STANDING, {
  N: { ...FRONT_STANDING.N, el: [104, 25], wr: [108, 2] },
  F: { ...FRONT_STANDING.F, el: [146, 25], wr: [142, 2] },
})
const left = mirror(right)
const low: Pose = withPose(FRONT_STANDING, {
  N: { ...FRONT_STANDING.N, el: [110, 76], wr: [118, 100] },
  F: { ...FRONT_STANDING.F, el: [140, 76], wr: [132, 100] },
})

const reverse = (a: Arrow): Arrow => ({ p: a.q, q: a.p, bend: -a.bend })
const rise: Arrow = { p: [44, 52], q: [100, 0], bend: -16 }
const fall: Arrow = { p: [206, 72], q: [140, 110], bend: -14 }

const figure: FigureSpec = {
  view: 'front',
  keyframes: [right, overhead, left, low],
  arrows: [[rise], [reverse(mirrorArrow(rise))], [fall], [reverse(mirrorArrow(fall))]],
  labels: [
    'Circle the arms up overhead',
    'Down the left side, hands the same distance apart',
    'Across the bottom',
    'Out to the right and round again',
  ],
  breath: ['in', 'out', 'out', 'in'],
  alt: 'Standing, seen from the front, palms facing; both arms draw one big circle together, out to one side, up overhead, down the other side and across the bottom, as the body turns and the weight shifts with them.',
}

const seated = seatedFigure(
  figure,
  'Sitting on a chair, seen from the front, palms facing; both arms draw one big circle together, out to one side, up overhead, down the other side and across the bottom.',
)

const breathing = 'Breathe in as the arms circle up, out as they circle down.'

const steps = [
  'Stand with feet shoulder-width apart, knees soft, arms low in front, elbows bent, palms facing.',
  'Breathe in: turn to the right and reach both arms out and up in a big circle until they are above your head.',
  'Breathe out: lower the arms down the left side, keeping the same distance between the hands.',
  'Circle the same way a few times, then change direction.',
]

export const spinningWheels: Exercise = {
  id: 'spinning-wheels',
  name: 'Spinning wheels',
  technique: 'taichi',
  worksAreas: ['shoulders', 'core', 'upperBack', 'hips'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 5,
  standard: {
    dose: {
      kind: 'reps',
      reps: 4,
      range: [3, 6],
      sets: 1,
      perSide: false,
      repsNote: 'each direction',
    },
    steps,
    cues: ['One big circle', 'Hands stay apart', 'Body turns with the arms'],
    breathing,
    figure,
    secondsPerRep: 10,
  },
  easier: {
    dose: {
      kind: 'reps',
      reps: 3,
      range: [2, 5],
      sets: 1,
      perSide: false,
      repsNote: 'each direction',
    },
    steps: [
      'Sit tall near the front of a chair, palms facing in front of you.',
      'Circle both arms together: out to one side, up overhead, down the other side.',
      'Keep the circle as big as is comfortable, then change direction.',
    ],
    cues: ['Seated', 'Arms move together', 'Comfortable size'],
    breathing,
    figure: seated,
    secondsPerRep: 10,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: {
      kind: 'reps',
      reps: 6,
      range: [4, 8],
      sets: 1,
      perSide: false,
      repsNote: 'each direction',
    },
    steps: [
      ...steps.slice(0, 3),
      'Make the circle bigger, bend the knees as the arms pass low and shift the weight fully side to side.',
    ],
    cues: ['Bigger circle', 'Knees bend low', 'Full weight shift'],
    breathing,
    figure,
    secondsPerRep: 12,
  },
}
