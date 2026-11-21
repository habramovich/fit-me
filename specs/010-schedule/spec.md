# Feature Specification: Schedule

**Feature Branch**: `010-schedule`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Implement the Schedule tab." Owner answers: Schedule holds both the
classes she goes to outside the home (e.g. "Pilates, Tue 18:00, 60 min") and the home sessions she
plans; a home session is days + time + routine; reminders are in the app only (no notifications,
no calendar); a class can be marked as attended and then counts toward the weekly goal, streaks
and Progress; the planner takes classes into account (e.g. on a strength-class day the home
session leans to mobility; a yoga class covers that day's yoga).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set up my week (Priority: P1)

The owner opens the Schedule tab and adds what her week looks like. She adds a class: **Pilates**,
type Strength, Tuesdays and Thursdays, 18:00, 60 minutes. She adds home sessions: **Calm morning**
on Monday to Friday at 07:30, and **Weekend longer** on Saturday at 09:00. Schedule shows the
current week, Monday to Sunday, each day listing its classes and home sessions in time order, with
today highlighted. She can edit or delete any of them. The same week shows on her tablet.

**Why this priority**: Everything else (Today, attendance, planning around classes) reads this
schedule. On its own it already replaces the "Coming soon" page with something useful.

**Independent Test**: Add one class on two weekdays and one home session on five weekdays; the week
view shows each on the right days at the right times. Edit the class time and delete one home
session; the week updates. Open the app on another device: the same week shows.

**Acceptance Scenarios**:

1. **Given** an empty schedule, **When** the person opens Schedule, **Then** they see a short
   explanation and two buttons, **Add a class** and **Plan a home session**.
2. **Given** the Add a class form, **When** the person enters a name, type, one or more weekdays, a
   start time and a duration and saves, **Then** the class shows on each of those days this week.
3. **Given** the Plan a home session form, **When** the person picks a routine, one or more
   weekdays and a time and saves, **Then** the session shows on each of those days with the
   routine's name and its minutes (from Profile, changeable in the form).
4. **Given** the form, **When** a name (classes), weekday or time is missing, or the duration is
   outside 5–240 minutes, **Then** saving is blocked and the problem shows next to the field.
5. **Given** a day with several items, **Then** they are listed by start time, and an item shows
   its time, name, length and whether it is a class or a home session.
6. **Given** a class or home session, **When** the person edits it, **Then** the change shows on
   every day it repeats; **When** they delete it (after confirming), **Then** it is gone from the
   week, and classes already marked attended stay in Progress.
7. **Given** the person is offline, **When** they add, edit or delete an item, **Then** the change
   shows at once and reaches their other devices once back online.

---

### User Story 2 - Today knows what's planned (Priority: P1)

On a weekday morning the owner opens FitMe. Today shows a **Today's schedule** card: "07:30 Calm
morning · 15 min" and "18:00 Pilates · 60 min". The session picker below already has Calm morning
and 15 minutes selected, because that is what she planned, instead of a guess from the time of day.
She taps Plan and goes on as usual.

**Why this priority**: This is where the schedule pays off every day: no re-choosing, and a
reminder of the evening class. It is the in-app reminder the owner asked for.

**Independent Test**: With a home session planned for today at a time that differs from the
time-of-day default (e.g. Strength keeper at 07:30), open Today: the card lists today's items and
Strength keeper with its minutes is preselected. On a day with nothing planned, Today behaves as
before.

**Acceptance Scenarios**:

1. **Given** today has scheduled items, **When** the person opens Today, **Then** a Today's
   schedule card lists them in time order; items whose time has passed are shown quieter, and a home
   session already done today is ticked.
2. **Given** a home session is planned for today, **When** Today opens, **Then** the routine and
   minutes of the first of today's planned sessions not yet done (in time order) are preselected;
   if all are done, the usual time-of-day choice applies.
3. **Given** a kept (already planned) session exists, **Then** it still shows as today, above the
   schedule card; the schedule does not replace or re-plan it.
4. **Given** nothing is scheduled today, **Then** Today shows no schedule card and works exactly as
   before this feature.
5. **Given** the schedule card, **When** the person taps a home session, **Then** the plan for that
   routine and minutes opens, as if chosen in the picker.

---

### User Story 3 - Classes count toward my week (Priority: P2)

After Pilates the owner opens FitMe. Today's schedule card shows the class with **Attended?** She
taps **Yes**, and its 60 minutes count toward her weekly goal, keep her streak going, and show in
Progress under Recent sessions as "Pilates (class)" and in the technique mix as Strength. If she
can't go one week, she taps **Not this time** and the class is shown as skipped for that day.

**Why this priority**: Classes are a real part of her exercise; without them Progress
under-counts her week. It depends on Story 1 but not on Story 2.

**Independent Test**: Mark a 60-minute class attended: Progress this week rises by 60 minutes, a
session is added, the streak counts the day, and Recent sessions shows the class. Undo it: all
of that goes back.

**Acceptance Scenarios**:

1. **Given** a class scheduled today, **When** the person taps Yes on Attended?, **Then** it is
   marked attended with its scheduled minutes, and Progress (week minutes, sessions this week,
   minutes per week, streaks, technique mix, recent sessions) includes it.
2. **Given** a class marked attended, **When** the person opens it, **Then** they can change the
   minutes they actually did (5–240) or undo the attendance, and Progress follows.
3. **Given** a class, **When** the person taps Not this time, **Then** that day's class shows as
   skipped, counts nothing, and can be changed back.
4. **Given** the Schedule tab, **When** the person steps back to last week, **Then** they can mark
   or change attendance for last week's classes; earlier weeks are not shown.
5. **Given** a class scheduled later today, **Then** it can already be marked attended (the person
   may update afterwards or early); a class on a future day cannot.
6. **Given** a class of type Other, **Then** its minutes count toward the goal, sessions and
   streaks, and it shows in the technique mix as Other.
7. **Given** a class is renamed or deleted later, **Then** attendances already recorded keep the
   name, type and minutes they had.

---

### User Story 4 - The planner plans around my classes (Priority: P3)

On Tuesday the owner plans her Calm morning. Because Pilates (Strength) is tonight, the plan uses
less strength and more mobility, and says so: "Lighter on strength: Pilates today." On a day with a
yoga class, the home session uses less yoga. If she picks Strength keeper on a strength-class day,
the plan page suggests a different routine but plans what she asked for.

**Why this priority**: A refinement of the existing planner. The schedule and attendance are
useful without it.

**Independent Test**: Schedule a Strength class today, then plan a Weekend longer twice, with and
without the class (other inputs equal): with the class there are fewer strength exercises and the
note appears. Pick Strength keeper on that day: the suggestion note shows and the plan is still
a Strength keeper.

**Acceptance Scenarios**:

1. **Given** a class of type T is scheduled today (not marked Not this time), or was attended
   yesterday, **When** the person plans a session whose routine is not built around T, **Then**
   exercises of technique T are less likely to be chosen and the plan shows a note naming the
   class.
2. **Given** the class is a Strength class, **Then** mobility exercises take the space freed; for
   other types, the routine's usual mix fills it.
3. **Given** the chosen routine is built around the class's type (Strength keeper on a Strength
   class day, Cardio on a Cardio class day), **Then** the plan page shows a note suggesting another
   routine, and the plan itself is the routine asked for.
