<!--
Sync Impact Report
- Version change: template → 1.0.0 (initial ratification)
- Principles defined: I. Spec Before Code, II. Smallest Useful Slice, III. Simplicity / YAGNI,
  IV. Test What Matters, V. Local-First & Private
- Sections added: Technology Constraints, Development Workflow, Governance
- Templates reviewed: plan-template.md (Constitution Check gate applies as-is),
  spec-template.md, tasks-template.md (no changes required)
- Deferred items: none
-->

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
Build only what the current spec needs. No speculative abstractions, no state-management
or UI libraries until a concrete need is shown, no backend until local storage is
demonstrably insufficient. Any added dependency or layer must be justified in the plan's
Complexity Tracking table.

### IV. Test What Matters
Domain logic (calculations, data transforms, persistence) has unit tests written alongside
the code. UI is covered by a small number of high-value component or end-to-end tests,
not exhaustive snapshots. `npm test` and `npm run build` must pass before a feature is
considered done.

### V. Local-First & Private
User data stays on the user's device by default (localStorage / IndexedDB). No accounts,
analytics, or third-party data sharing unless a spec explicitly calls for it and explains
why. Stored data has a versioned shape so it can be migrated safely.

## Technology Constraints

- **Stack**: Vite + React + TypeScript (strict mode), single-page app.
- **Persistence**: Browser storage behind a thin repository module; no backend initially.
- **Testing**: Vitest (+ React Testing Library for components).
- **Styling**: Plain CSS / CSS modules unless a plan justifies more.
- **Tooling**: npm, ESLint, Prettier. Keep the dependency list short and current.

## Development Workflow

1. `/speckit-specify` → spec for one feature (optionally `/speckit-clarify`).
2. `/speckit-plan` → plan checked against this constitution.
3. `/speckit-tasks` → ordered task list (optionally `/speckit-analyze`).
4. `/speckit-implement` → build, test, commit.

Work happens on a feature branch per spec and merges to `main` once tests and build pass.
As a solo project, self-review against the spec's acceptance scenarios replaces formal
code review.

## Governance

This constitution overrides ad-hoc preferences. Plans must pass the Constitution Check
gate; any deviation is recorded in Complexity Tracking with a reason. Amendments are made
via `/speckit-constitution`, versioned with semantic versioning (MAJOR: principle removed or
redefined; MINOR: principle or section added; PATCH: wording), and dated below.

**Version**: 1.0.0 | **Ratified**: 2026-11-14 | **Last Amended**: 2026-11-14
