---
description: "Task list for 010-schedule"
---

# Tasks: Schedule

Branch `010-schedule`. Run Vitest from PowerShell. Tests are included because the constitution
requires unit tests for domain logic (Principle IV). Weekdays are ISO numbers (`1` Monday … `7`
Sunday; from JS: `((d.getDay() + 6) % 7) + 1`); dates are local `"YYYY-MM-DD"` (`todayKey` in
`src/planner/history.ts`); weeks start Monday (`weekStart` in `src/progress/stats.ts`).

## Phase 1: Setup

- [X] T001 Create `src/schedule/`; check the installed Firestore `.d.ts` for `query`/`where`/`onSnapshot` on a query and `setDoc(…, { merge: true })` signatures (Firebase 13) before writing the repo

## Phase 2: Foundational (blocks all stories)

- [X] T002 [P] Types in `src/schedule/types.ts`: `Weekday = 1|2|3|4|5|6|7`, `WEEKDAYS`, `WEEKDAY_LABEL` (short "Mon"… and long "Monday"…), `ClassType = Technique | 'other'`, `CLASS_TYPES`, `CLASS_TYPE_LABEL` (reuse `TECHNIQUE_LABEL`, plus `other: 'Other'`), `ScheduleItem` = `{ id; kind: 'class'; name; type: ClassType; days: Weekday[]; start: string; minutes }` | `{ id; kind: 'home'; routine: RoutineId; days: Weekday[]; start: string; minutes }`, `ScheduleDraft` (same without `id`), `Attendance { id; classId; date; status: 'attended' | 'skipped'; minutes; name; type: ClassType; start }`, `SCHEDULE_SCHEMA_VERSION = 1`, `ATTENDANCE_SCHEMA_VERSION = 1`
- [X] T003 [P] Repo `src/data/repo/schedule.ts` (data-model.md): `watchSchedule(uid, onData, onError)` on `users/{uid}/schedule`, skipping documents with an unknown `kind` or missing/ill-typed fields, `days` sorted; `createScheduleItem(uid, draft): string` (random id, `schemaVersion`, `createdAt`/`updatedAt` server time); `updateScheduleItem(uid, id, changed: Partial<ScheduleDraft>)` writing only the given fields plus `updatedAt`; `deleteScheduleItem(uid, id)`. Writes not awaited, `.catch(() => {})`, as in `src/data/repo/sets.ts`
- [X] T004 Provider `src/app/schedule.tsx` + `src/app/scheduleContext.ts` mirroring `SetsProvider`: `items: ScheduleItem[] | null` (null while loading; `[]` on error), `add(draft): string`, `update(id, changed)`, `remove(id)`, all optimistic; default context value with `items: []` and no-ops; mount `ScheduleProvider` in `src/app/Shell.tsx` alongside `SetsProvider`/`PlansProvider`
- [X] T005 Rules: add `validScheduleItem(d)` and the `match /schedule/{itemId}` block from contracts/firestore-access.md to `firestore.rules`; tests rows 41–46 in `tests/rules/firestore.rules.test.ts` (new `describe('schedule (010 rows 41–46)')`): valid class and home CRUD + list; "`kind` unknown; `days` empty, more than 7, or not a list"; "`start` not `HH:MM`; `minutes` not a number, below 5, or above 240 (class) / 90 (home)"; "class `name` missing, empty or over 40; class `type` unknown; home `routine` unknown"; B's items denied; uninvited denied. Confirm row 28 doesn't use `schedule`

**Checkpoint**: schedule items load, save and sync through the provider; rules enforce their shape.

## Phase 3: User Story 1 - Set up my week (P1) 🎯 MVP

**Goal**: the Schedule tab shows this week's classes and home sessions; items can be added, edited and deleted.

**Independent test**: quickstart.md Manual steps 1 and 2.

