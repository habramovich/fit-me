# Feature Specification: Session feedback fixes

**Feature Branch**: `006-session-feedback`

**Created**: 2026-11-15

**Status**: Draft

**Input**: Owner feedback after the first real sessions: (1) "I reviewed a session yesterday, but
when I clicked Start today it was a totally different set I wasn't prepared for." (2) "Movements
on the figure don't tell me if it should be fast or slow (hold the pose)." (3) "In the rating I
can only say too easy / too hard, I can't say skip next time."

Causes found: the planner builds a session from the date and recent history, and nothing keeps
the session that was shown; every figure plays at one fixed speed and timed holds keep moving
between poses; the rating sheet has no way to drop an exercise, and its "More next time" /
"Easier next time" hints promise changes the planner doesn't make yet.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The session I reviewed is the session I do (Priority: P1)

The owner plans a session in the evening, reads through it to prepare, and the next morning
opens the app on any of their devices and starts exactly that session. It changes only when they
change it (Swap, Reshuffle, another routine or length), or once they've done it.

**Why this priority**: Being surprised by an unprepared set at the start of a session breaks
trust in the plan; it was the most frustrating part of real use.

**Independent Test**: Plan a 15-minute Calm morning, note its exercises, change the device date
to the next day (or wait a day), open Today: the same plan is offered and starts unchanged.

**Acceptance Scenarios**:

1. **Given** a plan was shown for a routine and length and not yet done, **When** the owner
   opens a plan for the same routine and length later (another day, another device, after new
   sessions were recorded), **Then** they see the same exercises, versions, doses and order.
