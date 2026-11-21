import { FRONT_STANDING, limbs, withPose } from '../build'
import type { Arrow, Exercise, FigureSpec } from '../types'

// Front view, a wall on the viewer's left with the figure's right hand resting on it. The left
// foot (F, the viewer's right) lifts a few inches off the floor and the figure balances.
const WALL = 66
const legs = FRONT_STANDING
const handOnWall = limbs([92, 64], [70, 72], legs.N.kn, legs.N.an, legs.N.to)
const both = withPose(FRONT_STANDING, { N: handOnWall })
const footUp = limbs(legs.F.el, legs.F.wr, [134, 116], [138, 138], [148, 140])
const oneFoot = withPose(FRONT_STANDING, { N: handOnWall, F: footUp })

// Harder: no support, hands on the hips.
const hipsN = limbs([98, 72], [114, 94], legs.N.kn, legs.N.an, legs.N.to)
const hipsF = (l = legs.F) => limbs([152, 72], [136, 94], l.kn, l.an, l.to)
const handsOnHips = withPose(FRONT_STANDING, { N: hipsN, F: hipsF() })
const oneFootFree = withPose(FRONT_STANDING, { N: hipsN, F: hipsF(footUp) })

const arrows: Arrow[][] = [[{ p: [156, 150], q: [156, 128], bend: 0 }]]
const labels = ['Lift one foot a few inches and balance', 'Lower the foot']

const figure: FigureSpec = {
  view: 'front',
  props: { wall: WALL },
  keyframes: [both, oneFoot],
  arrows,
  labels,
  alt: 'Standing, seen from the front, one hand resting lightly on a wall; the other foot lifts a few inches off the floor and the body balances on one leg.',
}
const harderFigure: FigureSpec = {
  view: 'front',
  keyframes: [handsOnHips, oneFootFree],
  arrows,
  labels,
  alt: 'Standing without support, hands on the hips, seen from the front; one foot lifts a few inches off the floor and the body balances on one leg.',
}

const steps = [
  'Stand tall next to a wall or sturdy chair and rest one hand on it lightly.',
  'Shift your weight onto your right foot, knee soft.',
  'Lift your left foot a few inches off the floor and balance.',
  'Hold, then switch legs.',
]

export const singleLegBalance: Exercise = {
  id: 'single-leg-balance',
  name: 'Single-leg balance',
  technique: 'strength',
  worksAreas: ['ankles', 'hips', 'core'],
  loadsAreas: ['ankles'],
  equipment: ['wall'],
  level: 'beginner',
  phases: ['main'],
  position: 'standing',
  intensity: 'gentle',
  tags: ['balance'],
  batch: 6,
  standard: {
    dose: { kind: 'time', seconds: 20, range: [10, 30], perSide: true },
    steps,
    cues: ['Light touch on the support', 'Eyes on one point', 'Stand tall'],
    breathing: 'Steady, easy breaths; a wobble is part of it.',
    figure,
  },
  easier: {
    dose: { kind: 'time', seconds: 10, range: [10, 20], perSide: true },
    steps: [
      'Stand tall next to a wall or sturdy chair and hold it firmly.',
      'Shift your weight onto your right foot.',
      'Lift your left heel and then the toes just off the floor.',
      'Hold, then switch legs.',
    ],
    cues: ['Hold on firmly', 'Foot just off the floor', 'Stand tall'],
    breathing: 'Steady, easy breaths.',
    figure,
  },
  harder: {
    dose: { kind: 'time', seconds: 30, range: [20, 45], perSide: true },
    steps: [
      'Stand tall near a wall or sturdy chair, hands on your hips; fix your gaze on one point.',
      steps[1],
      steps[2],
      'Hold, then switch legs. Touch the support whenever you need to.',
    ],
    cues: ['Hands off', 'Eyes on one point', 'Knee soft'],
    breathing: 'Steady, easy breaths; a wobble is part of it.',
    figure: harderFigure,
  },
}
