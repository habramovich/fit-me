# Feature Specification: Freshen a saved set

**Feature Branch**: `012-freshen-set`

**Created**: 2026-11-22

**Status**: Draft

**Input**: User description: "I want the feature to review existing saved set and add (or replace)
new exercises to it to keep it balanced. This is when I have already some set that I like, but want
to try something new." Owner answers: balanced means all four of body areas, parts and time,
technique mix and the set's routine character; suggestions appear on the set screen and each one
is accepted or skipped, an accepted one changes the saved set at once; the app proposes each change
as an Add or a Replace and the owner can ask for another idea in its place; "new" means any
exercise not already in this set, old favourites included.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Try something new in a set I like (Priority: P1)

The owner has a set, "My calm morning", saved from a Calm morning plan and used for weeks. Today
they want a change without losing what works. On the set screen they tap **Try something new**.
A short list of up to three suggestions appears above the set, each with the exercise's figure, a
plain change and a reason:

- **Add Upper back hug to Main**: works the upper back, which the set doesn't.
- **Replace Knee to chest with Figure four**: the hips are already worked three times; Figure four
  keeps the hips and adds the glutes.
- **Add Seated side bend to Cool-down**: the cool-down is short for this set.

Each suggestion has **Add** (or **Replace**) and **Skip**. Accepting changes the saved set at once,
in the same place and part as the item it replaces, or at the end of the named part. An **Undo**
appears briefly. Skipping removes the suggestion from the list. Tapping the figure or name opens the
exercise page; **Back** returns to the set with the suggestions still there.

**Why this priority**: This is the whole feature: a known-good set gets something new while it
stays balanced, in a couple of taps.

**Independent Test**: Open a saved Calm morning set that doesn't work the upper back, tap Try
something new, accept one Add and one Replace, reload on another device, and see both changes in the
set. Check that every suggested exercise is gentle and not already in the set.

**Acceptance Scenarios**:

1. **Given** a saved set, **When** the owner taps Try something new, **Then** up to three
   suggestions appear, each reading "Add X to <part>" or "Replace Y with X", with a one-line reason.
2. **Given** a suggestion "Add X to Main", **When** the owner taps Add, **Then** X is added at the
   end of Main with its recommended amount, and the set's time estimate updates.
3. **Given** a suggestion "Replace Y with X", **When** the owner taps Replace, **Then** X takes Y's
   place and part, with an amount that takes about the same time as Y did.
4. **Given** an accepted suggestion, **When** the owner taps Undo before making another change or
   leaving the set, **Then** the set is exactly as it was before, including Y's own amount.
5. **Given** a suggestion, **When** the owner taps Skip, **Then** it disappears and that exercise is
   not suggested again until the owner leaves the set.
6. **Given** the suggestions on screen, **Then** no two of them suggest the same exercise, replace
   the same item, or fill the same gap.
7. **Given** a set saved from a Calm morning plan, **Then** every suggestion is a gentle exercise
   that a Calm morning plan could use. A set saved from a Desk break gets only standing or seated
   exercises that need nothing beyond a chair or a wall, and so on for each routine.
8. **Given** the owner's profile and marks, **Then** no suggestion is marked Not for me, loads an
   area to avoid, needs equipment the owner doesn't have, or uses a technique set to None.
   Exercises in a go-easy area are suggested in their easier version.
9. **Given** the owner accepted or skipped every suggestion, **When** they tap Try something new
   again, **Then** a fresh list is made for the set as it is now.

---

### User Story 2 - Another idea in the same place (Priority: P2)

The owner likes the idea of replacing Knee to chest but not with Figure four. On that suggestion
they tap **Another idea**. The suggestion keeps its change (replace Knee to chest) and shows the
next best exercise for it, with its own reason. Tapping again keeps going. Once every suitable
exercise has been shown, the list starts again from the best one.

**Why this priority**: The first idea won't always appeal. Without this, the owner can only skip,
and the gap stays.

**Independent Test**: On a set with a Replace suggestion, tap Another idea several times. Each tap
shows a different exercise that still fits the same slot, until the ideas run out and the first one
comes back.

**Acceptance Scenarios**:

1. **Given** a suggestion, **When** the owner taps Another idea, **Then** the same change (the same
   item to replace, or the same part to add to) shows a different exercise with its own reason.
2. **Given** repeated taps, **Then** no exercise repeats until every suitable one has been shown.
   Exercises in the other suggestions on screen are never shown.
3. **Given** only one suitable exercise for that change, **Then** Another idea is not offered.

---

### User Story 3 - See how the set is balanced (Priority: P3)

Above the suggestions, a short review says what the set covers today, so the reasons make sense:
the body areas it works (and notable ones it doesn't), its time per part next to the usual shares,
and its mix of techniques. For example: "Works hips, lower back, hamstrings. Nothing for upper back
or shoulders. Warm-up 4 min, Main 10 min, Cool-down 1 min (short). Yoga 5, Mobility 2."

**Why this priority**: Helpful context, but the suggestions and their reasons already work without
it.

**Independent Test**: Open the review on a set with known contents and check that the areas, part
times and technique counts match the set.

**Acceptance Scenarios**:

1. **Given** a set, **When** the suggestions open, **Then** the review lists the areas the set works
   and up to three it doesn't that matter most (the owner's focus areas first, then the routine's
   areas).
2. **Given** a part well below its usual share of the set's time, **Then** the review marks it
   "short" (or "long" when well above).
3. **Given** the set changes after an accepted suggestion or an Undo, **Then** the review updates.

---

### Edge Cases

