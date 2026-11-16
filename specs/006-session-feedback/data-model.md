# Data model: Session feedback fixes

## Kept plan (new) — `users/{uid}/plans/{planId}`

`planId` = `{routine}-{minutes}`, e.g. `calm-15`. One document per routine and length.

| Field | Type | Notes |
|---|---|---|
| `schemaVersion` | number | `1` |
| `routine` | RoutineId | `calm`, `desk`, `strength`, `weekend`, `cardio` |
| `minutes` | number | 5–90, the length asked for |
| `generation` | number | Seed counter: `0` for the first plan, +1 per Reshuffle or new plan after use |
| `items` | KeptItem[] | 1–40, in session order |
| `notes` | string[] | What the last repair changed; `[]` otherwise |
| `shortOfTime` | boolean | As the planner reported it |
| `plannedAt` | timestamp | When this generation was made |
| `viewedAt` | timestamp | Last time the plan screen showed it (Today offers the latest) |
| `usedAt` | timestamp \| null | Set on the first exercise done in a session from it |
| `sessionId` | string \| null | That session |

**KeptItem**: the planner's `PlanItem` (`exerciseId`, `version`, `dose`, `phase`, `reason`,
`seconds`) plus `passed: string[]`: exercises already swapped away from this slot. No field may
be `undefined` (Firestore rejects it); absent lists are `[]`.

**State transitions**

```text
(none) --show plan--> kept --swap/repair--> kept (items changed, same generation)
kept --reshuffle--> kept (new items, generation+1, notes [])
kept --first exercise done--> used
used --show plan--> kept (new items, generation+1)
```

Writes: create/replace the whole document only for a new generation; Swap, repair, `viewedAt`
and `usedAt` update only their own fields (lessons: last-writer-wins on whole documents).

## Exercise content (changed)

- `Pace` = `'hold' | 'slow' | 'flowing' | 'brisk'`, with `PACE_LABEL` = Hold, Slow and
  controlled, Flowing, Brisk.
- `Exercise.pace?` and `Version.pace?`: optional overrides; `paceOf(e, v)` gives the default
  (research R5).
- `FigureSpec.holdAt?`: the keyframe a hold stays on (default `1`).

## Player (changed)

- The `rate` event accepts `rating: Rating | null`; `null` from Skip next time records the item
  as done with no rating.
- `usePlayer` takes an optional `planId`; on the first done outcome it marks that plan used.

## Routes (changed)

- `PlanParams` = `{ routine, minutes }`. `s` and `w` in old links are ignored.
- `#/player?routine=plan&r=…&m=…` plays the kept plan for that routine and length.

## Existing, unchanged

- `exerciseMarks/{id}`: `notForMe` is now also written from the rating sheet.
- `sessions/{id}`: unchanged; items done via Skip next time have `rating: null`.
