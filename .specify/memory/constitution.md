# FitMe Constitution

## Core Principles

### I. Spec Before Code
Every feature starts as a spec under `specs/` (via `/speckit-specify`) that describes
*what* and *why* in user terms. Code without a spec is not merged. Specs are kept short:
user stories, acceptance scenarios, and open questions. Implementation details belong in
the plan, not the spec.

### II. Smallest Useful Slice
Features are delivered as thin vertical slices that a user can actually use. Each user
story in a spec must be independently shippable. Prefer finishing one slice end-to-end
over starting several. If a slice takes more than a few sessions, split it.

### III. Simplicity / YAGNI
Build only what the current spec needs. No speculative abstractions, and no state-management
or UI libraries until a concrete need is shown. Firebase (Auth, Firestore, Hosting) is the
only backend; no server-side functions until a spec justifies the paid plan. Any added
dependency or layer MUST be justified in the plan's Complexity Tracking table.

### IV. Test What Matters
Domain logic (session planning, calculations, data transforms, persistence) has unit tests
written alongside the code. UI is covered by a small number of high-value component or
end-to-end tests, not exhaustive snapshots. `npm test` and `npm run build` MUST pass before a
feature is considered done.

### V. Private & Synced
Users sign in with Google. Each user's data lives under `users/{uid}` in Firestore, with the
offline cache enabled so the app works without a connection. Access is limited to an allowlist
of invited emails, enforced in Firestore security rules; a user can never read another user's
data. No analytics and no third-party data sharing unless a spec explicitly calls for it and
explains why. Stored data has a versioned shape so it can be migrated safely.

## Technology Constraints

- **Stack**: Vite + React + TypeScript (strict mode), single-page app, mobile and tablet first.
- **Persistence**: Firestore behind a thin repository module (`src/data/repo/`); writes update
  only the fields that changed.
- **Exercise library**: static data in the repo (JSON + images), not in Firestore.
- **Hosting**: Firebase Hosting, deployed by GitHub Actions on push to `main`.
- **Local development**: the Firebase emulators (Auth, Firestore, Hosting).
- **Testing**: Vitest (+ React Testing Library for components).
- **Styling**: Plain CSS / CSS modules unless a plan justifies more.
- **Tooling**: npm, oxlint (the Vite template's linter), Prettier. Keep the dependency list
  short and current.

## Development Workflow

1. `/speckit-specify` → spec for one feature (optionally `/speckit-clarify`).
2. `/speckit-plan` → plan checked against this constitution.
3. `/speckit-tasks` → ordered task list (optionally `/speckit-analyze`).
4. `/speckit-implement` → build, test, commit.

Work happens on a feature branch per spec. CI (lint, `prettier --check`, tests, build) MUST
pass before merging to `main`, and merging to `main` deploys to production. As a solo project,
self-review against the spec's acceptance scenarios replaces formal code review.

## Governance

This constitution overrides ad-hoc preferences. Plans must pass the Constitution Check
gate; any deviation is recorded in Complexity Tracking with a reason. Amendments are made
via `/speckit-constitution`, versioned with semantic versioning (MAJOR: principle removed or
redefined; MINOR: principle or section added; PATCH: wording), and dated below.

**Version**: 2.0.1 | **Ratified**: 2026-11-14 | **Last Amended**: 2026-11-14
