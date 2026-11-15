# Research: Profile and Session Planner

## R1. Where the profile lives

- **Decision**: A `profile` map on the existing `users/{uid}` document, written with
  `setDoc(..., { merge: true })` one field at a time.
- **Rationale**: Already owner-only (001 rules), already cached offline, read with the record the
  app already watches. Field-level merge writes avoid last-writer-wins between phone and tablet
  (AGENTS lesson).
- **Alternatives**: `users/{uid}/settings/profile` (rejected: one more listener and rules block for
  no gain).

## R2. Planner shape

- **Decision**: A pure function `makePlan(input) → Plan | Insufficient` in `src/planner/`, with
  `input = { library, profile, routine, minutes, marks, history, today, shuffle, swaps }`.
  Seeded PRNG (mulberry32) from `shuffle`, routine and date, so the same input always gives the
  same plan (FR-013).
- **Steps**: (1) filter exclusions (FR-007) and routine rules (FR-009); (2) pick the version per
  exercise (Go easy → easier; advanced → harder; else standard; Desk break may use a desk-friendly
  version, e.g. seated cat-cow); (3) per phase, greedily pick the best-scoring candidate until the
  phase budget is used; (4) fit time by scaling doses within recommended ranges, then adding or
  dropping a main item; (5) attach a reason per item; (6) apply swaps.
- **Scoring** (weights tuned in tests): technique Lots +2 / Some +1; each focus area worked +1.5
  (max 2 areas); favourite +1.5; routine target area +1; new for you +2 while under the
  trying-new target; done yesterday in main −2; Strength keeper strength/balance +3 until half the
  main part; Calm morning breathing-tagged +3 as first warm-up and last cool-down; age 50+ and
  Strength keeper bone-loading +1.5; seeded jitter 0–1.2.
- **Phase shares**: Calm 30/50/20, Desk 20/60/20, Strength 20/65/15, Weekend 20/60/20, Cardio
  20/60/20 (warm-up/main/cool-down). Under 8 minutes: warm-up and cool-down may be merged into
  main.
- **Rationale**: Explainable (reasons come from the top-scoring factor), testable with property
  tests over many random profiles (SC-003), no backend.
- **Alternatives**: Constraint solver (rejected: overkill); AI planning (deferred by the owner).

## R3. History for variety and "new for you"

- **Decision**: Read the person's sessions from the last 14 days
  (`where('startedAt', '>=', …)` on `users/{uid}/sessions`; single-field range, no composite
  index). Summarise to `{ date, exerciseIds, mainIds }`. Exercises in any session ever are "done";
  for "new for you" use all sessions read plus marks (a favourite counts as known).
- **Rationale**: 001/002 rules already allow owner list reads; offline cache serves it.
- **Note**: "Ever done" is approximated by the last 14 days plus favourites; good enough until
  Progress adds a lifetime record.

## R4. Plan → player hand-off

- **Decision**: The plan is encoded in the route: `#/plan?r=calm&m=15&s=3&w=1.2` (routine,
  minutes, shuffle, swaps as `index.count` pairs). The player gets the same params
  (`routine=plan`) and recomputes the plan, which is identical by FR-013. Reload-safe, no
  storage.

## R5. Exercise attributes

- **Decision**: `Exercise.position` (`standing | seated | kneeling | lying`), `Exercise.intensity`
  (`gentle | moderate | vigorous`), `Exercise.tags` (`breathing | balance | boneLoading`), and an
  optional `Version.position` override (e.g. seated cat-cow). Desk-friendly = position standing or
  seated and equipment within `none | chair | wall`.

## R6. Setup flow

- **Decision**: `#/setup/1…6`, shown automatically when `profile.setupDone` is not true. Each step
  saves on Next; Skip moves on; "Skip setup" on step 1 saves defaults and `setupDone: true`.
  Suggestions are computed by a pure `suggest(profile)` (tested).
