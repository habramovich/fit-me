# Research: Foundation — Sign-in and Deploy Pipeline

Versions checked against the npm registry on 2026-11-14.

## R1. Toolchain versions

- **Decision**: Node 24 (`.nvmrc`), Vite 8 via `create-vite` 9 (`react-ts` template), React 19,
  TypeScript 7 (template default, `strict` set explicitly), Firebase JS SDK 13, Vitest 5 +
  jsdom + React Testing Library 16, **oxlint** (template default), Prettier 3.
- **Rationale**: Node 24 is installed locally and supported by every package above. The
  current Vite template ships oxlint and TypeScript 7. ESLint's `typescript-eslint` does not
  yet support TypeScript 7 (peer range `<6.1.0`), so keeping the template's oxlint avoids
  downgrading TypeScript.
- **Alternatives**: ESLint + TypeScript 6 (rejected: fights the template for no gain); Node 22
  (rejected: no reason to differ from the local install).
- **Note**: npm's install-script allowlist skips postinstall for `@firebase/util`,
  `protobufjs` and `re2`. None is needed: the app, unit tests, rules tests and build all pass
  without them.

## R2. Invite allowlist

- **Decision**: A top-level `allowlist` collection whose document IDs are lowercased emails
  (the document body can be empty or hold a note). The owner adds documents in the Firebase
  console. Rules define
  `isInvited() = request.auth != null && request.auth.token.email_verified == true &&
  exists(/databases/$(database)/documents/allowlist/$(request.auth.token.email.lower()))`.
  A signed-in person may `get` only the allowlist document matching their own email; `list`
  and writes are denied.
- **Rationale**: Works on the free Spark plan (no custom claims or functions needed). Changing
  the invite list needs no redeploy (FR-009). Lowercasing handles the case-mismatch edge case.
  Requiring `email_verified` stops someone from claiming an invited email through an unverified
  provider. Letting a person read their own entry lets the app tell "not invited" apart from
  "offline".
- **Alternatives**: Custom auth claims (needs Admin SDK and a server); blocking functions
  (need Blaze); a hard-coded email list in rules (needs a redeploy per invite).
- **Note for the owner**: the console document ID must be the email in lowercase.

## R3. How the app detects invite status

- **Decision**: After `onAuthStateChanged` reports a user, the app reads
  `allowlist/{email.toLowerCase()}`. Exists → invited: upsert the user record and show home.
  Missing or `permission-denied` → invite-only screen. Any `permission-denied` on the user
  record later (owner removed them) also switches to the invite-only screen.
- **Rationale**: One cheap read; the rules remain the real gate (FR-008), so the app check is a
  UX convenience only.
- **Alternatives**: Try the user-record write and treat failure as "not invited" (rejected:
  offline writes queue instead of failing, so this can't tell offline from uninvited).

## R4. Offline behaviour

- **Decision**: `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager:
  persistentMultipleTabManager() }) })`. The sign-in upsert uses `setDoc(..., { merge: true })`
  with only the three fields plus `schemaVersion`, and is not awaited before showing home; the
  home screen subscribes with `onSnapshot` to the user's record.
- **Rationale**: Covers the "opens app offline" edge case: cached record shows, the write
  syncs when back online. Merge writes satisfy "changing only those fields" (FR-005).
- **Alternatives**: Memory cache (rejected: blank screen when offline).

## R5. Sign-in method

- **Decision**: `signInWithPopup(auth, new GoogleAuthProvider())`, called directly in the
  button's click handler. `auth/popup-closed-by-user` and `auth/cancelled-popup-request` are
  ignored; `auth/popup-blocked` shows a short "allow pop-ups for this site" message.
- **Rationale**: The setup doc's guidance: redirect breaks where third-party cookies are
  blocked. Calling from the click keeps popup blockers happy.
- **Alternatives**: `signInWithRedirect` (rejected per above).

## R6. Testing the rules

- **Decision**: `@firebase/rules-unit-testing` 6 with Vitest, in `tests/rules/`, run by
  `firebase emulators:exec --only firestore "vitest run --project rules"`. `firebase-tools` is
  a pinned dev dependency (`^15`) so local runs, CI and deploy use the same CLI version. CI
  installs Java 21 (`actions/setup-java`) for the emulator.
- **Rationale**: SC-002 requires automated proof that cross-user and uninvited access is
  refused. The setup doc lists rules tests under "Hardening later", but this spec makes them a
  success criterion, so they come now.
- **Alternatives**: Manual checks only (rejected: SC-002); global `firebase-tools` install in
  workflows (rejected: two places to pin the version).

## R7. Local development against emulators

- **Decision**: When `import.meta.env.DEV` is true, `src/firebase.ts` calls
  `connectAuthEmulator(auth, 'http://127.0.0.1:9099')` and
  `connectFirestoreEmulator(db, '127.0.0.1', 8080)`. `npm run emulators` starts them with
  `--import ./emulator-data --export-on-exit`, and seed data includes an allowlist entry for a
  test email.
- **Rationale**: Per the setup doc (B7). Seed data means the invited flow works on first run.
- **Alternatives**: A separate dev project (rejected: D1 chose one project).

## R8. Firebase config values

- **Decision**: Commit the web config in `src/firebase.ts`.
- **Rationale**: The values identify the project and grant no access; one fewer moving part in
  CI. The README says so.
- **Alternatives**: `VITE_FIREBASE_*` from GitHub variables (rejected: more setup, no gain).

## R9. CI, deploy and merge blocking

- **Decision**: `ci.yml` (job `CI`) on pull requests and pushes to `main`: checkout, Node 24,
  Java 21, `npm ci`, `npm run lint`, `npm run format:check`, `npm test`, `npm run test:rules`,
  `npm run build`. `deploy.yml` on push to `main` and `workflow_dispatch`, environment `prod`,
  with the setup doc's retry loop, deploying hosting, rules and indexes via
  `npx firebase`. Branch protection requires `CI`.
- **Rationale**: FR-010 to FR-012, following the setup doc (B8–B10).
- **Open item**: branch protection on a private repository needs a paid GitHub plan. If
  the repository is private on a free plan, the protection call fails; the owner is told and
  FR-011 falls back to convention (see the spec's Assumptions).

## R10. Stale app after deploy

- **Decision**: `Cache-Control: no-cache` for `/`, `**/*.html` and `**/*.json` in
  `firebase.json`; Vite's hashed assets keep default caching.
- **Rationale**: FR-013, per the setup doc (B6).
