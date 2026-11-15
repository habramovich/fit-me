// Profile model. See specs/003-profile-planner/data-model.md.
import type { BodyArea, Equipment, Level, Phase, Technique } from '../exercises/types'

export type AgeRange = 'u30' | '30s' | '40s' | '50s' | '60s' | '70plus'
export type Sex = 'woman' | 'man'
export type Goal =
  | 'mobility'
  | 'strength'
  | 'balance'
  | 'boneStrength'
  | 'flexibility'
  | 'stressRelief'
  | 'posture'
  | 'energy'
export type Amount = 'none' | 'some' | 'lots'
export type TryNew = 'favourites' | 'mix' | 'new'
export type RoutineId = 'calm' | 'desk' | 'strength' | 'weekend' | 'cardio'
export type HomeEquipment = Exclude<Equipment, 'none'>

export const PROFILE_SCHEMA_VERSION = 1

export interface Profile {
  schemaVersion: number
  setupDone: boolean
  ageRange: AgeRange | null
  sex: Sex | null
  goals: Goal[]
  focusAreas: BodyArea[]
  goEasyAreas: BodyArea[]
  avoidAreas: BodyArea[]
  techniques: Record<Technique, Amount>
  level: Level
  equipment: HomeEquipment[]
  tryNew: TryNew
  routineMinutes: Record<RoutineId, number>
  /** Parts the person likes each exercise in, by exercise id (004). Missing = no preference. */
  phasePrefs: Record<string, Phase[]>
}

export const DEFAULT_PROFILE: Profile = {
  schemaVersion: PROFILE_SCHEMA_VERSION,
  setupDone: false,
  ageRange: null,
  sex: null,
  goals: [],
  focusAreas: [],
  goEasyAreas: [],
  avoidAreas: [],
  techniques: { yoga: 'some', taichi: 'some', strength: 'some', mobility: 'some', cardio: 'some' },
  level: 'beginner',
  equipment: ['mat', 'chair', 'wall'],
  tryNew: 'mix',
  routineMinutes: { calm: 15, desk: 5, strength: 20, weekend: 35, cardio: 15 },
  phasePrefs: {},
}

/** Fills missing fields with defaults (older or partial records). */
export function withDefaults(stored: Partial<Profile> | null | undefined): Profile {
  const p = stored ?? {}
  return {
    ...DEFAULT_PROFILE,
    ...p,
    techniques: { ...DEFAULT_PROFILE.techniques, ...(p.techniques ?? {}) },
    routineMinutes: { ...DEFAULT_PROFILE.routineMinutes, ...(p.routineMinutes ?? {}) },
    phasePrefs: { ...(p.phasePrefs ?? {}) },
  }
}

export const AGE_LABEL: Record<AgeRange, string> = {
  u30: 'Under 30',
  '30s': '30–39',
  '40s': '40–49',
  '50s': '50–59',
  '60s': '60–69',
  '70plus': '70+',
}

export const GOAL_LABEL: Record<Goal, string> = {
  mobility: 'Mobility',
  strength: 'Strength',
  balance: 'Balance',
  boneStrength: 'Bone strength',
  flexibility: 'Flexibility',
  stressRelief: 'Stress relief',
  posture: 'Posture',
  energy: 'Energy',
}

export const AMOUNT_LABEL: Record<Amount, string> = { none: 'None', some: 'Some', lots: 'Lots' }

export const TRY_NEW_LABEL: Record<TryNew, string> = {
  favourites: 'Mostly favourites',
  mix: 'A mix',
  new: 'Mostly new',
}

export const EQUIPMENT_LABEL: Record<HomeEquipment, string> = {
  mat: 'Mat',
  chair: 'Chair',
  wall: 'Free wall space',
  band: 'Resistance band',
}