4. **Given** a class of type Other, **Then** the planner does not change the plan.
5. **Given** a plan already kept before a class was added or skipped, **Then** the kept plan does
   not change (plans the person has seen are never re-derived).

---

### Edge Cases

- A class and a home session at the same time on the same day: both show; no warning.
- A class that crosses midnight is not supported: start time plus duration must end by 23:59.
- The week starts on Monday, the same as Progress.
- Opening Today just after midnight uses the new day's schedule.
- A home session planned for a routine whose minutes change in Profile: items saved with their own
  minutes keep them; the form preselects the Profile minutes for new items.
- Marking attendance twice from two devices for the same class and day results in one attendance,
  not two.
- A class marked attended and then deleted from the schedule: the attendance stays in Progress
  and Recent sessions; it no longer shows on Schedule.
- A day with many items (more than 4) still fits the phone screen; the week view scrolls.
- Daylight-saving changes: times are the person's local wall-clock times and do not shift.
- The Schedule tab, Today card and forms are usable with a screen reader: each item reads its day,
  time, name, length and status.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Schedule tab MUST replace the Coming soon page with a week view, Monday to Sunday,
  of the current week, today highlighted, each day listing its items by start time.
- **FR-002**: A person MUST be able to add, edit and delete **classes**, each with a name (1–40
  characters), a type (Yoga, Tai chi, Strength, Mobility, Cardio or Other), one or more weekdays, a
  start time and a duration of 5–240 minutes that ends by midnight.
