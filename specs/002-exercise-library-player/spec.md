# Feature Specification: Exercise Library and Session Player

**Feature Branch**: `002-exercise-library-player`

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "Exercise library and session player for FitMe. Builds on 001 (sign-in).
Each exercise has technique, body areas worked and loaded, equipment, level, phase, a default dose,
how-to cues, easier and harder versions, and an animated illustration: realistic line figures with
body volume that move smoothly between key poses, with arrows showing the direction of movement.
First batch is the owner's favourites (pelvic tilts, cat-cow, hip circles, shoulder rotations, dead
bug, glute bridge, figure four stretch, bird dog); the library grows to about 40 in reviewed batches,
including tai chi. A Library screen to browse, search, filter, view and mark Favourite or Not for me.
A full-screen session player running a fixed sample routine of the favourites, with reps and sets
or countdowns, pause, back, skip, progress, screen kept awake, and Too easy / Just right / Too hard
after each exercise. Works offline once loaded. Bottom navigation with placeholder tabs. Follows the
reviewed prototype. Out of scope: planner, profile editing, schedule, progress, music, custom
exercises." Owner additions after reviewing the prototype: "add cardio as type of exercises and
breathing recommendation to exercise: what pose to breathe-in / breath-out"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Follow a session hands-free (Priority: P1)

A signed-in person opens FitMe on their phone, sees today's sample session (the owner's eight
favourite exercises, about 15 minutes), taps **Start**, puts the phone on the floor beside the mat
and follows along. For each exercise they see a moving figure with arrows showing which way to move and
when to breathe in or out, the exercise name, short cues, and either a rep count with a set
counter or a countdown. They can
pause, go back or skip. The screen stays on. After each exercise they tap Too easy, Just right or
Too hard. At the end they see that the session is done.

**Why this priority**: This is the core promise of FitMe: set the time, press Start, follow along.
It is useful on its own even before the planner exists.

**Independent Test**: Sign in, tap Start on the sample session, complete it using every control
(pause, back, skip, set done, finish early) and rate each exercise; confirm the ratings are saved
and visible on another device.

**Acceptance Scenarios**:

1. **Given** a signed-in person on the Today screen, **When** they tap Start, **Then** the player
   opens on the first exercise with its animated figure, name, cues, dose and a progress indicator
   showing "1 of 8".
1. **Given** an exercise with a repeated movement is playing, **When** the figure moves, **Then** a
   breath indicator shows "Breathe in" or "Breathe out" in step with each movement; for holds and
   cardio it shows the exercise's breathing note instead.
2. **Given** a timed exercise is running, **When** the countdown reaches zero, **Then** the person
   is asked how it felt, and after answering the next exercise starts.
3. **Given** a rep-based exercise with several sets, **When** the person taps Set done, **Then** the
   set counter advances; after the last set they are asked how it felt.
4. **Given** an exercise done per side, **When** the first side is finished, **Then** the player says
   to switch sides before continuing.
5. **Given** the player is running, **When** the person taps Pause, **Then** the countdown and the
   figure's motion stop until they tap Resume.
6. **Given** the player is on any exercise, **When** the person taps Back or Skip, **Then** the
   previous or next exercise starts from its beginning; a skipped exercise is recorded as skipped,
   not rated.
7. **Given** the player is open, **When** the phone would normally dim and lock, **Then** the
   screen stays on for as long as the player is open, and normal behaviour returns after it closes.
8. **Given** the person rated exercises, **When** they open FitMe on another device, **Then** the
   ratings for that session are there.
9. **Given** the last exercise is rated or skipped, **When** the session ends, **Then** a summary
   shows the session length and how many exercises were done, skipped and rated.

---

### User Story 2 - Browse and learn exercises (Priority: P1)

A person opens the Library tab and sees every exercise as a card with its figure, name and
technique. They search by name or body area ("hips"), filter by technique, and open an exercise to
see the full animation, default dose, step-by-step how-to, what it works, the equipment needed, and
an easier and a harder version.

