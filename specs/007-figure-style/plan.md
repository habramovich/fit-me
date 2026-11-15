# Implementation Plan: Figure Style Preference

**Branch**: `007-figure-style` | **Date**: 2026-11-15 | **Spec**: [spec.md](spec.md)

## Summary

`<Figure>` gains a second body renderer, Doodle (outlined head with a face, outlined shirt along the
spine curve, single-line limbs, loops for hands and feet), next to the unchanged Classic one. The
arrows, rings, props, mat, breath chip and caption stay shared. The person's choice is a new profile
field, `figureStyle`, saved like the other Profile settings and handed to every figure through a
React context provided by the shell. Face direction is guessed from how the joints bend, with an
optional per-figure `nose` override for the figures where the guess is wrong.

## Technical Context

**Language/Version**: TypeScript 7 (strict), React 19

**Primary Dependencies**: none new (Vite 8, Firebase 13 as before)

**Storage**: `users/{uid}.profile.figureStyle` in Firestore (offline cache); no new collection

**Testing**: Vitest + React Testing Library; figure review renders (`npm run render:figures`)

**Target Platform**: mobile and tablet browsers (PWA)

**Project Type**: single-page web app

**Performance Goals**: figure animation stays at the display frame rate on a mid-range phone; the
Doodle body has fewer, simpler shapes than Classic

**Constraints**: Classic markup byte-identical to before (SC-003); works offline

**Scale/Scope**: 41 exercises, up to 3 versions each; 6 screens draw figures

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. Spec Before Code | Pass | spec.md + checklist. The prototype was exploratory and is folded in under this plan. |
| II. Smallest Useful Slice | Pass | US1 + US2 together are the usable slice (a choice whose faces are right); US3 refines thumbnails. |
| III. Simplicity / YAGNI | Pass | No dependency; one context, one profile field, one optional exercise-data field. |
| IV. Test What Matters | Pass | Face/outline geometry and profile defaults are unit-tested; one component test for the Profile choice; faces checked in review renders. |
| V. Private & Synced | Pass | Stored in the person's own profile; rules unchanged (profile is already "any map"); additive field with a default, so schema version stays 1. |

Re-checked after design: still passes; nothing for Complexity Tracking.

## Design

See [research.md](research.md) for the reasoning behind each decision.

- **Profile** (`src/profile/types.ts`): `figureStyle: FigureStyle` (`'classic' | 'doodle'`),
  default `'classic'`; `withDefaults` turns a missing or unknown value into `'classic'`.
  See [data-model.md](data-model.md).
- **Style context** (`src/figure/style.ts`): `FigureStyleContext` (default `'classic'`) and
  `useFigureStyle()`. `Shell` wraps its screens in the provider with `profile.figureStyle`.
- **Figure** (`src/figure/Figure.tsx`): optional `figureStyle` prop overrides the context (Profile
  previews, render tool). The shared frame (mat, props, ring, arrows, breath, caption) is drawn
  once; the body comes from `ClassicBody` (today's markup, moved as is) or `DoodleBody` (the
  prototype). The `<figure>` gets `fm-figure--doodle` in Doodle.
- **Geometry** (`src/figure/geometry.ts`): `sideFacing`, `face`, `collar`, `torsoOutline`,
  `limbPath`, `HEAD_R` from the prototype; `facingFor(spec)` applies `spec.nose` when present.
- **Exercise data**: `FigureSpec.nose?: 'left' | 'right' | 'up' | 'down'`, where the nose points in
  keyframe 0, only where the guess is wrong (wall push-up, figure four; any others found in review).
- **Contact with mat and chair**: in Doodle the shirt is as wide as the head (side half-width 12–13)
  so lying figures rest on the mat, and the chair/seat props are drawn a few units higher so seated
  doodles sit on them. Checked in renders.
- **Profile UI** (`src/screens/profileSections.tsx`): `FigureStyleSection`, two radio cards each
  with a thumbnail of the same pose in that style; saves `{ figureStyle }` on change.
- **Render tool** (`tools/render-figures.test.tsx`): `STYLE=doodle` renders Doodle to
  `figure-renders/<id>-doodle.png`; the rasterizer also strokes circles and closed paths.
  AGENTS.md step 4 mentions checking both styles.
- **Throwaway**: `preview.html` and `tools/preview.tsx` from the prototype are deleted before merge.

## Project Structure

### Documentation (this feature)

```text
specs/007-figure-style/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks
```

No `contracts/`: the feature adds no interface to other systems; the only stored shape is in
data-model.md.

### Source Code

```text
src/
├── figure/
│   ├── Figure.tsx          # shared frame + ClassicBody / DoodleBody
│   ├── Figure.css          # doodle tweaks if needed
│   ├── Figure.test.tsx     # new: style switching
│   ├── geometry.ts         # doodle geometry + facingFor
│   ├── geometry.test.ts    # doodle geometry tests
│   └── style.ts            # new: FigureStyle context
├── exercises/
│   ├── types.ts            # FigureSpec.nose
│   └── data/wall-push-up.ts, figure-four.ts (+ any found in review)
├── profile/types.ts        # figureStyle + default
├── app/Shell.tsx           # provider
├── screens/profileSections.tsx, Profile.tsx
└── index.css               # --figure-paper
tools/render-figures.test.tsx
AGENTS.md
```

**Structure Decision**: existing single-project layout; one new module in `src/figure/`.
