// The five routines and their character (spec FR-009, research R2).
import type { BodyArea, Equipment, Intensity, Phase, Position, Technique } from '../exercises/types'
import type { RoutineId } from '../profile/types'

export interface RoutineDef {
  id: RoutineId
  name: string
  hint: string
  /** Share of the time for warm-up, main, cool-down. */
  shares: Record<Phase, number>
  intensities: Intensity[]
  /** Allowed positions; undefined = any. */
  positions?: Position[]
  /** Allowed equipment; undefined = whatever the person has. */
  equipment?: Equipment[]
  /** Extra weight for these techniques. */
  techniqueBoost: Partial<Record<Technique, number>>
  /** Extra weight for exercises that work these areas. */
  areaBoost: BodyArea[]
  /** Main part must be only these techniques (Cardio). */
  mainTechniques?: Technique[]
  /** Target seconds per exercise: fewer, longer exercises for calmer routines. */
  pace: number
}

export const ROUTINES: Record<RoutineId, RoutineDef> = {
  calm: {
    id: 'calm',
    pace: 100,
    name: 'Calm morning',
    hint: 'Breath, gentle yoga, tai chi',
    shares: { warmup: 0.3, main: 0.5, cooldown: 0.2 },
    intensities: ['gentle'],
    techniqueBoost: { yoga: 1, taichi: 1, mobility: 1, strength: -3 },
    areaBoost: [],
  },
  desk: {
    id: 'desk',
    pace: 60,
    name: 'Desk break',
    hint: 'Standing or seated reset',
    shares: { warmup: 0.2, main: 0.6, cooldown: 0.2 },
    intensities: ['gentle', 'moderate'],
    positions: ['standing', 'seated'],
    equipment: ['none', 'chair', 'wall'],
    techniqueBoost: { mobility: 1 },
    areaBoost: ['hips', 'upperBack', 'chest', 'neck', 'shoulders'],
  },
  strength: {
    id: 'strength',
    pace: 90,
    name: 'Strength keeper',
    hint: 'Legs, back, balance',
    shares: { warmup: 0.2, main: 0.65, cooldown: 0.15 },
    intensities: ['gentle', 'moderate'],
    techniqueBoost: { strength: 1 },
    areaBoost: ['quads', 'glutes', 'hamstrings', 'upperBack', 'core'],
  },
  weekend: {
    id: 'weekend',
    pace: 110,
    name: 'Weekend longer',
    hint: 'A fuller mix, more tai chi',
    shares: { warmup: 0.2, main: 0.6, cooldown: 0.2 },
    intensities: ['gentle', 'moderate'],
    techniqueBoost: { taichi: 1 },
    areaBoost: [],
  },
  cardio: {
    id: 'cardio',
    pace: 90,
    name: 'Cardio',
    hint: 'Heart rate up, low impact',
    shares: { warmup: 0.2, main: 0.6, cooldown: 0.2 },
    intensities: ['gentle', 'moderate'],
    techniqueBoost: {},
    areaBoost: [],
    mainTechniques: ['cardio'],
  },
}

export const ROUTINE_ORDER: RoutineId[] = ['calm', 'desk', 'strength', 'weekend', 'cardio']

/** Pre-selected routine by time of day (spec US3). */
export function routineForTime(now: Date): RoutineId {
  const day = now.getDay()
  const hour = now.getHours()
  const weekend = day === 0 || day === 6
  if (weekend && hour < 13) return 'weekend'
  if (hour < 11) return 'calm'
  if (!weekend && hour < 17) return 'desk'
  return 'calm'
}
