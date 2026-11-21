import { birdDog } from './data/bird-dog'
import { catCow } from './data/cat-cow'
import { deadBug } from './data/dead-bug'
import { figureFour } from './data/figure-four'
import { gluteBridge } from './data/glute-bridge'
import { hipCircles } from './data/hip-circles'
import { pelvicTilts } from './data/pelvic-tilts'
import { shoulderRotations } from './data/shoulder-rotations'
// Batch 2: calm morning, desk break, strength keeper
import { calfRaises } from './data/calf-raises'
import { chestOpener } from './data/chest-opener'
import { childsPose } from './data/childs-pose'
import { chinTucks } from './data/chin-tucks'
import { lowLunge } from './data/low-lunge'
import { seatedSideBend } from './data/seated-side-bend'
import { sitToStand } from './data/sit-to-stand'
import { sunriseBreath } from './data/sunrise-breath'
import { taiChiCommencement } from './data/tai-chi-commencement'
import { treePose } from './data/tree-pose'
import { wallAngels } from './data/wall-angels'
import { wallPushUp } from './data/wall-push-up'
import { waveHandsLikeClouds } from './data/wave-hands-like-clouds'
// Batch 3: low-impact cardio and tai chi
import { marchInPlace } from './data/march-in-place'
import { stepJacks } from './data/step-jacks'
import { shadowBoxing } from './data/shadow-boxing'
import { stepTouch } from './data/step-touch'
import { crossBodyKneeLifts } from './data/cross-body-knee-lifts'
import { heelFlicks } from './data/heel-flicks'
import { partingWildHorsesMane } from './data/parting-wild-horses-mane'
import { brushKneeAndPush } from './data/brush-knee-and-push'
import { goldenRooster } from './data/golden-rooster'
import { repulseMonkey } from './data/repulse-monkey'
// Batch 4: yoga and strength
import { downwardDog } from './data/downward-dog'
import { warriorTwo } from './data/warrior-two'
import { supineTwist } from './data/supine-twist'
import { sphinxPose } from './data/sphinx'
import { puppyPose } from './data/puppy-pose'
import { splitSquat } from './data/split-squat'
import { wallSit } from './data/wall-sit'
import { sideLyingLegLifts } from './data/side-lying-leg-lifts'
import { clamshells } from './data/clamshells'
import { proneWRaises } from './data/prone-w-raises'
// Batch 5: Shibashi qigong
import { broadeningTheChest } from './data/broadening-the-chest'
import { dancingWithRainbows } from './data/dancing-with-rainbows'
import { circlingArms } from './data/circling-arms'
import { twistAndSwingArms } from './data/twist-and-swing-arms'
import { rowingTheBoat } from './data/rowing-the-boat'
import { holdingABall } from './data/holding-a-ball'
import { carryingTheMoon } from './data/carrying-the-moon'
import { twistAndPushPalms } from './data/twist-and-push-palms'
import { scoopingFromTheSea } from './data/scooping-from-the-sea'
import { playingWithWaves } from './data/playing-with-waves'
import { spreadingTheWings } from './data/spreading-the-wings'
import { taiChiPunching } from './data/tai-chi-punching'
import { flyingWildGoose } from './data/flying-wild-goose'
import { spinningWheels } from './data/spinning-wheels'
import { bouncingTheBall } from './data/bouncing-the-ball'
// Batch 6: morning stretches
import { neckSideStretch } from './data/neck-side-stretch'
import { shoulderRolls } from './data/shoulder-rolls'
import { standingSideStretch } from './data/standing-side-stretch'
import { seatedSpinalTwist } from './data/seated-spinal-twist'
import { kneeToChest } from './data/knee-to-chest'
import { standingThighStretch } from './data/standing-thigh-stretch'
import { hamstringStretch } from './data/hamstring-stretch'
import { calfStretch } from './data/calf-stretch'
import { ankleCircles } from './data/ankle-circles'
import { singleLegBalance } from './data/single-leg-balance'
import { forwardFold } from './data/forward-fold'
import { crossBodyShoulderStretch } from './data/cross-body-shoulder-stretch'
import { upperBackHug } from './data/upper-back-hug'
import { butterfly } from './data/butterfly'
import { sideLungeStretch } from './data/side-lunge-stretch'
import { windshieldWipers } from './data/windshield-wipers'
import { lowLungeHamstring } from './data/low-lunge-hamstring'
import {
  BODY_AREA_LABEL,
  TECHNIQUE_LABEL,
  type Dose,
  type Exercise,
  type Pace,
  type Version,
  type VersionKey,
} from './types'

