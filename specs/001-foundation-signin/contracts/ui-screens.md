# Contract: Screens

All screens: single column, max content width 32rem, centred; buttons at least 48px tall;
no horizontal scroll from 320px wide up (FR-014).

| State (see data-model.md) | Shows |
|---|---|
| `loading` | App name and a "Loading…" line. |
| `signedOut` | App name, one-line tagline, **Sign in with Google** button. Optional error line (popup blocked). |
| `checkingInvite` | "Checking your invite…"; adds "You're offline" when offline. |
| `notInvited` | "FitMe is invite-only. Ask the owner to add you." and a **Sign out** button. |
| `invited` | "Hi, {displayName or email}", "Last signed in {date, time}" read from the record, **Sign out** button. |