**Why this priority**: People need to understand a move before doing it unsupervised at home, and
the owner wants to explore beyond their favourites.

**Independent Test**: Open the Library, search "hips", filter to Yoga, open an exercise and switch
between its easier, standard and harder versions.

**Acceptance Scenarios**:

1. **Given** the Library, **When** it opens, **Then** every exercise in the library is listed with
   its figure, name and technique.
2. **Given** the Library, **When** the person types a word, **Then** the list shows only exercises
   whose name or body areas match, and an empty result says so with a way to clear the search.
3. **Given** the Library, **When** the person picks a technique filter, **Then** only that
   technique's exercises are listed; picking All restores the full list.
4. **Given** an exercise page, **When** it opens, **Then** it shows the animated figure with
   direction arrows and breath indicator, the default dose, numbered how-to steps, a breathing
   line (e.g. "Breathe out as you lift, in as you lower"), body areas worked, equipment, level,
   and a control to see the easier and harder versions with their own doses and cues.
5. **Given** an exercise page, **When** the person taps Try it, **Then** the player runs just that
   exercise.

---

### User Story 3 - Mark favourites and moves to avoid (Priority: P2)

On any exercise card or page, the person marks it **Favourite** or **Not for me**. Favourites can
be filtered in the Library. Exercises marked Not for me stay visible in the Library (marked as such)
but are not included in the sample session. Marks follow the person to their other devices.

**Why this priority**: Marks are the raw material the later planner uses. On their own they help
the person keep track of moves they like.

**Independent Test**: Mark one exercise Favourite and another Not for me on the phone, then open
the Library on the tablet and see both marks and the Favourites filter working.

**Acceptance Scenarios**:

1. **Given** an exercise, **When** the person marks it Favourite, **Then** it shows as a favourite
   everywhere it appears and appears under the Favourites filter.
2. **Given** an exercise marked Favourite, **When** the person marks it Not for me, **Then** the
   Favourite mark is removed (the two are exclusive).
3. **Given** a favourite exercise from the sample session, **When** the person marks it Not for me,
   **Then** the next sample session leaves it out.
4. **Given** marks made on one device, **When** the person opens FitMe on another, **Then** the same
   marks are shown.
5. **Given** a new person signs in for the first time, **When** they open the Library, **Then** none
   of the exercises are marked; the owner's favourites are the owner's alone.

---

### User Story 4 - The library grows in reviewed batches (Priority: P2)

The owner reviews each new batch of exercises (figure, cues, dose) before it ships. The first batch
is the owner's eight favourites; later batches bring the library to about 40 exercises covering
yoga, tai chi, strength, mobility and cardio.

**Why this priority**: Content quality matters more than quantity for unsupervised home exercise.
Batches keep each review small.

**Independent Test**: Count exercises per technique in the Library after the last batch, and
confirm each batch was approved by the owner before release.

**Acceptance Scenarios**:

1. **Given** the first release of this feature, **When** the Library opens, **Then** it contains at
   least the eight favourites, each with a complete record and a working animation.
2. **Given** a new batch, **When** it is proposed, **Then** the owner can review every figure in
   motion and its cues before it is released.
3. **Given** the final batch of this feature, **When** the Library opens, **Then** it holds at
   least 40 exercises, with at least 6 in each of the five techniques, including at least 6 tai
   chi moves and at least 6 cardio moves suitable for a small indoor space.

---

### Edge Cases

- The connection drops mid-session: the session continues; ratings are saved once back online.
- The person locks the phone or switches apps mid-session: the countdown pauses and resumes when
  they return; on return, the screen-awake behaviour resumes.
- The device or browser cannot keep the screen awake: the session still works and a one-line note
  suggests changing the screen timeout.
- The person turns the device: the player works in portrait and landscape on phone and tablet.
- The person prefers reduced motion (system setting): figures show the key poses without continuous
  animation, and arrows still show direction.
- The person taps Back on the first exercise: nothing happens and no error appears.
- An exercise lacks an easier or harder version: the page says so instead of showing an empty
  control.
