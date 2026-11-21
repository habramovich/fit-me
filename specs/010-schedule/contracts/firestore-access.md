# Contract: Firestore access, schedule and attendance (rows 41–50)

Adds to the matrix in [001's firestore-access.md](../../001-foundation-signin/contracts/firestore-access.md).
Each row is one test in `tests/rules/firestore.rules.test.ts`. Row 28 ("other subcollections
under a user are denied") must keep passing: it must not use `schedule` or `attendance`.

| # | Actor | Operation | Expected |
|---|---|---|---|
| 41 | A | create, update, get, list, delete `users/A/schedule/x` with a valid class and a valid home session | allow |
| 42 | A | `kind` unknown; `days` empty, more than 7, or not a list | deny |
| 43 | A | `start` not `HH:MM`; `minutes` not a number, below 5, or above 240 (class) / 90 (home) | deny |
| 44 | A | class `name` missing, empty or over 40; class `type` unknown; home `routine` unknown | deny |
| 45 | A | read or write `users/B/schedule/*` | deny |
| 46 | U (uninvited) | create `users/U/schedule/x` | deny |
| 47 | A | create, update, get, list (with `date >=` query), delete `users/A/attendance/x_2026-11-20` | allow |
| 48 | A | `status` unknown; `minutes` outside 5–240; `date` not `YYYY-MM-DD` | deny |
| 49 | A | read or write `users/B/attendance/*` | deny |
| 50 | U (uninvited) | create `users/U/attendance/x_2026-11-20` | deny |

Rules (two new blocks under `users/{uid}`):

```text
// Schedule (010): repeating classes and planned home sessions.
match /schedule/{itemId} {
  allow read, delete: if isInvited() && isOwner(uid);
  allow create, update: if isInvited() && isOwner(uid) && validScheduleItem(request.resource.data);
}

// Class attendance (010): one per class per day, id `{classId}_{YYYY-MM-DD}`.
match /attendance/{attendanceId} {
  allow read, delete: if isInvited() && isOwner(uid);
  allow create, update: if isInvited() && isOwner(uid)
    && request.resource.data.status in ['attended', 'skipped']
    && request.resource.data.date is string
    && request.resource.data.date.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
    && request.resource.data.minutes is number
    && request.resource.data.minutes >= 5 && request.resource.data.minutes <= 240;
}
```

with, at the top level of the service:

```text
function validScheduleItem(d) {
  return d.days is list && d.days.size() >= 1 && d.days.size() <= 7
    && d.start is string && d.start.matches('^([01][0-9]|2[0-3]):[0-5][0-9]$')
    && d.minutes is number && d.minutes >= 5
    && ((d.kind == 'class' && d.minutes <= 240
         && d.name is string && d.name.size() >= 1 && d.name.size() <= 40
         && d.type in ['yoga', 'taichi', 'strength', 'mobility', 'cardio', 'other'])
      || (d.kind == 'home' && d.minutes <= 90
         && d.routine in ['calm', 'desk', 'strength', 'weekend', 'cardio']));
}
```

The rules don't check that a class ends by midnight or that days are 1–7 without repeats; the
app's `validateItem` does (research R11).
