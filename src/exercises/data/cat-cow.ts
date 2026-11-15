import { limbs, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// On hands and knees. Cow: back sinks, head lifts. Cat: back rounds up, head drops.
const allFours = {
  sh: [76, 90] as [number, number],
  hip: [150, 90] as [number, number],
  N: limbs([76, 120], [76, 148], [150, 148], [194, 150], [204, 150]),
  F: limbs([82, 120], [82, 148], [144, 148], [188, 150], [198, 150]),
}
const cow: Pose = { ...allFours, head: [50, 74], ctrl: [113, 108] }
const cat: Pose = { ...allFours, head: [60, 106], ctrl: [113, 64] }

const figure: FigureSpec = {
  view: 'side',
  keyframes: [cow, cat],
  arrows: [
    [
      { p: [113, 50], q: [113, 24], bend: 0 },
      { p: [38, 70], q: [46, 106], bend: 8 },
    ],
    [
      { p: [113, 24], q: [113, 50], bend: 0 },
      { p: [46, 106], q: [38, 70], bend: -8 },
    ],
  ],
  labels: ['Round your back up, tuck your chin', 'Let your back sink, lift your chest'],
  breath: ['out', 'in'],
  alt: 'On hands and knees; breathing out, the back rounds up and the head drops; breathing in, the back sinks and the head lifts.',
}

// Seated version: same movement on a chair.
const seatedCow: Pose = {
  head: [100, 30],
  sh: [114, 52],
  hip: [124, 102],
  ctrl: [108, 80],
  N: limbs([98, 78], [86, 98], [84, 104], [84, 150], [70, 150]),
  F: limbs([102, 78], [90, 98], [88, 104], [88, 150], [74, 150]),
}
const seatedCat = withPose(seatedCow, { head: [94, 76], sh: [120, 58], ctrl: [140, 78] })
const seated: FigureSpec = {
  view: 'side',
  props: { chair: [96, 117] },
  keyframes: [seatedCow, seatedCat],
  arrows: [[{ p: [146, 70], q: [154, 52], bend: 0 }]],
  labels: ['Round your back, chin to chest', 'Arch gently, lift your chest'],
  breath: ['out', 'in'],
  alt: 'Sitting on a chair with hands on the knees; breathing out, the back rounds; breathing in, the chest lifts and the back arches gently.',
}

const steps = [
  'Come to hands and knees: hands under shoulders, knees under hips.',
  'Breathe in: let your belly sink and lift your chest and gaze (cow).',
  'Breathe out: round your spine up and let your head drop (cat).',
  'Move slowly with your breath.',
]

export const catCow: Exercise = {
  id: 'cat-cow',
  name: 'Cat–cow',
  technique: 'yoga',
  worksAreas: ['upperBack', 'lowerBack', 'neck', 'core'],
  loadsAreas: ['wrists', 'knees'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['warmup', 'cooldown'],
  position: 'kneeling',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 1,
  standard: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps,
    cues: [
      'Breathe in: belly sinks, chest lifts',
      'Breathe out: round up',
      'Slow, with the breath',
    ],
    breathing: 'Breathe in as your back sinks, out as it rounds up.',
    figure,
    secondsPerRep: 6,
  },
  easier: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps: [
      'Sit tall near the front of a chair, feet flat, hands on your knees.',
      'Breathe in: lift your chest and arch your back gently.',
      'Breathe out: round your back and drop your chin.',
    ],
    cues: ['Seated, hands on knees', 'Breathe in: chest lifts', 'Breathe out: round'],
    breathing: 'Breathe in as your chest lifts, out as you round.',
    figure: seated,
    position: 'seated',
    equipment: ['chair'],
    secondsPerRep: 6,
  },
  harder: {
    dose: { kind: 'reps', reps: 10, range: [8, 12], sets: 1, perSide: false },
    steps: [...steps.slice(0, 3), 'Pause for one full breath at each end.'],
    cues: ['Pause one breath at each end', 'Move one vertebra at a time', 'Keep arms straight'],
    breathing: 'Breathe in as your back sinks, out as it rounds; one extra breath at each end.',
    figure,
    secondsPerRep: 12,
  },
}
