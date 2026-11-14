# Contract: Firestore access rules (additions)

All rows of [001's matrix](../../001-foundation-signin/contracts/firestore-access.md) still hold.
`A`, `B` invited; `U` uninvited. Each row is a test in `tests/rules/`.

| # | Actor | Operation | Expected |
|---|---|---|---|
| 17 | A | set `users/A/exerciseMarks/dead-bug` `{mark:'favourite'}` | allow |
| 18 | A | set `users/A/exerciseMarks/dead-bug` `{mark:'love'}` | deny (bad value) |
| 19 | A | delete `users/A/exerciseMarks/dead-bug` | allow |
| 20 | A | get / list `users/A/exerciseMarks` | allow |
| 21 | A | get / set `users/B/exerciseMarks/x` | deny |
| 22 | U | set `users/U/exerciseMarks/x` | deny |
| 23 | A | create / update `users/A/sessions/s1` with valid shape | allow |
| 24 | A | create `users/A/sessions/s1` with 51 items | deny |
| 25 | A | delete `users/A/sessions/s1` | deny |
| 26 | A | get / list `users/A/sessions` | allow |
| 27 | A | get / set `users/B/sessions/s1` | deny |
| 28 | A | any other subcollection under `users/A` | deny |
