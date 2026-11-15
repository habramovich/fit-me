import { SIDE_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Hip-flexor stretch for long sitting. Side view, facing left: front foot planted, back knee on
// the mat; the hips ease forward to stretch the front of the back hip.
const lunge: Pose = {
  head: [116, 40],
  sh: [118, 62],
  hip: [122, 112],
  N: limbs([106, 88], [90, 106], [84, 112], [82, 150], [70, 151]),
  F: limbs([110, 88], [94, 106], [154, 146], [192, 150], [200, 150]),
}
const sunk: Pose = {
  head: [112, 48],
  sh: [114, 70],
  hip: [114, 120],
  N: limbs([102, 96], [84, 112], [78, 118], [82, 150], [70, 151]),
  F: limbs([106, 96], [88, 112], [154, 146], [192, 150], [200, 150]),
}
const figure: FigureSpec = {
  view: 'side',
  keyframes: [lunge, sunk],
  arrows: [[{ p: [140, 104], q: [118, 126], bend: 4 }]],
  labels: ['Ease the hips forward and down', 'Back off a little'],
  alt: 'Kneeling lunge seen from the side, front foot planted and back knee on the mat; the hips ease forward and down to stretch the front of the back hip.',
}

// Standing version: a split stance, tucking the pelvis to stretch the back hip.
const split: Pose = withPose(SIDE_STANDING, {
  hip: [106, 100],
  N: limbs([116, 78], [108, 96], [94, 126], [88, 150], [76, 151]),
  F: limbs([120, 77], [112, 95], [124, 126], [142, 150], [152, 151]),
})
const tucked: Pose = withPose(split, {
  hip: [101, 104],
  sh: [100, 52],
  head: [97, 29],
  N: limbs([114, 80], [104, 98], [88, 128], [88, 150], [76, 151]),
  F: limbs([118, 79], [108, 97], [122, 128], [142, 150], [152, 151]),
})
const standing: FigureSpec = {
  view: 'side',
  keyframes: [split, tucked],
  arrows: [[{ p: [124, 92], q: [106, 108], bend: 4 }]],
  labels: ['Tuck the tailbone, hips forward', 'Release'],
  alt: 'Standing in a split stance seen from the side, hands on hips; the tailbone tucks and the hips move forward to stretch the front of the back hip.',
}

const steps = [
  'Kneel on your right knee with your left foot flat in front, knee over ankle.',
  'Tuck your tailbone slightly and ease your hips forward until you feel the front of the right hip.',
  'Keep your chest tall; hands on the front knee.',
  'Hold, then switch sides. Pad the back knee if needed.',
]

export const lowLunge: Exercise = {
  id: 'low-lunge',
  name: 'Low lunge hip stretch',
  technique: 'yoga',
  worksAreas: ['hips', 'quads', 'lowerBack'],
  loadsAreas: ['knees'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['main', 'cooldown'],
  position: 'kneeling',
  intensity: 'gentle',
  tags: [],
  batch: 2,
  standard: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps,
    cues: ['Tailbone tucks', 'Hips ease forward', 'Chest tall'],
    breathing: 'Breathe out as you ease the hips forward; keep breathing slowly in the stretch.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps: [
      'Stand in a long split stance, back heel lifted, hands on hips.',
      'Tuck your tailbone and move your hips forward until you feel the front of the back hip.',
      'Hold, then switch legs. Hold a chair or desk if you like.',
    ],
    cues: ['Standing, split stance', 'Tuck the tailbone', 'Hips forward'],
    breathing: 'Breathe out as you tuck and ease forward; keep breathing slowly.',
    figure: standing,
    position: 'standing',
    equipment: ['none'],
  },
  harder: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: true },
    steps: [...steps.slice(0, 2), 'Raise both arms overhead and lift through the chest.', steps[3]],
    cues: ['Arms overhead', 'Ribs down', 'Hips forward'],
    breathing: 'Breathe out as you ease forward; slow breaths in the stretch.',
    figure,
  },
}
