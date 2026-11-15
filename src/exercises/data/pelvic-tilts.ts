import { limbs, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Lying on the back, knees bent. The lower back lifts slightly (neutral), then presses flat.
const neutral: Pose = {
  head: [40, 138],
  sh: [64, 137],
  hip: [122, 137],
  ctrl: [93, 129],
  N: limbs([90, 145], [116, 147], [152, 102], [168, 146], [186, 148]),
  F: limbs([88, 143], [114, 145], [148, 102], [162, 146], [180, 148]),
}
const tilted = withPose(neutral, {
  hip: [122, 134],
  ctrl: [93, 141],
  N: limbs([90, 145], [116, 147], [154, 100], [168, 146], [186, 148]),
  F: limbs([88, 143], [114, 145], [150, 100], [162, 146], [180, 148]),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [neutral, tilted],
  arrows: [[{ p: [93, 104], q: [93, 124], bend: 0 }]],
  labels: ['Press your lower back into the mat', 'Release to a small arch'],
  breath: ['out', 'in'],
  alt: 'Lying on the back with knees bent; the lower back presses flat into the mat on a breath out, then releases into a small arch on a breath in.',
}

const steps = [
  'Lie on your back, knees bent, feet flat and hip-width apart.',
  'Breathe out and gently tilt your pelvis so your lower back presses into the mat.',
  'Breathe in and release back to a small natural arch.',
  'Keep the movement small; your hips stay on the mat.',
]

export const pelvicTilts: Exercise = {
  id: 'pelvic-tilts',
  name: 'Pelvic tilts',
  technique: 'mobility',
  worksAreas: ['lowerBack', 'core', 'hips'],
  loadsAreas: ['lowerBack'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['warmup'],
  batch: 1,
  standard: {
    dose: { kind: 'reps', reps: 10, range: [8, 15], sets: 1, perSide: false },
    steps,
    cues: ['Breathe out: press the lower back down', 'Breathe in: release', 'Small, slow movement'],
    breathing: 'Breathe out as you press your back down, in as you release.',
    figure,
    secondsPerRep: 4,
  },
  easier: {
    dose: { kind: 'reps', reps: 6, range: [5, 8], sets: 1, perSide: false },
    steps,
    cues: ['Tiny movement', 'Hands on your belly to feel it', 'Breathe out as you press'],
    breathing: 'Breathe out as you press your back down, in as you release.',
    figure,
    secondsPerRep: 4,
  },
  harder: {
    dose: { kind: 'reps', reps: 12, range: [10, 15], sets: 2, perSide: false },
    steps: [...steps.slice(0, 2), 'Hold the press for 3 seconds before releasing.', steps[3]],
    cues: ['Press and hold 3 seconds', 'Keep breathing during the hold', 'Release slowly'],
    breathing: 'Breathe out as you press, keep breathing gently while you hold, in as you release.',
    figure,
    secondsPerRep: 7,
  },
}
