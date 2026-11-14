# Implementation Plan: Foundation — Sign-in and Deploy Pipeline

**Branch**: `001-foundation-signin` | **Date**: 2026-11-14 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-foundation-signin/spec.md`

## Summary

Scaffold the FitMe single-page app and its delivery pipeline. Invited people sign in with
Google; an `allowlist` collection, enforced in Firestore rules, decides who can touch data.
Each person's record lives at `users/{uid}`. CI checks every change, and merging to `main`
deploys hosting and rules to Firebase. Follows the owner's setup guide
(`new-web-project-setup.md`), with rules tests brought forward from "Hardening later" because
SC-002 requires them.

## Technical Context

**Language/Version**: TypeScript (strict; version pinned by the Vite template, `<6.1`), Node 24

**Primary Dependencies**: React 19, Vite 8, Firebase JS SDK 13 (Auth, Firestore)

**Storage**: Cloud Firestore (`nam5`) with persistent local cache; see
[data-model.md](data-model.md)

**Testing**: Vitest 5 + jsdom + React Testing Library; `@firebase/rules-unit-testing` 6
against the Firestore emulator

**Target Platform**: Mobile and tablet browsers (current Safari and Chrome), Firebase Hosting

**Project Type**: Single-page web app

**Performance Goals**: Home screen under 3 s on repeat opens (SC-001)

**Constraints**: Free Spark plan (no functions); works offline once signed in; no secrets in
the repo

**Scale/Scope**: Fewer than 20 people; 5 screen states

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Spec Before Code | Pass | [spec.md](spec.md) exists and passed its checklist. |
| II. Smallest Useful Slice | Pass | Sign-in plus pipeline is the thinnest usable slice; P1 stories ship together because they share one screen flow. |
| III. Simplicity / YAGNI | Pass | Firebase only; no router, state library or UI kit. `firebase-tools` as a dev dependency is tracked below. |
| IV. Test What Matters | Pass | Rules access matrix and the session-state logic are unit-tested; one component test per screen state. |
| V. Private & Synced | Pass | Allowlist + per-uid rules; no analytics; `schemaVersion` on the record. |

Post-design re-check: still passing; no new layers were introduced by Phase 1.

## Project Structure

### Documentation (this feature)

```text
specs/001-foundation-signin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── firestore-access.md
│   └── ui-screens.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── main.tsx
├── App.tsx                  # renders the screen for the current session state
├── App.css
├── firebase.ts              # config, auth, db (persistent cache), emulator wiring
├── auth/
│   ├── session.ts           # pure state machine (data-model.md) — unit-tested
│   ├── useSession.ts        # hook: onAuthStateChanged + invite check + upsert
│   └── signIn.ts            # popup sign-in, sign-out, error mapping
├── data/repo/
│   ├── users.ts             # upsertOnSignIn, watchUser
│   └── allowlist.ts         # isInvited(email)
└── screens/
    ├── SignedOut.tsx
    ├── NotInvited.tsx
    ├── Home.tsx
    └── Status.tsx           # loading / checking invite

tests/
└── rules/firestore.rules.test.ts   # access matrix

firebase.json  .firebaserc  firestore.rules  firestore.indexes.json
emulator-data/                       # seeded allowlist for local runs
.github/workflows/ci.yml  .github/workflows/deploy.yml
.nvmrc  AGENTS.md  CLAUDE.md  README.md
```

Component tests live beside the code (`*.test.tsx`).

**Structure Decision**: Single Vite project at the repository root; no `frontend/` split
because there is no server code.

## Delivery steps (cloud)

Run by the agent with the owner's tools logged in; stops marked ⏸ need the owner's OK.

1. Project ID: `fit-me-today` (`fitme` is too short; `fit-me` and `fit-me-now` were taken).
   Address: `https://fit-me-today.web.app`.
2. Setup guide B1: create project, web app, Firestore `nam5`, Hosting site. Paste the web
   config into `src/firebase.ts`.
3. Owner: guide A2 (enable Google provider; audience External, In production). Owner: add
   their own lowercase email to `allowlist` in the console.
4. ⏸ Guide B2: `github-deployer` service account with the five narrow roles.
5. Guide B3: `prod` environment, `FIREBASE_SERVICE_ACCOUNT` secret (key never shown),
   `FIREBASE_PROJECT_ID` variable on `habramovich/fit-me`.
6. ⏸ First push of `main` → deploy.
7. Branch protection requiring `CI` (skip and report if the plan doesn't allow it).

## Complexity Tracking

| Addition | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| `firebase-tools` dev dependency | Rules tests and deploy use the same pinned CLI | Global install in each workflow means two places to pin the version |
| Rules tests in this feature | SC-002 requires automated proof of access denial | Manual checks don't cover 16 cases reliably on every change |
