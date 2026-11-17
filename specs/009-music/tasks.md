---
description: "Task list for 009-music"
---

# Tasks: Session Music and Sound Cues

Branch `009-music`. Run Vitest from PowerShell. Tests are included because the constitution
requires unit tests for domain logic (Principle IV).

## Phase 1: Setup

- [X] T001 Create `src/sound/` and check the installed DOM typings for `AudioContext`, `ConvolverNode`, `navigator.audioSession` (may be missing in `lib.dom.d.ts`; declare a minimal optional type in `src/sound/engine.ts` if so)

## Phase 2: Foundational (blocks all stories)

- [X] T002 [P] Add `sessionMusic: boolean` (default `false`) and `soundCues: boolean` (default `true`) to `Profile` and `DEFAULT_PROFILE` in `src/profile/types.ts`; `withDefaults` "turns a missing or non-boolean value into the default"; tests for missing, set and non-boolean values in `src/profile/types.test.ts` (create if absent)
- [X] T003 [P] Add `SoundPrefs { music: boolean; cues: boolean; setMusic(on: boolean): void }`, `SoundPrefsContext` (default `{ music: false, cues: false, setMusic: () => {} }`) and `useSoundPrefs()` in `src/sound/prefs.ts`
- [X] T004 Provide `SoundPrefsContext` in `src/app/Shell.tsx` from `profile.sessionMusic` / `profile.soundCues`, with `setMusic` saving `{ sessionMusic }` via `saveProfile(user.uid, …)`
- [X] T005 Engine core in `src/sound/engine.ts`: lazy shared `AudioContext` (no-op when `window.AudioContext` is missing); `unlockAudio()` creates/resumes it and sets `navigator.audioSession.type = 'ambient'` where supported; buses master → destination, music (0.3), cues (0.7), reverb send via a `ConvolverNode` with a generated 2.5 s decaying-noise impulse; `audioRunning()`; register `unlockAudio` once on the first `pointerdown`/`keydown` (capture) in `src/main.tsx`

**Checkpoint**: prefs flow from profile to any screen; audio context unlocks on first tap.

## Phase 3: User Story 1 - Music that suits the session (P1) 🎯 MVP

**Goal**: the player plays generated music in the session's mood, following pause, hide and finish.

**Independent test**: quickstart.md "By ear" steps 2, 3, 5, 6, 7.

- [X] T006 [P] [US1] `Mood = 'calm' | 'steady' | 'upbeat'`, `MOODS`, `MOOD_LABEL`, and `moodFor(sessionRoutine: string, items: { exerciseId: string }[])` in `src/sound/mood.ts`: "`plan:<routine>`: calm, weekend → `calm`; desk, strength → `steady`; cardio → `upbeat`"; otherwise the most common mood of the items' techniques ("cardio → `upbeat`; strength → `steady`; yoga, taichi, mobility → `calm`"), "ties go to the calmer mood; no items → `calm`"
- [X] T007 [P] [US1] Tests in `src/sound/mood.test.ts`: each plan routine; a set of mostly cardio; a tie between calm and steady → calm; empty → calm; unknown exercise ids ignored
- [X] T008 [P] [US1] Composer in `src/sound/compose.ts`: `mulberry32(seed)`; per-mood definition (bpm 60 / 84 / 112, scale, chord progressions, voices per research R2); `makeComposer(mood, seed)` → `{ bpm, secondsPerBar, nextBar(): NoteEvent[] }` with `NoteEvent { beat; voice: 'pad'|'bell'|'pluck'|'bass'|'kick'|'shaker'; midi; beats; velocity }`, "`beat` is within the bar (0 ≤ beat < 4), `velocity` in (0, 1]"; melody as a random walk on chord/scale tones with rests
- [X] T009 [P] [US1] Tests in `src/sound/compose.test.ts`: same seed → same bars, different seeds → different; every event's beat in [0, 4), velocity in (0, 1], pitched notes in the mood's scale; Calm has no `kick`/`shaker`, Upbeat has a kick on every beat; over 10 minutes of bars no 4-bar phrase of melody notes repeats exactly back to back and no 8-bar window repeats anywhere (FR-006)
- [X] T010 [US1] Engine music in `src/sound/engine.ts`: voices (pad: two detuned oscillators → low-pass → slow envelope, reverb send; bell: sine + partial, exponential decay; pluck: triangle, fast decay, low-pass; bass: triangle; kick: sine 120→45 Hz drop; shaker: high-passed noise burst); a 50 ms lookahead scheduler that schedules whole bars up to 0.3 s ahead; `startMusic(mood)` (fade in 1 s, keeps the composer per mood so a resume continues), `stopMusic(fadeSeconds)` (ramp music bus to 0, stop scheduling), `previewMood(mood, seconds = 8)`; all no-ops without Web Audio
- [X] T011 [US1] Hook `useSessionSound({ state, mood })` in `src/player/useSessionSound.ts`: wants music when `prefs.music && !state.paused && state.phase !== 'finished' && document.visibilityState === 'visible'`; start/stop on change (stop fade 0.3 s for pause/hidden, 1.5 s for finish and unmount); after starting, if `!audioRunning()` return `needsTap: true` and expose `retry()` that calls `unlockAudio()` then restarts
- [X] T012 [US1] Player UI in `src/player/PlayerScreen.tsx` + `src/player/player.css`: compute `mood` once with `moodFor(sessionRoutine, items)`; call `useSessionSound`; a music button in `.player__top` (icon note, `aria-label` "Music" with `aria-pressed={music}`, so screen readers say on or off per FR-016) calling `setMusic(!music)`; a "Tap to start sound" button when `needsTap`; also call `retry` from a `pointerdown` on `<main>` when `needsTap`
- [X] T013 [P] [US1] Tests in `src/player/PlayerScreen.test.tsx` (mock `src/sound/engine`): music off → no `startMusic`; provider with music on → `startMusic(mood)` called; pressing pause → `stopMusic`; the music button calls `setMusic(true)` and has `aria-pressed`; finishing → `stopMusic`

