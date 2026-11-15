import { FRONT_SEAT, FRONT_SEATED, FRONT_STANDING, withPose } from '../build'
import type { Exercise, FigureSpec, Pose } from '../types'

// Front view. Breathing in, the arms float out to the sides and up overhead; breathing out,
// they lower. Seated version for the desk.
function arms(base: Pose, dy: number): [Pose, Pose, Pose] {
  const y = (v: number) => v + dy
  const down = base
  const out = withPose(base, {
    N: { ...base.N, el: [88, y(52)], wr: [64, y(50)] },
    F: { ...base.F, el: [162, y(52)], wr: [186, y(50)] },
  })
  const up = withPose(base, {
    N: { ...base.N, el: [104, y(24)], wr: [120, y(6)] },
    F: { ...base.F, el: [146, y(24)], wr: [130, y(6)] },
  })
  return [down, out, up]
}

function figure(base: Pose, dy: number, seated: boolean): FigureSpec {
  const y = (v: number) => v + dy
  return {
    view: 'front',
    props: seated ? { seat: FRONT_SEAT } : undefined,
    keyframes: arms(base, dy),
    arrows: [
      [
        { p: [100, y(96)], q: [62, y(58)], bend: -10 },
        { p: [150, y(96)], q: [188, y(58)], bend: 10 },
      ],
      [
        { p: [58, y(44)], q: [112, y(8)], bend: -14 },
        { p: [192, y(44)], q: [138, y(8)], bend: 14 },
      ],
      [
        { p: [108, y(6)], q: [96, y(94)], bend: 26 },
        { p: [142, y(6)], q: [154, y(94)], bend: -26 },
      ],
    ],
    labels: ['Arms float out to the sides', 'Arms rise overhead', 'Arms lower slowly'],
    breath: ['in', 'in', 'out'],
    alt: `${seated ? 'Sitting on a chair' : 'Standing'}, seen from the front; breathing in, the arms float out to the sides and up overhead; breathing out, they lower slowly.`,
  }
}

const steps = [
  'Stand tall, feet hip-width apart, arms by your sides.',
  'Breathe in slowly as your arms float out to the sides and up overhead.',
  'Breathe out slowly as your arms lower.',
  'Let the movement follow the breath, not the other way round.',
]

export const sunriseBreath: Exercise = {
  id: 'sunrise-breath',
  name: 'Sunrise breath',
  technique: 'yoga',
  worksAreas: ['shoulders', 'chest', 'upperBack'],
  loadsAreas: [],
  equipment: ['none'],
  level: 'beginner',
  phases: ['warmup', 'cooldown'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['breathing'],
  batch: 2,
  standard: {
    dose: { kind: 'reps', reps: 6, range: [5, 8], sets: 1, perSide: false },
    steps,
    cues: ['Breathe in: arms rise', 'Breathe out: arms lower', 'Slow and smooth'],
    breathing: 'Breathe in as the arms rise, out as they lower.',
    figure: figure(FRONT_STANDING, 0, false),
    secondsPerRep: 9,
  },
  easier: {
    dose: { kind: 'reps', reps: 5, range: [4, 8], sets: 1, perSide: false },
    steps: [
      'Sit tall on a chair, feet flat.',
      'Breathe in as your arms float out and up; breathe out as they lower.',
      'Raise them only as high as feels easy.',
    ],
    cues: ['Seated', 'Breathe in: arms rise', 'Breathe out: arms lower'],
    breathing: 'Breathe in as the arms rise, out as they lower.',
    figure: figure(FRONT_SEATED, 14, true),
    secondsPerRep: 9,
    position: 'seated',
    equipment: ['chair'],
  },
  harder: {
    dose: { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false },
    steps: [
      ...steps.slice(0, 2),
      'Hold overhead for one full breath, then lower as you breathe out.',
    ],
    cues: ['Hold one breath at the top', 'Ribs soft', 'Slow and smooth'],
    breathing: 'Breathe in as the arms rise, take one breath at the top, out as they lower.',
    figure: figure(FRONT_STANDING, 0, false),
    secondsPerRep: 13,
  },
}
