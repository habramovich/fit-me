import { SIDE_CHAIR, SIDE_SEATED, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Desk break, side view, sitting tall. The head glides straight back ("double chin"), then
// relaxes forward: a reset for a forward head after screen work.
const forward = withPose(SIDE_SEATED, { head: [96, 33] })
const tucked = withPose(SIDE_SEATED, { head: [106, 30] })

const figure: FigureSpec = {
  view: 'side',
  props: { chair: SIDE_CHAIR },
  keyframes: [forward, tucked],
  arrows: [[{ p: [82, 22], q: [100, 22], bend: 0 }]],
  labels: ['Glide the head straight back', 'Relax'],
  breath: ['out', 'in'],
  alt: 'Sitting tall on a chair, seen from the side; the head glides straight back, making a gentle double chin, then relaxes.',
}

const steps = [
  'Sit tall, shoulders relaxed, eyes level.',
  'Glide your head straight back, as if making a double chin; don’t tip it up or down.',
  'Hold for two seconds, feeling the back of the neck lengthen.',
  'Relax and repeat.',
]

export const chinTucks: Exercise = {
  id: 'chin-tucks',
  name: 'Chin tucks',
  technique: 'mobility',
  worksAreas: ['neck', 'upperBack'],
  loadsAreas: ['neck'],
  equipment: ['chair'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'seated',
  intensity: 'gentle',
  tags: [],
  batch: 2,
  standard: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps,
    cues: ['Head glides back', 'Eyes stay level', 'Hold two seconds'],
    breathing: 'Breathe out as you glide back, in as you relax.',
    figure,
    secondsPerRep: 5,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: false },
    steps: [steps[0], 'Make a small movement back, without holding.', 'Relax and repeat.'],
    cues: ['Small movement', 'No hold', 'Eyes level'],
    breathing: 'Breathe out as you glide back, in as you relax.',
    figure,
    secondsPerRep: 3,
  },
  harder: {
    dose: { kind: 'reps', reps: 10, range: [8, 12], sets: 1, perSide: false },
    steps: [
      steps[0],
      'Glide back and press the back of your head gently into your hand for five seconds.',
      'Relax and repeat.',
    ],
    cues: ['Glide back', 'Press into your hand', 'Hold five seconds'],
    breathing: 'Breathe out as you glide back, keep breathing in the hold.',
    figure,
    secondsPerRep: 8,
  },
}
