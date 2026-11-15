---
description: "Task list for 007-figure-style"
---

# Tasks: Figure Style Preference

Work in the worktree `C:\Projects\FitMe\fit-me-doodle` (branch `007-figure-style`). The prototype's
doodle drawing is already in `src/figure/Figure.tsx` and `src/figure/geometry.ts`; tasks below turn
it into a selectable style. Run Vitest from PowerShell.

## Phase 1: Setup

- [X] T001 Capture Classic baseline: on `main` (via `git stash` or a temporary checkout of `src/figure` from `main`), render static markup for every exercise version's figure at each keyframe (`still={k}`) plus `thumbnail`, and save it to the scratchpad as `classic-baseline.json`, using a throwaway script `tools/classic-markup.test.tsx` (render project) that writes JSON keyed `<id>/<version>/<k|thumb>`

## Phase 2: Foundational (blocks all stories)

- [X] T002 [P] Add `export type FigureStyle = 'classic' | 'doodle'`, `FigureStyleContext` (default `'classic'`) and `useFigureStyle()` in `src/figure/style.ts`
- [X] T003 Split `src/figure/Figure.tsx`: shared frame (mat, wall/seat/chair props, ring, arrows, breath chip, caption) + `ClassicBody` (exactly the pre-prototype body markup from `main`, restoring `--figure-near-arm` use) + `DoodleBody` (prototype); add optional `figureStyle?: FigureStyle` prop that overrides `useFigureStyle()`; add class `fm-figure--doodle` on the `<figure>` in Doodle; restore `--figure-near`, `--figure-near-arm`, `--figure-far` to their `main` values in `src/index.css` and keep `--figure-paper: #ffffff` (doodle colours go in new `--doodle-ink` / `--doodle-far` variables)
- [X] T004 Run the T001 script on the branch with Classic and compare with `classic-baseline.json`: every entry identical (SC-003); then delete `tools/classic-markup.test.tsx`

**Checkpoint**: Classic unchanged; Doodle drawable via the prop.

## Phase 3: User Story 1 - Choose the doodle style (P1) 🎯 MVP

**Goal**: the person picks Classic or Doodle in Profile and every figure follows, on all devices.

**Independent test**: quickstart.md "In the app" steps 1–5.

- [X] T005 [P] [US1] Add `figureStyle: FigureStyle` to `Profile` with default `'classic'` in `DEFAULT_PROFILE`; in `withDefaults`, "Missing or any other value reads as `'classic'`" (`src/profile/types.ts`); add a test for missing, `'doodle'` and an unknown value in `src/profile/types.test.ts` (create if absent)
- [X] T006 [US1] Wrap the shell's screens in `<FigureStyleContext.Provider value={profile.figureStyle}>` in `src/app/Shell.tsx`
- [X] T007 [US1] Add `FigureStyleSection` in `src/screens/profileSections.tsx`: heading "Figure style", two radio options (Classic, Doodle) as cards, each with `<Figure thumbnail figureStyle=…>` of the Warrior II standard figure and its name; selecting calls `onChange({ figureStyle })`; add it to `src/screens/Profile.tsx` after Home; style in `src/app/app.css` (44 px min tap targets, selected state with `--accent`)
- [X] T008 [P] [US1] Component tests in `src/figure/Figure.test.tsx`: default renders Classic (no `fm-figure--doodle`); a provider with `'doodle'` renders Doodle; the `figureStyle` prop overrides the context; the `aria-label` (spec `alt`) is the same in both (FR-009)
- [X] T009 [P] [US1] Component test in `src/screens/Profile.test.tsx` (or the existing profile sections test pattern): choosing Doodle calls `saveProfile(uid, { figureStyle: 'doodle' })` (mock `src/data/repo/users`)

**Checkpoint**: US1 works end to end.

## Phase 4: User Story 2 - The doodle looks the right way (P1)

**Goal**: in Doodle every exercise's face points the way the person would look.

**Independent test**: quickstart.md "Faces and contact".

- [X] T010 [P] [US2] Add `nose?: 'left' | 'right' | 'up' | 'down'` to `FigureSpec` with a doc comment ("Doodle, side view: where the nose points in keyframe 0; set only when the automatic guess is wrong") in `src/exercises/types.ts`
- [X] T011 [US2] Add `facingFor(spec): 1 | -1` in `src/figure/geometry.ts`: with `nose`, pick the facing whose face "across" vector in keyframe 0 points most along the nose direction; otherwise `sideFacing(spec.keyframes)`; use it in `DoodleBody`
- [X] T012 [P] [US2] Unit tests in `src/figure/geometry.test.ts`: `sideFacing` for a standing left-facing pose (+1) and its mirror (−1); `face` front view has two eyes level and the smile below them; side view eye/nose on the facing side, and turned with the head for a lying pose; `facingFor` honours each `nose` value on a lying pose; `torsoOutline` is a closed path; `limbPath` passes through every joint
- [X] T013 [US2] Support `STYLE=doodle` in `tools/render-figures.test.tsx` (pass `figureStyle`, write `figure-renders/<id>-doodle.png`); keep the stroked circle / closed path support from the prototype
- [X] T014 [US2] Set `nose` on wall push-up (`'left'`, toward the wall) in `src/exercises/data/wall-push-up.ts` and figure four (`'up'`) in `src/exercises/data/figure-four.ts`, on every version's figure that needs it
- [X] T015 [US2] Render all 41 in Doodle and look at every image; set `nose` on any other figure whose face is wrong; in `src/figure/geometry.ts` widen the side-view shirt (half-width ≈ 12–13) and in `DoodleBody`'s frame raise the chair/seat props so lying figures rest on the mat and seated ones on the chair (R6); re-render lying, seated and kneeling exercises to confirm

**Checkpoint**: SC-002 met.

## Phase 5: User Story 3 - Readable at small sizes (P2)

**Goal**: Doodle thumbnails stay legible at 56–72 px.

**Independent test**: quickstart.md "In the app" step 6.

- [X] T016 [US3] Confirm thumbnail drawing (line 4.6, solid hands and feet, larger eyes) in `src/figure/Figure.tsx`; check set rows, plan rows and library cards in Chrome at 390 px and 820 px with Doodle selected and adjust widths if a pose can't be told apart

## Phase 6: Polish

- [X] T017 [P] Delete prototype-only `preview.html` and `tools/preview.tsx`
- [X] T018 [P] Update AGENTS.md "Adding exercises" step 4: render both styles (`STYLE=doodle`), check the doodle face, and use `nose` when it looks the wrong way
- [X] T019 Run `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run build`, and `npx prettier --check` on changed files; walk through quickstart.md in the browser (emulators) at phone and tablet widths
- [ ] T020 ⏸ Owner review, then PR, CI, merge, deploy (owner's go-ahead)

## Dependencies

- T001 → T003 → T004. T002 before T003.
- US1 (T005–T009) needs Phase 2. US2 (T010–T015) needs T003; independent of US1 (uses the prop and
  render tool). US3 (T016) needs US1 for the in-app check.
- Polish after all stories.

## Parallel opportunities

- T002 alongside T001.
- US1: T005, T008, T009 in parallel; T006 → T007.
- US2: T010 and T012 in parallel; T011 → T014 → T015; T013 any time after T003.
- US1 and US2 can proceed side by side after Phase 2.

## Implementation strategy

MVP = US1 + US2 together (a style choice with correct faces), since the owner flagged wrong faces as
the one thing to fix. US3 then polishes thumbnails. Stop at T020 for the owner's review.
