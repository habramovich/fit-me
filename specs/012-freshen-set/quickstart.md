# Quickstart: Freshen a saved set

## Prerequisites

- `npm ci`, then `npm run emulators` and `npm run dev` (PowerShell: `npm.cmd`).
- Sign in with the emulator test user and finish setup with the default profile.

## Automated checks

```powershell
npm.cmd test -- src/sets/freshen.test.ts src/screens/SetView.test.tsx
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Expected: everything passes. `freshen.test.ts` covers SC-002 to SC-005 on sample sets from every
routine and from hand-made sets ([research.md](research.md) R8).

## Manual checks (phone 390 px and tablet 820 px)

1. **US1 suggestions.** Plan a Calm morning, then Save as set. Open the set and tap **Try something
   new**.
   - Up to three cards appear. Each reads "Add X to <part>" or "Replace Y with X", with a reason.
   - Every suggested exercise is gentle and not already in the set.
   - Tap the figure on a card, then Back: the cards are still there.
2. **Accept and Undo.**
   - Tap **Add** on an Add card. The exercise appears at the end of that part and the minutes
     update. Tap **Undo**: the set is as before and the card is back.
   - Accept a Replace. The new exercise is in the old one's place, with a similar time.
   - Reload on a second device: the accepted changes are there.
3. **Skip.** Skip a card. It goes, and that exercise doesn't come back until you leave the set.
4. **US2 Another idea.** Tap **Another idea** several times. The same change shows a different
   exercise each time, then cycles back to the first.
5. **Character.**
   - In a Desk break set, every suggestion is standing or seated and needs nothing beyond a chair
     or a wall.
   - In a Cardio set, Main suggestions are cardio only.
   - In a hand-made set of gentle moves only, no moderate exercise is suggested.
6. **Profile rules.** Mark one suggested exercise Not for me on its page and come back: that card
   is gone. With an area set to Go easy, its exercises are suggested in their easier version.
7. **Repair.** Mark an exercise in the set Not for me. Its replacement is the first card, and the
   reason says why.
8. **US3 review.** The review above the cards lists the areas worked, up to three missing, the
   part times with short or long, and the technique counts. It updates after an accept.
9. **Offline.** Turn the network off. Open the set, accept a suggestion, then turn the network
   back on: the change syncs.
