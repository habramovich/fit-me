# Implementation Plan: Session Music and Sound Cues

**Branch**: `009-music` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

The player gains generated background music and sound cues, both made live with the Web Audio API
on the device. A pure, seeded composer writes the music bar by bar in one of three moods (Calm,
Steady, Upbeat) chosen from the session; a thin engine schedules the notes and synthesizes the
voices and cues. A pure `cueFor(prev, next)` turns player state changes into cues. Two profile
fields (`sessionMusic`, `soundCues`) store the choices; Profile gets a Sound section with previews
and a Song ideas page that opens fixed song suggestions as Amazon Music searches.

## Technical Context

**Language/Version**: TypeScript 7 (strict), React 19

**Primary Dependencies**: none new (Web Audio API, built into browsers)

**Storage**: `users/{uid}.profile.sessionMusic` and `.soundCues` in Firestore (offline cache)

**Testing**: Vitest + React Testing Library; composer, mood, cue and song-list rules unit-tested;
the engine is checked by ear on the owner's devices (jsdom has no audio)

**Target Platform**: mobile and tablet browsers (iOS Safari, Android Chrome)

**Project Type**: single-page web app

**Performance Goals**: music adds no visible jank to the figure animation; scheduling work is a
few dozen nodes per bar

**Constraints**: offline; no downloads; no other app's music interrupted where the browser allows
(research R3); a session with music and cues off behaves exactly as before (SC-007)

**Scale/Scope**: 3 moods, 4 cues, 30 song ideas, 5 entry points into the player (plan, set, single,
sample, kept plan)

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Spec Before Code | Pass | spec.md + checklist, owner choices recorded in the input. |
| II. Smallest Useful Slice | Pass | US1 (music) ships alone; US2 (cues) and US3 (song ideas) each add on top. |
| III. Simplicity / YAGNI | Pass | No dependency; Web Audio directly. One context for prefs, like figure style. |
| IV. Test What Matters | Pass | Composer, mood, cues, songs and profile defaults unit-tested; component tests for the music button, Sound section and Song ideas page. Sound quality is judged by the owner. |
| V. Private & Synced | Pass | Prefs in the person's own profile; no rules change; additive fields, schema version stays 1. Amazon links carry only the song and use `noreferrer`; the spec explains why (FR-014). |

Re-checked after design: still passes; nothing for Complexity Tracking.

## Design

See [research.md](research.md) for the reasoning and [data-model.md](data-model.md) for shapes.

- **Profile** (`src/profile/types.ts`): `sessionMusic: boolean` (default `false`), `soundCues:
  boolean` (default `true`); `withDefaults` keeps only booleans.
- **Prefs context** (`src/sound/prefs.ts`): `SoundPrefsContext` with `{ music, cues, setMusic }`,
  default `{ false, false, no-op }` outside the shell (tests, review). `Shell` provides it from the
  profile; `setMusic` saves `{ sessionMusic }`.
- **Mood** (`src/sound/mood.ts`): `Mood`, `MOODS`, `moodFor(sessionRoutine, items)`.
- **Composer** (`src/sound/compose.ts`): `makeComposer(mood, seed)` returns `{ bpm, nextBar():
  NoteEvent[] }`; seeded PRNG (mulberry32), chord progressions per mood, melody as a random walk on
  chord and scale tones with rests. Pure.
- **Cues** (`src/sound/cues.ts`): `Cue`, `cueFor(prev, next)`. Pure.
- **Engine** (`src/sound/engine.ts`): shared `AudioContext` (lazy; `unlockAudio()` on first gesture;
  `audioSession.type = 'ambient'` where supported), buses (master, music, cue, reverb send),
  voices, `startMusic(mood)`, `stopMusic(fadeSeconds)`, `playCue(cue)` (with music dip),
  `previewMood(mood)`, `audioRunning()`. Every function is a no-op where Web Audio is missing.
- **Player hook** (`src/player/useSessionSound.ts`): from player state, mood, prefs and page
  visibility, starts and stops music and plays cues; returns `needsTap` for the "Tap to start
  sound" hint and a `retry()` for the next tap.
- **Player UI** (`src/player/PlayerScreen.tsx`): a music button in the top bar (`aria-pressed`,
  label "Music on" / "Music off") calling `setMusic`; the hint when `needsTap`.
- **Profile UI** (`src/screens/profileSections.tsx`): `SoundSection` with Music and Cues on/off
  (`Segmented`), "Hear" buttons for each mood and for the cues, the tip about other apps' music,
  and a link to Song ideas.
- **Song ideas** (`src/sound/songs.ts`, `src/screens/Songs.tsx`, route `#/songs`): 10 songs per
  mood; each a link to the Amazon Music search; offline taps show a notice. The Profile tab stays
  highlighted on this page.
- **Start-up** (`src/main.tsx`): register `unlockAudio` on the first `pointerdown` / `keydown`.

## Project Structure

### Documentation (this feature)

```text
specs/009-music/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks
```

No `contracts/`: no interface to other systems beyond the Amazon Music search link (research R7).

### Source Code

```text
src/
├── sound/
│   ├── mood.ts, mood.test.ts
│   ├── compose.ts, compose.test.ts
│   ├── cues.ts, cues.test.ts
│   ├── engine.ts           # Web Audio; not unit-tested
│   ├── prefs.ts            # SoundPrefsContext
│   ├── songs.ts, songs.test.ts
├── player/
│   ├── useSessionSound.ts, useSessionSound.test.tsx
│   ├── PlayerScreen.tsx, PlayerScreen.test.tsx, player.css
├── profile/types.ts        # sessionMusic, soundCues
├── app/Shell.tsx, router.ts, TabBar.tsx
├── screens/profileSections.tsx, Profile.tsx, Profile.test.tsx, Songs.tsx, Songs.test.tsx
└── main.tsx                # unlockAudio
```

**Structure Decision**: existing single-project layout; one new folder, `src/sound/`.
