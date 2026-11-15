import { FRONT_STANDING, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Front view, back against a wall. Arms in a "goalpost" shape slide up the wall overhead and
// back down. N = the figure's right (viewer's left).
const goalpost = withPose(FRONT_STANDING, {
  N: { ...FRONT_STANDING.N, el: [84, 54], wr: [86, 26] },
  F: { ...FRONT_STANDING.F, el: [166, 54], wr: [164, 26] },
})
const overhead = withPose(FRONT_STANDING, {
  N: { ...FRONT_STANDING.N, el: [100, 26], wr: [112, 6] },
  F: { ...FRONT_STANDING.F, el: [150, 26], wr: [138, 6] },
})

const figure: FigureSpec = {
  view: 'front',
  keyframes: [goalpost, overhead],
  arrows: [
    [
      { p: [76, 22], q: [100, 2], bend: -6 },
      { p: [174, 22], q: [150, 2], bend: 6 },
    ],
  ],
  labels: ['Slide the arms up the wall', 'Slide back down to the goalpost'],
  breath: ['in', 'out'],
  alt: 'Standing with the back against a wall, seen from the front; the arms, bent like a goalpost, slide up the wall overhead and back down.',
}

const steps = [
  'Stand with your back against a wall, feet a little forward, knees soft.',
  'Raise your arms into a goalpost shape, backs of the hands toward the wall.',
  'Breathe in and slide the arms up as far as they stay close to the wall.',
  'Breathe out and slide them back down. Keep your lower back gently against the wall.',
]

export const wallAngels: Exercise = {
  id: 'wall-angels',
  name: 'Wall angels',
  technique: 'mobility',
  worksAreas: ['shoulders', 'upperBack', 'chest'],
  loadsAreas: ['shoulders'],
  equipment: ['wall'],
  level: 'beginner',
  phases: ['warmup', 'main'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 2,
  standard: {
    dose: { kind: 'reps', reps: 8, range: [6, 12], sets: 1, perSide: false },
    steps,
    cues: ['Arms close to the wall', 'Ribs down', 'Only as high as feels good'],
    breathing: 'Breathe in as the arms slide up, out as they slide down.',
    figure,
    secondsPerRep: 5,
  },
  easier: {
    dose: { kind: 'reps', reps: 6, range: [5, 8], sets: 1, perSide: false },
    steps: [
      'Stand a hand’s width from the wall instead of against it.',
      'Make the goalpost shape and slide the arms up and down in the air.',
      'Keep it small and pain-free.',
    ],
    cues: ['Away from the wall', 'Small range', 'Pain-free'],
    breathing: 'Breathe in as the arms rise, out as they lower.',
    figure,
    secondsPerRep: 5,
  },
  harder: {
    dose: { kind: 'reps', reps: 10, range: [8, 15], sets: 2, perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Pause at the top for a breath, then slide down slowly over three seconds.',
    ],
    cues: ['Pause at the top', 'Slow on the way down', 'Wrists to the wall'],
    breathing: 'Breathe in as the arms slide up, out as they slide down.',
    figure,
    secondsPerRep: 8,
  },
}