export const allExercises: readonly Exercise[] = [
  pelvicTilts,
  catCow,
  hipCircles,
  shoulderRotations,
  deadBug,
  birdDog,
  gluteBridge,
  figureFour,
  sunriseBreath,
  taiChiCommencement,
  waveHandsLikeClouds,
  childsPose,
  treePose,
  lowLunge,
  seatedSideBend,
  chestOpener,
  chinTucks,
  wallAngels,
  sitToStand,
  calfRaises,
  wallPushUp,
  marchInPlace,
  stepJacks,
  shadowBoxing,
  stepTouch,
  crossBodyKneeLifts,
  heelFlicks,
  partingWildHorsesMane,
  brushKneeAndPush,
  goldenRooster,
  repulseMonkey,
  downwardDog,
  warriorTwo,
  supineTwist,
  sphinxPose,
  puppyPose,
  splitSquat,
  wallSit,
  sideLyingLegLifts,
  clamshells,
  proneWRaises,
  broadeningTheChest,
  dancingWithRainbows,
  circlingArms,
  twistAndSwingArms,
  rowingTheBoat,
  holdingABall,
  carryingTheMoon,
  twistAndPushPalms,
  scoopingFromTheSea,
  playingWithWaves,
  spreadingTheWings,
  taiChiPunching,
  flyingWildGoose,
  spinningWheels,
  bouncingTheBall,
  neckSideStretch,
  shoulderRolls,
  standingSideStretch,
  seatedSpinalTwist,
  kneeToChest,
  standingThighStretch,
  hamstringStretch,
  calfStretch,
  ankleCircles,
  singleLegBalance,
  forwardFold,
  crossBodyShoulderStretch,
  upperBackHug,
  butterfly,
  sideLungeStretch,
  windshieldWipers,
  lowLungeHamstring,
]

const byId = new Map(allExercises.map((e) => [e.id, e]))

export function getExercise(id: string): Exercise | undefined {
  return byId.get(id)
}

export function getVersion(exercise: Exercise, key: VersionKey): Version | undefined {
  return exercise[key]
}

/**
 * How fast to move (spec 006 R5): the version's or exercise's own pace, else a default from the
 * technique and dose. Timed cardio is brisk, timed tai chi flows, other timed moves are holds;
 * tai chi and breath-led repetitions flow, other repetitions are slow and controlled.
 */
export function paceOf(e: Exercise, v: Version): Pace {
  if (v.pace) return v.pace
  if (e.pace) return e.pace
  if (v.dose.kind === 'time') {
    if (e.technique === 'cardio') return 'brisk'
    if (e.technique === 'taichi') return 'flowing'
    return 'hold'
  }
  if (e.technique === 'taichi' || e.tags.includes('breathing')) return 'flowing'
  return 'slow'
}

/** Matches name, technique or body areas worked, case-insensitively. Empty query matches all. */
export function searchExercises(
  query: string,
  list: readonly Exercise[] = allExercises,
): Exercise[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return [...list]
  return list.filter((e) => {
    const haystack = [
      e.name,
      TECHNIQUE_LABEL[e.technique],
      ...e.worksAreas.map((a) => BODY_AREA_LABEL[a]),
    ]
      .join(' ')
      .toLowerCase()
    return words.every((w) => haystack.includes(w))
  })
}

/** "2 × 8 per side" or "30 s per side". */
export function formatDose(dose: Dose): string {
  const side = dose.perSide ? ' per side' : ''
  if (dose.kind === 'time') return `${dose.seconds} s${side}`
  const sets = dose.sets > 1 ? `${dose.sets} × ` : ''
  const note = dose.repsNote ? ` ${dose.repsNote}` : ''
  return `${sets}${dose.reps}${side}${note}`
}

/** "6–10 recommended" or "20–45 s recommended". */
export function formatRange(dose: Dose): string {
  const unit = dose.kind === 'time' ? ' s' : ''
  return `${dose.range[0]}–${dose.range[1]}${unit} recommended`
}

const REST_BETWEEN_SETS = 20
const TRANSITION = 10

/** Rough time to do one version, in seconds, including short rests. */
export function estimateSeconds(version: Version): number {
  const d = version.dose
  const sides = d.perSide ? 2 : 1
  if (d.kind === 'time') return d.seconds * sides + TRANSITION
  const perRep = version.secondsPerRep ?? 4
  return d.reps * d.sets * sides * perRep + REST_BETWEEN_SETS * (d.sets - 1) + TRANSITION
}
