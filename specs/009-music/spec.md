# Feature Specification: Session Music and Sound Cues

**Feature Branch**: `009-music`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "Music: background music during a home session in the player." Owner
answers: music "made by app", "also an option to suggest songs from Amazon Music, so I can create
playlist"; music should match the routine; add short sound cues too.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Music that suits the session (Priority: P1)

During a session the owner taps the music button in the player and soft music starts, made by the
app on the device. It suits the session: slow and spacious for a calm morning, a steady pulse for a
strength keeper, livelier for cardio. The music pauses when the session pauses, keeps playing
through exercise changes and rating screens, and fades out when the session ends. The next session
starts with music on, on the phone and on the tablet, until the owner turns it off.

**Why this priority**: This is the feature the owner asked for; the other stories add to it.

**Independent Test**: Start a Calm morning plan, turn music on, pause, resume, finish: music starts,
stops on pause, comes back on resume and fades out on the finish screen. Start a Cardio plan: the
music is noticeably livelier. Start any session on another device: music is already on.

**Acceptance Scenarios**:

1. **Given** a person who has never turned music on, **When** they start a session, **Then** no
   music plays and the player shows a music button that is off.
2. **Given** a session in progress, **When** the person turns music on, **Then** music fades in
   within 2 seconds, in the mood of the session.
3. **Given** music is playing, **When** the person pauses the session, or the app goes to the
   background, **Then** the music stops; **When** they resume, **Then** it comes back.
4. **Given** music is playing, **When** the session reaches the finish screen or the person leaves
   the player, **Then** the music fades out and stops.
5. **Given** music was on at the end of the last session, **When** the person starts any session on
   any of their devices, **Then** music starts on its own once they start the first exercise.
6. **Given** the phone is offline, **When** the person plays a session with music on, **Then** the
   music plays as usual.
7. **Given** a Calm morning or Weekend longer session, **Then** the mood is Calm; a Desk break or
   Strength keeper session is Steady; a Cardio session is Upbeat; a saved set takes the mood of
   most of its exercises.
8. **Given** a session longer than 10 minutes, **When** the owner listens throughout, **Then** the
   music does not audibly repeat the same short loop.

---

### User Story 2 - Sound cues (Priority: P2)

While moving, the owner is not always looking at the screen. Soft sounds tell her what is
happening: three quiet ticks before a countdown ends, a chime when it ends, a different tone when
it is time to switch sides, and a short rising tone when the next exercise begins. Cues play with or
without music, sit clearly above the music, and can be turned off.

**Why this priority**: Useful on its own and with music, but the owner asked for music first.

**Independent Test**: Play a plan with a timed hold, a two-sided exercise and a repetition
exercise, with music off and then on: each moment has its cue, and with cues off there are none.

**Acceptance Scenarios**:

1. **Given** cues are on and a timed exercise is counting down, **When** 3 seconds are left,
   **Then** a soft tick plays each second, and a chime plays at zero.
2. **Given** cues are on, **When** the side-switch prompt appears, **Then** the switch-side tone
   plays.
3. **Given** cues are on, **When** the next exercise starts, **Then** the next-exercise tone plays.
4. **Given** cues are off, **Then** none of these sounds play; music, if on, is unaffected.
5. **Given** the session is paused, **Then** no cues play.
6. **Given** the person is playing their own music from another app, **When** a cue plays, **Then**
   their music keeps playing (see Edge Cases for devices that cannot do this).

---

### User Story 3 - Song ideas for an Amazon Music playlist (Priority: P3)