- Every favourite in the sample session is marked Not for me: the Today screen says the sample is
  empty and links to the Library.
- The person opens the app offline for the first time on a new device: they see the sign-in screen
  with a message that a connection is needed the first time.

## Requirements *(mandatory)*

### Functional Requirements

**Exercise library**

- **FR-001**: Each exercise MUST have: name, technique (yoga, tai chi, strength, mobility or
  cardio), body areas worked, body areas loaded, equipment (none, mat, chair, wall or band), level
  (beginner, intermediate, advanced), suitable phases (warm-up, main, cool-down), a default dose,
  numbered how-to steps, breathing guidance, and an animated illustration.
- **FR-002**: A dose MUST be either reps with a number of sets, or a time (a hold, or continuous
  movement for cardio); either may be marked per side. Each dose MUST state a recommended range
  and a target within it (e.g. "10 reps, 8–12 recommended, 2 sets"; "30 s, 20–45 s recommended"),
  for each version, and the range MUST be shown on the exercise page, in the Library card and in
  the player.
- **FR-002a**: Breathing guidance MUST say, for each movement of a repeated exercise, whether to
  breathe in or out (e.g. cat-cow: in as the back sinks, out as it rounds). For holds and cardio
  it MUST give a breathing note instead (e.g. "slow breaths through the nose").
- **FR-002b**: Cardio exercises MUST suit a small indoor space and have a low-impact (no jumping)
  version, as the easier version or the standard one.
- **FR-003**: Each exercise SHOULD have an easier and a harder version, each with its own dose and
  cues; where one is missing, the app MUST say so.
