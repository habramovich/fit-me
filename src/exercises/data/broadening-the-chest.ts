import { FRONT_STANDING, seatedFigure, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Shibashi 2, front view. The arms float up in front to shoulder height (seen end-on, so short),
// open wide to the sides, come back to the middle and lower. N = the figure's right.
const down = FRONT_STANDING
const front: Pose = withPose(FRONT_STANDING, {
  N: { ...FRONT_STANDING.N, el: [104, 68], wr: [110, 56] },
  F: { ...FRONT_STANDING.F, el: [146, 68], wr: [140, 56] },
})
const open: Pose = withPose(FRONT_STANDING, {
  N: { ...FRONT_STANDING.N, el: [82, 54], wr: [56, 56] },
  F: { ...FRONT_STANDING.F, el: [168, 54], wr: [194, 56] },
})

const figure: FigureSpec = {
  view: 'front',
  keyframes: [down, front, open, front],
  arrows: [
    [
      { p: [92, 98], q: [90, 56], bend: 6 },
      { p: [158, 98], q: [160, 56], bend: -6 },
    ],
    [
      { p: [94, 42], q: [54, 44], bend: 8 },
      { p: [156, 42], q: [196, 44], bend: -8 },
    ],
    [
      { p: [54, 44], q: [94, 42], bend: -8 },
      { p: [196, 44], q: [156, 42], bend: 8 },
    ],
    [
      { p: [90, 56], q: [92, 98], bend: -6 },
      { p: [160, 56], q: [158, 98], bend: 6 },
    ],
  ],
  labels: [
    'Arms float up in front to shoulder height',
    'Open the arms wide, chest broad',
    'Palms face, arms come back to the middle',
    'Lower the arms',
  ],
  breath: ['in', 'out', 'in', 'out'],
  alt: 'Standing, seen from the front; the arms float up in front to shoulder height, open wide to the sides, come back to the middle and lower.',
}

const seated = seatedFigure(
  figure,
  'Sitting on a chair, seen from the front; the arms float up in front to shoulder height, open wide to the sides, come back to the middle and lower.',
)

const breathing =
  'Breathe in as the arms rise, out as they open, in as they close, out as they lower.'

const steps = [
  'Stand with feet shoulder-width apart, weight even, arms relaxed by your sides.',
  'Breathe in: float the arms up in front to shoulder height, elbows and wrists soft.',
  'Breathe out: palms facing, open the arms wide to the sides and broaden the chest.',
  'Breathe in: bring the arms back to the middle. Breathe out: lower them.',
]

export const broadeningTheChest: Exercise = {
  id: 'broadening-the-chest',
  name: 'Broadening the chest',
  technique: 'taichi',
  worksAreas: ['chest', 'shoulders', 'upperBack'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 6, range: [4, 8], sets: 1, perSide: false },
    steps,
    cues: ['Arms float up, then open', 'Shoulders relaxed', 'Chest broad'],
    breathing,
    figure,
    secondsPerRep: 12,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: false },
    steps: [
      'Sit tall near the front of a chair, feet flat, hands on your thighs.',
      'Float the arms up in front, open them wide, bring them back and lower them.',
      'Raise the arms only as high as feels easy.',
    ],
    cues: ['Seated', 'Open wide', 'Shoulders relaxed'],
    breathing,
    figure: seated,
    secondsPerRep: 12,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Breathe in as the arms close; breathe out and soften the knees as they lower, rising again as they float up.',
    ],
    cues: ['Knees soften as you lower', 'Very slow', 'Chest broad'],
    breathing,
    figure,
    secondsPerRep: 14,
  },
}