2. **Given** a kept plan, **When** the owner opens Today, **Then** Today offers it ("Your planned
   session", routine, length, and when it was planned if not today) with Review and Start.
3. **Given** a kept plan, **When** the owner swaps an item or reshuffles, **Then** the changed
   plan becomes the kept plan, and stays that way on later visits.
4. **Given** a kept plan, **When** the owner finishes a session from it with at least one
   exercise done, **Then** that plan is used up and the next plan for that routine and length is
   new.
5. **Given** a kept plan, **When** the owner starts it and leaves without doing any exercise,
   **Then** the plan is still kept.
6. **Given** a kept plan containing an exercise the owner has since marked Not for me, or that
   no longer suits the profile (an area now avoided, equipment removed, a technique set to
   none), **When** the plan is shown, **Then** only that item is replaced and a short note says
   which one changed and why.

---

### User Story 2 - The figure shows how fast to move (Priority: P2)

On the player and the exercise page, the figure moves at the exercise's real pace, and a short
pace word next to it says how to move: **Hold** (get into the pose, then stay still and
breathe), **Slow and controlled** (strength and mobility repetitions), **Flowing** (tai chi and
moving-with-the-breath yoga, no pauses), or **Brisk** (cardio).

**Why this priority**: Without a pace the owner guesses, and a stretch done at cardio speed (or
a march done in slow motion) loses its point. Second because it improves every exercise but
doesn't block doing a session.

**Independent Test**: Open a hold (e.g. Child's pose), a strength move (e.g. Glute bridge), a
tai chi form (e.g. Wave hands like clouds) and a cardio move (e.g. March in place): each shows
its pace word and visibly different motion.

**Acceptance Scenarios**:

1. **Given** a hold, **When** its figure plays, **Then** it moves into the pose and then stays
   still in it (with its breathing line), rather than looping between poses.
2. **Given** a repetition exercise, **When** its figure plays, **Then** one full cycle takes
   about as long as one repetition of that version.
3. **Given** a flowing exercise, **When** its figure plays, **Then** it moves continuously
   without stopping at each pose.
4. **Given** a brisk exercise, **When** its figure plays, **Then** it moves noticeably faster than
   any slow or flowing exercise, at roughly a real stepping rhythm.
5. **Given** any exercise version, **When** it's shown in the player or on its exercise page,
   **Then** its pace word is shown next to the figure, in text.
6. **Given** reduced motion is on, **When** a figure is shown, **Then** it still steps between
   poses as today (a hold shows the held pose still), and the pace word still says the pace.

---

### User Story 3 - "Skip next time" when rating (Priority: P2)

After an exercise, the rating sheet offers a fourth choice, **Skip next time**. Choosing it marks
the exercise Not for me: the planner won't suggest it again, and the owner can undo it from the
exercise's page in the Library. The other rating hints stop promising changes the app doesn't
make yet.

**Why this priority**: Small and self-contained; it gives the owner control over what comes up
without leaving the session.

**Independent Test**: In a session, choose Skip next time on an exercise; the session continues;
the exercise shows as Not for me in the Library; a new plan never includes it; unmarking it in
the Library makes it eligible again.

**Acceptance Scenarios**:

1. **Given** the rating sheet after an exercise, **When** the owner chooses Skip next time,
   **Then** the exercise is marked Not for me, a short confirmation says it won't be suggested
   again and can be undone in the Library, and the session moves on as after any rating.
2. **Given** an exercise marked through Skip next time, **When** a plan is made, **Then** it isn't
   included (including in a kept plan, per US1 scenario 6).
3. **Given** the rating sheet, **When** it's shown, **Then** Too easy and Too hard don't claim
   the next session will change, and the finish screen says ratings are saved and shown in
   Progress (instead of "once the planner arrives").

---

### Edge Cases

- Two plans for different routines or lengths: each is kept separately; Today offers the most
  recently viewed one that isn't done.
- A kept plan from many days ago is still offered, with the day it was planned shown, so the
  owner can choose to reshuffle.
- Offline: a kept plan already on the device is shown and can be started; a plan kept or
  changed offline syncs when the connection returns (last change wins).
- Two devices change the same kept plan at once: the later change wins; no merge.
- Replacing an item in a kept plan (US1 scenario 6) keeps the other items exactly as they were.
  If no replacement is available for that part, the item is removed and the note says so.
- An exercise added to the library after a plan was kept doesn't change that plan.
- Skip next time on an exercise that's also in a saved set: the saved set keeps it (sets are the
  owner's own choice); only the planner stops suggesting it.
- Skip next time during a session doesn't change the rest of the session already running.
- Saved sets and the sample routine are unaffected by US1; they already stay the same.
- A per-side or multi-set exercise shows one pace for the whole exercise.

## Requirements *(mandatory)*

### Functional Requirements

**Kept plans (US1)**

- **FR-001**: When a plan is shown for a routine and length, the app MUST keep it (exercises,
  versions, doses, order, reasons) for that routine and length, synced across the owner's
  signed-in devices.
- **FR-002**: Opening a plan for a routine and length with a kept plan MUST show the kept plan,
  regardless of date or new history.
- **FR-003**: Swap and Reshuffle MUST update the kept plan.
- **FR-004**: A kept plan MUST be used up once a session started from it has at least one
  exercise done; it MUST stay kept if none was done.
- **FR-005**: When a kept plan is shown, items that are no longer eligible (Not for me, an
  avoided area, missing equipment, a technique set to none, no longer in the library) MUST be
  replaced individually with a note; all other items stay unchanged.
- **FR-006**: Today MUST offer the most recently viewed kept plan that isn't used up, with its
  routine, length and planned day (when not today), and links to review and start it.

**Pace (US2)**

- **FR-007**: Every exercise version MUST have one pace: Hold, Slow and controlled, Flowing or
  Brisk (a default from its technique and dose, or set explicitly). The library check MUST fail
  for a pace that contradicts the dose (a Hold that counts repetitions, a repetition pace with no
  time per repetition, Brisk outside cardio).
- **FR-008**: The figure MUST play at its version's pace: holds move into the pose and stay
  still; repetition exercises take about one repetition's time per cycle; flowing exercises move
  without pausing at poses; brisk exercises move at about one step per second or faster.
- **FR-009**: The pace word MUST be shown as text next to the figure in the player and on the
  exercise page.
- **FR-010**: With reduced motion, figures MUST keep today's step-through behaviour, except holds,
  which show the held pose still; the pace word still shows.

**Rating (US3)**

- **FR-011**: The rating sheet MUST offer Skip next time, which marks the exercise Not for me,
  confirms it briefly with how to undo, and continues the session.
- **FR-012**: The rating sheet and finish screen MUST NOT promise that ratings change future
  sessions while they don't.

### Key Entities

- **Kept plan**: a plan for one routine and length: its items, when it was planned and last
  viewed, and whether it has been used up. Belongs to the owner, synced across devices.
- **Pace** (exercise content): one of Hold, Slow and controlled, Flowing, Brisk, per exercise
  version.
- **Not for me mark** (existing): now also set from the rating sheet.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A plan reviewed on one day and started on a later day (same or another device)
  matches item for item in 100% of cases where the owner made no change and nothing became
  ineligible.
- **SC-002**: For each of the four paces, the owner can name the right pace for a sample exercise
  from the figure and its pace word alone, on first viewing.
- **SC-003**: All 41 library exercises (every version) have a pace, checked by the library test.
- **SC-004**: Dropping an exercise for good takes one tap from the rating sheet, without leaving
  the session.
- **SC-005**: No text in the player or finish screen promises a change the app doesn't make.

## Assumptions

- "Skip next time" means never suggest again (the existing Not for me mark), as the owner chose;
  a one-time skip isn't offered.
- Making Too easy / Too hard change later sessions is deferred to a later feature; the ratings
  keep being saved and shown in Progress.
- Pace is set per version in the exercise content, with a sensible default from the technique and
  dose (timed yoga or strength = Hold, cardio = Brisk, tai chi = Flowing, repetitions = Slow and
  controlled) and explicit exceptions where a move differs (e.g. cat-cow and sunrise breath
  flow with the breath).
- Kept plans don't expire; the planned day is shown so an old plan is obvious.
- Kept plans live with the owner's other data and follow its privacy and access rules.
- No sound or spoken counting is added; pace is visual and in text.
