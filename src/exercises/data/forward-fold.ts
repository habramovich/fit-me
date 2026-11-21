import { SIDE_STANDING, limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Side view facing left. From standing, the knees bend softly and the body folds forward from
// the hips, back softly rounded, head and arms hanging toward the floor.
const stand = SIDE_STANDING
const folded: Pose = {
  head: [58, 126],
  sh: [72, 112],
  hip: [112, 100],
  ctrl: [94, 98],
  N: limbs([72, 136], [76, 150], [96, 122], [100, 150], [88, 151]),
  F: limbs([76, 135], [82, 149], [100, 123], [105, 150], [93, 151]),
}
// Easier: a half fold with the hands on the thighs and a long back.
const half: Pose = {
  head: [58, 62],
  sh: [74, 74],
  hip: [110, 100],
  N: limbs([80, 98], [94, 112], [96, 124], [100, 150], [88, 151]),
  F: limbs([84, 97], [98, 111], [100, 125], [105, 150], [93, 151]),
}

const figure: FigureSpec = {
  view: 'side',
  keyframes: [stand, folded],
  arrows: [[{ p: [92, 14], q: [52, 112], bend: -22 }]],
  labels: ['Bend the knees and fold forward from the hips', 'Roll up slowly, head last'],
  alt: 'Standing, seen from the side; the knees bend softly and the body folds forward from the hips, head and arms hanging toward the floor, then rolls up slowly.',
}
const easierFigure: FigureSpec = {
  view: 'side',
  keyframes: [stand, half],
  arrows: [[{ p: [92, 14], q: [56, 50], bend: -12 }]],
  labels: ['Bend the knees and lean forward, hands on the thighs', 'Come back up'],
  alt: 'Standing, seen from the side; the knees bend and the body leans halfway forward from the hips with a long back, hands resting on the thighs.',
}

const steps = [
  'Stand with your feet hip-width apart and your knees softly bent.',
  'Breathe out and slowly fold forward from your hips.',
  'Let your arms hang toward the floor or rest your hands on your thighs; let your head hang.',
  'Hold. To come up, bend your knees more and roll up slowly, head last.',
]

export const forwardFold: Exercise = {
  id: 'forward-fold',
  name: 'Gentle forward fold',
  technique: 'yoga',
  worksAreas: ['hamstrings', 'lowerBack', 'calves'],
  loadsAreas: ['lowerBack'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: false },
    steps,
    cues: ['Knees bent', 'Fold from the hips', 'Roll up slowly'],
    breathing: 'Slow breaths; let the back of the body soften on each breath out.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 15, range: [10, 20], perSide: false },
    steps: [
      steps[0],
      'Rest your hands on your thighs and lean forward from your hips, back long.',
      'Go only halfway; keep your head in line with your back.',
      'Hold, then walk your hands up your thighs to stand.',
    ],
    cues: ['Hands on thighs', 'Halfway', 'Back long'],
    breathing: 'Slow, easy breaths.',
    figure: easierFigure,
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps: [
      steps[0],
      steps[1],
      'Hold opposite elbows and let your upper body hang heavy; sway gently from side to side if it feels good.',
      steps[3],
    ],
    cues: ['Hold the elbows', 'Hang heavy', 'Roll up slowly'],
    breathing: 'Slow breaths; let the back of the body soften on each breath out.',
    figure,
  },
}
