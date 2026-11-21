# Research: Schedule

Decisions behind [plan.md](plan.md). Each: decision, rationale, alternatives considered.

## R1. One document per schedule item

**Decision**: `users/{uid}/schedule/{itemId}`, one document per class or planned home session,
with `kind: 'class' | 'home'`. Edits update only the changed fields.

**Rationale**: Whole-document saves are last-writer-wins (AGENTS.md lessons); one document per
item means editing Pilates on the phone can't overwrite a home session added on the tablet. The
collection is tiny (a handful of items) so one `onSnapshot` watch covers it, as with sets.

**Alternatives**: one `schedule` map on the user document (a phone and tablet edit would race on
the whole list); separate `classes` and `homeSessions` collections (two rules blocks and watches
for the same shape).

## R2. Attendance in its own collection, one document per class per day

**Decision**: `users/{uid}/attendance/{classId}_{YYYY-MM-DD}`, holding `status` (`attended` or
`skipped`), `minutes`, and a copy of the class's `name`, `type` and `start`. Undo deletes the
document.

**Rationale**: The deterministic id gives FR-011 (at most one per class per day) for free: two
devices marking the same class write the same document. Copying name, type and start meets FR-010
(attendance survives renames and deletion). Deleting on undo keeps Progress simple: a document
means something happened.

**Alternatives**:
- Writing an attended class into `sessions` (routine `class:<id>`): Progress would pick it up
  with fewer changes, but sessions can't be deleted (history is kept, rules row 25), "Not this
  time" isn't a session, and the planner's history reads sessions' exercises.
- Random ids with a query for duplicates: needs a transaction, and offline writes from two devices
  could still both land.

## R3. Local wall-clock dates and times as strings

**Decision**: weekdays as ISO numbers `1`–`7` (Monday to Sunday), start as `"HH:MM"`, dates as
`"YYYY-MM-DD"` in local time (the existing `todayKey`). An attended class's moment for Progress is
built on the device from `date` + `start`.

**Rationale**: Classes are at a wall-clock time wherever the person is; storing instants would
shift them across daylight-saving changes (spec Edge Cases). String dates sort and compare
correctly, so "attendance since a date" is a simple range query on one field (automatic index).

**Alternatives**: Firestore timestamps (time-zone and DST shifts); JS `getDay()` numbering with
Sunday = 0 (the week starts on Monday here, as in Progress).

## R4. "Done today" for a home session comes from today's sessions, watched

**Decision**: Today watches the person's sessions started since local midnight
(`watchSessionsSince`). A planned home session for routine R is done when a counted session
(at least one done exercise) with routine `plan:R` started today. With two slots for the same
routine, the first N slots in time order are ticked for N such sessions.

**Rationale**: Exactly FR-006 ("counted in Progress that day"), and live: finishing a session and
returning to Today ticks it without a reload. `useHistory` loads once per app start, so it would go
stale. Kept plans' `usedAt` is lost when a second plan for the same routine and length is made.

**Alternatives**: `useHistory` (stale after a session); kept plans' `usedAt` (overwritten, see
above).

## R5. Today's preselection is derived, and a person's own pick wins

**Decision**: Today holds the person's pick as state that starts empty; the shown choice is
`pick ?? plannedChoice(today's entries) ?? routineForTime(now)`. `plannedChoice` returns the first
home session today, in time order, not yet done.

**Rationale**: The schedule and today's sessions arrive after Today first renders (cache or
network); a derived value updates when they do, but never overrides a tap.

**Alternatives**: initialising state from the schedule (wrong when the schedule loads a moment
later); waiting for the schedule before showing Today (a blank Today when offline on a new device).

## R6. Planner: classes as "covered" techniques, a score penalty and a note

**Decision**: `PlanInput` gains `covered: Cover[]` (`{ name, type, when: 'today' | 'yesterday' }`),
from classes scheduled today and not marked Not this time, and classes attended yesterday; type
Other is left out. In `score`:
- An exercise whose technique is covered gets −2.5 (about the gap between a liked and a neutral
  technique plus the routine boost), unless the routine is built around that technique
  (`strength` → strength, `cardio` → cardio).
- After a covered strength class, mobility exercises get +1.

`makePlan` returns `notes` on a plan: "Lighter on strength: Pilates today." (or "yesterday") per
covered class it acted on, or, for a built-around routine, "Pilates today covers strength; Calm
morning or Desk break may suit better." The kept plan stores these notes when it's created.

**Rationale**: A penalty, not a filter: the planner still has enough candidates (a yoga-heavy
profile on a yoga-class day still gets a valid Calm morning), and the existing seeded jitter keeps
plans varied. The note is shown where kept-plan notes already show (PlanView and Today's card).
Kept plans aren't re-derived (FR-014): `covered` only matters when a plan is made, reshuffled or an
item swapped.

**Alternatives**: excluding covered techniques (can leave Calm morning short of candidates);
switching routine automatically (the owner chose to keep her pick and get a suggestion).

## R7. The planner waits for the schedule

**Decision**: `useKeptPlan` takes `covered` (null until the schedule and recent attendance have
loaded) and makes no plan before then.

**Rationale**: AGENTS.md lesson: the planner waits for real data. A plan made from an empty
schedule would be kept and wouldn't change when the class appears a moment later.

## R8. One provider for schedule and recent attendance

**Decision**: `ScheduleProvider` (like `SetsProvider`) watches `schedule` and attendance since 60
days ago (Progress reads 60 days of sessions), applies edits optimistically, and is shared by
Schedule, Today, the planner and Progress.

**Rationale**: Every consumer needs the same small data; one watch each keeps reads low and the
screens consistent. 60 days of attendance is at most a few dozen documents.

**Alternatives**: one-off reads per screen (stale after edits on another screen); watching all
attendance (grows without bound, though slowly).

## R9. Progress counts classes through the existing stats

**Decision**: `classSessions(attendance)` turns attended records into `StatSession`s with
`routine: 'class:<name>'`, no items, `activeSeconds = minutes × 60`, `startedAt` from date + start,
and a new optional `classType`. `counts` accepts a class session; `techniqueMix` attributes its
time to `classType` (a new `'other'` share, labelled Other); `areaCoverage` ignores it (no items);
`recentList` marks it as a class; `routineLabel` gives "<name> (class)".

**Rationale**: Week minutes, sessions, per-week minutes and streaks then need no change, and the
Progress screen keeps one list of sessions.

**Alternatives**: separate class totals added to each figure (every stat changes, easy to miss one).

## R10. Screens and routes

**Decision**: `#/schedule` shows the week with a This week / Last week switch; `#/schedule/new/class`,
`#/schedule/new/home` and `#/schedule/<id>` open one form screen (`ScheduleItemForm`). Attendance
is set inline on class rows (Schedule and Today) with a small sheet for minutes and undo.
Weekdays are toggle chips, the time a native `<input type="time">`, minutes a number input with
chips for common lengths.

**Rationale**: Matches the existing screen-per-route pattern (sets, plans); native time inputs are
the most usable on phones and tablets and need no library. Back from the form uses `goBack`.

**Alternatives**: a modal form on the week view (no back-button support, harder at phone width).

## R11. Validation

**Decision**: one pure `validateItem(draft)` returning per-field messages: class name 1–40
characters after trimming; at least one weekday; a valid `HH:MM`; class minutes 5–240 and start +
minutes ≤ 24:00; home minutes 5–90 (the planner and kept-plan range). Attendance minutes 5–240.
Firestore rules re-check shapes and ranges.

**Rationale**: Testable without the UI; the rules stop malformed writes from any client.
