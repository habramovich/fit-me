---
description: "Task list for 004-saved-sets"
---

# Tasks: Saved Sets, Exercise Order and Phase Preferences

US1 save/open · US2 arrange · US3 phase preferences · US4 back + Swap label

- [X] T001 [US4] Router: in-app history tracking + `goBack()`; Back on exercise page uses it; Swap label on plan items
- [X] T002 [P] [US2] Pure editing `src/sets/edit.ts` + tests (move within/across parts, up/down across headings, add, remove, duplicates, cap 40, fromPlan)
- [X] T003 [P] [US1] Repo `src/data/repo/sets.ts` (watch, create, rename, save items, delete) + `SetsProvider` context
- [X] T004 [US1] Rules for `users/{uid}/sets` + tests rows 31–35
- [X] T005 [US1] Save as set on PlanView (name sheet); Your sets on Today
- [X] T006 [US2] `src/screens/SetView.tsx`: grouped list, drag handles, up/down, remove, rename, delete, add, Start
- [X] T007 [US2] Library add mode (`addTo`, `phase`); Add to set on exercise page (choose set/new, part)
- [X] T008 [US1] Player runs `set:<id>`
- [X] T009 [P] [US3] Profile `phasePrefs`; "I like this as" on exercise page
- [X] T010 [US3] Planner honours preferences + tests (never in main when not chosen; both warm-up and cool-down allowed)
- [X] T011 Screen tests (SetView buttons, Save as set, Back); docs; full checks
- [ ] T012 ⏸ PR, CI, merge (after #7), deploy
