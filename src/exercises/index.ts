import { birdDog } from './data/bird-dog'
import { catCow } from './data/cat-cow'
import { deadBug } from './data/dead-bug'
import { figureFour } from './data/figure-four'
import { gluteBridge } from './data/glute-bridge'
import { hipCircles } from './data/hip-circles'
import { pelvicTilts } from './data/pelvic-tilts'
import { shoulderRotations } from './data/shoulder-rotations'
import {
  BODY_AREA_LABEL,
  TECHNIQUE_LABEL,
  type Dose,
  type Exercise,
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
]

const byId = new Map(allExercises.map((e) => [e.id, e]))

export function getExercise(id: string): Exercise | undefined {
  return byId.get(id)
}

export function getVersion(exercise: Exercise, key: VersionKey): Version | undefined {
  return exercise[key]
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
