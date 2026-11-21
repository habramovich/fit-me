import { SIDE_STANDING, limbs, withPose } from '../build'
import type { Arrow, Exercise, FigureSpec } from '../types'

// Side view facing left, the far hand on a wall. The near knee bends and the heel comes up
// behind toward the buttocks, the near hand holding the ankle; the knees stay side by side.
const WALL = 56
const farOnWall = limbs([80, 64], [60, 70], [105, 126], [105, 150], [93, 151])
const stand = withPose(SIDE_STANDING, { F: farOnWall })
const bent = withPose(SIDE_STANDING, {
  N: limbs([112, 74], [124, 96], [106, 128], [126, 106], [134, 98]),
  F: farOnWall,
})
// Harder: no support, the far arm reaching forward for balance.
const farFree = limbs([82, 60], [60, 62], [105, 126], [105, 150], [93, 151])
const standFree = withPose(SIDE_STANDING, { F: farFree })
const bentFree = withPose(bent, { F: farFree })

const arrows: Arrow[][] = [[{ p: [92, 148], q: [126, 112], bend: -14 }]]
const labels = ['Heel toward your buttocks, hold the ankle', 'Lower the foot']

const figure: FigureSpec = {
  view: 'side',
  props: { wall: WALL },
  keyframes: [stand, bent],
  arrows,
  labels,
  alt: 'Standing side-on to a wall with one hand on it; the other knee bends and the heel comes up behind toward the buttocks, that hand holding the ankle, knees side by side.',
}
const harderFigure: FigureSpec = {
  view: 'side',
  keyframes: [standFree, bentFree],
  arrows,
  labels,
  alt: 'Standing without support, one arm reaching forward for balance; the other knee bends and the heel comes up behind toward the buttocks, that hand holding the ankle.',
}

const steps = [
  'Stand tall beside a wall or sturdy chair and hold it with your left hand.',
  'Bend your right knee and bring your heel toward your buttocks.',
  'Hold your ankle with your right hand if comfortable; keep your knees side by side.',
  'Hold, then switch legs.',
]

export const standingThighStretch: Exercise = {
  id: 'standing-thigh-stretch',
  name: 'Standing thigh stretch',
  technique: 'mobility',
  worksAreas: ['quads', 'hips'],
  loadsAreas: ['knees'],
  equipment: ['wall'],
  level: 'beginner',
  phases: ['main', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: [],
  batch: 6,
  standard: {
    dose: { kind: 'time', seconds: 20, range: [15, 30], perSide: true },
    steps,
    cues: ['Knees side by side', 'Stand tall, tailbone down', 'Gentle, never into the knee'],
    breathing: 'Slow, easy breaths; let the front of the thigh soften on each breath out.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 15, range: [10, 20], perSide: true },
    steps: [
      steps[0],
      'Bend your right knee and lift the heel behind you only as far as is comfortable.',
      'If you can’t reach your ankle, loop a towel around it and hold the ends, or just hold the lifted heel there.',
      'Hold, then switch legs.',
    ],
    cues: ['Use a towel if needed', 'Knees side by side', 'Stand tall'],
    breathing: 'Slow, easy breaths.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps: [
      'Stand tall without support; fix your gaze on one point.',
      steps[1],
      'Hold your ankle with your right hand and reach your left arm forward for balance. Tuck your tailbone slightly.',
      'Hold, then switch legs. Touch the wall whenever you need to.',
    ],
    cues: ['Eyes on one point', 'Tailbone tucks', 'Knees side by side'],
    breathing: 'Slow, steady breaths.',
    figure: harderFigure,
  },
}
