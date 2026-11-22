---
description: "Tasks for the exercise feedback round (011)"
---

# Tasks: Exercise feedback round

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md), [quickstart.md](quickstart.md)

**Tests**: Included. The constitution (IV) asks for unit tests alongside domain logic, plus a few
high-value component tests.

**Organization**: One phase per user story, in priority order. The stories are independent, except
that US6 reuses the full-figure layout from US1.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

No setup: no new dependency, no new config. The branch `011-exercise-feedback` exists.

## Phase 2: Foundational

No shared prerequisite: each story touches its own modules.

---

## Phase 3: User Story 1 - A player screen that stays still (P1) 🎯 MVP

**Goal**: Nothing below the figure moves while an exercise plays.

**Independent Test**: Play Cat-cow and a hold at 390 × 844. The title, count and buttons don't move
through several movements, the hold reaching its pose, or pause/resume.

- [X] T001 [US1] In `src/figure/Figure.tsx`, always render the full figure's `figcaption.fm-figure__label` (empty when `label` is null, with `aria-hidden` when empty) so its space never disappears; keep the "Next: " prefix logic
- [X] T002 [US1] In `src/figure/Figure.css`, give `.fm-figure__breath` a fixed height (chip or two lines of 14px text), clamp `.fm-breath--note` to 2 lines, and give `.fm-figure__label` a fixed height of two lines with `-webkit-line-clamp: 2` and an ellipsis (text kept in the DOM); thumbnails unaffected
- [X] T003 [US1] In `src/player/PlayerScreen.tsx` and `src/player/player.css`, give `.player__count` a minimum width and a no-wrap detail line; always render the Paused note and toggle it with `visibility`; render the notice as a floating toast above the controls (fixed position) instead of in the flow
- [X] T004 [P] [US1] Add a test to `src/figure/Figure.test.tsx`: a full figure always has a caption element (also for a hold at its pose), and a thumbnail has none

**Checkpoint**: Check at phone and tablet widths in the browser (quickstart US1).

---

## Phase 4: User Story 2 - Time to get ready before a timed exercise (P1)

**Goal**: A 5-second Get ready countdown (with Start now) before every timed exercise.

**Independent Test**: Quickstart US2. A set of timed → reps → timed per-side items shows Get ready
before items 1 and 3 only, and the clock stays full until Get ready ends.

- [X] T005 [US2] In `src/player/machine.ts`: add `'getReady'` to `PlayerPhase`, `{ type: 'startNow' }` to `PlayerEvent`, and `export const GET_READY_SECONDS = 5`. `goTo` enters `getReady` (remaining 5) for a timed item and `doing` for a reps item. A tick in `getReady` counts down; at ≤ 1, or on `startNow`, go to `doing` with `remaining = dose.seconds`. `pause`/`hidden` also pause `getReady`. Elapsed counts as in other phases.
- [X] T006 [US2] Update `src/player/machine.test.ts`: existing timed-exercise tests pass through Get ready first. New cases: the first timed item starts in `getReady`; the clock stays full during it; it ends after 5 ticks; `startNow` starts at once; pause stops it; skip/back work from it; a reps item has no Get ready; the second side uses `switchSide`, not Get ready; elapsed includes the Get ready seconds.
- [X] T007 [US2] In `src/sound/cues.ts`: `switch` when entering `getReady` (as for `switchSide`); `start` whenever `next.phase === 'doing'` and either the phase or the exercise changed (covers new reps items, the end of Get ready, and side 2). Update `src/sound/cues.test.ts` for the new sequence (switch → start → ticks → chime) and keep the switch-side case.
- [X] T008 [US2] In `src/player/PlayerScreen.tsx`, add a Get ready `Sheet` (title "Get ready"; text "<name> starts in N s."; primary button "Start now" dispatching `startNow`), like the Switch sides sheet. Check `src/player/useSessionSound.ts` and `src/player/usePlayer.ts` for phase assumptions (music and wake lock keep running in `getReady`).
- [X] T009 [P] [US2] Update `src/player/PlayerScreen.test.tsx`: a timed item shows the Get ready sheet, and Start now hides it and shows the full clock; fix existing tests that expect a timed clock to tick immediately.

**Checkpoint**: Quickstart US2 in the browser.

---

## Phase 5: User Story 3 - Choose my own reps, sets and seconds in a set (P1)

**Goal**: Inline steppers per set item for reps and sets, or seconds, with a recommended-range hint.

**Independent Test**: Quickstart US3. Values persist and sync, the player uses them, and the set's
minutes update.

