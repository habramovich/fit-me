---
description: "Task list for 002-exercise-library-player"
---

# Tasks: Exercise Library and Session Player

**Input**: Design documents from `/specs/002-exercise-library-player/`

**Tests**: Included (constitution IV: content validation, figure math, player machine, rules).

## Format: `[ID] [P?] [Story] Description`

US1 player · US2 library · US3 marks · US4 batches

---

## Phase 1: Setup

- [X] T001 Install `vite-plugin-pwa@^2`; configure in `vite.config.ts` (`generateSW`, `registerType: 'autoUpdate'`, manifest: name FitMe, short_name FitMe, theme `#2F6F5E`, background `#F6F4EF`, display standalone, icons 192/512/maskable from `public/icons/`)
- [X] T002 [P] PWA icons in `public/icons/` (simple FitMe mark, SVG source + PNG sizes) and favicon
- [X] T003 [P] `firebase.json`: add `no-cache` headers for `/sw.js`, `/registerSW.js`, `/manifest.webmanifest`
- [X] T004 [P] Design tokens in `src/styles/tokens.css` (colours, fonts, radii from the prototype); load Inter + Space Grotesk; update `src/index.css`

## Phase 2: Foundational

- [X] T005 [P] Types in `src/exercises/types.ts` per data-model.md (Exercise, Version, Dose, FigureSpec, Pose, Limbs, Arrow, BodyArea, Technique)
- [X] T006 [P] Geometry tests `src/figure/geometry.test.ts`: easeCycle holds/ease/ping-pong for 2 and 3 keyframes; interpolatePose endpoints and midpoint; arrowGeometry direction reverses on return, head at tip
- [X] T007 Pure geometry in `src/figure/geometry.ts`
- [X] T008 `src/figure/Figure.tsx`: SVG renderer (mat, far limbs light, torso curve, neck, head, near legs, near arm, hands, feet; front view draws left/right symmetric), rAF loop with `playing` prop, motion arrows + phase label, breath indicator ("Breathe in/out" per transition, or the breathing summary), `prefers-reduced-motion` stepping, `role="img"` + alt
- [X] T009 [P] Hash router `src/app/router.ts` (+ tests for parsing routes and params)
- [X] T010 `src/app/Shell.tsx` + `src/app/TabBar.tsx`; `src/App.tsx` renders Shell when invited; placeholders for Schedule/Progress; Profile with name, email, Sign out
- [X] T011 Content validator test `src/exercises/exercises.test.ts`: unique ids, all fields valid, dose target inside its recommended range, keyframes 2–4 with all joints, arrows + labels per transition, breath per transition for rep exercises (summary always), cardio has a lowImpact version, alt text, steps 2–6, cues 2–3

## Phase 3: US4 batch 1 content + US2 Library (P1)

- [X] T012 [US4] Batch 1 exercises in `src/exercises/data/`: pelvic-tilts, cat-cow, hip-circles (front view, 4 keyframes), shoulder-rotations (front view), dead-bug, glute-bridge, figure-four, bird-dog; each with standard + easier + harder versions, steps, cues, figures, arrows; `src/exercises/index.ts` with `allExercises`, `getExercise`, `searchExercises`
- [X] T013 [P] [US2] `src/screens/Library.tsx`: search (name, body-area words), technique chips, Favourites chip, card grid with figure thumbnail (static first pose), mark badges, empty state
- [X] T014 [P] [US2] `src/screens/ExerciseDetail.tsx`: figure, dose, steps, areas, equipment, level, version switcher (says when a version is missing), Try it link, medical-advice note
- [X] T015 [US2] Tests `src/screens/Library.test.tsx`: search, technique filter, empty state
- [X] T016 [P] [US4] `src/screens/Review.tsx` at `#/review` (dev/preview only via `import.meta.env.DEV || location.hostname.includes('--')`)

## Phase 4: US1 Player (P1) 🎯 MVP

