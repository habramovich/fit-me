# Quickstart: checking the exercise feedback round

## Setup

```text
npm ci
npm run emulators        # terminal 1
npm run dev              # terminal 2, sign in with the seeded test user
```

Automated: `npm test` (from PowerShell on Windows), `npm run lint`, `npm run build`.
Figures: `FIGURES=superman,standing-torso-twist npm run render:figures`, then the same with
`STYLE=doodle`. Check `figure-renders/`.

Check the UI at phone (390 × 844) and tablet (820 × 1180) widths.

## US1: still screen

1. Library → Cat-cow → Play. Watch three full cycles. The title, count and buttons don't move.
2. Play a hold (e.g. Child's pose): when it reaches its pose and the caption disappears, nothing
   moves.
3. Pause and resume: the Paused note appears without moving the buttons.

## US2: Get ready

1. Build a set: a timed exercise first, then a rep exercise, then a timed per-side one.
2. Play: Get ready (5 s) shows before exercise 1, and its clock stays full until Get ready ends.
3. Exercise 2 (reps) starts directly.
4. Exercise 3: Get ready, side 1, Switch sides, side 2.
5. During Get ready: Pause stops the countdown; Start now starts the clock at once; Skip moves on.

## US3: adjustable dose

1. Open a set, tap a rep item's dose, and set reps to 15 and sets to 3. Tap a timed item's dose
   and set 60 s. Go out of range: the hint is emphasised.
2. The set's minutes update. Reload: the values are kept. Play: the player shows 15, set 1 of 3,
   and a 1:00 clock.
3. Offline (DevTools): change a dose; it shows at once and syncs once back online.

## US4: Stretching

1. Library filter Stretching → the 9 listed exercises; Mobility → the 10 listed.
2. Profile → Techniques shows Stretching with the old Mobility amount.
3. Schedule → Add a class → type Stretching is offered.
4. Progress → technique mix lists Stretching for past sessions with those exercises.

## US5: new exercises

Library shows Superman and Standing torso twist, with every version. Each version plays.
Owner review via a preview channel (AGENTS.md step 5) when the owner agrees.

## US6: pose strip

1. Exercise page: only the animation and **Show poses**. Tap it: numbered poses with labels
   between them.
2. Open another exercise and play a session: the strip is still shown; the main button is
   reachable without scrolling at 390 × 844.
3. Hide poses; reload; it stays hidden. Switch to Doodle in Profile: the strip follows.
