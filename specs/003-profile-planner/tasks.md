---
description: "Task list for 003-profile-planner"
---

# Tasks: Profile and Session Planner

US1 profile · US2 planner · US3 routine defaults

## Phase 1: Foundational

- [X] T001 [P] Exercise attributes in `src/exercises/types.ts` (position, intensity, tags, Version.position) and batch 1 data; validator checks them
- [X] T002 [P] Profile types and defaults in `src/profile/types.ts`
- [X] T003 [P] Routine definitions in `src/planner/routines.ts`; seeded PRNG in `src/planner/random.ts`
- [X] T004 `src/data/repo/users.ts`: profile in `UserRecord`, `saveProfileField(uid, field, value)` (merge write)
- [X] T005 Rules: `profile` must be a map if present; rules tests rows 29–30

## Phase 2: US1 Profile (P1)

- [X] T006 [P] [US1] `src/profile/suggest.ts` + tests (age/sex → goals; goals → techniques)
- [X] T007 [US1] `src/profile/useProfile.ts` (profile from the record with defaults; save)
- [X] T008 [US1] `src/screens/Setup.tsx` six skippable steps; Shell shows setup until `setupDone`
- [X] T009 [US1] `src/screens/Profile.tsx` full editor per prototype, saving each change

## Phase 3: US2 Planner (P1) 🎯

- [X] T010 [P] [US2] Planner tests `src/planner/plan.test.ts`: exclusions, time tolerance, routine characters, focus frequency, new-for-you, determinism, swap, reshuffle, insufficient, property test over 1,000 random profiles
- [X] T011 [US2] `src/planner/plan.ts`
- [X] T012 [P] [US2] `src/planner/history.ts` + `recentSessions()` in `src/data/repo/sessions.ts`
- [X] T013 [US2] Router: `#/plan`, `#/setup/n`, player `routine=plan`
- [X] T014 [US2] `src/screens/Today.tsx` (routine + minutes + Plan) and `src/screens/PlanView.tsx`
- [X] T015 [US2] Player builds items from the plan params; session routine `plan:<id>`

## Phase 4: US3 Routine defaults (P2)

- [X] T016 [US3] Time-of-day pre-selection (pure + test); default minutes editable in Profile

## Phase 5: Polish

- [X] T017 Screen tests (Setup, Today/Plan); docs; full checks
- [ ] T018 ⏸ PR, CI, merge, deploy; owner completes setup on her phone