- [X] T006 [P] [US1] In `src/schedule/week.ts`: `isoWeekday(d)`, `addDays(d, n)`, `dateKey(d)` (same format as `todayKey`), `minutesOf("HH:MM")`; `weekOccurrences(items, monday)` → `{ date: Date; dateKey; weekday; items: Occurrence[] }[]` for 7 days, each `Occurrence { item; dateKey; startsAt: Date; endsAt: Date }` sorted by start then name; `validateItem(draft)` → `Partial<Record<'name'|'days'|'start'|'minutes', string>>` per research R11: "class name 1–40 characters after trimming; at least one weekday; a valid `HH:MM`; class minutes 5–240 and start + minutes ≤ 24:00; home minutes 5–90"; days deduplicated
- [X] T007 [P] [US1] Tests in `src/schedule/week.test.ts`: occurrences land on the right weekdays for a Monday and across a month end; same-day items sorted by time; DST weekend keeps wall-clock times (`startsAt.getHours()` equals the stored hour); each `validateItem` rule including 23:00 + 60 (ok) and 23:30 + 60 (refused), name of spaces refused, home 95 min refused
- [X] T008 [P] [US1] Routes in `src/app/router.ts`: `{ name: 'scheduleItem'; id?: string; kind?: 'class' | 'home' }` for `#/schedule/new/class`, `#/schedule/new/home`, `#/schedule/<id>` (parse + `href`; unknown `new/<x>` → `schedule`); `activeTab` in `src/app/TabBar.tsx` maps `scheduleItem` to `schedule`; round-trip tests in `src/app/router.test.ts`
- [X] T009 [US1] Shared parts in `src/screens/scheduleParts.tsx`: `ScheduleRow` (start time, name — class name or `ROUTINES[routine].name` — "60 min", tag Class/Home, optional status slot; whole row a link to `#/schedule/<id>`; `aria-label` like "Tuesday 18:00, Pilates, class, 60 minutes"), `WeekdayChips` (toggle buttons Mon–Sun with `aria-pressed`)
- [X] T010 [US1] Screen `src/screens/Schedule.tsx` per contracts/ui.md: title, week range ("18–24 Nov"), `Segmented`-style switch This week / Last week, empty-state card with **Add a class** / **Plan a home session**, otherwise 7 day sections (today highlighted and labelled "Today"; "Nothing planned" for empty days) and the two add buttons below; loading state while `items === null`. Render it from `src/app/Shell.tsx` for `schedule`, and `ScheduleItemForm` for `scheduleItem`; delete `src/screens/Placeholder.tsx` if unused
- [X] T011 [US1] Screen `src/screens/ScheduleItemForm.tsx` per contracts/ui.md: class fields (name, type chips "default Other", days, start "default 18:00", length number + chips 30/45/60/90 "default 60"); home fields (routine buttons as on Today "default Calm morning", days, start "default 07:30", length preset to `profile.routineMinutes[routine]` and re-preset when the routine changes until the person edits length); **Save** runs `validateItem`, shows messages under fields (`aria-describedby`, `aria-invalid`) and focuses the first; on success `add` or `update` (changed fields only) then `goBack({ name: 'schedule' })`; editing shows **Delete** with `confirm("Delete Pilates? Attended classes stay in Progress.")`; unknown id shows "This item no longer exists" and a link back
- [X] T012 [P] [US1] Styles in `src/schedule/schedule.css` (day sections, today highlight, rows, tags, chips wrap at 390 px; no horizontal scroll at phone width), imported by the two screens
- [X] T013 [US1] Component tests (provider value mocked via `ScheduleContext`): `src/screens/Schedule.test.tsx` (empty state buttons; items on the right days in time order; Last week switch changes the range), `src/screens/ScheduleItemForm.test.tsx` (missing name/days blocks save with messages; valid class calls `add` with the draft; editing calls `update` with only changed fields; delete confirms then `remove`)

**Checkpoint**: US1 is usable alone: the week can be set up on phone and tablet.

## Phase 4: User Story 2 - Today knows what's planned (P1)

**Goal**: Today shows today's items and preselects the planned routine and minutes.

**Independent test**: quickstart.md Manual step 3.

- [X] T014 [P] [US2] `watchSessionsSince(uid, since: Date, onData, onError)` in `src/data/repo/sessions.ts` (query `startedAt >= since`, same mapping as `recentSessions`; factor the mapping into one function)
- [X] T015 [P] [US2] In `src/schedule/week.ts`: `todayEntries(items, attendance, todaySessions, now)` → `TodayEntry { occurrence; status: 'open' | 'done' | 'attended' | 'skipped'; passed: boolean }[]` in time order: home `done` per research R4 ("A planned home session for routine R is done when a counted session (at least one done exercise) with routine `plan:R` started today. With two slots for the same routine, the first N slots in time order are ticked for N such sessions"); class status from attendance with id `attendanceId(classId, date)` (define it here: `${classId}_${date}`), else `open`; `passed` when `endsAt < now`. `plannedChoice(entries)` → `{ routine, minutes }` of "the first of today's planned sessions not yet done (in time order)", else `null`. (`attendance` may be `[]` until US3.)
- [X] T016 [P] [US2] Tests in `src/schedule/week.test.ts`: entries only for today's weekday; done from a `plan:calm` session with a done item, not from one with only skips or from yesterday; two desk slots and one desk session → first done; `passed`; `plannedChoice` picks the first open home entry, ignores classes, `null` when all done or none
- [X] T017 [US2] Hook `useTodayEntries()` in `src/schedule/useToday.ts`: `now` fixed at mount; watches today's sessions with `watchSessionsSince(uid, startOfDay(now))`; combines with the provider's items and attendance → `{ entries, choice, loaded }`
- [X] T018 [US2] `src/screens/Today.tsx`: a `TodaySchedule` card below "Your planned session" and above "Your sets" (contracts/ui.md: rows via `ScheduleRow`, passed rows muted, done home rows "✓ Done", home row links to `href({ name: 'plan', plan: { routine, minutes } })`, link **See the week**); picker state becomes `pick: { routine?, minutes? }` starting empty, shown routine = `pick.routine ?? choice?.routine ?? routineForTime(now)`, minutes = `pick.minutes ?? (choice && routine === choice.routine ? choice.minutes : profile.routineMinutes[routine])`; no card when today has no items
- [X] T019 [US2] Tests in `src/screens/Today.test.tsx` (new; mock the hook): card lists entries; Strength keeper at 07:30 planned → Strength keeper and its minutes pressed; tapping Calm morning keeps Calm morning after entries update; no entries → no card and the time-of-day default

