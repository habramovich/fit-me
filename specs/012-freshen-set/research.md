# Research: Freshen a saved set

All decisions are made here; nothing in the Technical Context is left open.

## R1. Reuse the planner's rules, not its scoring

**Decision**: A new pure module `src/sets/freshen.ts` makes the suggestions. It reuses the
planner's eligibility (Not for me, techniques set to None, avoided areas, intensity for the
routine, version choice with go-easy, level, low-impact cardio and equipment) and its dose scaling.
To do that, `src/planner/plan.ts` exports helpers it already has: `eligible`, `fitsPhase`,
`scaleDose`, `unfit` and the unfit texts. Freshen gets its own balance score (R4).

**Rationale**: The rules in FR-003 must match planned sessions exactly, and they live in
`plan.ts` and are tested there. The planner's score depends on history, "new for you" counts and
per-plan jitter, so it answers a different question ("what makes a good session today") from
freshen's ("what improves this set").

**Alternatives considered**: Calling `swapItem` on the set's items treated as a kept plan. Rejected:
it can't add an item, ignores what the set already covers, and its reasons ("New for you") don't
explain the balance. A separate `src/planner/eligibility.ts`: a cleaner home, but it moves code
other features depend on for no change in behaviour. Exporting is the smaller step.

## R2. The set's character

**Decision**: `characterOf(set)` reads the set's `source`:

