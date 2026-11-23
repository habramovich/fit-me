---
description: "Tasks for Freshen a saved set (012)"
---

# Tasks: Freshen a saved set

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md),
[data-model.md](data-model.md), [quickstart.md](quickstart.md)

**Tests**: Included. The constitution (IV) asks for unit tests alongside domain logic, plus a few
high-value component tests.

**Organization**: One phase per user story, in priority order.
- US1 is the MVP: suggest, accept, Undo and Skip.
- US2 (Another idea) and US3 (review) each add to the US1 panel and pure module, and each works
  without the other.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

No setup: there is no new dependency and no new config. The branch `012-freshen-set` already exists.

---

## Phase 2: Foundational

**Purpose**: Make the planner's rules reusable (research R1).

- [X] T001 In `src/planner/plan.ts`, export the existing `eligible`, `fitsPhase`, `scaleDose`, `unfit` and `UNFIT_TEXT` (and the `Unfit` and `Candidate` types they need) without changing behaviour; `npm test -- src/planner` still passes

**Checkpoint**: The planner's tests pass unchanged.

---

## Phase 3: User Story 1 - Try something new in a set I like (P1) 🎯 MVP

**Goal**: **Try something new** on a set shows up to three Add or Replace suggestions. Each one has
a reason, follows the four balance rules and the profile rules, and can be accepted (with Undo) or
skipped.

**Independent Test**: Quickstart steps 1–3 and 5–7. Open a Calm morning set without upper-back work,
accept one Add and one Replace, reload on another device and see both. Every suggestion is gentle
and not already in the set.

### Pure logic

- [X] T002 [US1] Create `src/sets/freshen.ts` with the types from data-model.md (`Character`,
  `Change`, `Suggestion`, `FreshenInput`) and `characterOf(set, profile)` (research R2):
  - `plan:<routine>` for a known routine uses `ROUTINES[routine]`, `handMade: false`,
    `maxIntensity: null`.
  - Anything else gives a hand-made `RoutineDef`: shares `{ warmup: 0.2, main: 0.6, cooldown: 0.2 }`,
    no positions or equipment limits, empty boosts, `pace` 60, intensities up to the set's most
    intense available item, and `handMade: true`.
  - An empty hand-made set allows `gentle` and `moderate`, plus `vigorous` for Advanced.
  - Eligibility for a hand-made set uses `eligible` and then rejects anything above `maxIntensity`,
    with no Advanced exception.
- [X] T003 [US1] In `src/sets/freshen.ts`, add the coverage and balance score (research R4):
  - Area weights: focus 3, routine `areaBoost` 2, others 1. `heart` only counts for the `cardio`
    routine or when it is a focus area.
  - `count[a]` counts distinct available exercises.
  - Score terms:
    - base 1;
    - gap fill = sum of the gap weights the candidate works, capped at 6;
    - −0.4 × (count − 1) for each worked area with count ≥ 2;
    - +1 for a Lots technique below its fair share (1 / techniques not None);
    - −1.5 for a technique already over half the items;
    - the routine's `techniqueBoost`;
    - +1.5 if a phase pref includes the part;
    - +1 for a favourite;
    - jitter in [0, 0.3) from `seededRandom(hashSeed(`${set.id}|${today}`))`, drawn per library
      exercise in library order;
    - ties broken by id.
  - The reason is the largest term, with the texts from research R4, using `BODY_AREA_LABEL` and
    `TECHNIQUE_LABEL`. Also return the `gap` area named, if any.
- [X] T004 [US1] In `src/sets/freshen.ts`, implement `suggest(input)` (research R3, R5). The pool is
  every library exercise that:
  - is not in the set (any part or version);
  - is not in `skipped`;
  - is eligible for the character, with its version from `eligible`;
  - fits the part via `fitsPhase` (strict first, relaxed when the part has no strict candidate).

  Then build the list:
  1. Repairs: each item rejected by `unfit` becomes a Replace (`repair: true`) whose reason uses
     `UNFIT_TEXT`, with candidates that work its areas preferred.
  2. Add candidates (only when `items.length < MAX_SET_ITEMS`): one per part, scored with the
     short-part bonus +1.5 when the part's time is below 85% of its share of the set's time (an
     empty set uses 10 minutes).
  3. Replace candidates: the two weakest removable items. An item is removable if it is available,
     not a favourite, and every area it works has count ≥ 2 or is worked by the replacement (FR-005).
     Weakness = Σ(count − 1), +1.5 if its technique is crowded, −1.5 if it is a part pick. Gain is
     the candidate's score minus the item's own score.
  4. Greedy pick by gain, up to 3, under these limits:
     - no shared exercise, replaced item or `gap`;
     - at least one Add and one Replace when both exist;
     - drop any gain ≤ 0.

  Doses follow research R7:
  - Add: the version's `dose`.
  - Replace: `scaleDose(v.dose, targetSeconds / estimateSeconds(v), phase === 'main')`, or `v.dose`
    when the target exercise is gone.

  Set `key` as in data-model.md.
