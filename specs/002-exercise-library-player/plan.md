# Implementation Plan: Exercise Library and Session Player

**Branch**: `002-exercise-library-player` | **Date**: 2026-11-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-exercise-library-player/spec.md`

## Summary

Add a static, typed exercise library drawn as animated volume line figures with direction arrows,
a Library screen with search, filters and personal marks, and a full-screen player that runs the
owner's eight favourites as a sample session, records ratings and keeps the screen awake. The app
gains a bottom tab bar, hash routing and an offline app shell. Content ships in owner-reviewed
batches, starting with the eight favourites.

## Technical Context

**Language/Version**: TypeScript 7 (strict), Node 24

**Primary Dependencies**: React 19, Vite 8, Firebase JS SDK 13; new: `vite-plugin-pwa` 2

**Storage**: Static exercise modules in the bundle; Firestore `users/{uid}/exerciseMarks`,
`users/{uid}/sessions` (see [data-model.md](data-model.md))

**Testing**: Vitest + React Testing Library; rules tests against the emulator

**Target Platform**: Phone and tablet browsers, installable to the home screen

**Project Type**: Single-page web app

**Performance Goals**: Figure animation at display frame rate on the owner's phone (SC-006)

**Constraints**: Works offline after first sign-in; free Spark plan; no images from third parties

**Scale/Scope**: ≥ 36 exercises, 8 screens, < 20 people

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Spec Before Code | Pass | [spec.md](spec.md), checklist passed. |
| II. Smallest Useful Slice | Pass | US1 (player on 8 favourites) ships first; later batches add content only. |
| III. Simplicity / YAGNI | Pass, one addition | No router or state library; one new dependency (`vite-plugin-pwa`), tracked below. |
| IV. Test What Matters | Pass | Unit tests for content validity, figure math, player machine; rules rows 17–28; a few screen tests. |
| V. Private & Synced | Pass | Marks and sessions under `users/{uid}`, owner-only rules; library is shared static content. |

Post-design re-check: passing.

## Project Structure

### Documentation (this feature)

```text
specs/002-exercise-library-player/
├── plan.md  research.md  data-model.md  quickstart.md
├── contracts/ (firestore-access.md, ui-routes.md)
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── router.ts            # hash routes, useRoute()
│   ├── TabBar.tsx
│   └── Shell.tsx            # signed-in frame: routes + tab bar
├── exercises/
│   ├── types.ts             # Exercise, Version, FigureSpec, Pose, Arrow
│   ├── data/                # one module per exercise (pelvic-tilts.ts, …)
│   ├── index.ts             # all exercises, lookup, search
│   ├── sample.ts            # sample routine from favourites minus Not for me
│   └── exercises.test.ts    # validates every exercise
├── figure/
│   ├── geometry.ts          # interpolatePose, easeCycle, arrowGeometry (pure)
│   ├── geometry.test.ts
│   └── Figure.tsx           # SVG renderer, rAF loop, reduced motion, playing prop
├── player/
│   ├── machine.ts           # pure reducer
│   ├── machine.test.ts
│   ├── usePlayer.ts         # ticks, visibility pause, session writes
│   ├── wakeLock.ts
│   └── PlayerScreen.tsx     # + RatingSheet, SwitchSide, Summary
├── data/repo/
│   ├── marks.ts             # watchMarks, setMark, clearMark
│   └── sessions.ts          # startSession, recordItem, finishSession
├── screens/                 # Today, Library, ExerciseDetail, Profile, Placeholder, Review
└── styles/tokens.css        # prototype colours, type, radii

tests/rules/firestore.rules.test.ts   # + rows 17–28
public/icons/                          # PWA icons
```

**Structure Decision**: Same single Vite project. New folders by domain (`exercises`, `figure`,
`player`) keep pure logic next to its tests.

## Delivery

1. Batch 1 (the 8 favourites) + all app code → preview channel → owner reviews figures and doses
   → merge → deploy.
2. Batches 2–4 (about 10 each across techniques, incl. ≥ 6 tai chi): content-only PRs, each with
   a preview channel for review.

## Complexity Tracking

| Addition | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| `vite-plugin-pwa` | FR-024: app opens offline; home-screen install | Hand-written service worker: update and precache logic is easy to get wrong |
| `firebase.json` no-cache for `sw.js` and manifest | Updates must reach people (001 FR-013) | Without it a stale service worker can pin an old app |
