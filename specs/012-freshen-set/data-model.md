# Data model: Freshen a saved set

No stored shape changes. Sets keep `SET_SCHEMA_VERSION = 1` and `users/{uid}/sets/{id}` is
unchanged, so rules and rules tests stay as they are. An accepted suggestion is an ordinary
`saveItems` call that writes only `items` and `updatedAt`.

The types below are in-memory only and live in `src/sets/freshen.ts`.

## Character

```ts
interface Character {
  routine: RoutineDef            // a real routine, or the hand-made definition (research R2)
  handMade: boolean
  maxIntensity: Intensity | null // hand-made cap; null for plan sets
}
```

`characterOf(set: SavedSet, profile: Profile): Character`

## Suggestion

```ts
type Change =
  | { kind: 'add'; phase: Phase }
  | { kind: 'replace'; target: { exerciseId: string; phase: Phase }; repair: boolean }

interface Suggestion {
  /** Stable key for the list: `${kind}:${phase}` or `replace:${exerciseId}:${phase}`. */
  key: string
  change: Change
  item: SetItem           // the exercise, version, part and dose to put in
  reason: string
  /** Gap area named in the reason, if any: two suggestions never share one. */
  gap: BodyArea | null
  /** Exercises already shown for this change (Another idea, research R6). */
  passed: string[]
  /** Whether Another idea has a different candidate. */
  hasAnother: boolean
}
```

Validation:

- `item.exerciseId` is not in the set.
- For a replace, `target` matches an item in the set and `item.phase === target.phase`.
- For an add, the set has fewer than `MAX_SET_ITEMS` items.

## Inputs

```ts
interface FreshenInput {
  set: SavedSet
  library: readonly Exercise[]
  profile: Profile
  marks: Marks
  today: string                 // YYYY-MM-DD, part of the seed
  skipped: readonly string[]    // exercise ids skipped on this visit
}
```

## Functions (pure, tested)

| Function | Returns |
|---|---|
| `suggest(input)` | up to 3 `Suggestion`s (research R5) |
| `anotherIdea(input, list, key)` | the list with that suggestion's exercise replaced (research R6) |
| `applySuggestion(items, s)` | new `SetItem[]`, or `items` unchanged if the target is gone or the set is full |
| `revalidate(input, list)` | the list without suggestions that no longer apply (research R7) |
| `reviewSet(set, library, profile)` | a `SetReview` |

## SetReview (US3)

```ts
interface SetReview {
  worked: BodyArea[]                    // most-worked first
  missing: BodyArea[]                   // up to 3, by weight (focus, routine, other)
  parts: { phase: Phase; seconds: number; flag: 'short' | 'long' | null }[]
  techniques: [Technique, number][]     // most first, only those present
}
```

A part is `short` when its share of the set's time is below 0.6 × its usual share, and `long` when
it is above 1.5 ×. A set under 3 minutes gets no flags.

## Screen state (SetView / FreshenPanel)

| State | Lifetime |
|---|---|
| `open: boolean` | until the panel is closed or the owner leaves the set |
| `list: Suggestion[]` | revalidated after every change to `set.items` |
| `skipped: string[]` | until the owner leaves the set |
| `undo: { before: SetItem[]; after: SetItem[]; list: Suggestion[]; text: string } \| null` | shown while `set.items` equals `after`; cleared by any other change |
