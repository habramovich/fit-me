# Quickstart: validating Schedule

Prerequisites: `npm ci`, Java 21 for the rules tests. Emulators: `npm run emulators`, then
`npm run dev`, sign in as the seeded user. Run Vitest from PowerShell (see AGENTS.md).

## Automated

| Check | Command | Expect |
|---|---|---|
| Week, today's entries, planned choice, covers, validation | `npm test -- src/schedule` | Pass |
| Planner with classes | `npm test -- src/planner` | Covered technique used less; mobility after strength; notes; Other and empty `covered` change nothing |
| Progress with classes | `npm test -- src/progress` | Attended class in week minutes, sessions, streaks, mix (incl. Other), recent; not in body areas |
| Screens | `npm test -- src/screens` | Schedule empty state and week; form validation; Today card and preselection |
| Router | `npm test -- src/app` | New schedule routes round-trip |
| Rules rows 41–50 | `npm run test:rules` | Pass, rows 1–40 unchanged |
| All | `npm run lint`, `npm run format:check`, `npm test`, `npm run build` | Pass |

## Manual (phone 390 px and tablet 820 px widths)

1. **Set up the week (US1, SC-001)**: Schedule is empty with two buttons. Add Pilates, Strength,
   Tue + Thu, 18:00, 60 min; add Calm morning Mon–Fri 07:30; add Weekend longer Sat 09:00. Time it:
   under 3 minutes. Each shows on the right days in time order. Try saving a class with no name,
   no days, 23:30 + 60 min: each is refused with a message by the field.
2. **Sync and offline**: In a second browser profile, sign in: same week. Go offline (DevTools),
   edit the class time and delete a home slot: the week changes at once; back online, the other
   profile shows the change.
3. **Today (US2, SC-002)**: On a weekday, Today shows the card with 07:30 Calm morning and (Tue/Thu)
   18:00 Pilates; the picker has Calm morning and its minutes selected. Tap another routine: the
   pick stays. Tap the card's home row: the plan opens. Finish one exercise of that plan, return to
   Today: the row is ticked and the picker falls back to the time-of-day default (or the next open
   slot). On a day with nothing scheduled: no card, Today as before.
4. **Attendance (US3, SC-003)**: On a class day tap Yes: Progress shows +60 minutes, +1 session, the
   streak counts today, Recent shows "Pilates (class)" and the mix shows Strength. Change to 45 min:
   Progress follows. Undo: all back. Not this time: shows skipped, counts nothing. Switch to Last
   week and mark last week's class. Mark the same class from both browser profiles: one record.
   Rename the class: the recorded one keeps its old name in Recent.
5. **Planner (US4, SC-005)**: With a Strength class today, plan a Weekend longer: a note "Lighter on
   strength: Pilates today." and fewer strength exercises than the same plan with the class marked
   Not this time (reshuffle generation equal, or compare the planner test). Plan Strength keeper:
   the suggestion note shows, the plan is still strength-led. A kept plan made before adding the
   class is unchanged.
6. **No schedule (SC-006)**: Delete everything: Today, plans and Progress behave as on `main`.
7. Screen reader (VoiceOver or TalkBack, or the browser's accessibility tree): rows read day, time,
   name, kind, length and status; the form's errors are announced.

## Owner review

Preview channel (`npx firebase hosting:channel:deploy schedule --expires 7d --project
fit-me-today`); the owner sets up her real week on her phone and tablet, then merge and deploy on
her go-ahead.
