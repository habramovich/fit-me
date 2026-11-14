# Quickstart: Foundation — Sign-in and Deploy Pipeline

## Prerequisites

Node 24, Java 21 (for the emulators), and `npm ci` run once. Cloud steps also need the
`firebase`, `gcloud` and `gh` CLIs, logged in.

## Local checks

```bash
npm run lint
npm run format:check
npm test              # unit and component tests
npm run test:rules    # starts the Firestore emulator and runs the access matrix
npm run build
```

Expected: all pass; `test:rules` reports one passing test per row of
[contracts/firestore-access.md](contracts/firestore-access.md).

## Manual run against emulators

```bash
npm run emulators     # terminal 1: Auth, Firestore, emulator UI (seeded)
npm run dev           # terminal 2
```

1. Open the dev URL at phone width. Tap **Sign in with Google**; in the emulator's account
   picker, add `invited@example.com` (seeded on the allowlist). Expect the home screen
   greeting and a last-sign-in time.
2. Sign out, sign in as `stranger@example.com`. Expect the invite-only screen; the emulator UI
   shows no `users` document for that account.
3. In the emulator UI, add `allowlist/stranger@example.com`, reload. Expect the home screen.
4. Delete that allowlist doc, reload. Expect the invite-only screen.
5. Check tablet width, portrait and landscape: no horizontal scroll.

## After deploy

1. `gh run watch` on the deploy run; expect success.
2. Open `https://fit-me-today.web.app` on a phone; sign in with an allowlisted account.
3. Live rules match `firestore.rules`: Firebase console → Firestore → Rules, or the Rules API
   (`GET https://firebaserules.googleapis.com/v1/projects/fit-me-today/releases/cloud.firestore`,
   then the returned ruleset). firebase-tools 15 has no `firestore:rules:get` command.
