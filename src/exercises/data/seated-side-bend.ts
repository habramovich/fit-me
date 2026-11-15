import { FRONT_SEAT, FRONT_SEATED, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Desk break, front view, sitting on a chair. The left arm reaches up and over as the body
// leans to the right; then back to upright. N = the figure's right (viewer's left).
const upright = withPose(FRONT_SEATED, {
  N: limbs([106, 88], [104, 110], [112, 120], [110, 150], [102, 151]),
  F: limbs([150, 44], [144, 20], [138, 120], [140, 150], [148, 151]),
})
const lean = withPose(FRONT_SEATED, {
  head: [104, 50],
  sh: [112, 68],
  ctrl: [124, 86],
  N: limbs([98, 94], [96, 118], [112, 120], [110, 150], [102, 151]),
  F: limbs([128, 38], [104, 24], [138, 120], [140, 150], [148, 151]),
})

const figure: FigureSpec = {
  view: 'front',
  props: { seat: FRONT_SEAT },
  keyframes: [upright, lean],
  arrows: [[{ p: [148, 12], q: [100, 14], bend: -12 }]],
  labels: ['Lean to the side, reaching up and over', 'Back to upright'],
  breath: ['out', 'in'],
  alt: 'Sitting on a chair, seen from the front, one arm overhead; breathing out, the body leans to the side as the arm reaches over; breathing in, it returns upright.',
}

const steps = [
  'Sit tall near the front of your chair, feet flat.',
  'Reach your left arm up; rest your right hand on the seat.',
  'Breathe out and lean to the right, reaching up and over.',
  'Breathe in and come back up. Finish the reps, then switch sides.',
]

export const seatedSideBend: Exercise = {
  id: 'seated-side-bend',
  name: 'Seated side bend',
  technique: 'mobility',
  worksAreas: ['core', 'shoulders', 'lowerBack', 'upperBack'],
  loadsAreas: [],
  equipment: ['chair'],
  level: 'beginner',
  phases: ['warmup', 'main', 'cooldown'],
  position: 'seated',
  intensity: 'gentle',
  tags: [],
  batch: 2,
  standard: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: true },
    steps,
    cues: ['Sit tall first', 'Reach up and over', 'Both sit bones stay down'],
    breathing: 'Breathe out as you lean, in as you come back up.',
    figure,
    secondsPerRep: 6,
  },
  easier: {
    dose: { kind: 'reps', reps: 4, range: [3, 6], sets: 1, perSide: true },
    steps: [
      steps[0],
      'Rest the left hand on your head instead of reaching up.',
      steps[2],
      steps[3],
    ],
    cues: ['Hand on head', 'Small lean', 'Sit bones down'],
    breathing: 'Breathe out as you lean, in as you come back up.',
    figure,
    secondsPerRep: 5,
  },
  harder: {
    dose: { kind: 'reps', reps: 6, range: [5, 8], sets: 1, perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Hold the lean for two breaths, then come back up. Switch sides.',
    ],
    cues: ['Hold two breaths', 'Long through the side', 'Sit bones down'],
    breathing: 'Breathe out as you lean, breathe into your side in the hold, in as you return.',
    figure,
    secondsPerRep: 10,
  },
}
