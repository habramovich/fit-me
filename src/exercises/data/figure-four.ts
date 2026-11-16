import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Lying on the back, the near ankle crossed over the far knee; the far thigh is drawn toward the
// chest to stretch the near hip.
const crossed: Pose = {
  head: [40, 138],
  sh: [64, 137],
  hip: [122, 137],
  N: limbs([90, 145], [116, 147], [150, 120], [156, 102], [166, 96]),
  F: limbs([88, 143], [114, 145], [152, 104], [166, 146], [182, 148]),
}
const drawn: Pose = {
  head: [40, 138],
  sh: [64, 137],
  hip: [122, 137],
  N: limbs([88, 114], [114, 108], [156, 114], [134, 98], [140, 90]),
  F: limbs([86, 112], [112, 106], [128, 96], [164, 92], [174, 86]),
}

const figure: FigureSpec = {
  view: 'side',
  keyframes: [crossed, drawn],
  arrows: [[{ p: [162, 96], q: [136, 84], bend: -8 }]],
  labels: ['Hold behind the thigh and draw it toward you', 'Ease off a little'],
  // Lying on the back; the crossed legs fool the facing guess.
  nose: 'up',
  alt: 'Lying on the back with one ankle crossed over the opposite knee; the hands hold behind the lower thigh and draw it gently toward the chest, stretching the crossed hip.',
}

const easierFigure: FigureSpec = {
  view: 'side',
  keyframes: [
    crossed,
    { ...crossed, N: limbs([90, 145], [116, 147], [160, 134], [156, 102], [166, 96]) },
  ],
  arrows: [[{ p: [168, 116], q: [176, 134], bend: -4 }]],
  labels: ['Let the crossed knee open gently', 'Relax'],
  nose: 'up',
  alt: 'Lying on the back with one ankle crossed over the opposite knee and that foot on the floor; the crossed knee opens gently.',
}

const steps = [
  'Lie on your back, knees bent, feet flat.',
  'Cross your right ankle over your left knee and let the right knee open.',
  'Hold behind your left thigh and draw it gently toward your chest.',
  'Hold, breathing slowly. Switch sides halfway.',
]

export const figureFour: Exercise = {
  id: 'figure-four',
  name: 'Figure four stretch',
  technique: 'yoga',
  worksAreas: ['hips', 'glutes', 'lowerBack'],
  loadsAreas: ['hips', 'knees'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['cooldown'],
  position: 'lying',
  intensity: 'gentle',
  tags: [],
  batch: 1,
  standard: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps,
    cues: [
      'Ankle over the opposite knee',
      'Draw the thigh in gently',
      'Shoulders and head relaxed',
    ],
    breathing: 'Long, slow breaths; relax a little deeper on each breath out.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: true },
    steps: [
      steps[0],
      steps[1],
      'Keep the left foot on the floor; just let the right knee open.',
      'Hold, breathing slowly. Switch sides halfway.',
    ],
    cues: ['Foot stays on the floor', 'Let the knee open', 'No forcing'],
    breathing: 'Long, slow breaths; relax on each breath out.',
    figure: easierFigure,
  },
  harder: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: true },
    steps: [
      ...steps.slice(0, 3),
      'Gently press the right knee away with your elbow. Switch sides halfway.',
    ],
    cues: ['Draw the thigh closer', 'Press the knee away gently', 'Stay relaxed'],
    breathing: 'Long, slow breaths; relax deeper on each breath out.',
    figure,
  },
}
