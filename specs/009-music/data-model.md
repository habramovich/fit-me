# Data Model: Session Music and Sound Cues

## Stored: profile fields (`users/{uid}.profile`)

| Field | Type | Default | Notes |
|---|---|---|---|
| `sessionMusic` | boolean | `false` | Music on in the player. Set from Profile or the player's music button. |
| `soundCues` | boolean | `true` | Cues on in the player. Set from Profile. |

`withDefaults` turns a missing or non-boolean value into the default. Both fields are additive with
defaults, so `PROFILE_SCHEMA_VERSION` stays 1 and `firestore.rules` is unchanged (the profile is
already "any map"). Writes are merge writes of the changed field only.

## Not stored

### Mood

`'calm' | 'steady' | 'upbeat'`, worked out when the player opens (`moodFor`):

- `plan:<routine>`: calm, weekend → `calm`; desk, strength → `steady`; cardio → `upbeat`.
- anything else (`set:<id>`, `single:<id>`, `sample`): the most common mood of the items'
  techniques (cardio → `upbeat`; strength → `steady`; yoga, taichi, mobility → `calm`); ties go to
  the calmer mood; no items → `calm`.

### Note event (composer output)

`{ beat: number; voice: Voice; midi: number; beats: number; velocity: number }`, one bar at a time.
`voice` is one of `pad`, `bell`, `pluck`, `bass`, `kick`, `shaker`. `beat` is within the bar
(0 ≤ beat < 4), `velocity` in (0, 1]. Pitched voices use notes of the mood's scale; `kick` and
`shaker` ignore `midi`.

### Cue

`'tick' | 'chime' | 'switch' | 'start'`, from `cueFor(prev, next)` (research R6).

### Song idea (fixed content, `src/sound/songs.ts`)

`{ title: string; artist: string; mood: Mood; why: string }`. Validation (tested): 8–12 per mood,
no empty fields, no duplicate title + artist.
