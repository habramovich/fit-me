import { SIDE_STANDING, limbs, seatedFigure, withPose } from '../build'
import type { Arrow, Exercise, FigureSpec, Pose } from '../types'

// Shibashi 14, side view facing left, knees bent. Soft fists rest at the waist; one fist punches
// slowly forward at chest height, turns over and draws back; then the other. Not shadow boxing:
// slow and relaxed, one breath per punch.
type P = [number, number]
const legs = {
  N: [
    [96, 128],
    [100, 150],
    [88, 151],
  ] as [P, P, P],
  F: [
    [101, 128],
    [105, 150],
    [93, 151],
  ] as [P, P, P],
}
const ready = { el: [114, 76] as P, wr: [98, 88] as P }
const punch = { el: [74, 62] as P, wr: [48, 64] as P }
const pose = (n: { el: P; wr: P }, f: { el: P; wr: P }): Pose =>
  withPose(SIDE_STANDING, {
    head: [97, 30],
    sh: [100, 53],
    hip: [104, 104],
    N: limbs(n.el, n.wr, ...legs.N),
    F: limbs([f.el[0] + 4, f.el[1] - 1], [f.wr[0] + 4, f.wr[1] - 1], ...legs.F),
  })

const atWaist = pose(ready, ready)
const punchNear = pose(punch, ready)
const punchFar = pose(ready, punch)

const out: Arrow[] = [{ p: [92, 84], q: [42, 66], bend: 0 }]
const back: Arrow[] = [{ p: [42, 56], q: [92, 78], bend: 6 }]

const figure: FigureSpec = {
  view: 'side',
  keyframes: [atWaist, punchNear, atWaist, punchFar],
  arrows: [out, back, out, back],
  labels: [
    'Punch slowly forward at chest height',
    'Turn the fist over, draw it back to the waist',
    'Punch with the other fist',
    'Turn the fist over, draw it back to the waist',
  ],
  breath: ['out', 'in', 'out', 'in'],
  alt: 'Standing with knees bent, seen from the side, soft fists at the waist; one fist punches slowly forward at chest height, turns over and draws back, then the other.',
}

const seated = seatedFigure(
  figure,
  'Sitting tall on a chair, seen from the side, soft fists at the waist; one fist punches slowly forward at chest height and draws back, then the other.',
)

const breathing = 'Breathe out as you punch, in as the fist draws back.'

const steps = [
  'Stand with feet shoulder-width apart, knees soft, soft fists resting at your waist.',
  'Breathe out: punch the right fist slowly forward at chest height.',
  'Breathe in: turn the fist palm-up and draw it back to your waist.',
  'Repeat with the left fist. Keep the shoulders relaxed and never lock the elbow.',
]

export const taiChiPunching: Exercise = {
  id: 'tai-chi-punching',
  name: 'Tai chi punching',
  technique: 'taichi',
  worksAreas: ['shoulders', 'arms', 'core', 'quads'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 5,
  standard: {
    dose: { kind: 'reps', reps: 6, range: [4, 10], sets: 1, perSide: true },
    steps,
    cues: ['Slow, relaxed punch', 'Fist turns as it returns', 'Elbow soft'],
    breathing,
    figure,
    secondsPerRep: 6,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: true },
    steps: [
      'Sit tall near the front of a chair, soft fists at your waist.',
      'Punch one fist slowly forward, then turn it over and draw it back.',
      'Change hands. Punch only as far as is comfortable.',
    ],
    cues: ['Seated', 'Slow punch', 'Shoulders relaxed'],
    breathing,
    figure: seated,
    secondsPerRep: 6,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 12], sets: 1, perSide: true },
    steps: [
      'Stand in a wide horse stance, feet wider than the shoulders, knees bent over the toes.',
      ...steps.slice(1, 3),
      'Stay low and level through the whole set, alternating fists.',
    ],
    cues: ['Wide, low stance', 'Eyes forward', 'Stay level'],
    breathing,
    figure,
    secondsPerRep: 6,
  },
}
