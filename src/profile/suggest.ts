// Suggested defaults during setup (spec 003 FR-002). Suggestions are pre-selected and removable.
import { TECHNIQUES, type Technique } from '../exercises/types'
import type { Goal, Profile } from './types'

const OLDER = new Set(['50s', '60s', '70plus'])

/** Goals suggested from age range and sex. */
export function suggestGoals(p: Pick<Profile, 'ageRange' | 'sex'>): Goal[] {
  const goals: Goal[] = ['mobility']
  if (p.ageRange && OLDER.has(p.ageRange)) goals.push('strength', 'balance', 'boneStrength')
  else if (p.ageRange === '40s')
    goals.push('strength', p.sex === 'woman' ? 'boneStrength' : 'flexibility')
  else goals.push('strength')
  return [...new Set(goals)]
}

/** How much each goal points to each technique. */
const GOAL_WEIGHTS: Record<Goal, Partial<Record<Technique, number>>> = {
  mobility: { mobility: 4, yoga: 2, stretching: 1 },
  flexibility: { yoga: 3, stretching: 3, mobility: 1 },
  stressRelief: { yoga: 1.5, taichi: 1.5 },
  balance: { taichi: 1, strength: 0.5 },
  strength: { strength: 2 },
  boneStrength: { strength: 1 },
  posture: { mobility: 1, yoga: 1, stretching: 1 },
  energy: { cardio: 2 },
}

/**
 * Technique amounts suggested from goals: the two techniques the goals point to most get "Lots",
 * everything else "Some" (so nothing is switched off by a suggestion).
 */
export function suggestTechniques(goals: Goal[]): Profile['techniques'] {
  const score = Object.fromEntries(TECHNIQUES.map((t) => [t, 0])) as Record<Technique, number>
  for (const g of goals)
    for (const [t, w] of Object.entries(GOAL_WEIGHTS[g])) score[t as Technique] += w
  // Ties keep the TECHNIQUES order.
  const top = [...TECHNIQUES]
    .filter((t) => score[t] > 0)
    .sort((a, b) => score[b] - score[a])
    .slice(0, 2)
  return Object.fromEntries(
    TECHNIQUES.map((t) => [t, top.includes(t) ? 'lots' : 'some']),
  ) as Profile['techniques']
}
