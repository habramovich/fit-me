# Quickstart: Figure Style Preference

## Automated

```powershell
npm.cmd test          # geometry, profile defaults, Figure style switching, Profile choice
npm.cmd run lint
npm.cmd run build
```

## Classic unchanged (SC-003)

Render every figure's static markup (each keyframe with `still`, full size and thumbnail, Classic)
on `main` and on this branch and compare: they must be identical.

## Faces and contact (SC-002, US2, R6)

```powershell
$env:STYLE = 'doodle'; npm.cmd run render:figures
```

Open each `figure-renders/<id>-doodle.png` (one row per version, one column per key pose) and
check:

- The face looks the way the person would: toward the wall (wall push-up), up when lying on the back
  (glute bridge, figure four, dead bug, supine twist), down on all fours and face down.
- Lying figures rest on the mat and seated figures on the chair.

## In the app (US1, US3)

With the emulators and dev server running (`npm run emulators`, `npm run dev`), signed in:

1. Before choosing anything, Library and the player show Classic.
2. Profile → Figure style shows Classic and Doodle previews; pick Doodle.
3. Library, an exercise page, the player, a plan and a saved set all show Doodle and still animate
   with arrows and breath cues. Pick Classic again: all back to Classic.
4. Open the app in a second browser profile signed in as the same person: it shows the saved style.
5. DevTools offline: change the style; it applies at once.
6. Check phone (390 px) and tablet (820 px) widths: thumbnails in sets and plans are readable.
