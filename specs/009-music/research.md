# Research: Session Music and Sound Cues

## R1. How the app makes music

- **Decision**: Generate the music live with the Web Audio API: a pure, seeded composer
  (`compose.ts`) decides the notes bar by bar; a small engine (`engine.ts`) schedules them a few
  hundred milliseconds ahead on the `AudioContext` clock and plays them with built-in nodes
  (oscillators, filters, gains, a noise buffer, a convolver for reverb with a generated impulse).
- **Rationale**: Works offline with nothing to download, needs no licences and no dependency
  (Principle III), and never repeats a loop because the composer picks chords, melody and rests
  from a seeded random walk. Splitting the composer from the engine lets the musical rules be unit
  tested without audio (Principle IV).
- **Alternatives considered**: Recorded tracks (licensing, several MB, loops audibly); a music
  library such as Tone.js (a dependency for what ~300 lines of Web Audio do); `<audio>` elements
  (see R3).

## R2. Moods

- **Decision**: Three moods with fixed character:

  | Mood | Used for | Tempo | Sound |
  |---|---|---|---|
  | Calm | Calm morning, Weekend longer | 60 bpm | warm pad, sparse bell notes, long reverb, no beat |
  | Steady | Desk break, Strength keeper | 84 bpm | pad, plucked arpeggio, soft bass, gentle pulse on beats 1 and 3 |
  | Upbeat | Cardio | 112 bpm | pad, eighth-note arpeggio, bass, soft four-on-the-floor kick, offbeat shaker |

  Chords change every two bars (Calm) or every bar (Steady, Upbeat), chosen from a small pool of
  progressions in a major or pentatonic scale, so the music never sounds tense.
- **Mood of a session** (`moodFor`): a plan uses its routine (table above). A saved set, a single
  exercise or the sample routine counts its exercises by technique (cardio → Upbeat, strength →
  Steady, yoga, tai chi, mobility → Calm) and takes the most common; a tie takes the calmer mood.
- **Rationale**: The owner asked for music matched to the routine; tempos sit under typical
  movement paces so the music never pushes her to rush.

## R3. Playing alongside the person's own music (FR-009)

- **Decision**: Use Web Audio only (no `<audio>` elements), and where the browser offers the Audio
  Session API, set `navigator.audioSession.type = 'ambient'` before the first sound.
- **Rationale**: Safari (iOS 16.4+) supports the Audio Session API, and `ambient` is the type for
  audio that mixes with other apps' audio; WebKit treats Web Audio as ambient on iOS anyway. Chrome
  is reported to request audio focus for media elements but not for Web Audio, so Web Audio cues
  should not pause another app's music. Neither is guaranteed across versions, so it is checked on
  the owner's phone and tablet (quickstart), and the Sound section in Profile always carries the
  one-line tip from the spec's Edge Cases: if cues pause your own music, turn cues off.
- **Alternatives considered**: Detecting per device whether mixing works (no API reports it).
- Sources: [W3C Audio Session](https://www.w3.org/TR/audio-session/),
  [MDN AudioSession.type](https://developer.mozilla.org/docs/Web/API/AudioSession/type),
  [WebKit bug 264473](https://bugs.webkit.org/show_bug.cgi?id=264473),
  [Mozilla bug 1545817](https://bugzilla.mozilla.org/show_bug.cgi?id=1545817).

## R4. Autoplay rules

- **Decision**: One shared `AudioContext`, created and resumed on the first tap or key press
  anywhere in the app (a capture listener registered at start-up), then kept. The player calls
  `resume()` when sound is wanted; if the context is still not running (e.g. iOS after coming back
  from the background, [WebKit bug 263627](https://bugs.webkit.org/show_bug.cgi?id=263627)), the
  player shows "Tap to start sound" and the next tap anywhere in the player resumes it.
- **Rationale**: Browsers only let audio start after a user gesture. The person always taps Start
  before the player opens, so the context is normally running by then; the hint covers the rest.

## R5. Pausing, hiding and finishing

- **Decision**: Music plays while `sessionMusic` is on, the session is not paused, not finished, and
  the page is visible. Rating and side-switch screens keep it playing. Stopping ramps the music
  bus to silence over 0.3 s (pause, hidden) or 1.5 s (finish, leaving the player) and stops
  scheduling; resuming restarts scheduling from the next bar with a 1 s fade-in. The composer keeps
  its position, so the music carries on rather than restarting.
- **Rationale**: Matches FR-004 and FR-005 with the existing player state; the page-visibility
  check covers the rating screen, where the player itself does not pause.

## R6. Cues

- **Decision**: Cues are synthesized in the same context on a separate, louder bus. A pure
  `cueFor(prev, next)` compares two player states:

  | Moment | Cue |
  |---|---|
  | a timed exercise ticks down to 3, 2 or 1 s left | `tick` (short soft blip) |
  | a timed exercise ticks down to 0 and goes to rating | `chime` (bell, two notes) |
  | the side-switch prompt appears | `switch` (two tones, down then up) |
  | a new exercise, or the second side, starts | `start` (quick rising three notes) |

  No cue while paused or on the first exercise when the player opens. While a cue plays, the music
  dips by about 6 dB for 0.6 s so the cue is clearly heard (FR-008).
- **Rationale**: A pure function of the state is easy to test and keeps the player machine
  unchanged. The second side starting is a "begin" moment like a new exercise, so it gets the same
  tone.

## R7. Song ideas and Amazon Music

- **Decision**: A fixed list in `src/sound/songs.ts`: 10 songs per mood, each with title, artist and
  a short reason. Each opens `https://music.amazon.com/search/<title artist>` in a new tab with
  `rel="noopener noreferrer"`. Amazon Music links open the app where it is installed and set up to
  handle them, otherwise the website.
- **Rationale**: Amazon Music has no public API for building a listener's playlists, and song page
  ids can't be checked from here; a search for title and artist always lands on the song (or the
  closest match) and carries nothing but the song (FR-014). `noreferrer` keeps even the app's
  address out of the request. Offline, the tap shows "Needs a connection" instead of opening.
- **Alternatives considered**: Direct track links (ids may change or differ by country);
  sign-in with Amazon (no playlist API, and against Principle V).
- The list leans on well-known songs from several decades, instrumental for Calm. The owner checks
  every link before release (SC-006).

## R8. Preferences

- **Decision**: Two profile fields, `sessionMusic` (default `false`) and `soundCues` (default
  `true`), saved with `saveProfile` like the other settings. The shell provides them to the player
  through a small `SoundPrefsContext`, together with a setter, so the player's music button saves
  the same field.
- **Rationale**: Same pattern as `figureStyle` (007): synced, offline, per person, no rules change.
