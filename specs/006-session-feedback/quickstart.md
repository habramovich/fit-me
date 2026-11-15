# Quickstart: validating Session feedback fixes

Prerequisites: `npm ci`, Java 21 for the rules tests. Emulators: `npm run emulators`, then
`npm run dev`, sign in as the seeded user. Run Vitest from PowerShell (see AGENTS.md).

## Automated

| Check | Command | Expect |
|---|---|---|
| Planner: keep, swap, repair, reshuffle | `npm test -- src/planner` | Pass |
| Pace defaults and library rule | `npm test -- src/exercises` | Every version has a pace that fits its dose |
| Figure timing per pace | `npm test -- src/figure` | Hold stays on `holdAt`; slow cycle = `secondsPerRep`; brisk ≤ 1 s per cycle |
| Player rating | `npm test -- src/player` | Skip next time → done, rating null, mark set |
| Rules rows 36–40 | `npm run test:rules` | Pass, rows 1–35 unchanged |
| All | `npm run lint`, `npm run format:check`, `npm test`, `npm run build` | Pass |

## Manual (phone and tablet widths)

1. **Same plan next day (US1, SC-001)**: Today → Calm morning, 15 min → Plan. Note the exercises.
   Back to Today: the "Your planned session" card shows it. In a second browser profile (another
   device), sign in, open the same routine and length: same exercises. Set the system date a day
   ahead (or edit `plannedAt` in the emulator UI) and reload: same plan, "Planned {day}" shown.
2. **Deliberate changes stick**: Swap item 2, reload: the swap is still there. Reshuffle: new plan;
   reload: the new plan.
3. **Repair**: Mark one planned exercise Not for me in the Library, reopen the plan: only that item
   changed, with a note. Add an avoided area that a planned exercise loads: same.
4. **Used up**: Start the plan, finish one exercise, end the session. Today no longer offers it;
   planning the same routine and length gives a new plan. Start a plan and leave before finishing
   any exercise: it's still offered.
5. **Pace (US2, SC-002)**: Player or exercise page for Child's pose (Hold: moves in, then still),
   Glute bridge (Slow and controlled, ~4 s per cycle), Wave hands like clouds (Flowing, no stops),
   March in place (Brisk, fast). With reduced motion on: step-through, holds still, tags shown.
6. **Skip next time (US3)**: In a session rate an exercise Skip next time: the session goes on, the
   notice appears, the Library shows it Not for me, a reshuffled plan never includes it; unmark it
   and it can come back. The finish screen no longer mentions the planner arriving.
7. `npm run render:figures` is unaffected (renders use `still`), but look at the player for each
   hold to confirm the held pose is the right keyframe.
