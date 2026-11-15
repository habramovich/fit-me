# Implementation Plan: Saved Sets, Exercise Order and Phase Preferences

**Branch**: `004-saved-sets` | **Date**: 2026-11-15 | **Spec**: [spec.md](spec.md)

## Summary

Sets are stored per person in Firestore and edited with a pure list-editing module (move, move
across parts, add, remove) that drag-and-drop and the up/down buttons both call. Drag-and-drop is
hand-rolled with pointer events (no library). Phase preferences live in the profile and feed the
planner. Back navigation uses browser history when the previous screen was in the app.

## Technical Context

TypeScript 7, React 19, Firebase 13; no new dependencies.

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Spec Before Code | Pass | spec.md + checklist. |
| II. Smallest Useful Slice | Pass | US4 (back, Swap label) is tiny; US1+US2 deliver sets; US3 is a small planner change. |
| III. Simplicity / YAGNI | Pass | Hand-rolled drag (about 80 lines) instead of a drag library; one new collection. |
| IV. Test What Matters | Pass | Pure set-editing functions, planner preference rules, rules rows, screen tests. |
| V. Private & Synced | Pass | `users/{uid}/sets`, owner-only; preferences in the private profile. |

## Design

- **Data**: `users/{uid}/sets/{setId}` = `{ schemaVersion: 1, name (1–60 chars), source:
  'plan:<routine>' | 'manual', items: SetItem[] (≤ 40), createdAt, updatedAt }`, `SetItem =
  { exerciseId, version, phase, dose }`. Writes replace `items` (the whole ordered list) and
  `updatedAt`; name changes write `name` only.
- **Rules**: owner and invited may read, create, update and delete their own sets; `name` is a
  string of 1–60 chars; `items` is a list of at most 40. Rows 31–35.
- **Phase preferences**: `profile.phasePrefs: Record<exerciseId, Phase[]>` (merge-saved).
- **Pure editing** (`src/sets/edit.ts`, tested): items are kept sorted by part; `moveTo(items,
  from, toIndex, toPhase)`, `moveUp/moveDown` (crossing part boundaries), `addItem`, `removeItem`,
  `fromPlan(plan)`.
- **Drag**: a handle with `onPointerDown` + pointer capture; `touch-action: none` on the handle
  only; rows measured by `getBoundingClientRect`; a drop indicator line; drop position maps to
  (index, phase) via the part headings.
- **Planner**: `fitsPhase` uses the preference when present; +1.5 score and reason "Your
  warm-up pick" etc.; an exercise preferred in both warm-up and cool-down may be used once in
  each.
- **Back**: router counts in-app navigations; Back calls `history.back()` when there was one,
  else goes to the Library.
- **Routes**: `#/set/<id>`, `#/library?addTo=<setId>&phase=<phase>`; player `routine=set:<id>`.
