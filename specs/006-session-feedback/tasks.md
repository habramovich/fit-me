---
description: "Task list for 006-session-feedback"
---

# Tasks: Session feedback fixes

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Included. Constitution IV requires unit tests for domain logic (planner, pace, figure
timing, player machine) and a rules test row for each new Firestore path.

No setup or foundational phase: the three stories touch separate code and each ships alone.
Run Vitest from PowerShell (`npm.cmd test`).

## Phase 1: User Story 1 - The session I reviewed is the session I do (P1) 🎯 MVP

**Goal**: A shown plan is kept per routine and length (synced), changes only by Swap, Reshuffle
or an eligibility repair, and is used up by the first done exercise.

**Independent Test**: Plan Calm morning 15 min, reload on another day or browser profile: same
plan; Today offers it (quickstart 1–4).

### Planner (pure)

- [X] T001 [US1] Refactor `src/planner/plan.ts`: `PlanInput` takes `generation: number` instead of `shuffle`/`swaps` (seed `` `${today}|${routine}|${generation}` ``); export a `KeptItem` type (= `PlanItem` + `passed: string[]`); extract the candidate pool, `eligible`, `fitsPhase` and `score` into helpers shared by `makePlan`, `swapItem` and `repairPlan`; remove the inline swaps loop. `makePlan` returns items with `passed: []`.
- [X] T002 [US1] Add `swapItem(input, items, index): KeptItem[]` to `src/planner/plan.ts`: replace slot `index` with the best-scoring eligible candidate for its `phase` (relaxed `fitsPhase`, `Usage.canUse` against the other items) that isn't in that slot's `passed`; append the old exercise id to `passed`; when every candidate is passed, reset `passed` to `[old id]` and choose again; scale the new dose to the slot's `seconds` with `scaleDose(..., phase === 'main')`; no-op when there's no alternative.
- [X] T003 [US1] Add `repairPlan(input, items): { items: KeptItem[]; notes: string[] }` to `src/planner/plan.ts`: an item is ineligible when its exercise or version is missing from the library, it's marked `notForMe`, it loads an avoided area, needs equipment the profile lacks, or its technique is `none`. Replace each one as in `swapItem` (or remove it when nothing fits, unless it's the only item); other items stay identical. Note text, e.g. "Child’s pose is now Not for me, so it was swapped for Puppy pose." / "Wall sit no longer fits your profile, so it was swapped for …" / "… was removed: nothing else fits that part."
- [X] T004 [US1] Update `src/planner/plan.test.ts`: replace shuffle/swaps cases with `generation` (same inputs → same plan; generation+1 → different seed); `swapItem` (the slot changes, others don't, `passed` cycles, dose fits the slot's time); `repairPlan` (Not for me item replaced with a note and the rest unchanged; avoided area; missing exercise id; nothing fits → removed; an all-eligible plan returns the same items and no notes).

### Storage and rules

- [X] T005 [P] [US1] Add the rules block from [contracts/firestore-access.md](contracts/firestore-access.md) to `firestore.rules` (`match /plans/{planId}`: owner read/delete; create/update require `routine in ['calm','desk','strength','weekend','cardio']`, `minutes is number` with `5 <= minutes <= 90`, `items is list` with `1 <= size <= 40`).
- [X] T006 [P] [US1] Add rows 36–40 to `tests/rules/firestore.rules.test.ts` in a `describe('kept plans (006 rows 36–40)')` block; keep row 28 off the `plans` path. Run `npm.cmd run test:rules`.
- [X] T007 [P] [US1] Create `src/data/repo/plans.ts` (pattern: `sets.ts`): `KEPT_PLAN_SCHEMA_VERSION = 1`; `KeptPlan` = `{ id, routine, minutes, generation, items: KeptItem[], notes: string[], shortOfTime, plannedAt: Date | null, viewedAt: Date | null, usedAt: Date | null, sessionId: string | null }`; `planId(routine, minutes)` = `` `${routine}-${minutes}` ``; `watchPlans(uid, onData, onError)`; `getPlan(uid, id)` with `getDoc` (server first, cache offline; null when missing); `savePlan(uid, plan)` (whole document, `schemaVersion`, server timestamps for `plannedAt`/`viewedAt`, `usedAt: null`, `sessionId: null`); `updatePlanItems(uid, id, items, notes)`; `markPlanViewed(uid, id)`; `markPlanUsed(uid, id, sessionId)`. Writes are not awaited (`.catch(() => {})`). Never write `undefined` fields.