**Checkpoint**: on a scheduled day Today needs no re-choosing; unscheduled days behave as before.

## Phase 5: User Story 3 - Classes count toward my week (P2)

**Goal**: classes can be marked attended or Not this time; attended classes count in Progress.

**Independent test**: quickstart.md Manual step 4.

- [X] T020 [US3] Repo additions in `src/data/repo/schedule.ts`: `watchAttendance(uid, sinceDate: string, onData, onError)` (query `date >= sinceDate`; skip malformed), `setAttendance(uid, record)` (`setDoc` merge on `attendanceId(classId, date)` with `schemaVersion`, `updatedAt`), `clearAttendance(uid, id)` (delete). Provider (`src/app/schedule.tsx`): watch attendance since `dateKey(60 days ago)`; expose `attendance: Attendance[] | null`, `setAttendance(item, date, status, minutes?)` (copies "`name`, `type`, `start`" from the class; minutes default the class's duration, else the existing record's), `clearAttendance(id)`; optimistic
- [X] T021 [P] [US3] Rules: `match /attendance/{attendanceId}` block from contracts/firestore-access.md in `firestore.rules`; tests rows 47–50 (`describe('attendance (010 rows 47–50)')`): CRUD + list with a `date >=` query; "`status` unknown; `minutes` outside 5–240; `date` not `YYYY-MM-DD`"; B's records denied; uninvited denied
- [X] T022 [P] [US3] In `src/schedule/week.ts`: `canMarkAttendance(dateKey, now)` ("Monday of last week ≤ date ≤ today"), `attendanceFor(occurrence, attendance)`; tests in `src/schedule/week.test.ts` (window edges on a Monday and a Sunday; future date refused)
- [X] T023 [US3] Attendance UI in `src/screens/scheduleParts.tsx`: `AttendanceControls` (open: **Attended?** with **Yes** / **Not this time**; attended: "✓ Attended · 60 min" + **Change**; skipped: "Not this time" + **Change**) and a `ChangeSheet` (minutes number input 5–240 for attended, **Attended**, **Not this time**, **Undo**, **Done**; invalid minutes not saved, message shown); shown on class rows in `Schedule.tsx` (shown week, `canMarkAttendance` dates only) and in Today's card; row `aria-label` includes the status
- [X] T024 [P] [US3] Progress model in `src/progress/stats.ts` per research R9: `StatSession` gains optional `classType: ClassType`; `classSessions(attendance)` → attended only, `id: 'class-' + id`, `routine: 'class:' + name`, `items: []`, `activeSeconds: minutes * 60`, `startedAt` local from `date` + `start`; `counts` true for class sessions; `techniqueMix` adds class time to `classType` (`TechniqueShare.technique: ClassType`, `'other'` after the techniques); `recentList` adds `isClass`; `routineLabel` returns "<name> (class)" for `class:`
- [X] T025 [P] [US3] Tests in `src/progress/stats.test.ts`: an attended 60-min class adds 60 to `weekSummary` minutes and 1 to sessions; counts a streak day; appears in `weeklyMinutes`; Strength class in the mix as strength; Other class as `other`; no effect on `areaCoverage`; skipped records ignored; `routineLabel('class:Pilates')` → "Pilates (class)"
- [X] T026 [US3] `src/screens/Progress.tsx`: wait for `attendance !== null`; stats over `[...sessions, ...classSessions(attendance)]`; empty state counts classes; legend label `CLASS_TYPE_LABEL`; Recent shows "Class" instead of "n done" for class sessions; `.prog-fill--other` colour in `src/progress/progress.css` (distinct from the five, enough contrast in light and dark); update `src/screens/Progress.test.tsx` with a class session
- [X] T027 [US3] Component tests: `src/screens/Schedule.test.tsx` (Yes calls `setAttendance(…, 'attended')`; no controls on future days; Change → Undo calls `clearAttendance`)

