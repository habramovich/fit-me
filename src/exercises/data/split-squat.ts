import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Strength and bone loading, side view facing left, fingertips on a wall for balance. From a split
// stance, lower the back knee toward the floor and rise back up.
const WALL = 50
const top: Pose = {
  head: [108, 28],
  sh: [111, 50],
  hip: [114, 98],
  N: limbs([90, 70], [60, 76], [96, 124], [86, 150], [74, 151]),
  F: limbs([118, 76], [116, 98], [132, 124], [148, 146], [156, 151]),
}
const bottom: Pose = {
  head: [112, 50],
  sh: [114, 72],
  hip: [116, 120],
  N: limbs([92, 90], [60, 92], [84, 120], [86, 150], [74, 151]),
  F: limbs([120, 98], [118, 120], [134, 142], [150, 146], [158, 151]),
}
const figure: FigureSpec = {
  view: 'side',
  props: { wall: WALL },
  keyframes: [top, bottom],
  arrows: [[{ p: [136, 92], q: [136, 118], bend: 0 }]],
  labels: ['Lower the back knee toward the floor', 'Push up through the front heel'],
  breath: ['in', 'out'],
  alt: 'Standing in a split stance with fingertips on a wall, seen from the side; breathing in, the back knee lowers toward the floor with the body upright; breathing out, push back up.',
}

const steps = [
  'Stand in a long split stance, right foot forward, back heel lifted; fingertips on a wall or chair.',
  'Breathe in and bend both knees, lowering the back knee toward the floor.',
  'Keep the front knee over the ankle and the body upright.',
  'Breathe out and push up through the front heel. Finish the set, then switch legs.',
]

export const splitSquat: Exercise = {
  id: 'split-squat',
  name: 'Split squat',
  technique: 'strength',
  worksAreas: ['quads', 'glutes', 'hamstrings', 'hips'],
  loadsAreas: ['knees'],
  equipment: ['wall'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'moderate',
  tags: ['boneLoading', 'balance'],
  batch: 4,
  standard: {
    dose: { kind: 'reps', reps: 8, range: [6, 12], sets: 2, perSide: true },
    steps,
    cues: ['Back knee toward the floor', 'Front knee over ankle', 'Push through the front heel'],
    breathing: 'Breathe in as you lower, out as you push up.',
    figure,
    secondsPerRep: 4,
  },
  easier: {
    dose: { kind: 'reps', reps: 6, range: [5, 8], sets: 2, perSide: true },
    steps: [
      steps[0],
      'Lower only a few inches, holding the wall with both hands.',
      'Push back up. Switch legs after the set.',
    ],
    cues: ['Small range', 'Both hands on the wall', 'Upright'],
    breathing: 'Breathe in as you lower, out as you push up.',
    figure,
    secondsPerRep: 4,
  },
  harder: {
    dose: { kind: 'reps', reps: 10, range: [8, 12], sets: 3, perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Take three seconds to lower and let go of the wall if you’re steady.',
    ],
    cues: ['Three seconds down', 'Hands free', 'Front heel down'],
    breathing: 'Breathe in as you lower slowly, out as you push up.',
    figure,
    secondsPerRep: 6,
  },
}
