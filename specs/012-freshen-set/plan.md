# Implementation Plan: Freshen a saved set

**Branch**: `012-freshen-set` | **Date**: 2026-11-22 | **Spec**: [spec.md](spec.md)

## Summary

On a set's screen, **Try something new** shows up to three suggested changes. Each is an Add or a
Replace, chosen to keep the set balanced by body areas, part times, technique mix and the set's
routine character. The owner accepts (with Undo), skips, or asks for another idea. A new pure module
`src/sets/freshen.ts` makes the suggestions. It reuses the planner's eligibility and dose scaling,
which `plan.ts` now exports, and adds its own balance score. Nothing new is stored: an accepted
suggestion is an ordinary set edit.

## Technical Context

**Language/Version**: TypeScript 7 (strict), React 19

**Primary Dependencies**: none new (Vite 8, Firebase 13)

**Storage**: none new. Accepting a suggestion writes the set's `items` and `updatedAt` through the
existing `saveItems`. No schema, collection or rules change.

**Testing**: Vitest + React Testing Library. Sample sets come from `makePlan` for every routine,
plus hand-made sets.

**Target Platform**: mobile and tablet browsers (PWA)

**Project Type**: single-page web app

**Performance Goals**: suggestions appear without a visible wait (a pure pass over about 75
exercises)

**Constraints**: works offline (the library is static and sets are cached); deterministic for the
same set, profile, marks and day; waits for the real profile and marks before suggesting (AGENTS.md
lesson)

**Scale/Scope**: 1 new pure module; 1 new panel component; 2 screens touched (SetView, Shell
wiring)

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Spec Before Code | Pass | spec.md + checklist; the owner's four answers are recorded in its Input. |
| II. Smallest Useful Slice | Pass | US1 (suggest, accept, Undo, Skip) ships alone; US2 (Another idea) and US3 (review) are each additive. |
| III. Simplicity / YAGNI | Pass | No dependency and no stored data. Planner helpers are exported rather than moved; one module, one component. |
| IV. Test What Matters | Pass | Suggestion rules, balance, repairs, Another idea, revalidation and review are unit-tested over sample sets; SetView component tests cover accept, Undo and Skip. |
| V. Private & Synced | Pass | Only the person's own set is read and written, through the existing repo; offline edits queue as today. |

Re-checked after design: still passes. Nothing for Complexity Tracking.

## Design

See [research.md](research.md) for the reasoning and [data-model.md](data-model.md) for shapes.

**Planner exports** (`src/planner/plan.ts`)
- Export `eligible`, `fitsPhase`, `scaleDose`, `unfit` and `UNFIT_TEXT` as they are. The planner's
  own tests keep covering them; behaviour doesn't change.

**US1: suggestions** (`src/sets/freshen.ts`, `src/screens/FreshenPanel.tsx`, `SetView.tsx`)
- `characterOf` (R2), the balance score and reasons (R4), and `suggest` with repairs first and a
  greedy, varied pick (R5).
- `applySuggestion` and `revalidate` (R7).
- `SetView` takes `profile: Profile | null`; Shell passes `plannerProfile`. It also reads
  `useMarks()`. **Try something new** sits under the set's summary line, disabled with "Loading your
  profile…" until the profile and marks are loaded.
- `FreshenPanel` shows the cards above the parts. Each card has a thumbnail `Figure` linking to the
  exercise, the change as a heading, the reason, the dose, then **Add** or **Replace** and **Skip**.
  There is a **Done** control to close the panel.
- An accepted change shows a "Added X. **Undo**" line in the panel (an `aria-live` region). It
  stays while the set is unchanged since.
- Revalidation runs in an effect keyed on `set.items`, `profile` and `marks`.

**US2: Another idea** (`freshen.ts`, `FreshenPanel.tsx`)
- `anotherIdea` with a per-suggestion `passed` list (R6). The button shows when `hasAnother` is
  true.

**US3: review** (`freshen.ts`, `FreshenPanel.tsx`)
- `reviewSet`, shown as three short lines at the top of the panel (areas, parts, techniques) and
  updated with the set.

**Styles** (`src/app/app.css`)
- Card styles beside the existing `.set-row` rules. Checked at 390 px and 820 px.

**Docs** (`AGENTS.md`)
- The `src/sets/` layout line gains `freshen.ts` (012).

## Project Structure

### Documentation (this feature)

```text
specs/012-freshen-set/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks
```

There is no `contracts/` folder because the feature adds no interface to other systems. The
in-memory shapes are in data-model.md.

### Source Code

```text
src/
├── sets/
│   ├── freshen.ts           # new: character, score, suggest, anotherIdea, apply, revalidate, review
│   └── freshen.test.ts      # new
├── planner/plan.ts          # export existing helpers
├── screens/
│   ├── FreshenPanel.tsx     # new
│   ├── SetView.tsx          # profile prop, Try something new, panel
│   └── SetView.test.tsx     # panel tests
├── app/Shell.tsx            # pass plannerProfile to SetView
└── app/app.css              # card styles
```

**Structure Decision**: existing single-project layout. The pure logic sits beside `edit.ts` in
`src/sets/`, and the UI is a component beside `SetView`.

## Operational surface

- **Config / deploy**: none. It ships with the normal hosting deploy on merge to `main`.
- **Firestore rules / indexes**: unchanged. The set write is the same `items` + `updatedAt` update
  that the existing rules tests already cover.
- **Permissions / data**: no new data or console settings.
