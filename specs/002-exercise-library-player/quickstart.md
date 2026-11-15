# Quickstart: Exercise Library and Session Player

## Automated

```bash
npm run lint && npm run format:check
npm test            # exercise content validation, figure math, player machine, screens
npm run test:rules  # 001 rows + contracts/firestore-access.md rows 17–28
npm run build
```

## Batch review (owner)

1. `npx firebase hosting:channel:deploy batch-1 --expires 7d --project fit-me-today`
2. Open the printed preview URL + `#/review` on a phone. Each figure animates with arrows, name,
   dose and cues. Approve or comment per exercise.

## Manual, against the emulators

1. `npm run emulators` and `npm run dev`; sign in as `invited@example.com`.
2. Today → Start. Use Pause, Back, Skip, Set done, Finish early; rate each item. At the end the
   summary shows done / skipped / rated counts. Emulator UI shows `users/<uid>/sessions/<id>`.
3. Library: search "hips", filter Yoga, open Bird dog, switch versions, mark Favourite; Favourites
   filter shows it. Mark Glute bridge Not for me; Today's sample count drops by one.
4. Dev tools → Rendering → `prefers-reduced-motion: reduce`: figures step between poses, arrows
   remain.
5. Dev tools → Network offline after load: reload works; a session runs; ratings sync on
   reconnect.

## On devices (after deploy)

- Phone and tablet, portrait and landscape: a full sample session with the screen staying on
  (SC-005).
