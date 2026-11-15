import { SIDE_STANDING, limbs, withPose } from '../build'
import type { Exercise, FigureSpec } from '../types'

// Low-impact cardio, side view facing left, staggered stance. Guard, jab with the near hand,
// guard, cross with the far hand.
type P = [number, number]
const pose = (near: [P, P], far: [P, P]) =>
  withPose(SIDE_STANDING, {
    hip: [104, 100],
    N: limbs(near[0], near[1], [94, 126], [88, 150], [76, 151]),
    F: limbs(far[0], far[1], [110, 126], [118, 150], [108, 151]),
  })
const guardArm = (dx: number): [P, P] => [
  [94 + dx, 72],
  [86 + dx, 56],
]

const guard = pose(guardArm(0), guardArm(4))
const jab = pose(
  [
    [74, 56],
    [50, 54],
  ],
  guardArm(4),
)
const cross = pose(guardArm(0), [
  [78, 54],
  [52, 52],
])

const figure: FigureSpec = {
  view: 'side',
  keyframes: [guard, jab, guard, cross],
  arrows: [
    [{ p: [84, 46], q: [46, 46], bend: 0 }],
    [{ p: [50, 46], q: [82, 46], bend: 0 }],
    [{ p: [84, 44], q: [48, 44], bend: 0 }],
    [{ p: [52, 44], q: [84, 44], bend: 0 }],
  ],
  labels: ['Jab with the front hand', 'Back to guard', 'Cross with the back hand', 'Back to guard'],
  breath: ['out', 'in', 'out', 'in'],
  alt: 'Standing in a staggered stance with hands up by the chin, seen from the side; the front hand punches forward and returns, then the back hand.',
}

const steps = [
  'Stand with one foot a little ahead of the other, knees soft, hands up by your chin.',
  'Punch forward with the front hand, then bring it back to your chin.',
  'Punch with the back hand, turning the hips slightly, then back to guard.',
  'Keep the punches light and quick; never lock the elbows.',
]

export const shadowBoxing: Exercise = {
  id: 'shadow-boxing',
  name: 'Shadow boxing',
  technique: 'cardio',
  worksAreas: ['heart', 'shoulders', 'arms', 'core'],
  loadsAreas: ['shoulders'],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'moderate',
  tags: [],
  batch: 3,
  standard: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps,
    cues: ['Hands back to the chin', 'Soft elbows', 'Turn the hips on the cross'],
    breathing: 'Breathe out sharply with each punch, in as you return.',
    figure,
    lowImpact: true,
  },
  easier: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps: [
      'Stand with feet hip-width apart.',
      'Punch slowly forward with one hand, then the other.',
      'Keep the shoulders relaxed.',
    ],
    cues: ['Slow punches', 'Relaxed shoulders', 'Soft elbows'],
    breathing: 'Breathe out with each punch.',
    figure,
    lowImpact: true,
  },
  harder: {
    dose: { kind: 'time', seconds: 60, range: [45, 90], perSide: false },
    steps: [
      ...steps.slice(0, 3),
      'Add a bounce on the balls of your feet and faster combinations.',
    ],
    cues: ['Light bounce', 'Faster combinations', 'Hands up'],
    breathing: 'Sharp breath out with each punch.',
    figure,
    lowImpact: false,
  },
}