- `plan:<routine>` for a known routine: that routine's `RoutineDef`, unchanged. This covers
  intensities (with the planner's vigorous-for-Advanced exception), positions, equipment, shares,
  technique and area boosts, and Cardio's cardio-only Main.
- `manual`, an unknown routine or anything else: a hand-made definition with shares 20/60/20, no
  position or equipment limits beyond the profile, no boosts, and intensities up to the most intense
  available item in the set (`gentle` → gentle only; `moderate` → gentle and moderate;
  `vigorous` → all). An empty hand-made set allows gentle and moderate, plus vigorous for Advanced.
  Unlike the planner, the intensity cap for a hand-made set has no Advanced exception (FR-006).

**Rationale**: A set saved from a plan already has a clear character, so the same rules a plan of
that routine uses give FR-004's "routine character" for free. A hand-made set has no routine, and
its contents are the best evidence of what the owner wants from it.

**Alternatives considered**: Asking the owner to pick a routine for a hand-made set. Rejected as an
extra step the spec didn't ask for.

## R3. Which parts an exercise can go in

**Decision**: A candidate fits a part by the planner's `fitsPhase`: the owner's "I like this as"
parts when set, otherwise the exercise's own `phases`, and Cardio's Main rule. If no candidate fits
a part strictly, the relaxed rule (any of the exercise's parts) is tried for that part, as the
planner does when it borrows.

## R4. The balance score

The score is worked out for one candidate in one part, against the set as it would be with the
replaced item taken out. Every input is from the set, profile, marks and character, so the result
is deterministic.

**Area weights.** Focus areas weigh 3, the routine's `areaBoost` areas weigh 2, and other areas
weigh 1. `heart` counts only for the Cardio routine or when it is a focus area. Avoided areas are
never targets (candidates that load them are ineligible anyway).

**Coverage.** `count[a]` is the number of distinct available exercises in the set that work area
`a`. A *gap* is an area with weight > 0 and `count = 0`.

The score adds these together:

| Term | Value |
|---|---|
| Base | 1 |
| Fills gaps | + weight of each gap area the candidate works, at most 6 in total |
| Piles on | − 0.4 × (count − 1) for each worked area already at count ≥ 2 |
| Technique wanted | + 1 if the profile says Lots and that technique is below its fair share (1 / number of techniques not set to None) of the set's items |
| Technique crowded | − 1.5 if that technique already makes up more than half the set's items |
| Routine | + the routine's `techniqueBoost` for the technique |
| Part pick | + 1.5 if the candidate's "I like this as" parts include this part |
| Favourite | + 1 |
| Jitter | + up to 0.3, seeded by `setId|today` (FR-012: stable for the day, different tomorrow) |

Ties are broken by exercise id.

**The reason** is the largest contributing term, in the planner's reason style:

| Term | Example reason |
|---|---|
| Gap | "Works the upper back, which the set doesn't" (focus areas say "your focus: upper back") |
| Short part (Add) | "The cool-down is short for this set" |
| Technique | "Adds strength, which you like; the set has little" |
| Part pick | "Your cool-down pick" |
| Favourite | "Favourite" |
| Fallback | "Something new for <part>" |

A Replace's reason starts with why the item goes: "The hips are worked three times already;
Figure four keeps the hips and adds the glutes".

**Rationale**: Each term matches one of the owner's four balance meanings. The weights follow the
planner's scale (focus 1.5 per area, favourite 1.5), so suggestions feel similar to plans. The
exact numbers get tuned by the tests in R8 and by looking at real sets.

## R5. Picking up to three suggestions

1. **Repairs first.** Each item that `unfit` rejects (removed, Not for me, no longer fits the
   profile) becomes a Replace with the best candidate for its part, preferring candidates that
   work its areas. The reason gives the unfit text. These count toward the three.
2. **Candidate changes.**
   - For an Add (only when the set has fewer than 40 items): each part gets a *deficit* of usual
     share × set time − part time. An empty set uses its usual shares of 10 minutes. Each part's
     best candidate becomes an Add, with a bonus of + 1.5 when the part is below 85% of its share.
     The short-part reason applies when that bonus is the largest term.
   - For a Replace: a *removable* item is available, not a favourite, and either every area it
     works has count ≥ 2, or the replacement works the areas that would be lost (FR-005). Its
     *weakness* is the sum of (count − 1) over its areas, + 1.5 if its technique is crowded, and
     − 1.5 if it is one of the owner's part picks for that part. The two weakest removable items
     each get their best replacement. A Replace's gain is the candidate's score minus the item's
     own score in the same set.
3. **Greedy choice**, best gain first, under these limits:
   - no two suggestions share an exercise or a replaced item;
   - no two fill the same primary gap (the gap area named in the reason);
   - when both kinds exist, the three include at least one Add and one Replace;
   - a change whose gain is ≤ 0 is dropped (edge case "never pad").
4. **Nothing left**: an empty list, and the panel says "Nothing new fits this set right now".

## R6. Another idea

**Decision**: Each suggestion keeps a `passed` list (as kept plans do in spec 006). Another idea
takes the next best candidate for the same change. It excludes `passed`, the exercises in the other
suggestions on screen and the skipped exercises. When none is left, `passed` resets to the current
exercise. The button shows only when at least one other candidate exists.

## R7. Accepting, Undo, Skip and keeping suggestions valid

**Apply.** An Add uses `addItem` (end of part) with the version's recommended `dose`. A Replace
puts the new item in the target's index and part. The dose is
`scaleDose(v.dose, targetSeconds / estimateSeconds(v), part === 'main')`, where `targetSeconds` is
the target item's time with its own dose. If the target exercise is gone from the library, its
time isn't known, so the new item uses the version's recommended dose.

**Targets** are identified by `{ exerciseId, phase }` and located again in the current items,
because an Add earlier in the list shifts indexes. With the same exercise twice in one part, the
first match is used.

**Revalidation** runs after any change to the set (an accept, Undo, or ordinary editing).
`revalidate(set, suggestions)` drops a suggestion when:

- its exercise is now in the set;
- its Replace target is gone;
- its Add can't fit (40 items);
- its primary gap is now filled;
- or its exercise no longer passes FR-003, because the marks or profile changed (e.g. it was just
  marked Not for me on its page).

The others stay as they are (FR-011).

**Undo** is screen state: `{ before, after }`. It shows while the set's items still equal `after`.
Undo saves `before` and restores the cards as they were before the accept, including any that
the accept made obsolete. Leaving the set
discards it.

**Skip** adds the exercise to a skipped list in screen state, so it is forgotten on leaving.

**Rationale**: Suggestions aren't stored (spec Assumptions). Unlike plans (AGENTS.md lesson), a
suggestion the owner has seen and not accepted has no lasting effect, so working it out again is
safe. FR-012's seed keeps it the same within the day.

## R8. Testing

`src/sets/freshen.test.ts`:

- **Sample sets** come from `makePlan` for every routine, at several lengths and dates, with the
  default profile and with a restrictive one (Advanced, an avoided area, no band, a go-easy area,
  a technique set to None). There are also hand-made sets: gentle-only, moderate, and empty.
- **Rules (SC-002)**: every suggestion is outside the set, eligible under the profile and marks,
  fits the character (including the hand-made intensity cap), and uses an allowed part.
- **Areas (SC-003)**: applying any non-repair suggestion never reduces the number of areas worked.
- **Time (SC-004)**: a Replace stays within 60 s of the target's time unless the candidate's range
  bound is hit.
- **Gap (SC-005)**: a Calm set with no upper-back work gets an upper-back suggestion in its first
  list.
- **Repairs**: these come first. Favourites are never replaced. A full set gets no Add and an
  empty set gets no Replace. Results are deterministic for the same day.
- **Another idea**: it cycles without repeats and avoids the exercises on screen.
- **Revalidation** cases.
- **Review (US3)**: counts, short and long flags.

`src/screens/SetView.test.tsx` covers opening the panel, Add/Replace calling `saveItems` with the
expected items, Undo restoring them, Skip, and the button waiting for the profile.