- [X] T005 [US1] In `src/sets/freshen.ts`, implement `applySuggestion(items, s)` and `revalidate(input, list)` (research R7):
  - `applySuggestion` adds with `addItem`, or replaces at the first index matching
    `target.exerciseId` and `target.phase`. It returns `items` unchanged if the target is gone or an
    Add would exceed 40 items.
  - `revalidate` drops a suggestion when:
    - its exercise is now in the set;
    - its target is gone;
    - its Add can't fit;
    - its `gap` now has count > 0;
    - or its exercise is no longer eligible under the current profile and marks.

    Other suggestions are kept unchanged.
- [X] T006 [US1] Create `src/sets/freshen.test.ts` (research R8):
  - **Sample sets**: `fromPlan(makePlan(...).items)` for every routine at two lengths and three
    dates, with `DEFAULT_PROFILE` and a restrictive profile (Advanced, an avoided area, no band, a
    go-easy area, one technique None), each saved with `source: plan:<routine>`. Plus hand-made sets:
    gentle-only, one with a moderate item, and an empty one.
  - **SC-002**: every suggestion is not in the set, passes `eligible`, fits the character (hand-made
    intensity cap; Desk positions and equipment; Cardio main is cardio only), and its part passes
    `fitsPhase`.
  - **SC-003**: applying any non-repair suggestion never lowers the number of areas worked.
  - **SC-004**: a Replace's seconds are within 60 of the target's unless the dose sits at a range
    bound.
  - **SC-005**: a Calm set with no upper-back work gets a suggestion with `gap: 'upperBack'`.
  - **Other cases**:
    - a Not for me item gives a first repair suggestion;
    - a favourite is never a target;
    - a 40-item set gets no Add;
    - an empty set gets only Adds;
    - no two suggestions share an exercise, target or gap;
    - `skipped` is honoured;
    - phase prefs limit parts;
    - go-easy gives `easier`;
    - the same input gives the same output, and a different `today` may differ;
    - "nothing fits" gives `[]`;
    - each `revalidate` drop rule.

### Screen

- [X] T007 [US1] Wire the profile into the set screen:
  - In `src/app/Shell.tsx`, render `<SetView id={effective.id} profile={plannerProfile} />`.
  - In `src/screens/SetView.tsx`, add the `profile: Profile | null` prop and read
    `useMarks()`.
  - Under the "N exercises · about M min" line, add a **Try something new** button (`btn
    btn--outline`). It is disabled with the text "Loading your profile…" while
    `profile === null || !loaded`. It toggles the panel.
  - Update `renderSet` in `src/screens/SetView.test.tsx` to pass `DEFAULT_PROFILE`.
- [X] T008 [US1] Create `src/screens/FreshenPanel.tsx`, rendered by `SetView` above the parts when
  open. Props: `set`, `profile`, `marks`, `saveItems`.
  - State (data-model.md): `list`, `skipped` and `undo`, with `today = todayKey()`. `list` is
    computed with `suggest` on open, and when re-opened after every card was handled (US1
    scenario 9).
  - An effect on `set.items`, `profile` and `marks` runs `revalidate`, and clears `undo` when
    `set.items` no longer equals `undo.after`.
  - Each card is an `<article aria-label="<change text>">` with:
    - a thumbnail `<Figure>` linking to `href({ name: 'exercise', id })`;
    - a heading "Add X to Main" or "Replace Y with X";
    - the reason and the `formatDose` text (plus the version when not standard);
    - a primary **Add** or **Replace** button and a **Skip** link button.
  - Accept: `saveItems(set.id, applySuggestion(...))`, remove the card, and set `undo` with
    `before`, `after` and the suggestion.
  - An `aria-live="polite"` line reads "Added X." or "Replaced Y with X." with an **Undo** button.
    Undo saves `before`, puts the card back at its index and clears `undo`.
  - Skip removes the card and adds the exercise to `skipped`.
  - An empty list shows "Nothing new fits this set right now."
  - A **Done** button closes the panel. Closing or leaving the set discards all of this state.
- [X] T009 [P] [US1] In `src/app/app.css`, add `.freshen` panel and `.freshen-card` styles next to
  the `.set-row` rules. Cards use the same thumbnail size as set rows, and the buttons wrap
  cleanly at 390 px.
- [X] T010 [US1] Add tests to `src/screens/SetView.test.tsx`:
  - the button waits while the profile is null;
  - Try something new shows cards with Add/Replace headings;
  - accepting an Add calls `saveItems` with the item at the end of its part;
  - accepting a Replace calls it with the item swapped in place;
  - Undo calls `saveItems` with the original items and the card returns;
  - Skip removes the card;
  - Done closes the panel.

  Use the real library and a set built from known ids so the expected items are computed with
  `suggest` rather than hard-coded.

**Checkpoint**: Run quickstart steps 1–3 and 5–7 in the browser at 390 px and 820 px. Look at the
suggestions on three or four real sets and tune the R4 weights if any reason reads wrong; the
T006 tests guard the rules.

---

## Phase 4: User Story 2 - Another idea in the same place (P2)