### State and screens

- [X] T008 [US1] Create `src/app/plansContext.ts` and `src/app/plans.tsx` (pattern: `setsContext.ts`/`sets.tsx`): `PlansProvider` watches plans and patches optimistically; exposes `plans: KeptPlan[] | null`, `latestUnused` (unused plan with the latest `viewedAt`), and `useKeptPlan(routine, minutes, profile, history)` returning `{ status: 'loading' } | { status: 'insufficient', suggestion } | { status: 'ready', plan, swap(i), reshuffle() }`. Resolution: watched unused plan → else `getPlan` → if missing or used, `makePlan` with `generation` = previous + 1 (0 when none) and `savePlan`; then `repairPlan` and, if it changed anything, `updatePlanItems`. `swap`/`reshuffle` update state and Firestore (`notes` cleared). Mount `PlansProvider` in `src/app/Shell.tsx` next to `SetsProvider`.
- [X] T009 [US1] `src/app/router.ts` + `src/app/router.test.ts`: `PlanParams` = `{ routine, minutes }`; drop `s`/`w` from `planQuery`; old links with `s`/`w` parse without error.
- [X] T010 [US1] `src/screens/PlanView.tsx`: use `useKeptPlan`; Swap and Reshuffle become buttons calling `swap(i)`/`reshuffle()`; show `notes` above the list; "Planned {day}" under the title when `plannedAt` isn't today; call `markPlanViewed` once per mount; Start → `#/player?routine=plan&r=&m=`. Update `src/screens/PlanView.test.tsx` (kept plan shown; Swap changes one item; notes shown).
- [X] T011 [US1] `src/screens/Today.tsx`: card above "What kind of session?" for `latestUnused` per [contracts/ui.md](contracts/ui.md) ("Your planned session", routine · minutes, "Planned {day}" when not today, notes, Review and Start buttons).
- [X] T012 [US1] Player: in `src/app/Shell.tsx` pass the kept plan's items and id to `PlayerScreen` for `routine=plan` (show "Loading…" while `plans` is null; if there's no kept plan, resolve one as in T008); in `src/player/PlayerScreen.tsx` remove the `makePlan`/handoff path; `src/player/usePlayer.ts` takes optional `planId` and calls `markPlanUsed(uid, planId, sessionId)` once on the first `done` outcome. Delete the plan/handoff parts of `src/planner/usePlan.ts` (keep `useHistory`).
- [X] T013 [US1] Check `npm.cmd test`, `npm.cmd run build` and quickstart 1–4 in the browser at phone and tablet widths, including a second browser profile for sync.

**Checkpoint**: US1 is shippable alone.

---

## Phase 2: User Story 2 - The figure shows how fast to move (P2)

**Goal**: Each version has a pace (Hold, Slow and controlled, Flowing, Brisk); the figure moves
at it and the player and exercise page show it in text.

**Independent Test**: Child's pose, Glute bridge, Wave hands like clouds, March in place each
show their pace tag and visibly different motion (quickstart 5).

- [X] T014 [P] [US2] `src/exercises/types.ts`: `type Pace = 'hold' | 'slow' | 'flowing' | 'brisk'`; `PACE_LABEL` = Hold, Slow and controlled, Flowing, Brisk; optional `pace?: Pace` on `Exercise` and `Version`; optional `holdAt?: number` on `FigureSpec` ("the keyframe a hold stays on; default 1").
- [X] T015 [US2] `src/exercises/index.ts`: `paceOf(e, v)` = `v.pace ?? e.pace ??` default: time+cardio → brisk; time+taichi → flowing; time+other → hold; reps+(taichi or tag `breathing`) → flowing; reps → slow.
- [X] T016 [US2] `src/exercises/exercises.test.ts`: for every version, `hold` ⇒ time dose; reps dose ⇒ `secondsPerRep` set; `brisk` ⇒ technique cardio; `holdAt` (when set) < keyframe count. Spot checks: childs-pose hold, glute-bridge slow, wave-hands-like-clouds flowing, march-in-place brisk, cat-cow flowing.
- [X] T017 [P] [US2] `src/figure/geometry.ts`: `timingFor(pace, secondsPerRep?, count)` per research R6 (slow: transition = spr/count, ¾ move ¼ pause; flowing: no pause, spr/count or 2.5 s for time doses; brisk: 0.5 s, no pause; hold: 1.5 s move + 0.5 s pause); `holdPhaseAt(elapsed, holdAt, timing)` plays transitions 0…holdAt−1 once, then returns the held pose with `moving: false`. Tests in `src/figure/geometry.test.ts`: slow cycle = secondsPerRep; brisk cycle ≤ 1 s for 2 poses; flowing never has a pause; a hold stays on `holdAt` after entry.
- [X] T018 [US2] `src/figure/Figure.tsx`: props `pace?: Pace` and `secondsPerRep?: number`; use `holdPhaseAt` for holds (no arrows or move label once held; breathing line shown) and `phaseAt` with `timingFor` otherwise; reduced motion keeps the 2.5 s step-through, except holds, which show `holdAt` still; `still` and `thumbnail` unchanged.
- [X] T019 [US2] Add `PaceTag` to `src/screens/parts.tsx` (text, next to `TechniqueTag`); show it and pass `pace`/`secondsPerRep` to `<Figure>` in `src/player/PlayerScreen.tsx`, `src/screens/ExerciseDetail.tsx` and `src/screens/Review.tsx`.
- [X] T020 [US2] Check in the browser (quickstart 5) at phone and tablet widths, with reduced motion on and off; watch every hold's player figure to confirm `holdAt` = 1 shows the right pose, and set `holdAt` in a figure file where it doesn't.

