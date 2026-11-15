# Feature Specification: Progress

**Feature Branch**: `005-progress`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "Start with progress." Design follows the reviewed prototype's
Progress screen: streak, minutes this week against a goal, minutes per week, technique mix, and
recent sessions, plus which body areas were worked (the owner focuses on shoulders and hips
without forgetting other areas).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See this week at a glance (Priority: P1)

The owner opens the Progress tab and sees: minutes so far this week against her weekly goal, the
number of sessions this week, and her current streak of days in a row (and her best).

**Why this priority**: The quickest motivation check; answers "am I on track?".

**Independent Test**: Do two sessions on different days this week; Progress shows the summed
minutes against the goal, 2 sessions, and a streak counting today or yesterday.

**Acceptance Scenarios**:

1. **Given** sessions this week (Monday to Sunday), **When** Progress opens, **Then** it shows
   their total minutes, the weekly goal, a progress bar, and the number of sessions.
2. **Given** sessions on consecutive days ending today or yesterday, **When** Progress opens,
   **Then** the streak counts those days; a day without a session breaks it.
3. **Given** no session today yet but one yesterday, **When** Progress opens, **Then** the streak
   still counts (it isn't broken until a whole day is missed).
4. **Given** the owner changes her weekly goal in Profile, **When** Progress opens, **Then** the new
   goal is used.

---

### User Story 2 - See trends (Priority: P2)

She sees minutes per week for the last 8 weeks against the goal, and her technique mix (yoga,
tai chi, strength, mobility, cardio) over the last 4 weeks, with minutes and percentages.

**Independent Test**: With sessions across several weeks, the chart shows one bar per week and
the mix adds up to 100%.

**Acceptance Scenarios**:

1. **Given** sessions in past weeks, **When** Progress opens, **Then** there is one bar per week for
   8 weeks (empty weeks show zero), a goal line, and tapping a bar shows that week's minutes.
2. **Given** sessions in the last 4 weeks, **When** Progress opens, **Then** the technique mix
   shows each technique's minutes and share, labelled in words (not by colour alone).

---

### User Story 3 - See which body areas got attention (Priority: P2)

She sees the body areas worked in the last 7 days with how many exercises touched each, her focus
areas marked, and areas not worked at all this week listed so she can include them.

**Independent Test**: After a session of shoulder and hip exercises, those areas show counts and
are marked as focus areas; areas like calves appear under "Not worked this week".

**Acceptance Scenarios**:

1. **Given** exercises done in the last 7 days, **When** Progress opens, **Then** each area worked
   shows a count, focus areas first and marked.
2. **Given** areas with no exercise in the last 7 days, **When** Progress opens, **Then** they are
   listed as not worked this week.

---

### User Story 4 - Look back at recent sessions (Priority: P3)

She sees her last 10 sessions: when, which routine or set, minutes, exercises done and skipped,
and how she rated them.

**Acceptance Scenarios**:

1. **Given** past sessions, **When** Progress opens, **Then** the 10 most recent are listed newest
   first with date and time, routine name, minutes, done/skipped counts and rating counts.

---

### Edge Cases

- No sessions yet: Progress shows a friendly empty state with a link to Today.
- A session that was started and abandoned with nothing done doesn't count toward minutes,
  sessions or streak.
- Sessions saved before this feature have no recorded time: minutes are estimated from the
  exercises done.
- Offline: Progress shows what the device has cached.
- Week boundaries use Monday as the first day, in the device's time zone.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The player MUST record each session's active time (excluding pauses) with the
  session, updated as it goes and at the end.
- **FR-002**: A session counts if at least one exercise was done. Its minutes are its recorded
  active time, or an estimate from its done exercises when no time was recorded.
- **FR-003**: Progress MUST show: minutes this week vs the weekly goal, sessions this week,
  current streak and best streak in the period shown.
- **FR-004**: Progress MUST show minutes per week for the last 8 weeks with the goal line, and the
  value of a week on tap or hover.
- **FR-005**: Progress MUST show the technique mix for the last 4 weeks as minutes and percent,
  with text labels.
- **FR-006**: Progress MUST show body areas worked in the last 7 days with counts, focus areas
  marked and first, and areas not worked.
- **FR-007**: Progress MUST list the 10 most recent counted sessions.
- **FR-008**: The profile MUST include a weekly goal in minutes (default 90, 30–600), editable on
  the Profile tab.
- **FR-009**: All figures MUST be readable without colour (labels, values) and pass text contrast.

### Key Entities

- **Session** (existing): gains recorded active time.
- **Weekly goal**: minutes per week in the profile.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Progress opens with all figures in under 2 seconds on the owner's phone with 60 days
  of sessions.
- **SC-002**: Streak, weekly minutes and technique mix match a hand calculation in automated tests.
- **SC-003**: The owner can tell, without scrolling past the first screen, whether she is on track
  for the week.

## Assumptions

- Only the last 60 days of sessions are read for Progress (enough for 8 weeks and streaks).
- "Levelling up" (dose changes from ratings) comes with the progression feature; Progress shows
  rating counts for now.