**Checkpoint**: US1 is usable alone (music toggled from the player; saved like other settings).

## Phase 4: User Story 2 - Sound cues (P2)

**Goal**: soft cues for countdown end, side switch and next exercise.

**Independent test**: quickstart.md "By ear" steps 4 and 8.

- [X] T014 [P] [US2] `Cue = 'tick' | 'chime' | 'switch' | 'start'` and `cueFor(prev: PlayerState, next: PlayerState): Cue | null` in `src/sound/cues.ts` per research R6 (switch wins over chime; start for a new index or side 2 in `doing`; nothing when `next.paused` or `next.phase === 'finished'`)
- [X] T015 [P] [US2] Tests in `src/sound/cues.test.ts` driving `playerReducer`: 5 s hold ticks give tick at 3, 2, 1 then chime; per-side timed exercise gives switch then start; rate → start; skip → start; pause → nothing; reps `setDone` mid-exercise → nothing
- [X] T016 [US2] `playCue(cue)` in `src/sound/engine.ts` (tick: 880 Hz sine 50 ms; chime: two bell notes; switch: two tones down-up; start: rising three-note arpeggio), dipping the music bus ~6 dB for 0.6 s; `previewCues()` plays all four spaced out
- [X] T017 [US2] In `src/player/useSessionSound.ts`, keep the previous state in a ref and call `playCue(cueFor(prev, state))` when `prefs.cues`; add tests in `src/player/PlayerScreen.test.tsx`: cues on → `playCue` on rate; cues off → never

**Checkpoint**: cues work with music on or off.

## Phase 5: User Story 3 - Song ideas for an Amazon Music playlist (P3), plus Sound settings

**Goal**: Profile Sound section and a Song ideas page.

**Independent test**: quickstart.md "By ear" steps 1, 8 and 9.

- [X] T018 [US3] `SoundSection` in `src/screens/profileSections.tsx` (added to `src/screens/Profile.tsx` after Figure style): heading "Sound"; rows "Music during sessions" and "Sound cues" with `Segmented` Off/On saving `sessionMusic` / `soundCues`; "Hear" buttons for Calm, Steady, Upbeat (`previewMood`) and cues (`previewCues`); the tip "If cues pause music you play from another app, turn cues off while you use your own playlist."; a link "Song ideas for your playlist" to `#/songs`
- [X] T019 [P] [US3] `Song { title; artist; mood; why }` and `SONGS` (10 per mood, real, widely available songs; Calm mostly instrumental) plus `amazonMusicUrl(song)` = `https://music.amazon.com/search/` + encoded "title artist" in `src/sound/songs.ts`
- [X] T020 [P] [US3] Tests in `src/sound/songs.test.ts`: "8–12 per mood, no empty fields, no duplicate title + artist"; URL starts with the Amazon Music search address and contains only the encoded title and artist
- [X] T021 [US3] Route `songs` in `src/app/router.ts` (parse + href), `TabBar` highlights Profile for it (`src/app/TabBar.tsx`), `Shell` renders `Songs`; screen `src/screens/Songs.tsx`: back link to Profile, one-line note (FR-014: FitMe can't add songs for you; tapping tells Amazon only which song), a section per mood with each song as a link (`target="_blank" rel="noopener noreferrer"`), title, artist and why; offline (`!navigator.onLine`) taps are prevented and show "Needs a connection" (role status)
- [X] T022 [P] [US3] Tests: `src/screens/Songs.test.tsx` (30 links with the right `href` and `rel`; offline tap shows the notice), `src/screens/Profile.test.tsx` (Sound section: turning Music on saves `{ sessionMusic: true }`, Cues off saves `{ soundCues: false }`); router test for `#/songs` if a router test exists

**Checkpoint**: all three stories work.

## Phase 6: Polish

- [X] T023 [P] Update AGENTS.md Layout with `src/sound/` (composer, cues, engine, songs)
- [X] T024 Run `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run build`, and `npx prettier --check` on changed files
- [X] T025 Walk through quickstart.md "By ear" in Chrome (emulators) at phone and tablet widths; check the engine actually produces sound (an `AnalyserNode` or recorded output) and nothing throws in the console
- [ ] T026 ⏸ Owner review on a preview channel (quickstart "Owner review"), then merge and deploy (owner's go-ahead)

## Dependencies

- Phase 2 before all stories; T005 before T010, T016.
- US1: T006–T009 in parallel → T010 → T011 → T012 → T013.
- US2 needs T011 (the hook): T014–T015 in parallel → T016 → T017.
- US3 needs T002 and T005 only (and T010/T016 for previews): T019–T020 in parallel with T018; T021 → T022.

## Parallel examples

- US1: T006 + T008 (+ their tests T007, T009) together.
- US2: T014 + T015 together while T010 is in progress.
- US3: T019 + T020 alongside US1.

## Implementation strategy

MVP is US1 (music from the player). US2 and US3 follow in the same branch and PR; the owner
reviews all three by ear on the preview channel before merge.
