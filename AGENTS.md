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
- `src/data/repo/`: the only place that touches Firestore
- `src/screens/`: one component per screen
- `firestore.rules` + `tests/rules/`: rules and their access-matrix tests

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
