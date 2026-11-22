# Implementation Plan: Exercise feedback round

**Branch**: `011-exercise-feedback` | **Date**: 2026-11-21 | **Spec**: [spec.md](spec.md)

## Summary

Six changes from the owner's use of the app:

- The full figure reserves fixed space for its breath row and movement caption, so the player
  stops jumping.
- The pure player machine gains a `getReady` phase before timed exercises.
- Set rows get an inline dose editor backed by pure clamp helpers.
- `Technique` gains `stretching` (nine exercises move; profile, planner, schedule, colours and
  mood follow).
- Batch 7 adds Superman and Standing torso twist.
- `<Figure>` gets a static `frame` mode used by a new, optional `PoseStrip`, behind a synced
  `showPoses` profile preference.

## Technical Context

**Language/Version**: TypeScript 7 (strict), React 19

**Primary Dependencies**: none new (Vite 8, Firebase 13)

**Storage**: `users/{uid}.profile` gains `techniques.stretching` and `showPoses`. Set items' existing
`dose` becomes editable. No new collection; rules unchanged.

**Testing**: Vitest + React Testing Library; library validation (`exercises.test.ts`); figure
review renders

**Target Platform**: mobile and tablet browsers (PWA)

**Project Type**: single-page web app

**Performance Goals**: the animation stays smooth; the pose strip draws at most 4 static SVGs

**Constraints**: works offline; no layout shift in the player during an exercise

**Scale/Scope**: 75 exercises; 4 screens touched (Player, Exercise detail, Set view, Profile)

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Spec Before Code | Pass | spec.md + checklist; owner answers recorded in the spec's Input. |
| II. Smallest Useful Slice | Pass | Six independent stories; P1 fixes (US1–US3) ship first, each usable alone. |
| III. Simplicity / YAGNI | Pass | No dependency. One phase, one technique value, two profile fields, one component. |
| IV. Test What Matters | Pass | Machine, cues, dose helpers, profile defaults, planner/suggest and library rules are unit-tested; component tests for the dose editor, Get ready sheet and pose toggle. |
| V. Private & Synced | Pass | Data stays in the person's own documents; additive fields with defaults, schema versions unchanged; rules unchanged and existing rules tests still cover these paths. |

Re-checked after design: still passes; nothing for Complexity Tracking.

## Design

See [research.md](research.md) for the reasoning and [data-model.md](data-model.md) for shapes.

**US1: still screen** (`src/figure/Figure.tsx`, `Figure.css`, `src/player/*`)
- The caption is always rendered for full figures. It is empty when there is no label, has a
  fixed height of two lines, and is clamped with an ellipsis.
- The breath row has a fixed height for the chip or two clamped lines of the breathing note.
- Player: the count block has a minimum width and a no-wrap detail line. The Paused note keeps its
  space (`visibility`). The notice becomes a floating toast.

**US2: Get ready** (`src/player/machine.ts`, `src/sound/cues.ts`, `PlayerScreen.tsx`)
- `getReady` phase, `GET_READY_SECONDS = 5`, `startNow` event; `goTo` and ticks as in research R2.
- Cue rule: `switch` on entering `getReady`; `start` on entering `doing`.
- A Get ready `Sheet` with the exercise name, countdown and **Start now**.

**US3: dose editing** (`src/sets/edit.ts`, `src/screens/SetView.tsx`)
- `DOSE_LIMITS`, `stepDose`, `withDose`, `inRange` (pure, tested).
- The dose text in a row becomes a toggle. The inline editor has steppers and a hint; one row is
  open at a time. It saves through `saveItems`.

**US4: Stretching** (`src/exercises/types.ts` and every `Record<Technique, …>`)
- The type, labels, order, tag and chart colours, mood, profile default and `withDefaults`
  fallback, goal weights, routine boosts, and the planner's strength-class adjustment.
- Nine data files change technique. Tests that list techniques are updated.

**US5: batch 7** (`src/exercises/data/superman.ts`, `standing-torso-twist.ts`, `index.ts`)
- Content as in research R5. Validated by `npm test`, checked in Classic and Doodle renders.

**US6: pose strip** (`src/figure/PoseStrip.tsx`, `Figure.tsx`, `src/figure/poses.ts`, `Shell.tsx`,
`profile/types.ts`)
- `<Figure frame={i}>`: draws keyframe i still, in thumbnail ink, with transition i's arrows and
  no text rows.
- `PoseStrip`: a numbered grid with arrows and labels between poses, and the return label below.
- `PosesPrefContext` holds `{ show, setShow }` from `profile.showPoses`. The toggle button is on
  the exercise page and in the player figure card.

## Project Structure

### Documentation (this feature)

```text
specs/011-exercise-feedback/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks
```

No `contracts/`: the feature adds no interface to other systems. The stored shapes are in
data-model.md.

### Source Code

```text
src/
├── figure/
│   ├── Figure.tsx, Figure.css   # fixed text rows; frame mode
│   ├── PoseStrip.tsx            # new
│   ├── poses.ts                 # new: PosesPrefContext
│   └── Figure.test.tsx
├── player/
│   ├── machine.ts, machine.test.ts   # getReady
│   ├── PlayerScreen.tsx, player.css  # Get ready sheet, still layout, strip toggle
│   └── PlayerScreen.test.tsx
├── sound/cues.ts, cues.test.ts, mood.ts
├── sets/edit.ts, edit.test.ts         # dose helpers
├── screens/SetView.tsx, SetView.test.tsx, ExerciseDetail.tsx
├── exercises/types.ts, index.ts, data/*.ts (9 moved, 2 new)
├── profile/types.ts, types.test.ts, suggest.ts
├── planner/plan.ts, routines.ts, plan.test.ts
├── app/Shell.tsx, app.css
├── progress/progress.css
└── index.css
```

**Structure Decision**: existing single-project layout; two new files in `src/figure/`.