**Checkpoint**: attended classes show in Progress; undo and Not this time work.

## Phase 6: User Story 4 - The planner plans around my classes (P3)

**Goal**: plans use less of a technique a class covers, with a note; kept plans unchanged.

**Independent test**: quickstart.md Manual step 5.

- [X] T028 [P] [US4] `covers(items, attendance, now)` in `src/schedule/week.ts` → `Cover { name; type: Technique; when: 'today' | 'yesterday' }[]`: classes scheduled today not marked skipped, plus classes attended yesterday (from attendance records, so deleted classes still count); type `other` left out; one cover per technique and day, first by start time; tests in `src/schedule/week.test.ts`
- [X] T029 [US4] Planner in `src/planner/plan.ts` per research R6: `PlanInput.covered: Cover[]`; in `score`, "−2.5 for a covered technique unless the routine is built around it (`strength` → strength, `cardio` → cardio)", "+1 for mobility after a covered strength class"; `PlanResult` `kind: 'plan'` gains `notes: string[]`: "Lighter on {technique lower-case}: {name} {today|yesterday}." per cover that applied, or "{name} {today|yesterday} covers {technique lower-case}; {two other routine names} may suit better." for a built-around routine (suggest `calm` and `desk` for strength; `calm` and `weekend` for cardio); add `covered: []` to every existing `PlanInput` in tests and callers
- [X] T030 [P] [US4] Tests in `src/planner/plan.test.ts`: with a strength cover a Weekend longer plan has fewer strength items than without (same seed) and more mobility; yoga cover lowers yoga in Calm morning; Strength keeper with a strength cover → same items as without, built-around note; `covered: []` → identical output to before (existing snapshots/expectations unchanged); notes text
- [X] T031 [US4] `src/planner/usePlan.ts`: `useKeptPlan(routine, minutes, profile, history, covered: Cover[] | null)` waits for `covered` (input null until loaded) and includes it in the input; `fresh()` stores `notes: result.notes`; `src/screens/PlanView.tsx` and `src/player/PlanPlayer.tsx` pass `covers(items, attendance, now)` from the schedule provider, memoised, or `null` while `items` or `attendance` is null; update `src/screens/PlanView.test.tsx` for the new argument and a shown planner note. *Built as*: `useKeptPlan` reads `covers(...)` from the schedule provider itself (no new argument, PlanView/PlanPlayer unchanged); a swap keeps the class notes

**Checkpoint**: all four stories work.

## Phase 7: Polish

- [X] T032 [P] Update AGENTS.md Layout with `src/schedule/` (pure week rules, tested; provider in `src/app/schedule.tsx`) and the Schedule screens
- [X] T033 Run `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run test:rules` (Java 21), and `npx prettier --check` on changed files
- [X] T034 Walk through quickstart.md Manual steps 1–7 in Chrome against the emulators at 390 px and 820 px; no console errors; offline edits via DevTools
- [ ] T035 ⏸ Owner review on a preview channel (quickstart "Owner review"), then PR, CI, merge and deploy (deploys hosting and the new rules; owner's go-ahead)

## Dependencies

- Phase 2 before all stories: T002 → T003 → T004; T005 needs only T002's shapes.
- US1: T006–T008 in parallel → T009 → T010, T011 (T012 alongside) → T013.
- US2 needs US1's T006 and T009: T014–T016 in parallel → T017 → T018 → T019.
- US3 needs T004, T009 (rows), T015's entry status (for Today) and T010: T020; T021, T022, T024, T025 in parallel → T023 → T026, T027.
- US4 needs T020 (attendance) for "attended yesterday": T028 in parallel with T029/T030 → T031.

## Parallel examples

- Phase 2: T002 + T005 (rules against the contract) together; then T003.
- US1: T006 + T007 + T008 + T012 together.
- US2: T014 + T015 + T016 together.
- US3: T021 + T022 + T024 + T025 together after T020.
- US4: T028 + T029/T030 together.

## Implementation strategy

MVP is US1 (the week replaces Coming soon). US2 and US3 make it useful daily; US4 refines the
planner. All four go in one branch and PR; the owner sets up her real week on the preview channel
before merge.
