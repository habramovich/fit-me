# Feature Specification: Saved Sets, Exercise Order and Phase Preferences

**Feature Branch**: `004-saved-sets`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "If I'm in the detail view of an exercise, I can't return to the
previous screen, only back to Library. I want to be able to save an exercise set and open it. I
want the ability to reorder exercises in a set (for example I usually use cat-cow as a warm-up, or
it can be used as warm-up and cool-down). What do the arrows on the right of each card mean?"
Decisions: create sets from a plan and from the Library; reorder by drag handles (with up/down
buttons too); the planner learns per-exercise phase preferences.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Save a session as a set and open it later (Priority: P1)

After planning a session she likes, the owner taps **Save as set**, gives it a name ("My calm
morning"), and finds it later on Today under **Your sets**. Opening it shows the exercises by
warm-up, main and cool-down, with **Start**.

**Why this priority**: Repeating a known-good routine is the most common daily use.

**Independent Test**: Plan a Calm morning, save it as a set, reload the app on the tablet, open the
set from Today, and start it; the player runs exactly the saved exercises and doses.

**Acceptance Scenarios**:

1. **Given** a plan, **When** she taps Save as set and confirms a name, **Then** the set appears
   under Your sets on Today on all her devices.
2. **Given** a saved set, **When** she opens it and taps Start, **Then** the player runs its
   exercises, versions and doses in the saved order.
3. **Given** a saved set, **When** the library's default doses later change, **Then** the set keeps
   its saved doses.
4. **Given** a saved set, **When** she renames or deletes it, **Then** the change shows everywhere;
   deleting asks for confirmation.

---

### User Story 2 - Arrange a set: reorder, move between parts, add, remove (Priority: P1)

In a set she drags an exercise by its handle to a new place, including across the Warm-up, Main
and Cool-down headings (cat-cow from main into warm-up). She can also use Move up / Move down
buttons. She removes exercises she doesn't want and adds others from the Library, choosing the
part. The same exercise may appear twice (cat-cow in warm-up and in cool-down).

**Why this priority**: The owner's own order is the point of a set.

**Independent Test**: In a saved set, drag cat-cow from main to the top of warm-up, add cat-cow
again to cool-down, remove one exercise, reload, and see the same order.

**Acceptance Scenarios**:

1. **Given** a set, **When** she drags an item by its handle and drops it in another place or part,
   **Then** it moves there and the change is saved.
2. **Given** a set, **When** she uses Move up on the first item of Main, **Then** it moves to the
   end of Warm-up (and similarly across other headings).
3. **Given** a set, **When** she taps Add exercise, picks a part and an exercise in the Library,
   **Then** it is added at the end of that part with its standard dose.
4. **Given** an exercise page, **When** she taps Add to set and picks a set and part, **Then** it is
   added there; she can also start a new set from this button.
5. **Given** a set, **When** she adds an exercise that is already in it, **Then** it is added again
   (no error).
6. **Given** a set, **When** she removes an item, **Then** it disappears and the time estimate
   updates.

---

### User Story 3 - Tell the planner where I like an exercise (Priority: P2)

On an exercise page she marks **I like this as**: Warm-up, Main and/or Cool-down. New plans put
that exercise only in the parts she chose, prefer it there, and may use it twice when she chose
both warm-up and cool-down.

**Why this priority**: Makes planned sessions follow her habits without building sets by hand.

**Independent Test**: Mark cat-cow as Warm-up and Cool-down; plan several Calm mornings and see
cat-cow appear in warm-up and/or cool-down, never in main.

**Acceptance Scenarios**:

1. **Given** cat-cow marked Warm-up and Cool-down, **When** a plan includes it, **Then** it is only
   in warm-up or cool-down, and it may appear in both.
2. **Given** no preference, **When** a plan is made, **Then** the exercise's own suitable parts
   are used, as before.
3. **Given** a preference, **When** the plan shows its reason, **Then** it can read "Your warm-up
   pick".

---

### User Story 4 - Find my way back; understand Swap (Priority: P1)

From an exercise page, **Back** returns to the screen she came from (plan, set, Today or Library).
On a plan, the swap control reads **Swap** next to its icon.

**Independent Test**: Open an exercise from a plan, tap Back, land on the same plan.

**Acceptance Scenarios**:

1. **Given** she opened an exercise from a plan or set, **When** she taps Back, **Then** she
   returns there with the plan unchanged.
2. **Given** she opened an exercise from a direct link, **When** she taps Back, **Then** she goes
   to the Library.
3. **Given** a plan, **When** she looks at an item, **Then** the swap control shows the word Swap.

---

### Edge Cases

- A set references an exercise later removed from the library: it is skipped in the player and
  shown as "No longer available" in the set, with Remove.
- A set with no exercises: Start is disabled and the set invites her to add some.
- Dragging on a phone must not scroll the page while a handle is held; scrolling elsewhere works.
- Offline: sets open, start and edit offline; changes sync later.
- A set may hold at most 40 exercises.
- Two devices edit the same set: the last saved order wins (single user; acceptable).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The plan screen MUST offer Save as set with an editable default name (routine and
  date).
- **FR-002**: A set MUST store, per item, the exercise, version, dose and part (warm-up, main,
  cool-down), in order; plus its name and when it was created and changed.
- **FR-003**: Today MUST list the person's sets (name, number of exercises, estimated minutes),
  newest-changed first, each opening the set.
- **FR-004**: A set screen MUST show items grouped by part, each with its figure thumbnail, name,
  dose, a drag handle, Move up, Move down and Remove, plus Add exercise, Rename, Delete and Start.
- **FR-005**: Dragging an item by its handle MUST move it within or across parts; Move up/down
  MUST cross part headings at the edges. Every change MUST be saved without a Save button.
- **FR-006**: Exercises MUST be addable from the set (via the Library) and from an exercise page
  (Add to set → choose set or New set, and part). Duplicates are allowed. Maximum 40 items.
- **FR-007**: The player MUST run a set with its saved versions and doses, in order.
- **FR-008**: Each exercise page MUST let the person choose the parts they like it in (any of
  Warm-up, Main, Cool-down; none = no preference), stored privately and synced.
- **FR-009**: The planner MUST place an exercise with a preference only in the preferred parts,
  favour it there, and allow it in both warm-up and cool-down when both are chosen.
- **FR-010**: Back on an exercise page MUST return to the previous in-app screen, or to the
  Library when there is none.
- **FR-011**: The swap control on a plan MUST show the text "Swap".
- **FR-012**: Sets are private to the person; only they can read or change them.

### Key Entities

- **Set**: name, ordered items (exercise, version, dose, part), created and changed times, where
  it came from (a routine or made by hand). Private.
- **Phase preference**: per exercise, the parts the person likes it in. Private.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Saving a plan as a set takes 2 taps plus an optional name.
- **SC-002**: Moving an exercise to another part takes one drag, or at most 3 taps with buttons.
- **SC-003**: A saved set started on another device runs identically (same exercises, order,
  doses).
- **SC-004**: With cat-cow marked Warm-up and Cool-down, it never appears in main across 50
  generated plans (automated test).

## Assumptions

- Doses in a set can't be edited in this feature (they come from the plan or the standard dose);
  editing doses can follow if wanted.
- Sets are personal; sharing sets with family is out of scope.