- **FR-003**: A person MUST be able to add, edit and delete **planned home sessions**, each with a
  routine (one of the five), one or more weekdays, a start time and minutes (preset from the
  routine's minutes in Profile).
- **FR-004**: Items repeat every week on their weekdays; one-off events and other repeat patterns
  are out of scope.
- **FR-005**: Today MUST show a Today's schedule card when today has items, listing them in time
  order, showing passed items quieter and ticking a home session done today.
- **FR-006**: A home session counts as done today when a planned session of the same routine was
  counted in Progress that day.
- **FR-007**: When a home session is planned today, Today MUST preselect its routine and minutes
  (rule in Story 2, scenario 2) instead of the time-of-day default; tapping a home session on the
  card MUST open its plan.
- **FR-008**: A person MUST be able to mark a class on a given day as **attended** (with minutes,
  default the class's duration, changeable to 5–240) or **Not this time**, and to undo either, for
  any day of the current or previous week up to today.
- **FR-009**: An attended class MUST count in Progress like a session: week minutes and sessions
  against the goal, minutes per week, streaks, technique mix (by its type; Other shown as Other),
  and Recent sessions as "<name> (class)". It MUST NOT count toward body areas or exercise history.
- **FR-010**: An attendance MUST keep the class name, type, date and minutes it was recorded with,
  whatever later happens to the class.
- **FR-011**: At most one attendance record MUST exist per class per day.
- **FR-012**: When planning, the planner MUST treat classes scheduled today (not marked Not this
  time) and classes attended yesterday as covering their type: exercises of that technique are
  less likely; after a Strength class, mobility fills the space; Other changes nothing.
- **FR-013**: A plan affected by a class MUST show a note naming it; when the routine is built
  around the class's type (Strength keeper / Strength, Cardio / Cardio), the plan page MUST suggest
  another routine and still plan the one chosen.
- **FR-014**: Kept plans MUST NOT be re-planned when the schedule or attendance changes.
- **FR-015**: The schedule and attendance MUST be personal (only the person can see or change
  them), the same on all their devices, saved at once and usable offline.
- **FR-016**: No notifications, emails or calendar entries are made; reminders are the Today card
  and the Schedule tab only.

### Key Entities

- **Class**: a repeating outside class: name, type, weekdays, start time, duration. Personal.
- **Planned home session**: a repeating slot: routine, weekdays, start time, minutes. Personal.
- **Attendance**: one class on one date, attended (with minutes) or Not this time; keeps the name
  and type it was recorded with. Counts in Progress when attended.
- **Today's schedule**: the items for today, worked out from the classes, home sessions,
  attendance and today's sessions; not stored.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The owner can set up her usual week (two classes and two home-session slots) in under
  3 minutes on her phone.
- **SC-002**: On every day with a planned home session, Today preselects that routine and minutes,
  with no extra taps.
- **SC-003**: Marking a class attended takes one tap from Today, and Progress includes its minutes
  the next time it opens.
- **SC-004**: Schedule changes made on one device show on the owner's other device the next time it
  opens online.
- **SC-005**: On a strength-class day, a planned non-strength routine has fewer strength exercises
  than the same plan without the class, in every test case checked.
- **SC-006**: With an empty schedule, Today, the planner and Progress behave exactly as before this
  feature.

## Assumptions

- Class types reuse the app's five techniques plus Other; a class like Pilates is set by the owner
  to whichever type fits (e.g. Strength or Mobility).
- Attendance can be marked for today and back to the start of last week; older history is out of
  scope (the weekly goal and streak care about the recent past).
- An attended class adds no exercises to the planner's history, so it doesn't change which
  exercises the planner avoids repeating; it only changes the technique balance (FR-012).
- The Today card is the reminder. Push notifications, calendar export and email are out of scope
  (owner's choice; they would also need paid server features).
- Sharing a schedule with other invited people is out of scope.
- A class's place, teacher or notes are out of scope; the name can carry them ("Pilates – studio").
- Items have no end date; the person deletes an item when it stops.
- The existing time-of-day default stays for days without a planned home session.
