# Feature Specification: Exercise feedback round

**Feature Branch**: `011-exercise-feedback`

**Created**: 2026-11-21

**Status**: Draft

**Input**: Owner feedback after using the player and sets: (1) in exercises where the text under
the image changes from one line to two, the whole screen jumps; (2) before a countdown exercise,
leave time to get ready after the previous one, as when switching sides; (3) stretching and
mobility are not the same, they should be separate categories; (4) add Superman and a torso twist;
(5) improve the images: when the position changes during an exercise, show two or three poses side
by side (reference pictures showed numbered poses A, B, C); (6) let the person change the number of
repetitions when building a set. Owner answers: the torso twist is the standing one, arms out at
shoulder height, turning side to side with a heel pivot; keep the animation and make the pose strip
an option to show or hide, hidden by default; in a set, reps, sets and seconds can all be changed;
the Stretching / Mobility split below is right.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A player screen that stays still (Priority: P1)

The owner follows Cat-cow in the player. Under the moving figure, the label changes with each
movement: "Arch the back", then "Round the spine and tuck the chin". The second label is longer and
wraps onto a second line. Today that pushes the count, cues and buttons down, then back up a moment
later, so the screen jumps all the time and the Done button moves under the thumb. After this
change the label always has room for two lines and nothing below it moves.

**Why this priority**: It happens in every session, on every exercise with a long label, and it
makes the main button a moving target.

**Independent Test**: Play an exercise whose labels differ in length (one line and two lines at
phone width). Watch the title, the count and the buttons through several movements: none of them
moves.

**Acceptance Scenarios**:

1. **Given** an exercise whose movement labels take one line and two lines at phone width,
   **When** the figure moves from one movement to the next, **Then** nothing below the figure
   moves.
2. **Given** a label longer than two lines at the narrowest supported width, **Then** it is cut
   short with an ellipsis rather than pushing the screen down; the full text stays available to
   screen readers.
3. **Given** the count beside the title changes (e.g. "0:59 remaining" → "side 2 of 2"),
   **Then** the title and the count keep their place and size.
4. **Given** the "Paused" note or a notice appears or goes away, **Then** the figure and the
   buttons stay where they are.

---

### User Story 2 - Time to get ready before a timed exercise (Priority: P1)

The owner finishes Cat-cow and rates it. The next exercise, Child's pose, is held for 45 seconds.
Today its clock starts at once, while the owner is still getting down onto the mat. After this
change a **Get ready** panel shows the next exercise's name and counts down 5 seconds. A **Start
now** button skips the wait. When the countdown ends, the exercise clock starts at its full time.
It works like the existing "Switch sides" countdown.

**Why this priority**: Without it every timed exercise loses its first seconds to moving into
position. That is the hold the person is meant to do.

**Independent Test**: Play a set whose first exercise and a later exercise are timed. Before each
one a 5-second Get ready countdown shows and the exercise clock stays full until it ends. Start
now begins the exercise at once. Repetition exercises start without it.

**Acceptance Scenarios**:

1. **Given** the next exercise is timed (including the first exercise of the session), **When** it
   comes up, **Then** a Get ready panel shows its name and a 5-second countdown, and the exercise
   clock shows its full time without counting.
2. **Given** the Get ready countdown, **When** it reaches zero, **Then** the exercise clock starts
   and the usual start cue plays.
3. **Given** the Get ready countdown, **When** the person taps Start now, **Then** the exercise
   clock starts at once.
4. **Given** the Get ready countdown, **When** the person pauses (or the app goes to the
   background), **Then** the countdown stops and continues on resume.
5. **Given** the Get ready countdown, **When** the person skips or goes back, **Then** the player
   moves as it does today. Arriving at another timed exercise shows Get ready again.
6. **Given** the next exercise is done by repetitions, **Then** no Get ready countdown shows.
7. **Given** a timed exercise done per side, **Then** Get ready shows before the first side, and
   the existing Switch sides countdown shows before the second side.
8. **Given** the session summary, **Then** the Get ready seconds count toward session time, as the
   Switch sides seconds do.

---

### User Story 3 - Choose my own reps, sets and seconds in a set (Priority: P1)

The owner builds a saved set and adds Glute bridge. The planner suggested 10 reps × 2 sets, and
the owner wants 15 × 3. On the set screen each exercise row shows its dose with **−** and **+**
controls. For a repetition exercise they change reps and sets; for a timed exercise they change
seconds. A hint shows the recommended range ("Recommended 8–15"). When the owner plays the set,
the player uses their numbers, and the set's estimated minutes update.