- **A full set** (40 exercises): only Replace suggestions are made.
- **An empty set**: only Add suggestions are made, at least one per part where something fits.
- **An item that is no longer available** (removed from the library, now Not for me, or no longer
  fitting the profile): replacing it is always the first suggestion, with the reason saying why
  (e.g. "Knee to chest is now Not for me").
- **Nothing new fits** (the set already holds every suitable exercise): the panel says "Nothing new
  fits this set right now" and suggests no change.
- **Fewer than three good ideas**: show only those; never pad with changes that make the set less
  balanced.
- **A duplicated item** (cat-cow in warm-up and cool-down): it counts as one exercise for "already in
  this set", and either copy may be replaced.
- **An exercise with "I like this as" parts**: it is only suggested for those parts.
- **The set is edited while suggestions are open** (moved, removed, amount changed): suggestions
  that no longer make sense are dropped, and the rest stay.
- **A hand-made set** (from the Library or Add to set, not from a plan): see FR-006.
- **Offline**: suggestions work offline, and accepted changes sync later like any set edit.
- **Two devices**: an accepted suggestion is a set edit like any other, so the latest change wins.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The set screen MUST offer **Try something new**, which shows up to three suggested
  changes for that set. Each is either an Add (an exercise and a part) or a Replace (an item in the
  set and an exercise), with a one-line reason.
- **FR-002**: A suggested exercise MUST NOT already be in the set (in any part or version). Old
  favourites and exercises the owner has done before are allowed.
- **FR-003**: Every suggestion MUST respect the owner's profile and marks as planned sessions do:
  no Not for me, no avoided areas, no missing equipment, no technique set to None, the easier version
  for go-easy areas, low-impact cardio below Advanced, and "I like this as" parts.
- **FR-004**: The suggestions MUST keep the set balanced in four ways:
  - **Body areas**: prefer exercises that work areas the set doesn't (the owner's focus areas first,
    then the routine's areas); avoid adding more to areas the set already works most.
  - **Parts and time**: an Add goes to the part furthest below its usual share of the set's time; a
    Replace keeps the replaced item's part and about its time.
  - **Technique mix**: prefer techniques the owner wants a lot of that the set has few of; avoid
    adding to a technique that already makes up most of the set.
  - **Routine character**: only exercises a plan of the set's routine could use (intensity,
    positions, equipment, and for Cardio, cardio only in Main).
- **FR-005**: A Replace MUST only remove an item whose body areas stay worked by the rest of the
  set or by the new exercise, so accepting a Replace never leaves an area unworked that was worked
  before. Among such items it picks the weakest fit, such as one that only repeats the set's most
  worked area. A favourite is never the item a Replace removes.
- **FR-006**: A hand-made set MUST follow the owner's profile, and its character MUST be read from
  what it holds: no suggestion more intense than the set's most intense exercise, and the usual part
  shares are taken as 20% warm-up, 60% main, 20% cool-down.
- **FR-007**: Accepting a suggestion MUST change the saved set at once, with no Save button. An Add
  goes at the end of its part with the exercise's recommended amount; a Replace takes the item's
  place and part with an amount, within the recommended range, close to the replaced item's time.
- **FR-008**: After an accept, **Undo** MUST restore the set exactly, until the next change to the
  set or until the owner leaves it.
- **FR-009**: **Skip** MUST remove a suggestion. A skipped exercise is not suggested again until
  the owner leaves the set.
- **FR-010**: **Another idea** MUST keep a suggestion's change and show the next best exercise for
  it, without repeating one until all suitable exercises have been shown, and never one shown in
  another suggestion on screen.
- **FR-011**: The suggestions shown together MUST NOT share an exercise, replace the same item, or
  fill the same gap. After any change to the set, suggestions that no longer apply MUST be dropped.
- **FR-012**: For the same set, profile, marks and day, the suggestions MUST be the same each time
  they are made, so reopening the set doesn't reshuffle them.
- **FR-013**: The review (US3) MUST show the areas the set works, up to three notable areas it
  doesn't, each part's time with "short" or "long" when well off its usual share, and the technique
  counts.
- **FR-014**: Accepted changes MUST respect the 40-exercise limit and MUST stay private to the
  owner and synced like other set edits.

### Key Entities

- **Suggestion**: a proposed change to one set: kind (Add or Replace), the exercise and version, the
  part (Add) or the item replaced (Replace), the amount, and the reason. Suggestions are not saved;
  only accepted changes reach the set.
- **Set** (existing, spec 004): unchanged in shape. Its origin (a routine's plan or made by hand)
  sets the character the suggestions follow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From an open set, adding or swapping in a new exercise takes two taps (Try something
  new, then Add or Replace).
- **SC-002**: Across automated checks on sample sets from every routine and by hand, 100% of
  suggestions follow FR-002 and FR-003, and none breaks the set's routine character.
- **SC-003**: After accepting any suggestion other than replacing an item that is no longer
  available, the set works at least as many body areas as before (automated check over the sample
  sets).
- **SC-004**: An accepted Replace changes the set's estimated time by no more than 1 minute, unless
  the new exercise's recommended range can't come that close.
- **SC-005**: For a set with an obvious gap (e.g. a Calm morning set with no upper-back work), a
  suggestion that fills it appears in the first list.

## Assumptions

- Up to three suggestions at a time is enough to choose from without crowding the set screen.
- Suggestions are ideas, not saved data: they are worked out again when asked, and stay the same
  for the same set on the same day (FR-012). Session history is not needed because "new" means "not
  in this set".
- The owner's favourites and "I like this as" picks count in an exercise's favour, as in planned
  sessions.
- A suggestion doesn't change the order of the rest of the set or anyone else's sets.
- Turning a suggested exercise into Not for me, or changing amounts, happens through the existing
  exercise page and set controls; this feature adds no new marks.
- Sets keep their stored shape; no data migration is needed.
