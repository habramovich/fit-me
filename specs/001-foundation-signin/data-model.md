# Data Model: Foundation — Sign-in and Deploy Pipeline

## `users/{uid}` — person record

One document per invited person who has signed in. `uid` is the Firebase Auth user ID.

| Field | Type | Rules |
|---|---|---|
| `schemaVersion` | number | Always `1` in this feature. Bumped when the shape changes. |
| `displayName` | string \| null | From the Google account; the UI falls back to `email` when null. |
| `email` | string | From the Google account, as given (not lowercased). |
| `lastSignInAt` | timestamp | Server timestamp, set on every sign-in. |

- Written with a merge on each sign-in; only these four fields are set (FR-005).
- Readable and writable only by the person whose `uid` it is, and only while invited (FR-008).
- Later features add fields (profile, preferences) and subcollections under this document.

## `allowlist/{email}` — invite list entry

One document per invited email. The document ID is the email in lowercase.

| Field | Type | Rules |
|---|---|---|
| `note` | string (optional) | Free text for the owner, e.g. "sister". Not used by the app. |

- Created and deleted by the owner in the Firebase console only (FR-009).
- A signed-in person can `get` only the entry matching their own email; no `list`, no writes.

## Client-side session state (not stored)

```text
loading ──auth resolves──▶ signedOut
signedOut ──Sign in──▶ checkingInvite
checkingInvite ──entry exists──▶ invited (home)
checkingInvite ──missing / permission-denied──▶ notInvited (invite-only screen)
invited ──permission-denied on record──▶ notInvited
invited | notInvited ──Sign out──▶ signedOut
```

While offline, `checkingInvite` reads the allowlist entry from the local cache; if the cache
has no answer, the app stays in `checkingInvite` with an "offline" note rather than guessing.