- **FR-004**: Illustrations MUST be line figures with visible body volume (limbs and torso of
  realistic thickness), animated smoothly between two or more key poses, with arrows showing the
  direction of the current or next movement and a breath indicator ("Breathe in" / "Breathe
  out") in step with each movement. No photos or videos.
- **FR-005**: Illustrations MUST distinguish the near and far side of the body so that one-sided
  movements (such as opposite arm and leg) are clear.
- **FR-006**: Every illustration MUST have a text description for screen readers.
- **FR-007**: The first release MUST contain the owner's eight favourites: pelvic tilts, cat-cow,
  hip circles, shoulder rotations, dead bug, glute bridge, figure four stretch and bird dog.
- **FR-008**: By the end of this feature the library MUST hold at least 40 exercises, with at least
  6 in each of the five techniques. Each batch MUST be approved by the owner before release.

**Library screen**

- **FR-009**: The Library MUST list all exercises with figure, name, technique and the person's
  mark.
- **FR-010**: People MUST be able to search by name or body area, and filter by technique and by
  Favourites.
- **FR-011**: An exercise page MUST show the animation, default dose, how-to steps, body areas
  worked, equipment, level, and the easier and harder versions.
- **FR-012**: An exercise page MUST offer Try it, which plays just that exercise in the player.

**Marks**

- **FR-013**: People MUST be able to mark an exercise Favourite or Not for me, or clear the mark.
  The two marks are mutually exclusive.
- **FR-014**: Marks MUST be personal, visible only to their owner, and the same on all of the
  person's devices.

**Session player**

- **FR-015**: The Today screen MUST offer a sample session made of the eight favourites in a fixed
  order (warm-up, main, cool-down), leaving out any the person marked Not for me, with its total
  estimated time.
- **FR-016**: The player MUST show for the current exercise: animated figure with arrows and
  breath indicator, name, cues, and either reps with the current set or a countdown, plus overall
  progress ("3 of 8").
- **FR-017**: The player MUST provide Pause/Resume, Back, Skip, Set done (rep exercises) and Finish
  early (timed exercises), each at least 44 by 44 points and usable without precise aim.
- **FR-018**: For per-side exercises, the player MUST prompt the switch to the other side.
- **FR-019**: After each completed exercise, the player MUST ask Too easy / Just right / Too hard
  with one tap, and record the answer with the exercise, the version done, the date and the
  session.
- **FR-020**: The player MUST keep the screen awake while open, where the device allows it.
- **FR-021**: A session in progress MUST keep working without a connection; ratings made offline
  MUST be saved once the connection returns.
- **FR-022**: At the end, the player MUST show a summary: duration, exercises done, skipped and
  rated.

**App frame**

- **FR-023**: The app MUST have bottom navigation with Today, Library, Schedule, Progress and
  Profile. Schedule and Progress MAY be placeholders saying "Coming soon"; Profile MUST at least
  show the person's name and Sign out.
- **FR-024**: After the first successful sign-in on a device, the app MUST open and run the library
  and player without a connection.
- **FR-025**: All screens MUST work in portrait and landscape on phones and tablets, follow the
  reviewed prototype's look, and meet text contrast of at least 4.5:1.
- **FR-026**: When the system's reduced-motion setting is on, figures MUST show the key poses
  without continuous animation, keeping the direction arrows.

### Key Entities

- **Exercise**: one move in the library with the attributes in FR-001 to FR-006. Shared by
  everyone; changes only through reviewed batches.
- **Version**: an easier or harder variant of an exercise, with its own dose and cues.
- **Illustration**: the key poses and motion arrows for one exercise or version, plus its text
  description.
- **Exercise mark**: a person's Favourite or Not for me on one exercise. Private to that person.
- **Session**: one run of the player by one person: start time, end time, and the list of
  exercises with outcome (done, skipped) and rating.
- **Rating**: Too easy, Just right or Too hard for one exercise and version in one session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From the Today screen, a person starts the sample session in 1 tap and completes it
  without touching the phone except to rate or advance sets.
- **SC-002**: The owner, shown each figure without its name, can name the move or say which way to
  move for at least 7 of the 8 favourites.
- **SC-003**: A person finds any exercise by name or body area in under 15 seconds.
- **SC-004**: With the network turned off after the first sign-in, a full sample session runs and
  its ratings appear on another device within 1 minute of reconnecting.
- **SC-005**: The screen stays on for a full 15-minute session on the owner's phone and tablet.
- **SC-006**: Figure animations play smoothly (no visible stutter) on the owner's phone.
- **SC-007**: The library reaches at least 40 owner-approved exercises with at least 6 per
  technique (five techniques) by the end of the feature.
- **SC-008**: For every repeated-movement exercise, the owner confirms the breathing direction
  shown matches how they were taught it (or approves a correction) during batch review.

## Assumptions

- Default doses for the favourites, target (recommended range), owner to review with the first
  batch: pelvic tilts 10 (8–15); cat-cow 8 slow (6–10); hip circles 8 each direction (6–10);
  shoulder rotations 10 forward and 10 back (8–15); dead bug 2 × 8 per side (6–10); bird dog
  2 × 8 per side (6–10); glute bridge 2 × 12 (10–15); figure four stretch 30 s per side (20–45 s).
  Ranges follow common beginner guidance for bodyweight and mobility work. Order: pelvic tilts, cat-cow, hip circles, shoulder rotations (warm-up); dead bug, bird
  dog, glute bridge (main); figure four (cool-down). About 15 minutes.
- Some moves read better from the front than the side (hip circles, shoulder rotations); the
  figure may use whichever view shows the movement best.
- Exercise content is written and drawn by the agent and approved by the owner; it is general
  fitness guidance, not medical advice. A one-line note in the app says so.
- Ratings are stored now but change nothing yet; the progression feature uses them later.
- Exercise names and cues are in English only.
- Breathing follows the common convention: breathe out on effort or on folding/rounding, in on
  release or opening (e.g. dead bug: out as you extend, in as you return). Tai chi moves breathe
  with the opening (in) and closing (out) of the arms.
- The sample session (the eight favourites) has no cardio; cardio enters sessions with the planner.
- With the tab bar, Sign out moves to the Profile tab, which every signed-in screen can reach.
  This replaces 001 FR-003's "Sign out button on every signed-in screen"; the invite-only screen
  keeps its own Sign out button. The greeting stays on Today; the last sign-in time moves to
  Profile.
- People in the invited group may share a device, but each signs in to their own account.
