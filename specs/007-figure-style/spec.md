# Feature Specification: Figure Style Preference

**Feature Branch**: `007-figure-style`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "Can you generate images for our exercises in this style? [cartoon
illustrations] … single character. Ok, can you do something like this then? [sheet of stick-figure
doodles: round head with a face, outlined shirt, line limbs]" After seeing a prototype of all 41
exercises: "Looks good, only figure four stretch and wall push-up nose should face in the opposite
direction. I'd like to keep the originals for now and implement this as an alternative option, so
each user can select a style preference."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose the doodle style (Priority: P1)

In Profile, under **Figure style**, the owner sees the two styles side by side, each as a small
picture of the same pose: **Classic** (the current solid figure) and **Doodle** (a friendly line
drawing with a round head, a face, an outlined shirt, single-line arms and legs, and loops for hands
and feet). Picking Doodle changes every exercise figure in the app at once: library cards, the
exercise page, the player, the plan, saved sets and the review page. Movement, arrows, breath cues
and captions stay the same.

**Why this priority**: This is the whole feature; without the choice nobody sees the new style.

**Independent Test**: Pick Doodle in Profile, open the Library, an exercise page, a saved set and the
player; every figure is a doodle and still animates with its arrows. Pick Classic again and every
figure is back to the solid style.

**Acceptance Scenarios**:

1. **Given** a person who has never chosen a style, **When** they open any screen with a figure,
   **Then** they see the Classic style.
2. **Given** Profile, **When** the owner picks Doodle, **Then** every figure on every screen shows
   the doodle style without reloading, and Doodle is shown as selected.
3. **Given** Doodle is chosen, **When** an exercise plays, **Then** the figure moves through the
   same poses, with the same arrows, breath cue and caption, as in Classic.
4. **Given** Doodle is chosen on the phone, **When** the owner opens the app on the tablet, **Then**
   the tablet shows Doodle too.
5. **Given** the phone is offline, **When** the owner changes the style, **Then** it applies at once
   on the phone and reaches other devices once back online.

---

### User Story 2 - The doodle looks the right way in every exercise (Priority: P1)

The doodle has a face, so it shows where the person is looking: toward the wall in a wall push-up,
up at the ceiling when lying on the back (glute bridge, figure four stretch), down at the mat on all
fours or lying face down, and straight out in front-view exercises.

**Why this priority**: A face looking the wrong way makes the instruction confusing (the owner
spotted two in the prototype), so the style is not usable without this.

**Independent Test**: With Doodle chosen, look at every exercise and version in the review page; in
each, the face points the way the person in the exercise would look.

**Acceptance Scenarios**:

1. **Given** Doodle, **When** wall push-up is shown, **Then** the face looks toward the wall.
2. **Given** Doodle, **When** figure four stretch is shown, **Then** the face looks up, away from
   the mat.
3. **Given** Doodle, **When** any of the 41 exercises (every version) is shown, **Then** the face
   points the way the exercise's person would look, and keeps doing so as the figure moves.

---

### User Story 3 - Figures stay readable at small sizes (Priority: P2)

In the small pictures on set rows, plan rows and library cards, the doodle uses a slightly heavier
line and solid hands and feet so the pose is still clear at a glance.

**Why this priority**: The thin line of the full-size doodle is hard to read at thumbnail size, but
the feature still works without this refinement.

**Independent Test**: With Doodle chosen, look at a saved set and a plan at phone width; each
thumbnail's pose (standing, lying, on all fours, seated) can be told apart.

**Acceptance Scenarios**:

1. **Given** Doodle, **When** a set or plan is shown at phone width, **Then** each thumbnail's pose
   is recognisable.

---

### Edge Cases

- A person who chose Doodle and then signs in on a device that has not synced yet sees Classic until
  their profile arrives, then Doodle.
- A stored style value the app does not recognise (e.g. from a future version) shows as Classic.
- People who prefer reduced motion get the same stepped (non-animated) poses in both styles.
- Seated and lying doodles rest on the chair and mat rather than floating above them.
- New exercises added later need their doodle face checked in the review renders, the same as their
  keyframes are now.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST offer two figure styles, Classic (the current figure, unchanged) and
  Doodle, with Classic as the default.
- **FR-002**: Profile MUST let the person choose the style, showing a small preview of each, and the
  choice MUST save at once like other Profile settings.
- **FR-003**: The chosen style MUST apply to every figure in the app (library, exercise page,
  player, plan, saved sets, review) and take effect without a reload.
- **FR-004**: The choice MUST be stored with the person's profile so it follows them across devices,
  and MUST work offline.
- **FR-005**: The Doodle style MUST draw the same poses, movement, arrows, rings, props, breath cues
  and captions as Classic for every exercise and version.
- **FR-006**: The Doodle face MUST look the way the exercise's person would look in every exercise
  and version, including wall push-up and figure four stretch.
- **FR-007**: Doodle thumbnails MUST use a heavier line and solid hands and feet so poses stay
  readable at small sizes.
- **FR-008**: The developer figure renders used for exercise review MUST be able to show either
  style, so new exercises can be checked in both.
- **FR-009**: The figure's screen-reader description MUST be the same in both styles.

### Key Entities

- **Figure style**: a person's preference, Classic or Doodle, stored with the rest of their profile.
  Missing or unknown means Classic.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The owner can switch styles from Profile in under 10 seconds, and the next screen they
  open shows the new style.
- **SC-002**: In Doodle, all 41 exercises (every version and key pose) are checked in the review
  renders and none has the face looking the wrong way.
- **SC-003**: With Classic chosen, every figure looks exactly as it does before this feature.
- **SC-004**: A style chosen on one device shows on another of the owner's devices the next time it
  opens online.

## Assumptions

- The doodle is the line-drawing prototype the owner approved (no colour per technique, no hair or
  clothing choices); further character changes are out of scope.
- The style applies to figures only; app colours, icons and layout do not change.
- The style is a per-person preference, not per device.
- Generated or painted illustrations are out of scope.
- Existing exercise poses stay as they are; small per-exercise adjustments for the doodle (such as
  which way the face looks) are part of this feature.
