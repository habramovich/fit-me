import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Side view, facing left, kneeling on the far knee with the near foot in front (as in low lunge).
// The hips ease forward into the lunge, then shift back over the back knee as the front leg
// straightens, toes up, and the body folds over it to stretch the back of the front thigh.
const lunge: Pose = {
  head: [112, 48],
  sh: [114, 70],
  hip: [114, 120],
  N: limbs([102, 96], [84, 112], [78, 118], [82, 150], [70, 151]),
  F: limbs([106, 96], [88, 112], [154, 146], [192, 150], [200, 150]),
}
const fold: Pose = {
  head: [88, 76],
  sh: [108, 80],
  hip: [152, 102],
  N: limbs([104, 106], [100, 132], [120, 124], [87, 148], [82, 136]),
  F: limbs([108, 106], [104, 132], [154, 146], [192, 150], [200, 150]),
}

const figure: FigureSpec = {
  view: 'side',
  keyframes: [lunge, fold],
  arrows: [
    [
      { p: [126, 112], q: [154, 94], bend: -6 },
      { p: [98, 30], q: [74, 62], bend: -10 },
    ],
  ],
  labels: ['Hips back, front leg straight, fold forward', 'Hips forward into the lunge'],
  breath: ['out', 'in'],
  alt: 'Kneeling lunge seen from the side; breathing out, the hips shift back over the back knee, the front leg straightens with the toes up and the body folds over it; breathing in, the hips ease forward into the lunge again.',
}

// Easier: standing in a split stance; tuck the hips forward, then sit them back and hinge over
// the straight front leg.
const splitForward: Pose = {
  head: [97, 29],
  sh: [100, 52],
  hip: [101, 104],
  N: limbs([114, 80], [104, 98], [88, 128], [88, 150], [76, 151]),
  F: limbs([118, 79], [108, 97], [122, 128], [142, 150], [152, 151]),
}
const splitBack: Pose = {
  head: [70, 52],
  sh: [84, 66],
  hip: [116, 100],
  N: limbs([86, 92], [96, 114], [101, 125], [88, 150], [76, 151]),
  F: limbs([90, 91], [100, 113], [128, 126], [142, 150], [152, 151]),
}
const standingFigure: FigureSpec = {
  view: 'side',
  keyframes: [splitForward, splitBack],
  arrows: [
    [
      { p: [104, 112], q: [122, 96], bend: -6 },
      { p: [82, 12], q: [56, 42], bend: -10 },
    ],
  ],
  labels: ['Hips back, front leg straight, lean forward', 'Hips forward, tailbone tucked'],
  breath: ['out', 'in'],
  alt: 'Standing in a split stance seen from the side; breathing out, the hips sit back, the front leg straightens and the body leans forward over it; breathing in, the hips move forward with the tailbone tucked.',
}

const steps = [
  'Kneel on your right knee with your left foot flat in front, knee over ankle. Pad the back knee if needed.',
  'Breathe in and ease your hips forward into the lunge, chest tall.',
  'Breathe out and shift your hips back over the right knee; straighten the left leg, toes up, and fold over it with a long back.',
  'Rock slowly between the two. On the last one, stay in each for three breaths, then switch sides.',
]
const breathing = 'Breathe in as you move into the lunge, out as you shift back and fold.'

export const lowLungeHamstring: Exercise = {
  id: 'low-lunge-hamstring',
  name: 'Low lunge to hamstring stretch',
  technique: 'yoga',
  worksAreas: ['hips', 'hamstrings', 'quads', 'lowerBack'],
  loadsAreas: ['knees'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['main', 'cooldown'],
  position: 'kneeling',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: true },
    steps,
    cues: ['Hips forward, then back', 'Back long as you fold', 'Hands on the floor or blocks'],
    breathing,
    figure,
    secondsPerRep: 10,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 6], sets: 1, perSide: true },
    steps: [
      'Stand in a long split stance, left foot in front, hands on your hips or a chair back.',
      'Breathe in, tuck your tailbone and ease your hips forward until you feel the front of the right hip.',
      'Breathe out, sit your hips back, straighten the front leg and lean forward from the hips with a long back.',
      'Rock slowly between the two, then switch legs.',
    ],
    cues: ['Standing', 'Tuck, then sit back', 'Back long'],
    breathing,
    figure: standingFigure,
    secondsPerRep: 10,
    position: 'standing',
    equipment: ['none'],
  },
  harder: {
    dose: { kind: 'reps', reps: 6, range: [5, 8], sets: 1, perSide: true },
    steps: [
      steps[0],
      'Breathe in and ease your hips forward into the lunge, arms overhead.',
      'Breathe out, bring the hands down beside the front foot, shift back and fold over the straight front leg.',
      'Rock slowly between the two. On the last one, stay in each for five breaths, then switch sides.',
    ],
    cues: ['Arms up in the lunge', 'Fold with a long back', 'Five breaths at the end'],
    breathing,
    figure,
    secondsPerRep: 12,
  },
}