**Why this priority**: A set is the owner's own routine. Fixed numbers mean doing more or less
than intended, or giving up on the set.

**Independent Test**: In a saved set, change a rep exercise to 15 reps × 3 sets and a timed
exercise to 60 seconds. Leave and reopen the set: the numbers are kept. Play the set: the player
shows 15 reps, set 1 of 3, and a 60-second clock. Open the set on another device: same numbers.

**Acceptance Scenarios**:

1. **Given** a repetition exercise in a set, **When** the person taps + or − on reps, **Then** reps
   change by 1, between 1 and 50.
2. **Given** a repetition exercise in a set, **When** the person taps + or − on sets, **Then** sets
   change by 1, between 1 and 5.
3. **Given** a timed exercise in a set, **When** the person taps + or − on seconds, **Then** time
   changes by 5 seconds, between 10 seconds and 10 minutes.
4. **Given** a dose outside the recommended range, **Then** it is allowed, and the hint is shown
   more prominently ("Recommended 8–15") without blocking.
5. **Given** a per-side exercise, **Then** the dose reads per side ("10 reps per side") and the
   person's number applies to each side.
6. **Given** the person changed a dose, **When** they play the set, **Then** the player uses the
   changed reps, sets and seconds, and the set's estimated minutes reflect them.
7. **Given** the person edits the same set on two devices at once, **Then** the last saved list
   of exercises wins, as for reordering (spec 004). The set's name is never affected by a dose
   change.
8. **Given** the person is offline, **When** they change a dose, **Then** it shows at once and syncs
   when back online.

---

### User Story 4 - Stretching is its own category (Priority: P2)

The owner thinks of stretching (holding a lengthened position) and mobility (moving joints
through their range) as different things. The library lists both under Mobility. After this change
**Stretching** is a category of its own, next to Yoga, Tai chi, Strength, Mobility and Cardio:
in the library filter, the technique tag, profile preferences, Schedule class types, the planner
and the Progress technique mix.

These move from Mobility to Stretching: Calf stretch, Cross-body shoulder stretch, Hamstring
stretch, Neck side stretch, Seated spinal twist, Side lunge stretch, Standing side stretch, Standing
thigh stretch, Upper-back hug. These stay in Mobility: Ankle circles, Chest opener, Chin tucks, Hip
circles, Pelvic tilts, Seated side bend, Shoulder rolls, Shoulder rotations, Wall angels,
Windshield wipers. Yoga holds stay Yoga.

**Why this priority**: The owner asked for this to keep the library clear. The app works without
it, so it comes after the three player and set fixes.

**Independent Test**: Filter the library by Stretching: exactly the nine exercises above show.
Filter by Mobility: exactly the ten above show. Profile shows a Stretching preference already set
to the person's previous Mobility choice. A class can have type Stretching.

**Acceptance Scenarios**:

1. **Given** the library, **When** the person filters by Stretching, **Then** only stretching
   exercises show, each tagged Stretching. Filtering by Mobility shows only mobility exercises.
2. **Given** an existing profile saved before this change, **When** the person opens Profile,
   **Then** Stretching shows with the same amount (None, Some or Lots) as their Mobility
   preference, and that amount is what the planner uses until they change it.
3. **Given** the person sets Stretching to None, **Then** the planner suggests no stretching
   exercises; Mobility exercises are unaffected.
4. **Given** the profile goal Flexibility, **Then** the suggested technique amounts favour
   Stretching as well as Yoga.
5. **Given** the Schedule class form, **Then** Stretching is one of the class types; a Stretching
   class covers stretching in that day's plan as other class types cover theirs. Existing classes
   keep their type.
6. **Given** a strength-class day, **Then** the home plan leans to both mobility and stretching,
   as it leaned to mobility before.
7. **Given** Progress, **Then** the technique mix shows Stretching separately, including past
   sessions that used the moved exercises.
8. **Given** a routine that favoured mobility (e.g. Calm morning), **Then** it favours stretching
   the same way.
9. **Given** sound is on, **Then** a stretching session gets the calm music mood, as mobility does.

---

### User Story 5 - Superman and Standing torso twist (Priority: P2)