- [X] T010 [US3] In `src/sets/edit.ts`, add `DOSE_LIMITS` ("reps 1–50 step 1, sets 1–5 step 1, seconds 10–600 step 5"), `stepDose(dose, field: 'reps' | 'sets' | 'seconds', delta: 1 | -1): Dose` (clamps; keeps `range`, `perSide`, `repsNote`; a field that doesn't fit the dose kind returns the dose unchanged), `withDose(items, index, dose): SetItem[]`, and `inRange(dose): boolean`
- [X] T011 [P] [US3] Add tests to `src/sets/edit.test.ts`: stepping within, at and beyond the limits; the 5-second step; kept fields; `withDose` changes one item only; `inRange` at its edges
- [X] T012 [US3] In `src/screens/SetView.tsx`, make each row's dose text a button (`aria-expanded`, label "Change <name> amount") that opens an inline editor under the row: steppers for Reps and Sets (reps doses) or Seconds (time doses), each with − / value / + (min/max disable the buttons), the hint "Recommended a–b" (or "a–b s"), emphasised when `!inRange`, and "per side" noted for per-side doses. Open one row at a time. Each step calls `saveItems(id, withDose(...))`. No editor for an exercise that no longer exists. Add styles in `src/app/app.css`.
- [X] T013 [P] [US3] Add a test to `src/screens/SetView.test.tsx`: open a rep item's editor, tap + on reps and on sets, and `saveItems` receives the new dose. A timed item steps by 5 s. The out-of-range hint gets its emphasis class.

**Checkpoint**: Quickstart US3; check the editor at phone width.

---

## Phase 6: User Story 4 - Stretching is its own category (P2)

**Goal**: Stretching is a sixth technique everywhere techniques appear.

**Independent Test**: Quickstart US4. The filters return exactly the 9 and 10 listed; the profile
amount is inherited from Mobility.

- [X] T014 [US4] In `src/exercises/types.ts`, add `'stretching'` to `Technique`, put it after `mobility` in `TECHNIQUES`, and add `TECHNIQUE_LABEL.stretching = 'Stretching'`
- [X] T015 [P] [US4] Change `technique: 'mobility'` to `'stretching'` in `src/exercises/data/`: calf-stretch.ts, cross-body-shoulder-stretch.ts, hamstring-stretch.ts, neck-side-stretch.ts, seated-spinal-twist.ts, side-lunge-stretch.ts, standing-side-stretch.ts, standing-thigh-stretch.ts, upper-back-hug.ts
- [X] T016 [P] [US4] In `src/index.css`, add `--stretching-bg/--stretching-fg` (fg passes 4.5:1 on bg) and `--chart-stretching`; add `.tag--stretching` in `src/app/app.css` and `.prog-fill--stretching` (plus a legend swatch if colours are listed per technique) in `src/progress/progress.css`
- [X] T017 [P] [US4] In `src/sound/mood.ts`, map `stretching: 'calm'`
- [X] T018 [US4] In `src/profile/types.ts`, set `DEFAULT_PROFILE.techniques.stretching = 'some'`; in `withDefaults`, a missing `techniques.stretching` takes the stored `techniques.mobility`, else `'some'`. Add tests to `src/profile/types.test.ts` (missing → mobility's amount, incl. `'none'`; present → kept).
- [X] T019 [US4] In `src/profile/suggest.ts`, set goal weights: flexibility `{ yoga: 3, stretching: 3, mobility: 1 }`, mobility adds `stretching: 1`, posture adds `stretching: 1`. Add a test to `src/profile/suggest.test.ts` that Flexibility gives Stretching "Lots"; the existing tests still pass.
- [X] T020 [US4] In `src/planner/routines.ts`, give `stretching` the same boost as `mobility` wherever `techniqueBoost` lists mobility. In `src/planner/plan.ts` `coverAdjustment`, a strength class also boosts `stretching`. Update `src/planner/plan.test.ts` (`TECHS`, profile fixtures) and add a test: a strength-class day raises stretching too; Stretching "none" excludes stretching exercises.
- [X] T021 [US4] Fix the remaining compile errors and fixtures across `src/` (e.g. `src/screens/PlanView.test.tsx` techniques maps, `src/screens/profileSections.tsx` lists); check that the Library filter, Profile techniques, the Schedule class type and Progress show Stretching
- [X] T022 [US4] Add a test to `src/exercises/exercises.test.ts` that the Stretching and Mobility filters return exactly the ids listed in spec US4 (mobility also includes `standing-torso-twist` once batch 7 lands)

**Checkpoint**: Quickstart US4.

---

## Phase 7: User Story 5 - Superman and Standing torso twist (P2)

**Goal**: Two new exercises in batch 7.

**Independent Test**: Quickstart US5; `npm test` validates both; the renders look right.

- [X] T023 [P] [US5] Create `src/exercises/data/superman.ts`. Strength; lying; mat; side view, head left; reps range [6, 12], target 8, 2 sets; `secondsPerRep` ≈ 5. worksAreas lowerBack, glutes, upperBack, shoulders; loadsAreas lowerBack; phases main; moderate; beginner; batch 7. Breath: in to lift, out to lower. Easier: opposite arm and leg (alternating keyframes). Harder: longer hold, fewer reps.
- [X] T024 [P] [US5] Create `src/exercises/data/standing-torso-twist.ts`. Mobility; standing; equipment none; front view; time range [30, 60], target 40; `pace: 'flowing'` set explicitly. worksAreas core, upperBack, shoulders; phases warmup; gentle; beginner; batch 7. Keyframes: arms out → turn to one side (back heel lifts) → turn to the other side; curved arrows at hand height and a label per transition. Easier: smaller turn with the feet planted.
- [X] T025 [US5] Register both in `src/exercises/index.ts`. Run `npm test`. Render with `FIGURES=superman,standing-torso-twist npm run render:figures`, and again with `STYLE=doodle`. Look at every keyframe and fix the coordinates (set `nose` if a doodle face points the wrong way).

**Checkpoint**: Renders reviewed; owner review via a preview channel only with the owner's go-ahead.

---

## Phase 8: User Story 6 - See the key poses side by side (P3)

**Goal**: An optional numbered still strip of the key poses, hidden by default, with the choice
synced.

**Independent Test**: Quickstart US6.

- [X] T026 [US6] In `src/profile/types.ts`, add `showPoses: boolean` (default `false`; a non-boolean reads as `false`) with a test in `src/profile/types.test.ts`
- [X] T027 [US6] Create `src/figure/poses.ts`: `PosesPrefContext` (`{ show: boolean; setShow(on: boolean) }`, default `{ show: false, setShow: noop }`) and `usePosesPref()`. Provide it in `src/app/Shell.tsx` from `profile.showPoses`, saving `{ showPoses }` via `saveProfile`.
- [X] T028 [US6] In `src/figure/Figure.tsx`, add `frame?: number`: draw keyframe `frame` still, in thumbnail ink weight, with that transition's arrows and any props/ring, and no breath row or caption
- [X] T029 [US6] Create `src/figure/PoseStrip.tsx` (+ styles in `src/figure/Figure.css`): a grid of n equal columns of `<Figure frame={i}>`, each numbered (i + 1). Between neighbours, a small arrow and `labels[i]`. Under the row, "Then back to 1: <last label>" when there are 3+ keyframes; with 2 keyframes the second label shows after pose 2. An accessible list ("Pose 1 of 3: …").
- [X] T030 [US6] Add a "Show poses / Hide poses" toggle (`aria-pressed`) and the strip: a text button under the figure card in `src/screens/ExerciseDetail.tsx`; an icon button in the player's top bar and a compact strip (no labels) inside the player figure card in `src/player/PlayerScreen.tsx` (portrait: the main button stays reachable at 390 × 844 and 820 × 1180; landscape: in the figure column)
- [X] T031 [P] [US6] Add a test to `src/figure/Figure.test.tsx` that `PoseStrip` renders one numbered pose per keyframe with the labels between them, and that the toggle on the exercise page calls `setShow` (hidden by default)

**Checkpoint**: Quickstart US6 at phone and tablet widths, in Classic and Doodle.

---

## Phase 9: Polish & Cross-Cutting

- [X] T032 Update `AGENTS.md` (layout notes: Get ready phase, dose helpers, `PoseStrip`; the Stretching technique in "Adding exercises" if relevant)
- [X] T033 Run `npm run lint`, `npm run format:check` (format only the changed files), `npm test` (PowerShell) and `npm run build`; fix failures
- [X] T034 Run quickstart.md end to end in a browser at 390 × 844 and 820 × 1180

## Dependencies & Execution Order

- US1, US2, US3, US4 and US5 are independent. US6 builds on US1's full-figure layout (T001–T002).
- T022's Mobility list includes `standing-torso-twist`, so run it after T024, or add that id with
  T024.
- Within a story: helpers and machine first, then tests, then UI.

## Parallel Opportunities

- US1 T004 alongside T003. US2 T009 after T008. US3 T011 alongside T012.
- US4: T015, T016 and T017 in parallel after T014.
- US5: T023 and T024 in parallel.

## Implementation Strategy

1. MVP: US1 (still screen), then US2 and US3: the three P1 fixes the owner hits every session.
2. Then US4 (Stretching), US5 (batch 7), US6 (pose strip).
3. One commit per story; CI must pass before the PR is merged to `main` (which deploys).
