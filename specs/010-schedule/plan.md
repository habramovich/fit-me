# Implementation Plan: Schedule

**Branch**: `010-schedule` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

## Summary

The Schedule tab replaces its placeholder with a week of repeating classes and planned home
sessions, stored one document per item in `users/{uid}/schedule`. Today shows today's items and
preselects the planned routine. A class can be marked attended or Not this time
(`users/{uid}/attendance/{classId}_{date}`); attended classes count in Progress through the existing
stats. The planner treats today's classes (and yesterday's attended ones) as covering their
technique: a score penalty plus a note on the kept plan.

Design decisions: [research.md](research.md). Data: [data-model.md](data-model.md). Contracts:
[contracts/firestore-access.md](contracts/firestore-access.md), [contracts/ui.md](contracts/ui.md).
Validation: [quickstart.md](quickstart.md).

## Technical Context

**Language/Version**: TypeScript 7 (strict), React, Vite 8

**Primary Dependencies**: Firebase 13 (Auth, Firestore with persistent cache). No new dependencies.

**Storage**: Firestore, two new subcollections `users/{uid}/schedule` and
`users/{uid}/attendance` (rules + tests rows 41–50). No new indexes (single-field range on `date`).

**Testing**: Vitest + React Testing Library; rules tests against the emulator

**Target Platform**: Mobile and tablet browsers (SPA)

**Project Type**: Single-page web app

**Performance Goals**: Today and Schedule render from the offline cache without waiting on the
network; one watch each for schedule, recent attendance and today's sessions

**Constraints**: Offline-capable; local wall-clock times (no DST shift); the planner waits for the
schedule (research R7); kept plans never re-derived

