# Research: Session feedback fixes

## R1. What to keep so a plan stays the same

**Decision**: Keep the plan's *result* (its items: exercise, version, dose, part, reason,
seconds) in a Firestore document per routine and length,
`users/{uid}/plans/{routine}-{minutes}`. Swap, Reshuffle and the "no longer eligible" repair
work on these stored items.

**Rationale**: The planner's output depends on the date, recent history, the profile and marks.
Keeping only the inputs (seed + shuffle + swaps, as the URL does today) can't survive a change
in history, and re-running the planner after a mark or profile change reshuffles *every* item
(scores shift), while FR-005 asks that only the affected item changes. Stored items are the
smallest thing that is exactly "what the owner reviewed".

**Alternatives considered**:
- *Freeze the inputs* (planned day + history snapshot) and re-run the planner: same output only
  while profile and marks are unchanged; one Not for me mark would redo the whole plan.
- *localStorage*: not synced; the owner previews on the phone and may start on the tablet
  (constitution V: synced).
- *One kept plan overall*: going back to a routine previewed earlier would make a new plan,
  which is the same surprise again.

## R2. Avoiding a new device overwriting a kept plan with a fresh one

**Decision**: A provider watches `plans` (like `SetsProvider` watches `sets`). Before
*creating* a plan for a routine and length that isn't in the watched list, the app reads that one
document with `getDoc` (server first when online, cache when offline), and creates only if it's
missing or used up. The document id is deterministic (`{routine}-{minutes}`), so two devices
creating at once end with one document (last writer wins, as the spec allows).

**Rationale**: A fresh device's first snapshot can come from an empty cache. Creating from that
would replace the plan the owner reviewed on the other device.

## R3. Swap and Reshuffle on a stored plan

**Decision**:
- **Reshuffle**: make a new plan with seed `{today}|{routine}|{generation + 1}` and store it with
  the new `generation`. The URL no longer carries `shuffle`/`swaps`.
- **New plan after one is used**: also `generation + 1`, so the next plan on the same day isn't
  seeded identically.
- **Swap item i**: a new pure planner function picks the best-scoring eligible candidate for that
  part that isn't already in the plan and isn't in the item's `passed` list (exercises already
  swapped away from this slot); when every candidate has been passed, `passed` resets. The
  replacement's dose is scaled to the slot's seconds (as today).
- **Repair** (FR-005): a pure function checks each stored item against the current library,
  profile and marks (the planner's existing `eligible` rule, plus "the version still exists");
  each failing item is replaced as in Swap, or removed when nothing fits, with a note. If anything
  changed, the repaired items and notes are written back; notes are cleared by the next Swap or
  Reshuffle.

**Rationale**: Reuses the planner's candidate pool, eligibility and scoring (exported, not
duplicated). `passed` replaces the URL swap counter, which only made sense relative to a plan
re-derived from the seed.

## R4. When a kept plan is "used up"

**Decision**: The player gets the kept plan's id; on the first `done` outcome it writes
`usedAt` and `sessionId` to the plan document (once). A used plan stays readable (a mid-session
reload still loads its items) but is ignored by Today and replaced the next time that routine and
length is planned.

**Rationale**: Matches FR-004 and the 005 rule that a session counts once one exercise is done.

## R5. Pace

**Decision**: `type Pace = 'hold' | 'slow' | 'flowing' | 'brisk'`, labelled Hold, Slow and
controlled, Flowing, Brisk. `paceOf(exercise, version)` returns `version.pace ?? exercise.pace ??`
a default:

| Dose | Technique / tag | Default |
|---|---|---|
| time | cardio | brisk |
| time | tai chi | flowing |
| time | yoga, strength, mobility | hold |
| reps | tai chi, or tag `breathing` | flowing |
| reps | anything else | slow |

The `pace` field is optional and no current exercise needs it (cat-cow and sunrise breath are
tagged `breathing`, so they flow). The library test fails when `hold` has a reps dose, when a
reps dose has no `secondsPerRep`, or when `brisk` isn't cardio.

**Rationale**: The defaults fit all 41 exercises (checked against the library: timed yoga and
wall-sit are holds, timed tai chi forms flow, timed cardio is brisk, breath-led reps flow); a
field per version would be 100+ lines of repetition. The owner checks the result per exercise
in the figure renders.

## R6. Figure timing per pace

**Decision**: `geometry.ts` gains `timingFor(pace, secondsPerRep, keyframeCount)` and a hold
variant of `phaseAt`:

- **slow**: one cycle = `secondsPerRep`; each transition is `secondsPerRep / count`, ¾ moving
  and ¼ pausing in the pose (glute bridge, 4 s, 2 poses → 1.5 s move + 0.5 s pause).
- **flowing**: no pause; each transition `secondsPerRep / count` for reps, 2.5 s for timed forms.
- **brisk**: no pause; 0.5 s per transition (a step a half-second, about 120 per minute).
- **hold**: plays transitions from pose 0 up to the held pose at 1.5 s move + 0.5 s pause, then
  stays on the held pose with no arrows, showing the breathing line. The held pose is
  `figure.holdAt` (default 1: every current hold figure goes "start → pose").
- **Reduced motion**: as today (step every 2.5 s), except holds show the held pose still.

Every figure keeps smoothstep easing. With no pause, the figure still slows at each turning point,
which reads as a natural reversal rather than a stop.

**Rationale**: Uses content the library already has (`secondsPerRep` on every reps version), keeps
the figure maths pure and unit-testable, and adds nothing to the content files except one
override.

## R7. "Skip next time"

**Decision**: The rating sheet gains a fourth button, **Skip next time** (hint: "Not for me:
won't be suggested again"). It dispatches `rate` with `rating: null` (the item still counts as
done, with no rating), calls `setMark(id, 'notForMe')`, and shows a dismissible line on the next
screen for 6 s: "{name} won't be suggested again. Undo from its page in the Library." Too easy /
Too hard keep their labels without the "next time" hints; the finish screen says "Ratings are
saved; you'll see them in Progress."

**Rationale**: Reuses the existing mark (the planner already excludes it, and the Library already
shows and undoes it). `rating: null` keeps Progress's rating counts unchanged.
