import { SIDE_CHAIR, SIDE_SEATED, SIDE_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Tai chi opening form, side view facing left. Breathing in, the arms float up in front to
// shoulder height; breathing out, they sink back down as the knees soften.
const sunk = withPose(SIDE_STANDING, {
  head: [97, 31],
  sh: [100, 54],
  hip: [103, 104],
  N: limbs([96, 80], [86, 98], [94, 128], [100, 150], [88, 151]),
  F: limbs([100, 79], [90, 97], [99, 128], [105, 150], [93, 151]),
})
const risen = withPose(SIDE_STANDING, {
  N: limbs([78, 58], [52, 58], [100, 126], [100, 150], [88, 151]),
  F: limbs([82, 56], [56, 56], [105, 126], [105, 150], [93, 151]),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [sunk, risen],
  arrows: [[{ p: [80, 104], q: [46, 50], bend: -14 }]],
  labels: ['Float the arms up to shoulder height', 'Sink the arms, soften the knees'],
  breath: ['in', 'out'],
  alt: 'Standing with soft knees, seen from the side; breathing in, the arms float up in front to shoulder height; breathing out, they sink down as the knees soften.',
}

const seatedDown = withPose(SIDE_SEATED, {
  N: limbs([108, 80], [94, 96], [84, 104], [84, 150], [70, 150]),
  F: limbs([112, 80], [98, 96], [88, 104], [88, 150], [74, 150]),
})
const seatedUp = withPose(SIDE_SEATED, {
  N: limbs([90, 58], [64, 56], [84, 104], [84, 150], [70, 150]),
  F: limbs([94, 56], [68, 54], [88, 104], [88, 150], [74, 150]),
})
const seated: FigureSpec = {
  view: 'side',
  props: { chair: SIDE_CHAIR },
  keyframes: [seatedDown, seatedUp],
  arrows: [[{ p: [90, 100], q: [60, 48], bend: -12 }]],
  labels: ['Float the arms up', 'Let them sink'],
  breath: ['in', 'out'],
  alt: 'Sitting tall on a chair; breathing in, the arms float up in front to shoulder height; breathing out, they sink.',
}

const steps = [
  'Stand with feet shoulder-width apart, knees soft, arms by your sides.',
  'Breathe in: let the wrists lead as the arms float up in front to shoulder height.',
  'Breathe out: press the palms gently down as the arms sink and the knees soften.',
  'Keep the shoulders relaxed and the movement slow and even.',
]

export const taiChiCommencement: Exercise = {
  id: 'tai-chi-commencement',
  name: 'Tai chi commencement',
  technique: 'taichi',
  worksAreas: ['shoulders', 'upperBack', 'quads'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing', 'balance'],
  batch: 2,
  standard: {
    dose: { kind: 'reps', reps: 6, range: [4, 8], sets: 1, perSide: false },
    steps,
    cues: ['Breathe in: arms float up', 'Breathe out: arms sink, knees soft', 'Shoulders relaxed'],
    breathing: 'Breathe in as the arms float up, out as they sink.',
    figure,
    secondsPerRep: 10,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: false },
    steps: [
      'Sit tall near the front of a chair, hands resting on your thighs.',
      'Breathe in as the arms float up in front; breathe out as they sink.',
    ],
    cues: ['Seated', 'Wrists lead up', 'Palms press down'],
    breathing: 'Breathe in as the arms float up, out as they sink.',
    figure: seated,
    secondsPerRep: 10,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Sink a little deeper into the knees each time, staying upright.',
    ],
    cues: ['Deeper knee bend', 'Upright spine', 'Very slow'],
    breathing: 'Breathe in as the arms float up, out as they sink.',
    figure,
    secondsPerRep: 12,
  },
}
