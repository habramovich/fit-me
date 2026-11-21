import { SIDE_CHAIR, SIDE_SEATED, limbs, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Side view facing left. The near heel rests a small step in front, toes up; the back knee bends
// and the body leans forward from the hips with a long back, hands on the front thigh.
const upright: Pose = {
  head: [100, 25],
  sh: [102, 48],
  hip: [104, 98],
  N: limbs([102, 74], [100, 98], [88, 122], [74, 148], [68, 136]),
  F: limbs([106, 73], [104, 97], [106, 124], [106, 150], [94, 151]),
}
const hinged: Pose = {
  head: [66, 46],
  sh: [80, 62],
  hip: [110, 98],
  N: limbs([82, 88], [92, 108], [90, 122], [74, 148], [68, 136]),
  F: limbs([86, 86], [96, 106], [104, 124], [108, 150], [96, 151]),
}
// Harder: further forward, hands sliding down toward the shin.
const deeper = withPose(hinged, {
  head: [54, 68],
  sh: [68, 80],
  N: limbs([72, 106], [82, 128], [90, 122], [74, 148], [68, 136]),
  F: limbs([76, 104], [86, 126], [104, 124], [108, 150], [96, 151]),
})

const figure: FigureSpec = {
  view: 'side',
  keyframes: [upright, hinged],
  arrows: [[{ p: [96, 12], q: [62, 32], bend: -10 }]],
  labels: ['Lean forward from the hips, back long', 'Come back up'],
  alt: 'Standing, seen from the side, one heel a small step in front with the toes up; the back knee bends and the body leans forward from the hips with a long back, hands on the front thigh.',
}
const harderFigure: FigureSpec = {
  ...figure,
  keyframes: [upright, deeper],
  arrows: [[{ p: [96, 12], q: [50, 54], bend: -14 }]],
  alt: 'Standing, seen from the side, one heel in front with the toes up; the body folds further forward from the hips, hands sliding down toward the shin.',
}

// Easier: sitting near the front of a chair, the near leg straight with the heel on the floor.
const seatedUp = withPose(SIDE_SEATED, {
  N: limbs([110, 80], [100, 100], [86, 122], [52, 146], [48, 134]),
})
const seatedLean = withPose(SIDE_SEATED, {
  head: [80, 46],
  sh: [96, 62],
  N: limbs([88, 86], [78, 108], [86, 122], [52, 146], [48, 134]),
  F: limbs([92, 86], [82, 108], SIDE_SEATED.F.kn, SIDE_SEATED.F.an, SIDE_SEATED.F.to),
})
const seatedFigure: FigureSpec = {
  view: 'side',
  props: { chair: SIDE_CHAIR },
  keyframes: [seatedUp, seatedLean],
  arrows: [[{ p: [96, 18], q: [74, 34], bend: -8 }]],
  labels: ['Lean forward from the hips, back long', 'Sit back up'],
  alt: 'Sitting near the front of a chair, seen from the side, one leg straight with the heel on the floor; the body leans forward from the hips with a long back.',
}

const steps = [
  'Stand tall and place your right heel a small step in front of you, toes lifted, knee slightly bent.',
  'Bend your left knee a little and rest your hands on your thighs.',
  'Keeping your back long, lean forward from your hips until you feel the back of the right thigh.',
  'Hold, then switch legs.',
]
const breathing = 'Slow breaths; ease forward a little on each breath out.'

export const hamstringStretch: Exercise = {
  id: 'hamstring-stretch',
  name: 'Hamstring stretch',
  technique: 'stretching',
  worksAreas: ['hamstrings', 'calves', 'lowerBack'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: true },
    steps,
    cues: ['Lean from the hips', 'Back long, not rounded', 'Front knee soft'],
    breathing,
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: true },
    steps: [
      'Sit near the front of a sturdy chair.',
      'Stretch your right leg out in front, heel on the floor, toes up, knee soft.',
      'Sit tall, then lean forward from your hips until you feel the back of the thigh.',
      'Hold, then switch legs.',
    ],
    cues: ['Seated', 'Lean from the hips', 'Back long'],
    breathing,
    figure: seatedFigure,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps: [
      steps[0],
      steps[1],
      'Keeping your back long, lean further forward from your hips and let your hands slide toward the shin.',
      'For more stretch, rest the heel on a low step or the bottom stair. Hold, then switch legs.',
    ],
    cues: ['Further forward', 'Back long', 'Front knee soft'],
    breathing,
    figure: harderFigure,
  },
}
