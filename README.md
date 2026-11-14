# FitMe

A personal-trainer web app for home workouts, used on phone and tablet by an invited group.
Built with [Spec-Driven Development](https://github.com/github/spec-kit); see
[.specify/memory/constitution.md](.specify/memory/constitution.md) for project principles.

Stack: Vite + React + TypeScript, Firebase (Google sign-in, Firestore, Hosting).

## Run locally

Needs Node 24 (`.nvmrc`) and Java 21 (for the Firebase emulators).

```bash
npm ci
npm run emulators   # terminal 1: Auth + Firestore emulators, UI at http://127.0.0.1:4000
npm run dev         # terminal 2: app at http://localhost:5173
```

In development the app talks only to the emulators (project `demo-fitme`), never to the real
project. Sign in with the emulator's fake Google picker as `invited@example.com`, which is on
the seeded allowlist. Any other email shows the invite-only screen.

The seed lives in `emulator-data/`. To change it, edit `scripts/seed-emulator.mjs` and run
`npm run seed`. Changes made while `npm run emulators` runs are not saved.

## What's in the app

- **Today**: a sample session of the owner's favourite exercises, with **Start**.
- **Library**: every exercise with search, technique and favourites filters; each exercise has an
  animated figure (direction arrows, breathe in/out), recommended reps, how-to steps and easier /
  harder versions. Mark Favourite or Not for me.
- **Player**: full-screen follow-along with countdowns, sets, sides, pause/back/skip, a rating
  after each exercise, and the screen kept awake.
- Installable to the home screen and usable offline after the first sign-in.
- Figure review for new exercise batches at `#/review` (development and preview channels only).

## Check

```bash
npm run lint
npm run format:check   # npm run format -- <files> to fix named files
npm test               # unit and component tests
npm run test:rules     # Firestore security rules against the emulator
npm run build
```

CI runs all five on every pull request and push to `main`.

## Deploy

Merging to `main` deploys hosting, Firestore rules and indexes to production
(`.github/workflows/deploy.yml`). It can also be run by hand from the Actions tab.

The Firebase web config in `src/firebase.ts` is committed on purpose: it identifies the project
and grants no access. Access is controlled by `firestore.rules`.

## Inviting someone

FitMe is invite-only. In the Firebase console → Firestore → `allowlist` collection, add a
document whose **ID is the person's Google email in lowercase** (fields are optional, e.g.
`note: "sister"`). No redeploy is needed. Delete the document to remove access.

## Workflow (Claude Code)

| Step | Skill | Output |
|------|-------|--------|
| 1 | `/speckit-specify <feature idea>` | `specs/NNN-feature/spec.md` |
| 2 | `/speckit-clarify` *(optional)* | Resolves open questions in the spec |
| 3 | `/speckit-plan <tech notes>` | `plan.md`, `data-model.md`, `research.md` |
| 4 | `/speckit-tasks` | `tasks.md` |
| 5 | `/speckit-analyze` *(optional)* | Consistency check across artifacts |
| 6 | `/speckit-implement` | Code + tests |

Update principles with `/speckit-constitution`.
