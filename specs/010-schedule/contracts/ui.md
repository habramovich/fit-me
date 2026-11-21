# Contract: screens

## Schedule tab (`#/schedule`)

- Title **Schedule**; under it the week ("18–24 Nov") and a two-way switch **This week** /
  **Last week**.
- Empty schedule: one card, "Add the classes you go to and plan your home sessions. Today will
  remind you." with **Add a class** and **Plan a home session**.
- Otherwise seven day sections, Monday first; today's section is highlighted and labelled
  "Today". A day with nothing shows "Nothing planned". The two add buttons sit below the week.
- Each item row: start time, name (class name, or routine name), length ("60 min"), and a tag
  **Class** or **Home**. Tapping the row opens its form.
- Class rows on today or earlier days of the shown week also show attendance:
  - open: **Attended?** with **Yes** and **Not this time**;
  - attended: "✓ Attended · 60 min" and **Change**;
  - skipped: "Not this time" and **Change**.
  **Change** opens a small sheet: minutes (number, 5–240, attended only), **Attended**,
  **Not this time**, **Undo** (clears it), **Done**.
- Home rows on today or earlier show "✓ Done" when done (research R4); nothing otherwise.
- Future days show no attendance controls.
- Screen reader: each row reads e.g. "Tuesday 18:00, Pilates, class, 60 minutes, attended".

## Item form (`#/schedule/new/class`, `#/schedule/new/home`, `#/schedule/<id>`)

| Field | Class | Home session |
|---|---|---|
| Name | text, required, ≤ 40 | — |
| Type | chips: Yoga, Tai chi, Strength, Mobility, Cardio, Other (default Other) | — |
| Routine | — | the five routines, as on Today (default Calm morning) |
| Days | toggle chips Mon–Sun, at least one | same |
| Start | time input, required (default 18:00 class, 07:30 home) | same |
| Length | number + chips 30 / 45 / 60 / 90 (default 60) | number + chips, preset to the routine's Profile minutes |

- **Save** validates; problems show under the field and focus moves to the first one.
- Editing: **Save**, and **Delete** with a confirm ("Delete Pilates? Attended classes stay in
  Progress.").
- Back (or Cancel) leaves without saving.

## Today

- **Today's schedule** card, shown when today has items: below "Your planned session" (if any),
  above "Your sets". Rows as on Schedule for today (time, name, length);
  passed items muted; class rows have the attendance controls; done home rows show ✓. Tapping a
  home row opens its plan (`#/plan?r=…&m=…`). Link **See the week** to `#/schedule`.
- The session picker preselects the planned choice (research R5) until the person taps another
  routine or length.

## Plan screen

- Notes from the planner show where repair notes do, e.g. "Lighter on strength: Pilates today."
  or "Pilates today covers strength; Calm morning or Desk break may suit better."

## Progress

- Technique mix may include **Other** (its own colour).
- Recent sessions: an attended class shows "Pilates (class)", its minutes, and "Class" in place
  of "n done".
