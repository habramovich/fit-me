# Research: Exercise Library and Session Player

## R1. Exercise content format

- **Decision**: One typed TypeScript module per exercise in `src/exercises/data/`, collected by
  `src/exercises/index.ts`. Each holds metadata, versions, how-to steps and the figure (keyframes
  and motion arrows). A unit test validates every exercise against the model in
  [data-model.md](data-model.md).
- **Rationale**: Static content shipped with the app works offline, costs no reads, is reviewed in
  pull requests, and the compiler catches missing fields. One file per exercise keeps batch
  reviews small.
- **Alternatives**: Firestore collection (rejected: constitution keeps the library static; needs
  an admin path); one large JSON file (rejected: no type checking, noisy diffs).

## R2. Image source and figure style

- **Decision**: All illustrations are drawn by us as jointed "volume" line figures; no third-party
  images.
- **Research** (2026-11-14):
  - `yuhonas/free-exercise-db`: public domain (Unlicense), 876 exercises with 2 photos each;
    covers 6 of the 8 favourites, none of tai chi, little yoga. Mixed photo styles.
  - ExerciseDB: GIFs, but its terms forbid storing media and tie the licence to an active
    subscription. Unusable for an offline app.
  - `hasaneyldrm/exercises-dataset`: GIF media © Gym visual; reuse rights unclear.
  - Workout Labs: consistent paid illustrations (setup fee plus monthly, per its listing); no
    tai chi.
- **Rationale**: The owner chose one consistent drawn style, asked for more realism than stick
  figures, and asked for arrows showing direction. Tai chi needs drawn figures anyway.
- **Approved prototype**: "Figure style test (v2)" artboard on the design canvas.

## R3. Figure renderer

- **Decision**: A React SVG component, `<Figure>`, driven by keyframes of joint coordinates
  (head, shoulder, hip, optional spine-bend control, and per side elbow, wrist, knee, ankle,
  toe). Limbs are round-capped strokes of realistic thickness (thigh 17, shin 12, upper arm 11,
  forearm 9, torso 30 in a 250 × 180 view box); far side drawn lighter and behind; spine is a
  quadratic curve. Animation runs on `requestAnimationFrame`: hold, smoothstep ease, hold, ease
  back (ping-pong), with more than two keyframes allowed (e.g. hip circles). Motion arrows are
  dotted quadratic arcs with a computed arrowhead, pointing along the current or next movement,
  dimmed during holds.
- **Front view**: the same joint model with a `view: 'front'` flag that draws both sides
  symmetrically (left and right instead of near and far), for hip circles and shoulder
  rotations.
- **Pure functions** (unit-tested): `interpolatePose(keyframes, t)`, `easeCycle(t, timing)`,
  `arrowGeometry(arrow, direction)`.
- **Reduced motion**: when `prefers-reduced-motion: reduce`, show keyframe 1, step to the next
  pose every 2.5 s without tweening, arrows kept (FR-026).
- **Pause**: the component takes a `playing` prop; the player pauses it with the session.
- **Alternatives**: CSS keyframe crossfade of fixed drawings (prototype v1; rejected: no real
  motion); Lottie (rejected: new dependency and an authoring tool); canvas (rejected: SVG is
  crisper, accessible, simpler).

## R4. Figure review for batches

- **Decision**: A review screen at `#/review` listing every figure animating side by side with
  name, dose and cues, plus a "batch" filter. Shown only in development builds and preview
  channel deploys, not in production navigation.
- **Rationale**: FR-008 requires the owner to approve each batch. A Firebase Hosting preview
  channel (`firebase hosting:channel:deploy batch-N`) gives the owner a link on their phone
  without touching production.

## R5. Player logic

- **Decision**: A pure reducer `src/player/machine.ts`, like `src/auth/session.ts`. State: item
  index, set, side, remaining seconds, paused, phase (`doing`, `switchSide`, `rating`,
  `finished`), outcomes. Events: tick, setDone, finishEarly, pause, resume, back, skip, rate,
  visibilityHidden. A hook drives `tick` once per second from wall-clock time (so a background
  throttled timer doesn't drift).
- **Rationale**: Constitution IV: domain logic unit-tested; every acceptance scenario in US1 maps
  to reducer tests.

## R6. Keeping the screen awake

- **Decision**: Screen Wake Lock API (`navigator.wakeLock.request('screen')`) while the player is
  open; re-request on `visibilitychange` when visible; release on close. If unsupported or
  refused, show a one-line hint (edge case in spec).
- **Note**: Supported in current Chrome, Edge and Safari; on iPhone, older iOS versions did not
  honour it in home-screen web apps. SC-005 is verified on the owner's actual devices.

## R7. Offline app shell

- **Decision**: `vite-plugin-pwa` 2.0 (peer range includes Vite 8) with `generateSW`, precaching
  the built app; `registerType: 'autoUpdate'`. Web app manifest (name FitMe, theme `#2F6F5E`,
  icons) so it can be added to the home screen. Firestore's persistent cache (from 001) covers
  data.
- **Cache headers**: the service worker file `sw.js` and `manifest.webmanifest` get
  `Cache-Control: no-cache` in `firebase.json`, so updates reach people (extends 001 FR-013).
- **Alternatives**: hand-written service worker (rejected: easy to get update logic wrong).

## R8. Navigation

- **Decision**: Hand-rolled hash routing (`#/today`, `#/library`, `#/library/<id>`,
  `#/player?routine=sample|<id>`, `#/schedule`, `#/progress`, `#/profile`, `#/review`) in
  `src/app/router.ts`: about 40 lines, a `useRoute()` hook over `hashchange`.
- **Rationale**: Constitution III (no router library until needed); hash routes work with the
  existing SPA rewrite and the service worker without extra config. Back button and deep links
  work.

## R9. Saving marks and sessions

- **Decision**: `users/{uid}/exerciseMarks/{exerciseId}` with `{ mark, updatedAt }`; clearing a
  mark deletes the document. `users/{uid}/sessions/{sessionId}` created at start, updated with
  only the changed fields as items complete (`items` array rewritten, `endedAt` set at the end).
  Writes are not awaited, so they queue offline (FR-021).
- **Rules**: owner-only and invited (reuse `isInvited()`), plus light shape checks: `mark` is one
  of two values; session `items` is a list with at most 50 entries. Delete allowed for marks only.
- **Rationale**: 001's access pattern; each new subcollection gets its own rules block and rules
  test rows (AGENTS.md lesson).
