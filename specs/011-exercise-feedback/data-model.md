# Data model: Exercise feedback round

Every change is additive. Older stored data reads with defaults, so schema versions stay as they
are (profile 1, set 1).

## Technique (static library, `src/exercises/types.ts`)

```text
Technique = 'yoga' | 'taichi' | 'strength' | 'mobility' | 'stretching' | 'cardio'
TECHNIQUES order: yoga, taichi, strength, mobility, stretching, cardio
TECHNIQUE_LABEL.stretching = 'Stretching'
```

Moved to `stretching`: calf-stretch, cross-body-shoulder-stretch, hamstring-stretch,
neck-side-stretch, seated-spinal-twist, side-lunge-stretch, standing-side-stretch,
standing-thigh-stretch, upper-back-hug.

New in batch 7: `superman` (strength), `standing-torso-twist` (mobility).

`ClassType = Technique | 'other'` gains `stretching` automatically. Stored classes keep their type.

## Profile (`users/{uid}.profile`)

| Field | Type | Default | Read rule |
|---|---|---|---|
| `techniques.stretching` | `'none' \| 'some' \| 'lots'` | `'some'` | missing → stored `techniques.mobility`, else `'some'` |
| `showPoses` | boolean | `false` | not a boolean → `false` |

Saving: Profile's technique control already saves the whole `techniques` map, so the first change
stores `stretching`. The pose toggle saves `{ showPoses }` only.

## Saved set item (`users/{uid}/sets/{id}.items[]`, unchanged shape)

```text
SetItem { exerciseId, version, phase, dose: RepsDose | TimeDose }
```

The person can now change `dose`:

| Dose | Field | Min | Max | Step |
|---|---|---|---|---|
| reps | `reps` | 1 | 50 | 1 |
| reps | `sets` | 1 | 5 | 1 |
| time | `seconds` | 10 | 600 | 5 |

`range`, `perSide` and `repsNote` are kept from the library dose and are never edited. A value
outside `range` is allowed; the UI emphasises the hint. Saves write `items` and `updatedAt` only.
The rules are unchanged (`items` is a list of at most 40).

## Player state (pure machine, in memory)

```text
PlayerPhase = 'getReady' | 'doing' | 'switchSide' | 'rating' | 'finished'
PlayerEvent += { type: 'startNow' }
GET_READY_SECONDS = 5
```

Transitions added:

| From | Event | To |
|---|---|---|
| (goTo a timed item) | | `getReady`, remaining 5 |
| (goTo a reps item) | | `doing` (unchanged) |
| `getReady` | tick, remaining > 1 | `getReady`, remaining − 1 |
| `getReady` | tick, remaining ≤ 1 | `doing`, remaining = dose seconds |
| `getReady` | startNow | `doing`, remaining = dose seconds |
| `getReady` | pause / hidden | paused (no countdown) |
| `getReady` | skip / back | as from `doing` |

Cues: entering `getReady` → `switch`; any change into `doing` from another phase or exercise →
`start`.
