// The sample session (until the planner exists): the owner's favourites in a fixed order.
import type { Marks } from '../data/repo/marks'
import type { PlayItem } from '../player/machine'
import { estimateSeconds, getExercise } from './index'
import type { VersionKey } from './types'

export const SAMPLE_ORDER = [
  'pelvic-tilts',
  'cat-cow',
  'hip-circles',
  'shoulder-rotations',
  'dead-bug',
  'bird-dog',
  'glute-bridge',
  'figure-four',
] as const

export function sampleRoutine(marks: Marks): PlayItem[] {
  return SAMPLE_ORDER.filter((id) => marks[id] !== 'notForMe').map((id) => ({
    exerciseId: id,
    version: 'standard' as const,
    dose: getExercise(id)!.standard.dose,
  }))
}

export function singleRoutine(id: string, version: VersionKey = 'standard'): PlayItem[] {
  const e = getExercise(id)
  const v = e?.[version] ?? e?.standard
  if (!e || !v) return []
  return [{ exerciseId: id, version: e[version] ? version : 'standard', dose: v.dose }]
}

export function estimateMinutes(items: PlayItem[]): number {
  const seconds = items.reduce((sum, item) => {
    const v = getExercise(item.exerciseId)?.[item.version]
    return sum + (v ? estimateSeconds(v) : 0)
  }, 0)
  return Math.max(1, Math.round(seconds / 60))
}