**Checkpoint**: US2 is shippable alone.

---

## Phase 3: User Story 3 - "Skip next time" when rating (P2)

**Goal**: A fourth rating choice sets Not for me; no text promises rating-driven changes.

**Independent Test**: Skip next time in a session → session continues, notice shows, the Library
shows Not for me, new plans exclude it (quickstart 6).

- [X] T021 [P] [US3] `src/player/machine.ts`: the `rate` event takes `rating: Rating | null`; add a case to `src/player/machine.test.ts` (null → outcome done, rating null, `summary.rated` unchanged).
- [X] T022 [US3] `src/player/PlayerScreen.tsx` per [contracts/ui.md](contracts/ui.md): Skip next time button (hint "Not for me: won’t be suggested again") → `setMark(id, 'notForMe')` from `useMarks()` and `rate` with `null`; notice "{name} won’t be suggested again. Undo from its page in the Library." for 6 s or until dismissed; remove the "More next time" / "Easier next time" / "Keep it" hints; finish line "Ratings are saved; you’ll see them in Progress."
- [X] T023 [US3] `src/player/PlayerScreen.test.tsx`: Skip next time calls `setMark` with `notForMe`, moves on, shows the notice; the finish screen no longer mentions the planner.

**Checkpoint**: US3 is shippable alone.

---

## Phase 4: Polish

- [X] T024 Update `AGENTS.md`: Adding exercises → pace comes from technique and dose (`paceOf`), set `pace` or `figure.holdAt` only for exceptions; layout → `src/app/plans.tsx`; lesson: a plan the person has seen is stored, never re-derived.
- [X] T025 `npm.cmd run lint`, `npm.cmd run format -- <changed files>`, `npm.cmd test`, `npm.cmd run test:rules`, `npm.cmd run build`; walk the whole of [quickstart.md](quickstart.md).
- [ ] T026 ⏸ Owner: PR, CI, merge (deploys hosting and the new rules).

---

## Dependencies & Execution Order

- **US1**: T001 → T002 → T003 → T004 (same file). T005, T006, T007 in parallel with the planner
  work. T008 needs T001–T003 and T007; T009 before T010 and T012; T010–T012 need T008; T013 last.
- **US2**: T014 → T015 → T016; T017 in parallel with T015/T016; T018 needs T014 and T017; T019
  needs T015 and T018; T020 last.
- **US3**: T021 → T022 → T023.
- The stories are independent. US2 and US3 both edit `PlayerScreen.tsx` (different parts), as
  does US1 (T012); do them one after another to avoid conflicts.
- Polish after the stories being shipped.

## Parallel Examples

```text
US1: T005 (rules) | T006 (rules tests) | T007 (repo) | T001–T004 (planner)
US2: T014 + T015 + T016 (content) | T017 (geometry)
US3: T021 (machine) alongside any US2 task
```

## Implementation Strategy

1. **MVP = US1** (the most frustrating issue): T001–T013, then stop and check with the owner.
2. **US3** next: three tasks, an immediate win in every session.
3. **US2**: pace, then the owner reviews every hold in the player.
4. Each story can go out in its own PR if the owner prefers smaller deploys.