**Scale/Scope**: One owner, ~5 schedule items, ~2 attendance records a week

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Spec Before Code | Pass | spec.md + checklist; owner decisions recorded in the spec's Input. |
| II. Smallest Useful Slice | Pass | US1 (week) ships alone; US2 (Today) and US3 (attendance) each need only US1; US4 (planner) needs US1 (and US3 for "attended yesterday"). |
| III. Simplicity / YAGNI | Pass | No dependencies, no Cloud Functions (reminders are in-app, owner's choice). One provider mirrors `SetsProvider`. Classes join Progress through the existing `StatSession` shape. |
| IV. Test What Matters | Pass | Week occurrences, today's entries, planned choice, covers, validation, planner covers/notes and Progress class sessions are pure and unit-tested; a few component tests; rules rows 41–50. |
| V. Private & Synced | Pass | Both collections under `users/{uid}`, owner-only, synced, offline, `schemaVersion: 1`. Operational surface: two `firestore.rules` blocks + tests, deployed by the existing workflow on merge; no index, console or production-data changes. |

Re-checked after design: still passes; nothing for Complexity Tracking.

## Design

### Shared: model and pure rules (`src/schedule/`)

- `types.ts`: `Weekday` (1–7), `ClassType`, `ScheduleItem` (class | home), `Attendance`,
  `CLASS_TYPE_LABEL`, `WEEKDAY_LABEL`.
- `week.ts`, all pure and taking `now` or a date:
  - `weekOccurrences(items, monday)` → occurrences for 7 days, by start time.
  - `todayEntries(items, attendance, todaySessions, now)` → entries with status and `passed`
    (research R4).
  - `plannedChoice(entries)` → `{ routine, minutes } | null` (research R5).
  - `covers(items, attendance, now)` → `Cover[]` for the planner (research R6).
  - `canMarkAttendance(date, now)`: Monday of last week ≤ date ≤ today.
  - `validateItem(draft)` → per-field messages (research R11).
  - `attendanceId(classId, date)`.

### US1: Set up my week

- **Repo (`src/data/repo/schedule.ts`)**: `watchSchedule`, `createScheduleItem` (returns id),
  `updateScheduleItem(uid, id, changed fields)`, `deleteScheduleItem`. Writes not awaited
  (offline queue), as in `sets.ts`; unknown or malformed documents skipped on read.
- **Provider (`src/app/schedule.tsx` + `scheduleContext.ts`)**: watches schedule and attendance
  (US3); exposes `items`, `attendance` (null while loading), `add`, `update`, `remove`,
  `setAttendance`, `clearAttendance`; optimistic, like `SetsProvider`. Mounted in `Shell` next to
  the other providers.
- **Router**: routes `scheduleItem` (`#/schedule/new/class`, `#/schedule/new/home`,
  `#/schedule/<id>`); tab stays Schedule; tests.
- **Screens**: `Schedule.tsx` (week, empty state, This week / Last week) and
  `ScheduleItemForm.tsx` (form per [contracts/ui.md](contracts/ui.md)); styles in
  `src/schedule/schedule.css`. `Placeholder` goes if nothing else uses it.
- **Rules**: `schedule` block + `validScheduleItem`, rows 41–46.

### US2: Today knows what's planned

- **Repo**: `watchSessionsSince(uid, since)` in `sessions.ts`.
- **Hook**: `useTodayEntries(now)` in `src/schedule/useToday.ts`: provider data + today's sessions
  → `todayEntries`.
- **Today**: `TodaySchedule` card (rows shared with Schedule via a `ScheduleRow` component in
  `src/screens/scheduleParts.tsx`); the picker's routine and minutes become
  `pick ?? plannedChoice ?? time default`.

### US3: Classes count toward my week

- **Repo**: `watchAttendance(uid, sinceDate)`, `setAttendance(uid, record)` (`setDoc` with merge
  on the deterministic id), `clearAttendance(uid, id)`.
- **Screens**: attendance controls and the Change sheet in `scheduleParts.tsx`, used on Schedule
  and Today; only for dates `canMarkAttendance` allows.
- **Progress (`src/progress/stats.ts`)**: `classSessions(attendance)`; `counts`, `techniqueMix`,
  `recentList`, `routineLabel` as in research R9; `TechniqueShare.technique: ClassType`.
  `Progress.tsx` waits for attendance, merges class sessions into the list, labels Other, and shows
  "Class" in Recent; `.prog-fill--other` in `progress.css`.
- **Rules**: `attendance` block, rows 47–50.

### US4: The planner plans around my classes

- **Planner (`src/planner/plan.ts`)**: `PlanInput.covered`; in `score`, −2.5 for a covered
  technique unless the routine is built around it, +1 for mobility after a covered strength class;
  `makePlan` returns `notes` (research R6). `swapItem` and `repairPlan` get `covered` through the
  same input.
- **`useKeptPlan`**: takes `covered: Cover[] | null` and waits for it; `fresh()` stores the plan's
  notes. `PlanView` and `PlanPlayer` pass `covers(...)` from the provider (memoised per day).
- Tests: penalty, mobility boost, built-around note without penalty, Other and empty `covered`
  identical to today's output (existing planner tests keep passing with `covered: []`).

## Project Structure

### Documentation (this feature)

```text
specs/010-schedule/
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
├── schedule/       types.ts, week.ts (+ test), useToday.ts, schedule.css (new)
├── app/            schedule.tsx, scheduleContext.ts (new); Shell.tsx, router.ts (+ test), TabBar.tsx
├── data/repo/      schedule.ts (new); sessions.ts
├── planner/        plan.ts (+ test), usePlan.ts
├── progress/       stats.ts (+ test), progress.css
├── player/         PlanPlayer.tsx
└── screens/        Schedule.tsx (+ test), ScheduleItemForm.tsx (+ test), scheduleParts.tsx (new);
                    Today.tsx, PlanView.tsx, Progress.tsx (+ test); Placeholder.tsx (removed)
firestore.rules
tests/rules/firestore.rules.test.ts
```

**Structure Decision**: The existing single-app layout; Firestore stays behind `src/data/repo/`.
AGENTS.md's Layout gains a `src/schedule/` line.

## Complexity Tracking

None.
