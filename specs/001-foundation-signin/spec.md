# Feature Specification: Foundation — Sign-in and Deploy Pipeline

**Feature Branch**: `001-foundation-signin`

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "Foundation: sign-in and deploy pipeline for FitMe. Invited people
sign in with Google and see a home screen greeting them by name; their record is created or
updated on each sign-in and read back. Uninvited people see an invite-only message and can't
touch any data. No one can read another person's data. The owner invites people by adding their
email in the Firebase console. Every merge to main is checked and deployed; pull requests are
checked but not deployed. Mobile and tablet first. Out of scope: profiles, exercises, planner,
schedule, music."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Invited person signs in (Priority: P1)

An invited person opens FitMe on their phone, taps **Sign in with Google**, picks their Google
account, and lands on a home screen that greets them by name. The app remembers them, so the
next time they open it they go straight to the home screen. They can sign out.

**Why this priority**: Every later feature (profile, sessions, history) belongs to a signed-in
person. Without this, nothing else can be personal or synced between phone and tablet.

**Independent Test**: Add one email to the invite list, open the app, sign in with that
account, and confirm the greeting shows the account's name and the last sign-in time saved for
that person.

**Acceptance Scenarios**:

1. **Given** a signed-out invited person, **When** they tap Sign in with Google and choose
   their account, **Then** they see the home screen with their name and a Sign out button.
2. **Given** an invited person signing in, **When** sign-in completes, **Then** their record
   (name, email, last sign-in time) is created if new or updated if it exists, and the home
   screen shows the last sign-in time read back from that record.
3. **Given** a signed-in person, **When** they close and reopen the app, **Then** they are
   still signed in and see the home screen without signing in again.
4. **Given** a signed-in person, **When** they tap Sign out, **Then** they return to the
   signed-out screen and their data is no longer shown.
5. **Given** the same invited person on a phone and a tablet, **When** they sign in on both,
   **Then** both show the same record.

---

### User Story 2 - Uninvited person is turned away (Priority: P1)

Someone whose email isn't on the invite list signs in with Google. Instead of the home screen,
they see a clear message: "FitMe is invite-only. Ask the owner to add you." with a Sign out
button. Nothing is saved for them and they can't see anyone's data.

**Why this priority**: The app is for a small invited group. Without this, anyone who finds the
address could use it and store data at the owner's expense.

**Independent Test**: Sign in with a Google account that is not on the invite list and confirm
the invite-only message appears and no record is created for that person.

**Acceptance Scenarios**:

1. **Given** a person not on the invite list, **When** they sign in with Google, **Then** they
   see the invite-only message and a Sign out button, and no record is created for them.
2. **Given** an uninvited person, **When** they try to read or write any data by any means,
   **Then** the attempt is refused.
3. **Given** an uninvited person who is then added to the invite list by the owner, **When**
   they reopen the app or sign in again, **Then** they reach the home screen.

---

### User Story 3 - Each person's data is private (Priority: P1)

Two invited people use FitMe. Each sees only their own record. Neither can read or change the
other's, even by tampering with the app.

**Why this priority**: Family and friends will later store health-related preferences
(sensitive areas, goals). Privacy has to hold from the first record.

**Independent Test**: With two invited accounts, attempt to read and write the second
person's record while signed in as the first, and confirm both are refused.

**Acceptance Scenarios**:

1. **Given** two invited people A and B, **When** A attempts to read B's record, **Then** it is
   refused.
2. **Given** two invited people A and B, **When** A attempts to change or create B's record,
   **Then** it is refused.

---

### User Story 4 - Changes are checked and released automatically (Priority: P2)

The owner (working with an AI agent) proposes a change. Before it can be merged, it is checked
automatically: code style, formatting, tests and a production build. Once merged into the main
line, the live site updates on its own within minutes. A proposed change that isn't merged
never reaches the live site.

**Why this priority**: Every later feature ships through this path. It doesn't add user value
on its own, but it keeps the live app working as features are added.

**Independent Test**: Open a change with a deliberate formatting error and confirm it is flagged
and not deployed; fix and merge it and confirm the live site shows the change.

