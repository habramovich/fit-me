# Quickstart: Session Music and Sound Cues

## Automated

```powershell
npm.cmd test          # mood, composer, cues, songs, profile defaults, player + Profile + Songs UI
npm.cmd run lint
npm.cmd run build
```

## By ear, locally (emulators)

`npm run emulators`, then `npm run dev`; sign in as the seeded user, phone width.

1. Profile → Sound: Music is Off, Cues On. Tap **Hear** for Calm, Steady, Upbeat and the cues:
   each plays a few seconds and stops on its own.
2. Today → Calm morning → Start. No music. Tap the music button: music fades in within 2 s.
3. Pause: music stops. Resume: it comes back without restarting from the top.
4. Let a timed hold run out: three ticks, then a chime. A two-sided exercise: the switch tone,
   then the start tone for side 2. Rate it: the start tone for the next exercise.
5. Switch to another tab and back: music stopped while hidden, resumes on return (or shows
   "Tap to start sound"; one tap starts it).
6. Finish early on the last exercise: music fades out on the finish screen.
7. Cardio plan: music is Upbeat. Strength keeper: Steady. A saved set of mostly yoga: Calm.
8. Profile → Sound: Music is now On (set from the player). Turn Cues off; play again: no cues.
9. Profile → Song ideas: 10 songs per mood; tap one: Amazon Music search opens in a new tab.
   Offline (DevTools): tapping says it needs a connection.

## Owner review (preview channel, before merge)

`npx firebase hosting:channel:deploy music --expires 7d --project fit-me-today`

On the phone and the tablet:

- Listen to each mood for at least 5 minutes in a real session (SC-002).
- Play an Amazon Music playlist, open FitMe with music off and cues on, run a timed hold: the
  playlist keeps playing under the cues (FR-009). If it pauses, note the device and browser.
- Tap every song idea once (SC-006); note any that don't find the song.
- With the silent switch on (iPhone) nothing is heard and nothing breaks.
