import { FRONT_STANDING, limbs, mirror, mirrorArrow, seatedFigure } from '../build'
import type { Arrow, Exercise, FigureSpec, Pose } from '../types'

// Shibashi 17, front view. With the weight on the right foot, the left foot lifts off the floor
// as the right arm rises out to shoulder height, palm down, as if bouncing a ball; both lower
// slowly. Then the other side. N = the figure's right.
const centre = FRONT_STANDING
const right: Pose = {
  head: [122, 26],
  sh: [122, 48],
  hip: [120, 94],
  N: limbs([84, 54], [60, 50], [114, 122], [116, 150], [106, 151]),
  F: limbs([142, 74], [146, 96], [136, 120], [138, 140], [148, 141]),
}
const left = mirror(right)

const up: Arrow[] = [
  { p: [94, 94], q: [56, 42], bend: -10 },
  { p: [154, 150], q: [154, 132], bend: 0 },
]
const down: Arrow[] = up.map((a) => ({ p: a.q, q: a.p, bend: -a.bend }))

const figure: FigureSpec = {
  view: 'front',
  keyframes: [centre, right, centre, left],
  arrows: [up, down, up.map(mirrorArrow), down.map(mirrorArrow)],
  labels: [
    'Weight on the right foot: left foot lifts, right arm rises',
    'Slowly lower the foot and arm',
    'Weight on the left foot: right foot lifts, left arm rises',
    'Slowly lower the foot and arm',
  ],
  breath: ['in', 'out', 'in', 'out'],
  alt: 'Standing, seen from the front; with the weight on one foot, the other foot lifts off the floor as the opposite arm rises out to shoulder height, palm down, as if bouncing a ball; both lower, then the other side.',
}

// Seated, the foot lifts from the floor in front of the chair.
const seatedBase = seatedFigure(
  figure,
  'Sitting on a chair, seen from the front; one foot lifts off the floor as the opposite arm rises out to shoulder height, palm down; both lower, then the other side.',
)
const seatedRight: Pose = {
  ...seatedBase.keyframes[1],
  F: { ...seatedBase.keyframes[1].F, kn: [138, 114], an: [140, 140], to: [148, 141] },
}
const seatedUp: Arrow[] = [
  { p: [94, 108], q: [56, 56], bend: -10 },
  { p: [156, 150], q: [156, 132], bend: 0 },
]
const seatedDown: Arrow[] = seatedUp.map((a) => ({ p: a.q, q: a.p, bend: -a.bend }))
const seated: FigureSpec = {
  ...seatedBase,
  keyframes: [seatedBase.keyframes[0], seatedRight, seatedBase.keyframes[2], mirror(seatedRight)],
  arrows: [seatedUp, seatedDown, seatedUp.map(mirrorArrow), seatedDown.map(mirrorArrow)],
}

const breathing = 'Breathe in as the foot and arm lift, out as they lower.'

const steps = [
  'Stand with feet shoulder-width apart, then shift your weight onto your right foot.',
  'Breathe in: lift the left foot off the floor and raise the right arm to shoulder height, palm down, as if bouncing a ball.',
  'Breathe out: slowly lower the foot and the arm.',
  'Shift onto the left foot and repeat on the other side.',
]

export const bouncingTheBall: Exercise = {
  id: 'bouncing-the-ball',
  name: 'Bouncing the ball',
  technique: 'taichi',
  worksAreas: ['ankles', 'hips', 'calves', 'shoulders'],
  loadsAreas: ['ankles'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['balance'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 6, range: [4, 8], sets: 1, perSide: true },
    steps,
    cues: ['Weight fully on one foot', 'Opposite arm and foot', 'Lower slowly'],
    breathing,
    figure,
    secondsPerRep: 6,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: true },
    steps: [
      'Sit tall near the front of a chair, feet flat.',
      'Lift one foot a little off the floor as the opposite arm rises to shoulder height, palm down.',
      'Lower both slowly and change sides.',
    ],
    cues: ['Seated', 'Opposite arm and foot', 'Slow'],
    breathing,
    figure: seated,
    secondsPerRep: 6,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Lift the knee higher and pause on one foot for a breath before lowering.',
    ],
    cues: ['Higher knee', 'Pause on one foot', 'Eyes on one point'],
    breathing: 'Breathe in as the foot and arm lift, steadily in the pause, out as they lower.',
    figure,
    secondsPerRep: 8,
  },
}
