# Research: Figure Style Preference

## R1. Drawing the doodle: restyle the SVG figure, not generated images

- **Decision**: draw the doodle from the same keyframes with SVG, in `<Figure>`.
- **Rationale**: it keeps the animation, arrows, breath cues and per-version poses for all 41
  exercises at no per-exercise cost, works offline, and needs no image service.
- **Alternatives**: generated illustrations (owner's first idea): no image tool is available here,
  a character can't be kept identical across keyframes for animation, and it would need hundreds of
  images reviewed by hand.

## R2. Where the choice lives

- **Decision**: `profile.figureStyle`, saved with `saveProfile` (merge write of one field).
- **Rationale**: the spec wants it per person and on every device; the profile is already synced,
  cached offline and covered by rules. A merge write of one field follows the "update only the
  fields that changed" lesson.
- **Alternatives**: localStorage (per device, fails FR-004); a new settings document (needs a new
  rules block and test row for no gain).

## R3. Getting the style to every figure

- **Decision**: a React context with default `'classic'`, provided in `Shell` from the profile, plus
  an optional `figureStyle` prop on `<Figure>`.
- **Rationale**: figures are drawn in six screens, some deep in lists; threading a prop through all
  of them is noisy. The prop is needed for Profile's side-by-side previews and the render tool. The
  default keeps tests and screens outside the shell on Classic.
- **Alternatives**: prop drilling (many touch points); a global store (constitution forbids
  state-management libraries without need).

## R4. Keeping Classic unchanged

- **Decision**: move today's body markup into `ClassicBody` unchanged and keep the old CSS
  variables. Verify by rendering every figure's static markup (each keyframe, full size and
  thumbnail) on `main` and on the branch and comparing them.
- **Rationale**: SC-003 says Classic must look exactly as before; comparing markup is exact and
  cheaper than comparing pixels.

## R5. Which way the face looks

- **Decision**: guess from how the joints bend over all keyframes (knees fold one way; ankles and
  elbows the other), and let a figure override it with `nose: 'left' | 'right' | 'up' | 'down'`,
  the direction the nose points in keyframe 0.
- **Rationale**: the guess was right for 39 of 41 exercises in the prototype. The two misses are
  figures with unusual joints (feet drawn pointing back in wall push-up; crossed legs in figure
  four). A plain direction ("up") is easy to write and to check in a render; a facing flag would
  be confusing for lying figures, where "facing left" means the nose points down.
- **Alternatives**: a facing value on every figure (41 edits, easy to get wrong for lying poses);
  tuning the guess (fragile, and the next unusual pose would break it silently).

## R6. Resting on the mat and chair

- **Decision**: make the doodle shirt about as wide as the head (side-view half-width ≈ 12–13, as in
  the owner's reference sheet), and in Doodle draw the chair seat a few units higher, since a thin
  line has no thickness to reach it.
- **Rationale**: the classic body is 30 units thick, so poses were placed for it; the thin doodle
  floats ~5 units above the mat when lying and ~7 above a seat. Widening the shirt also matches the
  reference. Moving the seat keeps exercise data unchanged.
- **Check**: lying, seated and kneeling exercises in the Doodle renders.

## R7. Small sizes

- **Decision**: in thumbnails, line width 4.6 (vs 2.5), solid hands and feet, slightly larger
  eyes.
- **Rationale**: at 56–72 px wide the full-size line is under 1 px and the hand loops vanish.
