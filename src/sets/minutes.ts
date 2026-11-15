import { estimateSeconds, getExercise } from '../exercises'
import type { SetItem } from './edit'

/** Estimated minutes for a set's items with their saved doses. */
export function setMinutes(items: SetItem[]): number {
  const seconds = items.reduce((sum, i) => {
    const v = getExercise(i.exerciseId)?.[i.version]
    return sum + (v ? estimateSeconds({ ...v, dose: i.dose }) : 0)
  }, 0)
  return Math.max(1, Math.round(seconds / 60))
}
