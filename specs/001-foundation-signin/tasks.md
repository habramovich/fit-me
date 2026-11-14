---
description: "Task list for 001-foundation-signin"
---

# Tasks: Foundation — Sign-in and Deploy Pipeline

**Input**: Design documents from `/specs/001-foundation-signin/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included. SC-002 requires automated rules tests; constitution IV requires unit tests
for domain logic (the session state machine).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 sign-in, US2 uninvited, US3 privacy, US4 pipeline

---

## Phase 1: Setup

- [X] T001 Scaffold Vite `react-ts` app into the repo root with `npm create vite@latest`, keeping
  existing README.md, .gitignore and .specify/; set `"name": "fit-me"` in package.json
- [X] T002 Add `.nvmrc` with `24`; set `"engines": { "node": ">=24" }` in package.json
- [X] T003 Install deps: `firebase@^13`; dev: `firebase-tools@^15`, `vitest@^5`, `jsdom`,
  `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`,
  `@firebase/rules-unit-testing@^6`, `prettier@^3`; confirm `typescript` satisfies
  `typescript-eslint`'s `<6.1.0` peer range (research R1)
- [X] T004 [P] Prettier config in `.prettierrc.json` and `.prettierignore` (dist, coverage,
  emulator-data, .specify, specs, package-lock.json)
- [X] T005 [P] Vitest config in `vitest.config.ts` with two projects: `unit` (jsdom, `src/**/*.test.{ts,tsx}`,
  setup `src/test/setup.ts` importing jest-dom) and `rules` (node, `tests/rules/**/*.test.ts`)
- [X] T006 package.json scripts: `dev`, `build`, `preview`, `lint`, `format`
  (`prettier --write` on named paths), `format:check`, `test` (`vitest run --project unit`),
  `test:rules` (`firebase emulators:exec --only firestore --project demo-fitme "vitest run --project rules"`),
  `emulators` (`firebase emulators:start --project demo-fitme --import ./emulator-data --export-on-exit`)
- [X] T007 [P] Extend `.gitignore` with `.firebase/`, `*-debug.log`, `firebase-debug.log*`,
  `firestore-debug.log*`, `ui-debug.log*`

---

## Phase 2: Foundational

- [X] T008 [P] `firebase.json` per setup guide B6 (firestore rules + indexes, hosting `dist`
  with SPA rewrite and `no-cache` headers on `/` and `**/*.@(html|json)`, emulators auth 9099,
  firestore 8080, hosting 5000, ui enabled, singleProjectMode)
- [X] T009 [P] `.firebaserc` with `default` and `prod` set to the project ID (placeholder
  `fitme` until confirmed), and `firestore.indexes.json` `{ "indexes": [], "fieldOverrides": [] }`
- [X] T010 `src/firebase.ts`: committed web config (placeholder values until cloud step C2),
  `initializeApp`, `getAuth`, `initializeFirestore` with
  `persistentLocalCache({ tabManager: persistentMultipleTabManager() })`; in `import.meta.env.DEV`
  connect to Auth emulator `http://127.0.0.1:9099` and Firestore `127.0.0.1:8080` and use
  project `demo-fitme`
- [X] T011 [P] Mobile-first base styles in `src/App.css` and `src/index.css`: single column,
  max width 32rem, centred, buttons min-height 48px, no horizontal scroll from 320px
  (contracts/ui-screens.md); remove Vite demo assets
- [X] T012 [P] Unit tests for the session state machine in `src/auth/session.test.ts`
  covering every transition in data-model.md
- [X] T013 Pure session state machine in `src/auth/session.ts`: states `loading`,
  `signedOut`, `checkingInvite`, `invited`, `notInvited`; events auth-resolved, invite-found,
  invite-missing, permission-denied, signed-out (data-model.md)

**Checkpoint**: lint, format:check, test and build pass on an app that renders "Loading…".

---

## Phase 3: User Story 1 — Invited person signs in (P1) 🎯 MVP

**Goal**: Allowlisted person signs in with Google, sees greeting and last sign-in time read
back from `users/{uid}`, stays signed in, can sign out.

**Independent Test**: quickstart.md manual steps 1 and 5.

- [X] T014 [P] [US1] `src/data/repo/allowlist.ts`: `isInvited(email)` gets
  `allowlist/{email.toLowerCase()}`; returns `true` / `false`; maps `permission-denied` to `false`
- [X] T015 [P] [US1] `src/data/repo/users.ts`: `upsertOnSignIn(user)` does
  `setDoc(users/{uid}, { schemaVersion: 1, displayName: user.displayName ?? null, email,
  lastSignInAt: serverTimestamp() }, { merge: true })` without awaiting before UI;
  `watchUser(uid, onData, onError)` via `onSnapshot`, exposing `lastSignInAt` as a Date
  (pending server timestamps use estimate)
- [X] T016 [P] [US1] `src/auth/signIn.ts`: `signInWithGoogle()` calls
  `signInWithPopup(auth, new GoogleAuthProvider())`; ignores `auth/popup-closed-by-user` and
  `auth/cancelled-popup-request`; returns a message for `auth/popup-blocked`; `signOutUser()`
- [X] T017 [US1] `src/auth/useSession.ts`: subscribes to `onAuthStateChanged`, drives the
  state machine, calls `isInvited` then `upsertOnSignIn`, tracks `navigator.onLine` for the
  offline note
- [X] T018 [P] [US1] Screens `src/screens/Status.tsx`, `src/screens/SignedOut.tsx`,
  `src/screens/Home.tsx` per contracts/ui-screens.md (Home: "Hi, {displayName or email}",
  "Last signed in {date, time}", Sign out)
- [X] T019 [US1] `src/App.tsx` renders the screen for the current state
- [X] T020 [P] [US1] Component tests in `src/App.test.tsx` with `useSession` mocked: each state
  renders its contract text; Sign in button calls `signInWithGoogle` on click

---

## Phase 4: User Story 2 — Uninvited person turned away (P1)

**Goal**: Not-allowlisted person sees invite-only screen; nothing is written.

**Independent Test**: quickstart.md manual steps 2–4.

- [X] T021 [US2] `src/screens/NotInvited.tsx`: "FitMe is invite-only. Ask the owner to add you."
  and Sign out; wired in `src/App.tsx`
- [X] T022 [US2] In `src/auth/useSession.ts`, do not call `upsertOnSignIn` when not invited;
  any `permission-denied` from `watchUser` dispatches permission-denied → `notInvited`
- [X] T023 [P] [US2] Add notInvited rendering test to `src/App.test.tsx`
- [X] T024 [P] [US2] Seed `emulator-data/` with `allowlist/invited@example.com` (start
  emulators, add doc in UI or via script, stop with export)

---

## Phase 5: User Story 3 — Each person's data is private (P1)

**Goal**: Rules enforce contracts/firestore-access.md.

**Independent Test**: `npm run test:rules` passes all 16 rows.

- [X] T025 [P] [US3] Rules tests in `tests/rules/firestore.rules.test.ts` using
  `initializeTestEnvironment({ projectId: 'demo-fitme', firestore: { rules } })`, one test per
  row of contracts/firestore-access.md; seed allowlist with `withSecurityRulesDisabled`
- [X] T026 [US3] `firestore.rules`: `isInvited()` per research R2 (signed in,
  `email_verified == true`, allowlist entry for `request.auth.token.email.lower()`);
  `users/{uid}` get/create/update only if `isInvited() && request.auth.uid == uid`, no delete,
  no list; `allowlist/{email}` get only if signed in and
  `email == request.auth.token.email.lower()`; everything else denied
- [X] T027 [US3] Run `npm run test:rules` (requires Java 21) until all rows pass

---

## Phase 6: User Story 4 — Checked and released automatically (P2)

**Goal**: CI on PRs and main; deploy on main.

**Independent Test**: quickstart.md "After deploy".

- [X] T028 [P] [US4] `.github/workflows/ci.yml`: on `pull_request` and `push` to `main`; job
  `CI`; checkout@v5, setup-node@v5 (`node-version-file: .nvmrc`, `cache: npm`),
  setup-java@v5 (temurin 21), `npm ci`, `npm run lint`, `npm run format:check`, `npm test`,
  `npm run test:rules`, `npm run build`; no secrets
- [X] T029 [P] [US4] `.github/workflows/deploy.yml`: on `push` to `main` and
  `workflow_dispatch`; concurrency `deploy-${{ github.ref }}` no cancel; environment `prod`;
  checkout, setup-node, `npm ci && npm run build`; write `secrets.FIREBASE_SERVICE_ACCOUNT` to
  `$RUNNER_TEMP/sa.json`; retry loop (5 tries, 15·n s) of
  `npx firebase deploy --only hosting,firestore:rules,firestore:indexes --project "$PROJECT" --non-interactive`
  with `GOOGLE_APPLICATION_CREDENTIALS` and `PROJECT: ${{ vars.FIREBASE_PROJECT_ID }}`

---

## Phase 7: Polish & docs

- [X] T030 [P] `README.md`: what FitMe is, run/test/build commands, emulators, deploy on merge
  to `main`, committed public config (research R8), how to invite someone (lowercase email as
  `allowlist` doc ID)
- [X] T031 [P] `AGENTS.md` with commands, deploy trigger and the setup guide's B11 lessons;
  `CLAUDE.md` containing `@AGENTS.md`
- [ ] T032 Run lint, format:check, test, test:rules, build; manual quickstart steps 1–5 in a
  browser at phone and tablet widths

---

## Phase 8: Cloud setup and first deploy (needs owner's CLIs)

- [X] T033 Project ID `fit-me-today` (owner's choice; `fitme` too short, others taken). Setup guide B1: create
  project, web app, Firestore `nam5`, Hosting site; paste config into `src/firebase.ts`;
  set `.firebaserc`
- [X] T034 Owner: guide A2 (Google provider, audience External / In production) and add own
  lowercase email to `allowlist`
- [X] T035 ⏸ Owner OK, then guide B2: `github-deployer` service account with the five roles
- [X] T036 Guide B3 on `habramovich/fit-me`: `prod` environment, `FIREBASE_SERVICE_ACCOUNT`
  secret via temp file (never printed), `FIREBASE_PROJECT_ID` variable
- [X] T037 ⏸ Owner OK, then merge to `main` and push; `gh run watch`; sign in on the live site
- [X] T038 Branch protection requiring `CI` (report and skip if plan doesn't allow)

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → US1 → US2 (extends US1's hook and App) ; US3 depends only on Phase 2
  (`firebase.json`) and can run in parallel with US1/US2; US4 depends on Phase 1 scripts.
- Phase 8 needs the owner's CLIs and everything else done; T035 and T037 wait for the owner.

## Parallel Example: User Story 1

```text
T014 allowlist.ts | T015 users.ts | T016 signIn.ts | T018 screens   (then T017 → T019, T020)
```

## Implementation Strategy

MVP is Phases 1–5 running against the emulators: sign-in, invite gate and rules all proven
locally. Phase 6–7 add the pipeline and docs; Phase 8 takes it live.