- [X] T017 [P] [US1] Machine tests `src/player/machine.test.ts` covering data-model.md transitions and US1 scenarios
- [X] T018 [US1] `src/player/machine.ts`
- [X] T019 [P] [US1] `src/player/wakeLock.ts` (request, re-acquire on visible, release; reports unsupported)
- [X] T020 [P] [US1] `src/data/repo/sessions.ts`: startSession, recordItems (changed fields only), finishSession; writes not awaited
- [X] T021 [US1] `src/player/usePlayer.ts`: wall-clock ticks, pause on hidden, wake lock, session writes
- [X] T022 [US1] `src/player/PlayerScreen.tsx`: layout per prototype (portrait + landscape), controls ≥ 44 px, rating sheet, switch-side prompt, summary, wake-lock hint
- [X] T023 [US1] `src/exercises/sample.ts` (favourites order from spec Assumptions minus Not for me, estimated minutes) + test; `src/screens/Today.tsx` with sample card and empty state
- [X] T024 [P] [US1] Player screen test `src/player/PlayerScreen.test.tsx` (start, set done, rate, summary)

## Phase 5: US3 Marks (P2)

- [X] T025 [P] [US3] Rules tests rows 17–28 in `tests/rules/firestore.rules.test.ts`
- [X] T026 [US3] `firestore.rules`: `exerciseMarks` and `sessions` blocks per contract
- [X] T027 [US3] `src/data/repo/marks.ts` + `useMarks()` hook; wire Favourite / Not for me on cards and detail page; sample excludes Not for me

## Phase 6: Polish

- [X] T028 [P] Update `README.md`, `AGENTS.md` (figure authoring guide, batch review steps)
- [X] T029 Full checks; manual quickstart against emulators
- [ ] T030 ⏸ Preview channel `batch-1`; owner reviews figures and doses; apply feedback
- [ ] T031 ⏸ Owner OK → PR, CI, merge, deploy; check on phone and tablet (SC-005)

## Phase 7: Later batches (content-only PRs, each reviewed on a preview channel)

- [X] T032 [US4] Batch 2: 13 exercises chosen for the owner’s profile (calm morning, desk break, strength keeper): sunrise breath, tai chi commencement, wave hands like clouds, child’s pose, tree pose, low lunge, seated side bend, chest opener, chin tucks, wall angels, sit-to-stand, calf raises, wall push-up. Library: 21 (yoga 6, mobility 7, strength 6, tai chi 2)
- [X] T033 [US4] Batch 3: 6 low-impact cardio (march in place, step jacks, shadow boxing, step-touch, cross-body knee lifts, heel flicks; jump versions as harder) + 4 tai chi (parting the wild horse’s mane, brush knee and push, golden rooster, repulse monkey). Library: 31 (yoga 6, mobility 7, strength 6, tai chi 6, cardio 6)
- [X] T034 [US4] Batch 4: 5 yoga (downward dog with wall-dog version, warrior II, supine twist, sphinx, puppy pose) + 5 strength (split squat, wall sit, side-lying leg lifts, clamshells, prone W raises). Library: 41 (yoga 11, mobility 7, strength 11, tai chi 6, cardio 6) — FR-008 / SC-007 met
- [X] T035 [US4] Batch 5: 15 Shibashi qigong forms from the owner’s tai chi handout (broadening the chest, dancing with rainbows, circling arms, twisting waist and swinging arms, rowing the boat, holding a ball, carrying the moon, twisting waist and pushing palms, scooping from the sea, playing with waves, spreading the wings, tai chi punching, flying like a wild goose, spinning wheels, bouncing the ball), each with a seated version. Commencing form, playing with clouds and pressing the palms are already covered by tai chi commencement and wave hands like clouds. Library: 56 (yoga 11, mobility 7, strength 11, tai chi 21, cardio 6)
- [X] T036 [US4] Batch 6: 17 stretches from the owner’s morning stretching handout (neck side stretch, shoulder rolls, standing side stretch, seated spinal twist, knee to chest, standing thigh stretch, hamstring stretch, calf stretch, ankle circles, single-leg balance, gentle forward fold, cross-body shoulder stretch, upper-back hug, butterfly, standing side lunge stretch, windshield wipers, and low lunge to hamstring stretch, the owner’s pairing of the two). Already covered: chest opener, cat–cow, child’s pose, wall angels, calf raises (heel raises), low lunge (hip flexor stretch), figure four (lying); figure four’s easier version is now the chair version from the handout, and chest opener’s hold says not to arch the lower back. Library: 73 (yoga 15, mobility 19, strength 12, tai chi 21, cardio 6)

## Dependencies

Setup → Foundational → (US4 batch 1 ∥ router/shell) → US2 and US1 → US3 → Polish → batches.