The owner would sometimes rather listen to real songs. In Profile, **Song ideas** lists songs for
each mood (Calm, Steady, Upbeat), with title, artist and a word on why it fits (for example "slow,
no vocals" or "about 125 beats per minute"). Tapping a song opens it in Amazon Music, where she adds
it to her own playlist. She then plays that playlist in Amazon Music during a session, with FitMe's
music off and its cues still on.

**Why this priority**: A nice extra for building playlists; the session works fully without it.

**Independent Test**: Open Profile → Song ideas, tap three songs from different moods: each opens
that song in Amazon Music (app or website), where it can be added to a playlist.

**Acceptance Scenarios**:

1. **Given** Profile, **When** the person opens Song ideas, **Then** they see 8–12 songs for each
   mood, each with title, artist and why it fits.
2. **Given** Song ideas, **When** the person taps a song, **Then** it opens in Amazon Music (the app
   if installed, otherwise the website) and FitMe stays open behind it.
3. **Given** Song ideas, **Then** the page explains in one line that FitMe can't add songs to
   Amazon Music for them, and that tapping a song tells Amazon only which song was tapped.
4. **Given** the phone is offline, **When** the person opens Song ideas, **Then** the list shows,
   and tapping a song says it needs a connection.

---

### Edge Cases

- A device or browser that stops other apps' music when FitMe plays a cue: the cue still plays; the
  Sound section of Profile says that on this device cues may pause other music, so the person can
  turn cues off when using their own playlist.
- The phone's silent switch or volume at zero: FitMe plays nothing audible and does not show an
  error; the music button still shows on or off.
- The person turns music on while a different sound source (call, video) is active: FitMe does not
  try to take over; the session is unaffected.
- A session that ends early (Finish early) fades the music out the same way as a normal finish.
- Going back to a previous exercise or skipping one keeps the music playing without a restart.
- A saved set evenly split between moods uses the calmer mood.
- The music never plays outside the player (not in Library, Today, Profile previews or the review
  page) except for a short sample when the person taps a mood's preview in Profile.
- A song suggestion that is no longer on Amazon Music opens a search there instead of an error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The player MUST offer a music button that turns session music on and off at any time
  during a session.
- **FR-002**: Session music MUST be made by the app on the device: no downloads, no outside service,
  and it MUST work offline.
- **FR-003**: The app MUST have three music moods, Calm, Steady and Upbeat, chosen from the session:
  Calm morning and Weekend longer → Calm; Desk break and Strength keeper → Steady; Cardio → Upbeat;
  a saved set → the mood of most of its exercises (calmer on a tie).
- **FR-004**: Music MUST fade in on start, stop on pause or when the app is hidden, resume on
  resume, and fade out on finish, Finish early or leaving the player.
- **FR-005**: Music MUST continue without restarting across exercise changes, side switches, rating
  screens, back and skip.
- **FR-006**: Music MUST not audibly repeat a short loop within a 10-minute session.
- **FR-007**: The player MUST play sound cues: a soft tick each of the last 3 seconds of a countdown,
  a chime when a countdown ends, a switch-side tone, and a next-exercise tone; no cues while paused.
- **FR-008**: Cues MUST be clearly audible over the app's own music and MUST play whether music is
  on or off.
- **FR-009**: Cues SHOULD NOT stop or pause music the person plays from another app; where the
  device cannot avoid this, Profile MUST say so (Edge Cases).
- **FR-010**: Profile MUST have a Sound section with Music on/off, Cues on/off, and a short preview
  of each mood and of the cues.
- **FR-011**: Music and cue choices MUST be stored with the person's profile so they follow them
  across devices, MUST save at once like other Profile settings, and MUST work offline. Turning
  music on or off in the player MUST update the same stored choice.
- **FR-012**: Defaults for a person who has never chosen: music off, cues on.
- **FR-013**: Profile MUST have a Song ideas page listing 8–12 suggested songs per mood with title,
  artist and why it fits, each opening that song (or a search for it) in Amazon Music.
- **FR-014**: Opening a song MUST send Amazon nothing but which song it is: no account, profile or
  session details. The page MUST say so in one line, and MUST say FitMe can't add songs to playlists
  for them.
- **FR-015**: The song list MUST be fixed content shipped with the app (the same for everyone),
  reviewed by the owner before release.
- **FR-016**: The music button and Sound settings MUST have clear screen-reader labels that say
  whether music and cues are on or off.

### Key Entities

- **Sound preferences**: a person's choice of Music on/off and Cues on/off, stored with their
  profile. Missing values mean the defaults (FR-012).
- **Mood**: Calm, Steady or Upbeat; worked out from the session (routine or saved set), not stored.
- **Song idea**: title, artist, mood, and a short reason it fits; fixed content, not per person.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The owner can turn music on from the player in one tap, and hears it within 2 seconds.
- **SC-002**: After listening to each mood for at least 5 minutes in a real session, the owner
  agrees each one suits its routines and is pleasant enough to keep on.
- **SC-003**: In 100% of pauses, finishes and exits, the music stops within 2 seconds.
- **SC-004**: Every cue moment in a test plan (countdown end, side switch, next exercise) plays its
  cue with cues on, and none plays with cues off.
- **SC-005**: Music and cue choices made on one device are in effect on the owner's other device the
  next time it opens online.
- **SC-006**: Every song idea opens the right song, or a search that finds it, in Amazon Music when
  the owner checks them before release.
- **SC-007**: With music off and cues off, a session sounds and behaves exactly as before this
  feature.

## Assumptions

- "Made by app" means music generated on the device while the session runs (gentle pads, tones and
  a soft pulse), not recorded songs; it will sound ambient rather than like a song. The owner listens
  to each mood on a preview channel before release, as with exercise batches.
- Music starts off by default so a session never surprises anyone with sound (e.g. a desk break at
  work); cues start on because they are soft and help when not looking at the screen.
- Volume is the device's own volume; the app sets a sensible balance (music quieter than cues) and
  adds no volume slider.
- Mood is automatic; choosing a different mood for a session is out of scope.
- Amazon Music offers no way for FitMe to create or fill playlists, so the person adds songs
  themselves; connecting FitMe to an Amazon account is out of scope. Other music services are out
  of scope.
- Song ideas are suggestions only; FitMe does not play them and does not check what the person
  listens to.
- Opening Amazon Music is a link the person taps, carrying only the song; this is not data sharing
  about the person (constitution, Principle V).
- Breath-paced music (music that follows each exercise's breath cues) is out of scope.
- The existing behaviour stays: the session pauses when the app goes to the background, so
  switching to Amazon Music to change songs pauses the session.
