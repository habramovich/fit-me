# Data Model: Exercise Library and Session Player

## Static content (in the app bundle)

### Exercise

| Field | Type | Rules |
|---|---|---|
| `id` | string | kebab-case, unique, stable (used in Firestore paths) |
| `name` | string | 1–40 chars |
| `technique` | `'yoga' \| 'taichi' \| 'strength' \| 'mobility' \| 'cardio'` | |
| `worksAreas` | `BodyArea[]` | at least 1 |
| `loadsAreas` | `BodyArea[]` | may be empty; used by the later planner |
| `equipment` | `('none' \| 'mat' \| 'chair' \| 'wall' \| 'band')[]` | at least 1 |
| `level` | `'beginner' \| 'intermediate' \| 'advanced'` | |
| `phases` | `('warmup' \| 'main' \| 'cooldown')[]` | at least 1 |
| `standard` | `Version` | required |
| `easier`, `harder` | `Version` | optional; UI says when missing (FR-003). Cardio: one version is `lowImpact: true` (FR-002b) |
| `batch` | number | 1 = owner's favourites; used by the review screen |

`BodyArea` = `neck | shoulders | upperBack | lowerBack | core | hips | glutes | hamstrings |
quads | knees | calves | ankles | wrists | chest | arms | heart` (`heart` = cardiovascular, for
cardio).

### Version

| Field | Type | Rules |
|---|---|---|
| `dose` | `RepsDose \| TimeDose` | see below (FR-002) |
| `steps` | string[] | 2–6 numbered how-to steps |
| `cues` | string[] | 2–3 short lines shown in the player |
| `breathing` | `Breathing` | required (FR-002a) |
| `figure` | `FigureSpec` | required |
| `secondsPerRep` | number | for time estimates; default 4 |
| `lowImpact` | boolean | cardio only; no jumping |

`RepsDose` = `{ kind: 'reps', reps: number, range: [min, max], sets: number, perSide: boolean }`
with `1 ≤ min ≤ reps ≤ max ≤ 50`, sets 1–5. Shown as "2 × 8 per side · 6–10 recommended".

`TimeDose` = `{ kind: 'time', seconds: number, range: [min, max], perSide: boolean }` with
`5 ≤ min ≤ seconds ≤ max ≤ 300`. Used for holds and continuous cardio. Shown as
"30 s per side · 20–45 s recommended".

`Breathing` = `{ summary: string }` plus, for repeated movements, one `'in' | 'out'` per figure
transition in `FigureSpec.breath`. `summary` is the line on the exercise page ("Breathe out as you
lift, in as you lower"; for holds and cardio a note such as "Slow breaths through the nose").

### FigureSpec

| Field | Type | Rules |
|---|---|---|
| `view` | `'side' \| 'front'` | |
| `keyframes` | `Pose[]` | 2–4; looped A→B(→C…)→A |
| `arrows` | `Arrow[][]` | one list per transition (keyframe i → i+1, last → first), 1–2 arrows each |
| `labels` | string[] | one short phrase per transition, e.g. "Lift the hips" |
| `breath` | `('in' \| 'out')[]` | one per transition, or omitted for holds and cardio (then the indicator shows `breathing.summary`) |
| `alt` | string | screen-reader description of the whole movement, including breathing |

`Pose` = `{ head, sh, hip, ctrl?, N: Limbs, F: Limbs }` with points `[x, y]` in a 250 × 180 box,
mat top at y = 152. `Limbs` = `{ el, wr, kn, an, to }`. In front view, `N`/`F` mean right/left.
`Arrow` = `{ p: [x,y], q: [x,y], bend: number }`, drawn p → q for its transition.

## Per-person data (Firestore)

### `users/{uid}/exerciseMarks/{exerciseId}`

| Field | Type | Rules |
|---|---|---|
| `mark` | `'favourite' \| 'notForMe'` | required; clearing the mark deletes the document |
| `updatedAt` | timestamp | server time |

### `users/{uid}/sessions/{sessionId}`

| Field | Type | Rules |
|---|---|---|
| `schemaVersion` | number | `1` |
| `routine` | string | `'sample'` or `'single:<exerciseId>'` |
| `startedAt` | timestamp | set at create |
| `endedAt` | timestamp \| null | set when finished; null if abandoned |
| `items` | `SessionItem[]` | ≤ 50 |

`SessionItem` = `{ exerciseId, version: 'easier'|'standard'|'harder', outcome: 'done'|'skipped',
rating: 'easy'|'right'|'hard'|null }`.

## Player state machine (client only)

```text
doing ──setDone (more sets)──▶ doing (set+1)
doing ──setDone (last set) / tick to 0 / finishEarly──▶ switchSide (if perSide and side 1) | rating
switchSide ──continue / 5 s auto──▶ doing (side 2, set 1)
rating ──rate──▶ doing (next item) | finished
any ──skip──▶ doing (next item, outcome skipped) | finished
any ──back──▶ doing (previous item, from its start); no-op on item 1
doing ──pause──▶ doing (paused) ──resume──▶ doing
app hidden ──▶ paused
```