**Acceptance Scenarios**:

1. **Given** a proposed change, **When** it is opened for review, **Then** the checks run and
   their result is shown, and nothing is deployed.
2. **Given** a proposed change that fails any check, **When** the owner tries to merge it,
   **Then** merging is blocked until the checks pass.
3. **Given** a change merged into the main line, **When** the checks pass, **Then** the live
   site is updated automatically, including the data-access rules.

---

### Edge Cases

- The person closes the Google account picker without choosing: they stay on the signed-out
  screen with no error.
- The browser blocks the sign-in popup: the person sees a short message explaining how to allow
  it.
- The person is offline when opening the app while already signed in: the home screen shows
  their last known record; the sign-in time is saved once they are back online.
- The person's Google account has no display name: the greeting falls back to their email.
- The owner removes someone from the invite list while they are signed in: their next data
  access is refused and they see the invite-only message.
- An invite-list email differs only in letter case from the Google account email: it still
  matches.
- A deploy fails midway: the live site keeps the previous working version.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST let a person sign in with their Google account from a single
  **Sign in with Google** button.
- **FR-002**: The app MUST keep a person signed in across app restarts until they sign out.
- **FR-003**: The app MUST provide a **Sign out** button on every signed-in screen, including
  the invite-only screen.
- **FR-004**: The app MUST grant data access only to people whose email is on the invite list.
- **FR-005**: On each sign-in by an invited person, the app MUST create or update that person's
  record with name, email and last sign-in time, changing only those fields.
- **FR-006**: The home screen MUST greet the person by name and show the last sign-in time
  read back from their saved record.
- **FR-007**: A person not on the invite list MUST see the message "FitMe is invite-only. Ask
  the owner to add you." and MUST NOT be able to read or write any data.
- **FR-008**: A person MUST NOT be able to read, create, change or delete another person's
  record. This MUST be enforced by the data store, not only by the app's screens.
- **FR-009**: The owner MUST be able to invite a person by adding their email to the invite
  list without changing or redeploying the app.
- **FR-010**: Every proposed change MUST be checked for code style, formatting, tests and a
  successful production build, and the result MUST be visible on the change.
- **FR-011**: A change MUST NOT be mergeable into the main line until its checks pass.
- **FR-012**: Every change merged into the main line MUST be deployed to the live site
  automatically, including the data-access rules; proposed but unmerged changes MUST NOT be
  deployed.
- **FR-013**: After a deploy, people MUST get the new version on their next app load, not a
  stale cached one.
- **FR-014**: All screens in this feature MUST be usable on a phone (portrait) and tablet
  (portrait and landscape) without horizontal scrolling, with touch targets large enough to tap
  comfortably.

### Key Entities

- **Person record**: one per invited person who has signed in. Holds display name, email, last
  sign-in time and a data-shape version. Owned by and visible only to that person.
- **Invite list**: the set of invited emails. Managed by the owner outside the app; readable
  by the data-access rules, not by people using the app.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An invited person goes from opening the app to seeing their greeting in under
  30 seconds on first use, and under 3 seconds on later opens.
- **SC-002**: 100% of attempts by an uninvited person, or by one person against another
  person's record, are refused (verified by automated tests against a local copy of the data
  store).
- **SC-003**: A merged change is live on the site within 10 minutes of merging, with no manual
  steps.
- **SC-004**: A change that fails any check cannot be merged (0 failing changes reach the main
  line).
- **SC-005**: All screens in this feature pass a manual check on one phone and one tablet with
  no layout breakage.

## Assumptions

- People using FitMe have a Google account; no other sign-in method is needed.
- The invite list holds a handful of emails (fewer than 20) and is edited rarely.
- Account deletion and data export are out of scope for this slice and come with profiles.
- The live site uses the default address of the hosting service; no custom domain.
- The owner's code-hosting plan may not support blocking merges on a private repository; if
  so, FR-011 is met by keeping the repository's checks required by convention and the owner is
  told.
- Uninvited people can still complete a Google sign-in (the sign-in provider can't check the
  invite list); they are stopped at data access, as FR-007 describes.
