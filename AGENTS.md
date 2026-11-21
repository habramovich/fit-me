# Agent notes for FitMe

Read [.specify/memory/constitution.md](.specify/memory/constitution.md) first. Every feature goes
through Spec Kit (`/speckit-specify` → `plan` → `tasks` → `implement`) on its own branch.

## Commands

| Task | Command |
|---|---|
| Install | `npm ci` |
| Dev server (uses emulators) | `npm run emulators` then `npm run dev` |
| Lint | `npm run lint` (oxlint) |
| Format check / fix | `npm run format:check` / `npm run format -- <files>` |
| Unit + component tests | `npm test` |
| Security rules tests | `npm run test:rules` (needs Java 21) |
| Build | `npm run build` |
| Re-seed emulator data | `npm run seed` |

On Windows PowerShell, call `npm.cmd` / `firebase.cmd` if script execution is blocked.

## Deploy

Push to `main` deploys hosting + Firestore rules + indexes (`.github/workflows/deploy.yml`).
CI (`.github/workflows/ci.yml`, job `CI`) must pass first. Single Firebase project (prod);
local work uses the emulators with project `demo-fitme`.

## Layout

- `src/firebase.ts`: config and emulator wiring
- `src/auth/`: session state machine (pure, tested), `useSession` hook, sign-in helpers
- `src/app/`: shell, hash router, tab bar, marks, sets and kept-plans providers
- `src/exercises/`: content model (`types.ts`), one module per exercise in `data/`, index,
  sample routine; `exercises.test.ts` validates every exercise
- `src/figure/`: pure geometry (`geometry.ts`, tested) and the `<Figure>` SVG renderer
- `src/planner/`: pure planner (`plan.ts`: make, swap, repair; tested), `useKeptPlan`
- `src/player/`: pure player machine (tested), `usePlayer`, wake lock, player screen
- `src/sound/`: session music and cues (009): pure mood, composer and cue rules (tested), the
  Web Audio engine (checked by ear), song ideas; `src/player/useSessionSound.ts` drives them
- `src/schedule/`: Schedule (010): pure week rules (occurrences, today's entries, planned
  choice, class covers for the planner, validation; tested), `useToday`; provider in
  `src/app/schedule.tsx`, screens `Schedule` and `ScheduleItemForm`
- `src/data/repo/`: the only place that touches Firestore
- `src/screens/`: one component per screen
- `firestore.rules` + `tests/rules/`: rules and their access-matrix tests

## Adding exercises

1. One file in `src/exercises/data/<id>.ts`, registered in `src/exercises/index.ts`, with the
   next `batch` number. Follow an existing file of the same view (side or front).
2. Figure box is 250 × 180, mat top at y = 152. Side view: head left by default; `N` = near side
   (drawn dark, in front), `F` = far side (light, behind). Front view: `N` = the figure's right,
   drawn on the viewer's left. Keep limb lengths roughly constant between keyframes (thigh ≈ 42,
   shin ≈ 42, upper arm ≈ 30, forearm ≈ 28).
3. Every transition needs a label and arrows (a two-pose figure may give only the outward
   arrows; the return reverses them). Repeated movements in side view need `breath` per
   transition. Doses need a target inside the recommended range. Cardio needs a `lowImpact`
   version. Pace (Hold, Slow and controlled, Flowing, Brisk) comes from technique and dose
   (`paceOf`); set `pace` only for an exception. A hold stays on key pose 1 unless the figure
   sets `holdAt`; repetitions need `secondsPerRep`, which sets the figure's speed.
4. `npm test` validates all of it. Then look at every keyframe before asking the owner:
   `npm run render:figures` (or `FIGURES=id1,id2`) writes `figure-renders/<id>.png`, one row per
   version and one column per key pose with that move's arrows, drawn from the real `<Figure>`.
   Movements in the horizontal plane (e.g. hip circles) use a `ring` instead of arrows; circles
   in the front-to-back plane (e.g. shoulder rotations) read best in side view.
   Check the Doodle style too: `STYLE=doodle` writes `figure-renders/<id>-doodle.png`. Its face
   direction is guessed from how the joints bend; if a face looks the wrong way, set the figure's
   `nose` (`'left' | 'right' | 'up' | 'down'`, where the nose points in keyframe 0).
5. Owner review: `npx firebase hosting:channel:deploy batch-<n> --expires 7d --project
   fit-me-today`, then open the preview URL + `#/review`.

## Lessons

- Every Firestore collection and subcollection needs its own rules block; a missing one denies
  silently. Add a rules test row for each new path.
- Offline Firestore writes queue rather than fail. Use a transaction where the user must see a
  failure.
- Whole-document saves are last-writer-wins. Update only the fields that changed.
- Production changes after setup (console settings, data, keys, the allowlist) are the owner's.
- A feature's plan covers its operational surface: config, deploy workflow, rules, permissions.
- Run the formatter on named files only.
- Check UI work in a real browser, at phone and tablet widths.
- Package versions move fast here (Vite 8, TypeScript 7, Firebase 13); check the installed
  `.d.ts` files rather than relying on memory of older APIs.
- On Windows, run Vitest from PowerShell (`C:\…` path). From Git Bash (`c:\…`) Vitest loads
  twice and every suite fails with "failed to find the current suite".
- Figure coordinates are easy to get subtly wrong; always look at the rendered keyframes.
- A plan the person has seen is stored (`users/{uid}/plans`), never re-derived: the planner's
  output depends on the date and history, so re-running it changes the session.
- The planner waits for the real profile and marks: defaults can make kept items look unfit.
