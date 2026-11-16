# Contract: Firestore access, kept plans (rows 36–40)

Adds to the matrix in [001's firestore-access.md](../../001-foundation-signin/contracts/firestore-access.md).
Each row is one test in `tests/rules/firestore.rules.test.ts`. Row 28 ("other subcollections
under a user are denied") must keep passing: it must not use `plans`.

| # | Actor | Operation | Expected |
|---|---|---|---|
| 36 | A | create, update, get, list, delete `users/A/plans/calm-15` with a valid plan | allow |
| 37 | A | `items` not a list, empty, or more than 40 | deny |
| 38 | A | `routine` not one of the five routines, or `minutes` outside 5–90 or not a number | deny |
| 39 | A | read or write `users/B/plans/*` | deny |
| 40 | U (uninvited) | create `users/U/plans/calm-15` | deny |

Rule (one new block under `users/{uid}`):

```text
match /plans/{planId} {
  allow read, delete: if isInvited() && isOwner(uid);
  allow create, update: if isInvited() && isOwner(uid)
    && request.resource.data.routine in ['calm', 'desk', 'strength', 'weekend', 'cardio']
    && request.resource.data.minutes is number
    && request.resource.data.minutes >= 5 && request.resource.data.minutes <= 90
    && request.resource.data.items is list
    && request.resource.data.items.size() >= 1
    && request.resource.data.items.size() <= 40;
}
```
