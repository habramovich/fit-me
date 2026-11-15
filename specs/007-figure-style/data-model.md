# Data Model: Figure Style Preference

## Profile (stored at `users/{uid}.profile`), one new field

| Field | Type | Default | Notes |
|---|---|---|---|
| `figureStyle` | `'classic' \| 'doodle'` | `'classic'` | Missing or any other value reads as `'classic'`. Written alone by a merge write. |

- No schema-version bump: the field is additive and has a default (`PROFILE_SCHEMA_VERSION` stays 1).
- Rules unchanged: `profile` must already be a map; no per-field validation exists for profile.

## Exercise content (static, in the repo), one new optional field

`FigureSpec.nose?: 'left' | 'right' | 'up' | 'down'`

- Side view only: where the Doodle's nose points in keyframe 0. The face then turns with the head
  through the other keyframes.
- Omitted for most figures: the direction is guessed from how the joints bend.
- Ignored in front view (the face looks out of the screen) and by Classic.
