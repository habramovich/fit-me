import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Yoga, side view, lying face down (head left). Prop up on the forearms, chest lifting gently:
// a counter to a rounded, desk-bound upper back.
const flat: Pose = {
  head: [44, 140],
  sh: [68, 140],
  hip: [126, 141],
  N: limbs([80, 148], [56, 148], [168, 144], [210, 146], [220, 150]),
  F: limbs([82, 146], [58, 146], [166, 142], [208, 144], [218, 148]),
}
const sphinx: Pose = {
  head: [50, 102],
  sh: [72, 116],
  hip: [126, 141],
  ctrl: [104, 136],
  N: limbs([72, 148], [44, 148], [168, 144], [210, 146], [220, 150]),
  F: limbs([76, 147], [48, 147], [166, 142], [208, 144], [218, 148]),
}
const figure: FigureSpec = {
  view: 'side',
  keyframes: [flat, sphinx],
  arrows: [[{ p: [80, 128], q: [80, 100], bend: 0 }]],
  labels: ['Come up onto the forearms, chest lifts', 'Lower down'],
  breath: ['in', 'out'],
  alt: 'Lying face down, seen from the side; breathing in, the chest lifts as the person comes up onto the forearms with elbows under the shoulders; breathing out, they lower.',
}

const steps = [
  'Lie on your front, legs long, forehead down.',
  'Place your elbows under your shoulders, forearms forward.',
  'Breathe in and lift your chest, drawing the shoulders down and back.',
  'Keep the neck long and the lower back relaxed. Hold, then lower.',
]

export const sphinxPose: Exercise = {
  id: 'sphinx',
  name: 'Sphinx',
  technique: 'yoga',
  worksAreas: ['upperBack', 'chest', 'lowerBack', 'shoulders'],
  loadsAreas: ['lowerBack'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['main', 'cooldown'],
  position: 'lying',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 4,
  standard: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps,
    cues: ['Elbows under shoulders', 'Shoulders down and back', 'Lower back soft'],
    breathing: 'Breathe in as the chest lifts; slow breaths while you hold.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: false },
    steps: [
      steps[0],
      'Place the elbows a little in front of the shoulders, so the lift is smaller.',
      'Hold, then lower.',
    ],
    cues: ['Elbows forward', 'Small lift', 'Relax the legs'],
    breathing: 'Slow breaths.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Press the forearms down to lift a little higher and hold longer.',
    ],
    cues: ['Press the forearms down', 'Chest forward', 'Neck long'],
    breathing: 'Slow breaths into the chest.',
    figure,
  },
}
