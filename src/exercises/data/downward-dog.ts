import { limbs } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Yoga, side view facing left. From hands and knees, lift the hips up and back into an upside-down
// V. Easier: "wall dog", hands on a wall, hinging at the hips (standing, desk-friendly).
const allFours: Pose = {
  head: [52, 80],
  sh: [76, 90],
  hip: [150, 90],
  N: limbs([76, 120], [76, 148], [150, 148], [194, 150], [204, 150]),
  F: limbs([82, 120], [82, 148], [144, 148], [188, 150], [198, 150]),
}
const dog: Pose = {
  head: [70, 120],
  sh: [86, 108],
  hip: [142, 58],
  N: limbs([74, 128], [62, 148], [158, 102], [172, 146], [160, 150]),
  F: limbs([80, 126], [68, 146], [154, 102], [168, 146], [156, 150]),
}
const figure: FigureSpec = {
  view: 'side',
  keyframes: [allFours, dog],
  arrows: [[{ p: [160, 84], q: [148, 48], bend: -8 }]],
  labels: ['Lift the hips up and back', 'Lower the knees to the mat'],
  breath: ['out', 'in'],
  alt: 'From hands and knees, seen from the side; breathing out, the hips lift up and back into an upside-down V with long arms and legs; breathing in, the knees lower.',
}

const WALL = 40
const standTall: Pose = {
  head: [96, 28],
  sh: [100, 50],
  hip: [104, 100],
  N: limbs([76, 56], [50, 60], [104, 126], [104, 150], [92, 151]),
  F: limbs([78, 54], [52, 58], [108, 126], [108, 150], [96, 151]),
}
const hinge: Pose = {
  head: [86, 98],
  sh: [100, 90],
  hip: [148, 96],
  N: limbs([74, 88], [48, 86], [148, 124], [148, 150], [136, 151]),
  F: limbs([76, 86], [50, 84], [152, 124], [152, 150], [140, 151]),
}
const wallDog: FigureSpec = {
  view: 'side',
  props: { wall: WALL },
  keyframes: [standTall, hinge],
  arrows: [[{ p: [120, 92], q: [158, 92], bend: 0 }]],
  labels: ['Walk back and hinge, chest toward the floor', 'Stand back up'],
  breath: ['out', 'in'],
  alt: 'Hands on a wall at shoulder height, seen from the side; breathing out, the hips move back and the chest sinks until the back is flat; breathing in, return to standing.',
}

const steps = [
  'Start on hands and knees, hands a little ahead of the shoulders.',
  'Tuck the toes and breathe out as you lift the hips up and back.',
  'Keep the knees soft if the back of the legs is tight; press the floor away with your hands.',
  'Breathe steadily, then lower the knees.',
]

export const downwardDog: Exercise = {
  id: 'downward-dog',
  name: 'Downward dog',
  technique: 'yoga',
  worksAreas: ['shoulders', 'hamstrings', 'calves', 'upperBack'],
  loadsAreas: ['wrists', 'shoulders'],
  equipment: ['mat'],
  level: 'beginner',
  phases: ['main', 'cooldown'],
  position: 'kneeling',
  intensity: 'moderate',
  tags: ['boneLoading'],
  batch: 4,
  standard: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps,
    cues: ['Hips up and back', 'Soft knees are fine', 'Press the floor away'],
    breathing: 'Breathe out as you lift the hips; slow, steady breaths in the pose.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: false },
    steps: [
      'Stand facing a wall, hands on it at shoulder height.',
      'Walk your feet back and hinge at the hips until your back is flat and arms are long.',
      'Let the chest sink gently; breathe, then walk back in.',
    ],
    cues: ['Hands on the wall', 'Hinge at the hips', 'Long arms, flat back'],
    breathing: 'Breathe out as you hinge back; slow breaths in the stretch.',
    figure: wallDog,
    position: 'standing',
    equipment: ['wall'],
  },
  harder: {
    dose: { kind: 'time', seconds: 45, range: [30, 60], perSide: false },
    steps: [...steps.slice(0, 3), 'Pedal the feet slowly, bending one knee then the other.'],
    cues: ['Pedal the feet', 'Long spine', 'Steady breath'],
    breathing: 'Slow, steady breaths.',
    figure,
  },
}
