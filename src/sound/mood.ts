// Music mood of a session (009, research R2): from the routine for a plan, else from the exercises.
import { getExercise } from '../exercises'
import type { Technique } from '../exercises/types'
import type { RoutineId } from '../profile/types'

export type Mood = 'calm' | 'steady' | 'upbeat'

/** Calmest first: ties go to the earlier one. */
export const MOODS: readonly Mood[] = ['calm', 'steady', 'upbeat']

export const MOOD_LABEL: Record<Mood, string> = { calm: 'Calm', steady: 'Steady', upbeat: 'Upbeat' }

const ROUTINE_MOOD: Record<RoutineId, Mood> = {
  calm: 'calm',
  weekend: 'calm',
  desk: 'steady',
  strength: 'steady',
  cardio: 'upbeat',
}

const TECHNIQUE_MOOD: Record<Technique, Mood> = {
  yoga: 'calm',
  taichi: 'calm',
  mobility: 'calm',
  stretching: 'calm',
  strength: 'steady',
  cardio: 'upbeat',
}

/**
 * `sessionRoutine` is the player's routine string: `plan:<routine>`, `set:<id>`, `single:<id>` or
 * `sample`. A plan takes its routine's mood; anything else the most common mood of its exercises.
 */
export function moodFor(sessionRoutine: string, items: readonly { exerciseId: string }[]): Mood {
  if (sessionRoutine.startsWith('plan:')) {
    const routine = sessionRoutine.slice(5) as RoutineId
    if (routine in ROUTINE_MOOD) return ROUTINE_MOOD[routine]
  }
  const counts: Record<Mood, number> = { calm: 0, steady: 0, upbeat: 0 }
  for (const item of items) {
    const exercise = getExercise(item.exerciseId)
    if (exercise) counts[TECHNIQUE_MOOD[exercise.technique]]++
  }
  let best: Mood = 'calm'
  for (const m of MOODS) if (counts[m] > counts[best]) best = m
  return best
}
