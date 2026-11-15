# Data Model: Profile and Session Planner

## `users/{uid}.profile` (map)

| Field | Type | Default |
|---|---|---|
| `schemaVersion` | number | 1 |
| `setupDone` | boolean | false |
| `ageRange` | `'u30' \| '30s' \| '40s' \| '50s' \| '60s' \| '70plus' \| null` | null |
| `sex` | `'woman' \| 'man' \| null` | null |
| `goals` | `Goal[]` — `mobility, strength, balance, boneStrength, flexibility, stressRelief, posture, energy` | [] |
| `focusAreas` | `BodyArea[]` | [] |
| `goEasyAreas` | `BodyArea[]` | [] |
| `avoidAreas` | `BodyArea[]` | [] |
| `techniques` | `Record<Technique, 'none' \| 'some' \| 'lots'>` | all `some` |
| `level` | `'beginner' \| 'intermediate' \| 'advanced'` | beginner |
| `equipment` | `('mat' \| 'chair' \| 'wall' \| 'band')[]` | mat, chair, wall |
| `tryNew` | `'favourites' \| 'mix' \| 'new'` | mix |
| `routineMinutes` | `Record<RoutineId, number>` | calm 15, desk 5, strength 20, weekend 35, cardio 15 |

A body area may be in at most one of `goEasyAreas` / `avoidAreas` (the UI enforces it).

## Exercise additions (static)

| Field | Type |
|---|---|
| `position` | `'standing' \| 'seated' \| 'kneeling' \| 'lying'` |
| `intensity` | `'gentle' \| 'moderate' \| 'vigorous'` |
| `tags` | `('breathing' \| 'balance' \| 'boneLoading')[]` |
| `Version.position` | optional override |

## Plan (client only, not stored)

```ts
type RoutineId = 'calm' | 'desk' | 'strength' | 'weekend' | 'cardio'
interface PlanItem { exerciseId; version: VersionKey; dose: Dose; phase: Phase; reason: string; seconds: number }
type PlanResult =
  | { kind: 'plan'; items: PlanItem[]; totalSeconds: number }
  | { kind: 'insufficient'; routine: RoutineId; suggestion: RoutineId | null }
```

Sessions (002) record `routine: 'plan:<routineId>'` for planned sessions.