The owner wants two exercises the library doesn't have. **Superman**: lying face down, lift the
arms, chest and legs off the mat together, hold briefly at the top, lower. The easier version lifts
the opposite arm and leg, alternating; the harder one holds longer at the top. **Standing torso
twist**: standing with feet apart and arms out at shoulder height, turn the upper body side to side,
pivoting on the back heel, in a steady swinging rhythm (pace Flowing, as Brisk is kept for Cardio). Both come with steps, cues, breathing and an
animated figure, and go through the usual owner review as batch 7.

**Why this priority**: New content, independent of the fixes above.

**Independent Test**: Find both in the library, open each version, and see the figure, steps,
cues, dose and breathing. Play each from its page. The planner can suggest them (Superman in a
main part, the torso twist in a warm-up).

**Acceptance Scenarios**:

1. **Given** the library, **Then** Superman (Strength; lower back, glutes, shoulders; lying, on a mat)
   and Standing torso twist (Mobility; core, upper back, shoulders; standing; warm-up) are listed.
2. **Given** Superman, **Then** it is done by repetitions with a short hold at the top, and has
   easier (opposite arm and leg) and harder (longer hold) versions.
3. **Given** Standing torso twist, **Then** it is done for a set time at a flowing pace, with a
   gentler easier version (smaller turn, no pivot).
4. **Given** either exercise, **Then** it meets every library rule (labels and arrows for every
   movement, breathing for repeated movements, a target inside the recommended range), and its
   figures pass owner review in both figure styles.

---

### User Story 6 - See the key poses side by side (Priority: P3)

Following a moving figure, the owner sometimes can't tell where a movement starts and ends. On an
exercise's page and in the player, a **Show poses** control opens a still row of the exercise's key
poses, numbered 1, 2, 3, side by side. A small arrow and the movement's label sit between each pose
and the next. The animated figure stays as it is. The row is hidden by default. Once the owner
opens it, it stays open on every exercise and in the player until they hide it, on all their
devices.

**Why this priority**: It helps, but the animation already shows the movement. The three fixes
above matter more day to day.

**Independent Test**: Open an exercise with three key poses: no row shows. Tap Show poses: three
numbered poses show in order, in the person's figure style. Open another exercise and start the
player: the row is still shown. Tap Hide poses: it goes and stays hidden.

**Acceptance Scenarios**:

1. **Given** the person has never opened the pose row, **Then** exercise pages and the player show
   only the animated figure and a Show poses control.
2. **Given** an exercise with 2–4 key poses, **When** the pose row is shown, **Then** each key pose
   is drawn still, in order and numbered, in the person's figure style (Classic or Doodle), with the
   chair, wall or seat drawn where the exercise has one.
3. **Given** the pose row is shown, **Then** the movement's label and an arrow sit between
   consecutive poses, so the row reads as a sequence.
4. **Given** the person shows or hides the row, **Then** the choice is remembered across
   exercises, sessions and devices.
5. **Given** a phone held upright, **Then** the pose row fits the screen width without sideways
   scrolling for up to four poses, and in the player the main button stays reachable without
   scrolling.
6. **Given** the pose row is shown or hidden during a session, **Then** the exercise, the timer
   and the count are not interrupted.
7. **Given** a timed hold with one held pose, **Then** the row shows the start and the held pose.

---

### Edge Cases

- A saved set from before this change has no custom doses. It plays exactly as before.
- A set item for an exercise that no longer exists keeps its row but offers no dose controls.
- The Get ready countdown does not show again when a timed exercise's clock is already running,
  for example after resuming from pause.
- A set made of a single timed exercise still gets the Get ready countdown.
- Kept plans and the Today plan keep the planner's dose (adjusting is only in saved sets). To
  adjust a plan, save it as a set first.
- Exercises that moved to Stretching keep their identity: marks, history, ratings and set items
  that refer to them still work.
- A profile whose Mobility preference is None starts with Stretching at None too, so its plan
  doesn't change on the day this ships.

## Requirements *(mandatory)*

### Functional Requirements

**Player layout (US1)**

- **FR-001**: The movement label under the player's figure MUST always take the height of two
  lines, whatever its length. Text that doesn't fit in two lines MUST be cut short with an
  ellipsis.
- **FR-002**: Changes to the count and its detail text, the Paused note and notices MUST NOT move
  the figure or the main controls.

**Get ready (US2)**

- **FR-003**: Before a timed exercise starts (by moving forward, skipping, going back, or as the
  first exercise), the player MUST show a Get ready countdown of 5 seconds. It names the exercise
  and has a Start now button.
