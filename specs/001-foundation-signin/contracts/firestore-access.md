# Contract: Firestore access rules

The rules in `firestore.rules` MUST produce exactly this access matrix. Each row is one
automated test in `tests/rules/`.

`A` and `B` are invited, verified users. `U` is a verified user not on the allowlist.
`X` is a signed-in user whose email is invited but not verified. `anon` is signed out.

| # | Actor | Operation | Expected |
|---|---|---|---|
| 1 | A | get `users/A` | allow |
| 2 | A | set / update `users/A` | allow |
| 3 | A | delete `users/A` | deny (no delete in this feature) |
| 4 | A | get `users/B` | deny |
| 5 | A | set / update `users/B` | deny |
| 6 | A | list `users` | deny |
| 7 | A | get `allowlist/{A's email, lowercased}` | allow |
| 8 | A | get `allowlist/{B's email}` | deny |
| 9 | A | list `allowlist` | deny |
| 10 | A | create / update / delete any `allowlist` doc | deny |
| 11 | U | get / set `users/U` | deny |
| 12 | U | get `allowlist/{U's email}` (missing) | allow (returns not found) |
| 13 | X | get / set `users/X` | deny |
| 14 | anon | get `users/A`, get any `allowlist` doc | deny |
| 15 | A, email with upper-case letters, allowlist ID lowercased | get / set own record | allow |
| 16 | any | any other collection | deny |
