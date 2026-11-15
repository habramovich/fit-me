# Implementation Plan: Progress

**Branch**: `005-progress` | **Date**: 2026-11-15 | **Spec**: [spec.md](spec.md)

## Summary

A pure stats module turns the last 60 days of sessions into week totals, streaks, technique mix,
area coverage and a recent list; the Progress screen draws them following the dataviz method
(single-series bars with a goal line and per-bar readout; a labelled stacked bar for the mix with
a validated categorical palette). The player starts saving active seconds.

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Spec Before Code | Pass | spec.md + checklist. |
| II. Smallest Useful Slice | Pass | US1 alone is useful; US2–US4 add to the same screen. |
| III. Simplicity / YAGNI | Pass | Hand-drawn bars in HTML/CSS; no chart library. |
| IV. Test What Matters | Pass | Stats are pure and unit-tested against hand calculations (SC-002). |
| V. Private & Synced | Pass | Reads the person's own sessions; no new collections. |

## Design

- **Session time**: `usePlayer` writes `activeSeconds` (from the player's `elapsed`) with each
  items update and at finish. Rules unchanged (sessions already allow any fields with `items` ≤ 50).
- **Reading**: `recentSessions(uid, 60)` returns `routine`, `endedAt` and `activeSeconds` too.
- **Stats** (`src/progress/stats.ts`): `sessionMinutes`, `countedSessions`, `weekStart` (Monday),
  `weekSummary`, `streaks`, `weeklyMinutes(8)`, `techniqueMix(28 days)` (minutes apportioned by
  each done item's estimated seconds), `areaCoverage(7 days, focus)`, `recentList(10)`.
- **Chart palette** (validated with the dataviz validator, light, on white): yoga `#2a78d6`,
  strength `#eb6834`, tai chi `#1baf7a`, mobility `#eda100`, cardio `#e87ba4`; three are below
  3:1 against white, so the legend always shows names, minutes and percent (secondary encoding).
- **Profile**: `weeklyMinutes` (default 90), stepper on Profile.