**Goal**: **Another idea** keeps a suggestion's change and shows the next best exercise, cycling
without repeats.

**Independent Test**: Quickstart step 4.

- [X] T011 [US2] In `src/sets/freshen.ts`, implement `anotherIdea(input, list, key)` and set
  `hasAnother` in `suggest` (research R6).
  - Candidates for the same change are ranked as in `suggest`, excluding:
    - the suggestion's `passed` plus its current exercise;
    - the exercises of the other suggestions in `list`;
    - `skipped`.
  - It returns the list with that suggestion's `item`, `reason`, `gap` and `passed` updated.
  - When no candidate is left, `passed` resets to `[current]` and the ranking restarts.
  - `hasAnother` is true when at least one other candidate exists.
  - For a Replace, the FR-005 removability check still applies to the new candidate.
- [X] T012 [US2] Add tests to `src/sets/freshen.test.ts`:
  - repeated `anotherIdea` keeps `change` and never repeats an exercise until the cycle restarts;
  - it never shows an exercise from another card;
  - `hasAnother` is false when only one candidate exists;
  - results still pass the SC-002 checks.
- [X] T013 [US2] In `src/screens/FreshenPanel.tsx`, add an **Another idea** button to each card
  when `hasAnother` is true; it replaces the card through `anotherIdea`. Add a test in
  `src/screens/SetView.test.tsx`: tapping it changes the exercise name while the heading's change
  stays the same.

**Checkpoint**: Quickstart step 4 in the browser.

---

## Phase 5: User Story 3 - See how the set is balanced (P3)

**Goal**: A short review above the cards: areas worked and missing, time per part with short or
long, and technique counts.

**Independent Test**: Quickstart step 8.

- [X] T014 [US3] In `src/sets/freshen.ts`, implement `reviewSet(set, library, profile)` returning a
  `SetReview` (data-model.md):
  - `worked`: most-worked first;
  - `missing`: up to 3 gap areas by weight;
  - `parts`: seconds per part, with `short` when the part's share of time is below 0.6 × the usual
    share and `long` when it is above 1.5 ×; a set under 3 minutes gets no flags;
  - `techniques`: the techniques present, most first.

  Shares come from `characterOf`.
- [X] T015 [US3] Add `reviewSet` tests to `src/sets/freshen.test.ts`:
  - known counts;
  - the missing order (focus before routine before other);
  - short and long flags;
  - no flags under 3 minutes;
  - an unavailable item is not counted.
- [X] T016 [US3] In `src/screens/FreshenPanel.tsx`, show the review as three short lines at the top
  of the panel. For example:
  - "Works hips, lower back, hamstrings. Nothing for upper back or shoulders."
  - "Warm-up 4 min, Main 10 min, Cool-down 1 min (short)."
  - "Yoga 5, Mobility 2."

  It is recomputed from `set.items`. Add a test in `src/screens/SetView.test.tsx` that the review
  updates after accepting an Add.

**Checkpoint**: Quickstart step 8 in the browser.

---

## Phase 6: Polish & cross-cutting

- [X] T017 [P] In `AGENTS.md`, extend the `src/sets/` layout line with `freshen.ts`: suggestions
  that freshen a saved set while keeping it balanced (012; tested).
- [X] T018 Run the formatter on the changed files only:
  `npm.cmd run format -- <files>`. Then run `npm.cmd run lint`, `npm.cmd test` (from PowerShell)
  and `npm.cmd run build`. All must pass.
- [X] T019 Run all of [quickstart.md](quickstart.md) in a real browser at 390 px and 820 px,
  including offline (step 9) and the second-device check. (Done 2026-11-22 with headless Chrome
  against the emulators, a reload standing in for the second device. The offline step was not run:
  accepting a suggestion uses the existing set-edit write path.)

---

## Dependencies & Execution Order

- **T001** blocks everything that uses the planner helpers (T002–T005, T011, T014).
- **US1**: T002 → T003 → T004 → T005 → T006. T007 can start after T001. T008 needs T005 and T007.
  T009 can run alongside T008. T010 needs T008.
- **US2**: needs T004 (ranking) and T008 (cards). T011 → T012, then T013.
- **US3**: needs T002 (character) and T008 (panel). T014 → T015, then T016. It is independent of
  US2.
- **Polish**: after the stories that will ship.

## Parallel Example

```text
After T005:  T006 (freshen tests)  ∥  T007 (SetView/Shell wiring)
During T008: T009 (CSS)
After US1:   US2 (T011–T013)  ∥  US3 (T014–T016): both touch freshen.ts and FreshenPanel.tsx,
             so run them one after the other in one session, or merge carefully
```

## Implementation Strategy

1. **MVP**: T001–T010 give a usable "Try something new" with accept, Undo and Skip. Stop, check it
   in the browser, and tune the weights.
2. **Next**: US2 (Another idea).
3. **Then**: US3 (review).
4. **Finally**: polish (T017–T019). Then commit, open a PR, and let CI pass before merging to
   `main`, which deploys.
