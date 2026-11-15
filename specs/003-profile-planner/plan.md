# Implementation Plan: Profile and Session Planner

**Branch**: `003-profile-planner` | **Date**: 2026-11-15 | **Spec**: [spec.md](spec.md)

## Summary

Add a private profile (first-run setup plus an editable Profile tab) and a deterministic,
explainable planner that builds Calm morning, Desk break, Strength keeper, Weekend longer and
Cardio sessions from the profile, marks and recent history, fitted to the chosen minutes. Today
becomes routine + minutes → Plan → Start.

## Technical Context

**Language/Version**: TypeScript 7 (strict), Node 24 · **Dependencies**: no new ones

**Storage**: `users/{uid}.profile` map; reads `users/{uid}/sessions` (last 14 days)

**Testing**: Vitest unit + property-style tests for the planner; rules rows for the profile

**Constraints**: Offline planning; deterministic output; free plan

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Spec Before Code | Pass | spec.md + checklist. |
| II. Smallest Useful Slice | Pass | US1 profile and US2 planner ship together by the owner's choice; US3 defaults is small. |
| III. Simplicity / YAGNI | Pass | No new dependencies; pure planner; plan encoded in the route instead of storage. |
| IV. Test What Matters | Pass | Planner is the core domain logic: unit + many-profile property tests (SC-003). |
| V. Private & Synced | Pass | Profile under `users/{uid}`, owner-only; age and sex optional, used only for suggestions. |

## Project Structure

```text
src/profile/
├── types.ts           # Profile, Goal, RoutineId, defaults
├── suggest.ts (+test) # suggestions from age/sex/goals
├── useProfile.ts      # from the user record; save(field, value)
src/planner/
├── routines.ts        # routine characters, phase shares, labels
├── random.ts          # seeded PRNG
├── plan.ts (+test)    # makePlan, swap, time fitting, reasons
├── history.ts         # sessions → summary
src/screens/
├── Setup.tsx          # #/setup/1..6
├── Today.tsx          # routine + minutes + Plan
├── PlanView.tsx       # #/plan?… with Swap / Reshuffle / Start
├── Profile.tsx        # full editor
src/data/repo/users.ts       # + saveProfileField, profile in UserRecord
src/data/repo/sessions.ts    # + recentSessions(uid, days)
src/exercises/data/*.ts      # + position, intensity, tags
```

## Complexity Tracking

None.