- **FR-004**: The exercise clock MUST NOT count down during Get ready. It starts at its full time
  when Get ready ends or Start now is tapped.
- **FR-005**: Get ready MUST pause and resume like the rest of the player and count toward session
  time. Its sound cues MUST match the Switch sides countdown.
- **FR-006**: Repetition exercises and a per-side exercise's second side MUST NOT get Get ready.
  The second side keeps Switch sides.

**Adjustable dose (US3)**

- **FR-007**: On a saved set's screen, each repetition item MUST offer + and − for reps (1–50,
  step 1) and sets (1–5, step 1). Each timed item MUST offer + and − for seconds (10–600, step 5).
- **FR-008**: Each adjustable item MUST show its recommended range as a hint. A value outside the
  range MUST be allowed and the hint MUST be emphasised.
- **FR-009**: A changed dose MUST be saved to the set, synced to the person's other devices, and
  used by the player and the set's minute estimate.
- **FR-010**: Saving a dose change MUST save only the set's list of exercises, never its name or
  other fields. Concurrent edits of one set's list on two devices are last-saved-wins, as for
  reordering (spec 004).

**Stretching (US4)**

- **FR-011**: The library MUST have a Stretching technique, shown wherever techniques are listed
  or chosen: library filter, technique tags, profile preferences, Schedule class types, planner,
  Progress technique mix, music mood.
- **FR-012**: The nine exercises listed in US4 MUST be Stretching. The ten listed MUST stay
  Mobility.
- **FR-013**: A profile without a Stretching preference MUST take its Mobility amount.
- **FR-014**: The planner MUST treat Stretching wherever it treats Mobility today: routine leanings,
  the boost on strength-class days, and goal suggestions (Flexibility and Mobility goals).

**New exercises (US5)**

- **FR-015**: The library MUST include Superman and Standing torso twist, as batch 7, with the
  versions, doses and technique described in US5, passing the library's validation rules.

**Pose strip (US6)**

- **FR-016**: Exercise pages and the player MUST offer a Show poses / Hide poses control, with the
  row hidden by default.
- **FR-017**: The pose row MUST show every key pose of the shown version, numbered, in order and
  still, in the person's figure style. Arrows and movement labels MUST sit between consecutive
  poses.
- **FR-018**: The show or hide choice MUST be saved with the person's preferences and apply on all
  their devices.

### Key Entities

- **Technique**: gains a sixth value, Stretching. Applies to exercises, profile preferences and
  class types.
- **Profile technique preferences**: gain a Stretching amount. When it is missing, the Mobility
  amount is used.
- **Saved set item**: already carries its own dose (reps, sets, seconds). The person can now
  change it.
- **Preferences**: gain "show pose row" (on or off; off by default), stored with the other figure
  and sound choices.
- **Player state**: gains a Get ready phase with its own countdown.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: During a full session at phone width, the main button never moves while an exercise
  is playing.
- **SC-002**: Every timed exercise gives the person 5 seconds, or until they tap Start now,
  between appearing and its clock starting.
- **SC-003**: The person can change any set item's reps, sets or seconds from the set screen itself,
  without opening another screen, and the player uses the new numbers on the next play.
- **SC-004**: Library filters for Stretching and Mobility each return exactly the exercises listed
  in this spec. No existing profile's plan changes because of the split until the person changes
  their preferences.
- **SC-005**: The library reaches 75 exercises, all passing validation and owner review.
- **SC-006**: With the pose row on, every exercise's key poses show on one row at phone width with
  no sideways scrolling.

## Assumptions

- 5 seconds of Get ready matches the existing Switch sides countdown. It is not a setting.
- Dose limits (reps 1–50, sets 1–5, seconds 10–600 in 5-second steps) are wide enough for home
  practice. The recommended ranges already in the library are the hints.
- Dose editing is only for saved sets. Kept plans are the planner's suggestion and stay as planned
  (a plan the person has seen is stored and not re-derived).
- Standing torso twist is Mobility (it moves the spine through its range). It is not Cardio, so it
  needs no low-impact version. Its easier version is a smaller turn without the heel pivot.
- Superman is Strength, lying on a mat, side view, done by repetitions with a 2–3 second hold.
- The pose row uses the same drawings as the animation (the key poses already in the library). It
  does not introduce a new drawing style.
- The pose-row preference is stored with the other display preferences in the profile, so it
  syncs like figure style and music.
