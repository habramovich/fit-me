# Implementation Plan: Session feedback fixes

**Branch**: `006-session-feedback` | **Date**: 2026-11-15 | **Spec**: [spec.md](spec.md)

## Summary

Three independent slices from the owner's first real sessions:

1. **Kept plans** (P1): the plan screen stores the plan's items per routine and length in
   `users/{uid}/plans/{routine}-{minutes}`. Swap, Reshuffle and an eligibility repair change the
   stored items; the first done exercise marks it used. Today offers the latest unused plan.
2. **Pace** (P2): each version resolves to Hold / Slow and controlled / Flowing / Brisk (default
   from technique and dose); the figure's timing follows it, holds stay on the held pose, and the
   pace shows as a text tag in the player and on the exercise page.
3. **Skip next time** (P2): a fourth rating button sets the existing Not for me mark; the wording
   that promises rating-driven changes goes.

Design decisions: [research.md](research.md). Data: [data-model.md](data-model.md). Contracts:
[contracts/firestore-access.md](contracts/firestore-access.md), [contracts/ui.md](contracts/ui.md).
Validation: [quickstart.md](quickstart.md).

## Technical Context

**Language/Version**: TypeScript 7 (strict), React, Vite 8

**Primary Dependencies**: Firebase 13 (Auth, Firestore with persistent cache). No new dependencies.

**Storage**: Firestore, one new subcollection `users/{uid}/plans` (rules + tests rows 36–40)

**Testing**: Vitest + React Testing Library; rules tests against the emulator

**Target Platform**: Mobile and tablet browsers (PWA-style SPA)

**Project Type**: Single-page web app

**Performance Goals**: Figure animation at display rate; no extra Firestore writes per tick

**Constraints**: Offline-capable (kept plan readable and startable from cache); no plan created
from an empty cache while a server copy may exist (research R2)

**Scale/Scope**: One owner, at most ~25 plan documents (5 routines × a few lengths)

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Spec Before Code | Pass | spec.md + checklist; two spec wordings refined during planning (FR-007, FR-010). |
| II. Smallest Useful Slice | Pass | Each story ships alone: kept plans need no pace; pace needs no storage; Skip next time reuses marks. |
| III. Simplicity / YAGNI | Pass | No dependencies. Pace is a derived default plus an optional override, not a field on 100+ versions. One provider mirrors `SetsProvider`. |
| IV. Test What Matters | Pass | Planner keep/swap/repair, pace defaults, figure timing and the player's rating are pure and unit-tested; rules rows 36–40. |
| V. Private & Synced | Pass | Plans live under `users/{uid}`, owner-only, synced, `schemaVersion: 1`. Operational surface: `firestore.rules` block + tests; deployed by the existing workflow on merge. No console or production-data changes. |

Re-checked after design: still passes; nothing for Complexity Tracking.

## Design

### US1: Kept plans

- **Planner (`src/planner/plan.ts`)**, pure:
  - `makePlan` takes `generation` instead of `shuffle`/`swaps` (seed
    `{today}|{routine}|{generation}`); the inline swap loop moves into `swapItem`.
  - `swapItem(input, items, index)` → items with slot `index` replaced by the best-scoring
    eligible candidate for its part not in the plan and not in `passed` (`passed` resets when
    exhausted); dose scaled to the slot's seconds.
  - `repairPlan(input, items)` → `{ items, notes }`: replaces or removes items that are no
    longer eligible (missing exercise or version, Not for me, avoided area, equipment, technique
    `none`).
  - Candidate pool, `eligible`, `fitsPhase` and `score` are shared by all three.
- **Repo (`src/data/repo/plans.ts`)**: `watchPlans`, `getPlan` (server-first `getDoc`),
  `savePlan` (whole document, new generation), `updatePlanItems` (items + notes),
  `markPlanViewed`, `markPlanUsed`. Writes not awaited (offline queue), as in `sets.ts`.
- **Provider (`src/app/plans.tsx` + `plansContext.ts`)**: watches plans, applies edits
  optimistically; exposes `plans`, `latestUnused`, and `useKeptPlan(routine, minutes)` which
  resolves (watched → `getPlan` → create), repairs, and returns
  `{ plan, swap(i), reshuffle() }`. `usePlan`/handoff are replaced by it.
- **Router**: `PlanParams` = `{ routine, minutes }`; tests updated.
- **Screens**: `PlanView` uses `useKeptPlan` (buttons for Swap/Reshuffle, notes, planned day);
  `Today` shows the kept-plan card; `Shell` passes the kept plan to `PlayerScreen`, waiting
  while plans load; `usePlayer(items, routine, uid, planId?)` marks the plan used on the first
  done outcome.
- **Rules**: `match /plans/{planId}` (contract), rows 36–40.

### US2: Pace

- **Content (`src/exercises/types.ts`, `index.ts`)**: `Pace`, `PACE_LABEL`, optional
  `Exercise.pace`/`Version.pace`, `FigureSpec.holdAt`, `paceOf(e, v)`. `exercises.test.ts`
  checks every version's pace against its dose.
- **Geometry (`src/figure/geometry.ts`)**: `timingFor(pace, secondsPerRep)`, `holdPhaseAt`;
  tests per pace.
- **Figure**: takes `pace` and `secondsPerRep`; reduced motion keeps step-through, holds still.
  `still` (renders) and `thumbnail` unchanged.
- **Screens**: `PaceTag` in `parts.tsx`, shown in `PlayerScreen` and `ExerciseDetail`; both
  pass the pace to `<Figure>`. `Review` passes it too.

### US3: Skip next time

- `machine.ts`: `rate` accepts `rating: Rating | null`.
- `PlayerScreen`: fourth button; `setMark(id, 'notForMe')`; 6 s notice; hints and finish-screen
  line updated; `PlayerScreen.test.tsx` covers it.

## Project Structure

### Documentation (this feature)

```text
specs/006-session-feedback/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── firestore-access.md
│   └── ui.md
├── checklists/requirements.md
└── tasks.md              # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/            plans.tsx, plansContext.ts (new); Shell.tsx, router.ts (+ test)
├── data/repo/      plans.ts (new)
├── exercises/      types.ts, index.ts, exercises.test.ts
├── figure/         geometry.ts (+ test), Figure.tsx
├── planner/        plan.ts (+ test), usePlan.ts (removed or reduced to useHistory)
├── player/         machine.ts (+ test), usePlayer.ts, PlayerScreen.tsx (+ test)
└── screens/        PlanView.tsx (+ test), Today.tsx, ExerciseDetail.tsx, Review.tsx, parts.tsx
firestore.rules
tests/rules/firestore.rules.test.ts
```

**Structure Decision**: The existing single-app layout; Firestore stays behind `src/data/repo/`.

## Complexity Tracking

None.
