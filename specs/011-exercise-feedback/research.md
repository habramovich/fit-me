# Research: Exercise feedback round

## R1. Why the player jumps, and how to keep it still

**Finding**: `<Figure>` renders two rows of text around the drawing: the breath row above (a
breath chip, or the version's breathing line for holds and cardio) and the movement caption below.
The caption is left out when a hold reaches its pose (`label = null`). It wraps to two lines when
the label is long. The breathing line can also wrap. Each change in their height moves everything
below the figure card. The player's `.player__controls` has `margin-top: auto`, but on a phone the
content already fills the screen, so the buttons move with it.

**Decision**: In the full (non-thumbnail) figure:

- The caption is always rendered. When there is no label, an empty placeholder keeps the space.
  It has a fixed height of two lines and is clamped to two lines with an ellipsis
  (`-webkit-line-clamp`, now widely supported). The text stays in the DOM, so screen readers get
  all of it.
- The breath row gets a fixed height that fits the chip or three lines of the breathing note
  (13 px), clamped the same way. The longest note in the library is 82 characters, which needs
  three lines at phone width.

**Checked in the browser** (390 × 844): through Cat–cow's movements, a pause, and Child's pose
from Get ready into its hold, the main button's position never changed.
- In the player, the count block has a fixed minimum width and its detail line doesn't wrap. The
  Paused note keeps its line all the time (hidden with `visibility` when not paused). The
  "won't be suggested again" notice becomes a floating toast above the controls instead of an
  item in the flow.

**Alternatives considered**: Measuring the longest label per exercise and reserving exactly that
height would need DOM measurement, and widths change with rotation. Truncating labels to one line
would lose information; the labels are written as two-line phrases in places. Shortening every
label in the data wouldn't stop future labels from wrapping.

## R2. Get ready as a player phase

**Decision**: Add a `getReady` phase to the pure player machine, next to `switchSide`.
`goTo(index)` enters `getReady` with `remaining = GET_READY_SECONDS` (5) when the item is timed,
and `doing` as today when it is done by repetitions. A tick in `getReady` counts down. At the end,
or on a new `startNow` event, the machine moves to `doing` with the full exercise time. `pause`,
`hidden`, `resume`, `skip` and `back` behave as in `switchSide`. Ticks add to `elapsed` as they
already do in every unpaused phase, so Get ready counts toward session time like Switch sides.

**Cues**: entering `getReady` plays the same `switch` cue as entering `switchSide`, and
`getReady → doing` plays `start`, as `switchSide → doing` does. The existing "new exercise starts"
rule moves from "index changed and phase is doing" to "phase became doing". This covers a new
rep exercise, the end of Get ready and the second side.

**UI**: a `Sheet` titled "Get ready" with "<Exercise> starts in N s." and a **Start now** button,
built like the Switch sides sheet. The figure stays still behind it, because it only plays in
`doing`.

**Alternatives considered**: A countdown overlay inside the timer. That would be a second way of
showing the same thing, and the owner asked for it to work like Switch sides. A per-exercise
countdown length is not needed (spec Assumptions).

## R3. Adjusting a set item's dose

**Finding**: Set items already carry their own `dose` (004). The player, `setMinutes` and
`estimateMinutes` already read it. The Firestore rules check only that `items` is a list of at
most 40, so no rules change is needed. Sets are saved as a whole `items` list via `updateDoc`,
which touches only `items` and `updatedAt`. Concurrent edits of one set are last-saved-wins
(spec 004, Edge Cases).

**Decision**:

- Pure helpers in `src/sets/edit.ts`: `DOSE_LIMITS` (reps 1–50 step 1, sets 1–5 step 1, seconds
  10–600 step 5), `stepDose(dose, field, ±1)`, which clamps and keeps `range`, `perSide` and
  `repsNote`, and `withDose(items, index, dose)`. `inRange(dose)` decides when the hint is
  emphasised.
- UI: the dose text in each set row becomes a button. Tapping it opens an inline editor under the
  row with steppers (Reps, Sets, or Seconds) and the hint "Recommended 8–15". One row is open at
  a time. Every step saves through the existing `saveItems`, which is optimistic, offline-safe and
  touches only `items`.

**Alternatives considered**: Steppers always visible on every row would crowd a row that already
has a drag handle, a figure and three buttons. A separate edit screen goes against SC-003.
Per-item Firestore fields or transactions would give per-item merging, but a set is a list (array
items can't be updated individually), and transactions fail offline. The same trade-off was
already accepted for reordering.

## R4. Stretching as a technique

**Decision**: `Technique` gains `'stretching'`, placed after `mobility` in `TECHNIQUES` so lists
read Yoga, Tai chi, Strength, Mobility, Stretching, Cardio. Everything typed `Record<Technique, …>`
must then list it, and the compiler finds them all:

- labels: `TECHNIQUE_LABEL`, and through it the Schedule class types and the Library filter
- `--stretching-bg/fg` tag colours (4.5:1) and `--chart-stretching`
- music mood: calm
- profile default `stretching: 'some'`. `withDefaults` reads a missing `stretching` as the stored
  `mobility` amount (FR-013).
- goal weights: Flexibility `{ yoga: 3, stretching: 3, mobility: 1 }`, Mobility adds
  `stretching: 1`, Posture adds `stretching: 1`. The existing suggestion tests (mobility and yoga
  lead for a woman in her 50s) still hold.
- routines: wherever `techniqueBoost` has `mobility`, `stretching` gets the same value
- planner `coverAdjustment`: a strength class boosts stretching as well as mobility.

Nine exercise files change `technique: 'mobility'` → `'stretching'`. Ids are unchanged, so marks,
history, sets, plans and progress keep working. Pace is unaffected: timed non-cardio exercises
already default to Hold.

**Alternatives considered**: A tag (`stretch`) inside Mobility would not give a separate filter,
profile amount or class type, so it misses the owner's ask.

## R5. New exercises: Superman and Standing torso twist (batch 7)

**Superman**: strength, lying, side view, head left, mat. Reps, 6–12 (target 8), 2 sets,
`secondsPerRep` about 5 (lift, 2–3 s hold, lower). Keyframes: lying flat with arms reaching past
the head, then arms, chest and legs lifted. Breath: out as you lift, in as you lower, like Prone W
raises. Works lower
back, glutes, upper back and shoulders. Loads lower back. Phases main. Intensity moderate, level
beginner. Easier: opposite arm and leg, alternating (front view not needed; in side view the near
arm and far leg lift, then the far arm and near leg). Harder: same lift with a longer hold (more
seconds per rep, fewer reps).

**Standing torso twist**: mobility, standing, front view (arms out reads best from the front, as
in the owner's reference picture). Time, 30–60 s (target 40), pace Flowing set explicitly (Brisk is
reserved for cardio by a library test). Keyframes: arms out at shoulder height, then turned to one
side (the near arm swings across the chest, the far arm reaches back and looks shorter, the back
heel lifts and the knee turns in), then the same to the other side. Labels and curved arrows at
hand height for each transition. No breath list (a timed rhythmic movement, as for cardio).
Phases warm-up. Easier: smaller turn with the feet planted.

Figures are checked in Classic and Doodle renders before owner review (AGENTS.md steps 4–5).

## R6. Pose strip

**Decision**: A `PoseStrip` component in `src/figure/` draws every keyframe of a `FigureSpec` as a
small still figure, in a row, numbered 1…n. Under each pose sits the move that starts there
("→ 2 Lift the hips"; the last pose's move leads back to 1), so every transition, including the
return, is named once. Each pose is drawn by `<Figure>` with a new `frame` prop:
a static keyframe in thumbnail ink weight, with that transition's arrows and props, and no breath
row or caption. The figure code stays in one place, and the person's figure style is used.

**Preference**: `profile.showPoses: boolean` (default false), saved like `sessionMusic`. It is
handed down through a small context (`PosesPrefContext`: `{ show, setShow }`) provided by the
shell, as the sound prefs are. On the exercise page a **Show poses / Hide poses** text button
sits under the figure card. In the player a poses icon button sits in the top bar next to the
music button. Inside the figure card it took width from the breathing note and cut it short.

**Layout**: The row is a grid with n equal columns. At 360 px wide each of 3 poses is about 100 px
wide (72 px tall), so up to 4 poses fit without sideways scrolling. In the player the strip goes
inside the figure card in a compact form: numbered poses with arrows between them and no labels,
since the moving figure already names the current move. The labels are still read to screen
readers. Measured in the browser, the main button stays on screen when:

- Phone held upright (height ≤ 960): the moving figure is capped at 20dvh and the poses at
  64 px. Main button bottom: 832 of 844.
- Tablet held upright: the figure is capped at 34dvh and the poses at 130 px. Main button
  bottom: 1160 of 1180.
- Landscape: the strip sits under the figure in the figure column, poses up to 18dvh. Main button
  bottom: 800 of 820.

**Alternatives considered**: Rendering the strip from separate static images would mean new
assets and a second drawing pipeline. Expanding the animated figure into a strip would lose the
animation, and the owner wants to keep it.
