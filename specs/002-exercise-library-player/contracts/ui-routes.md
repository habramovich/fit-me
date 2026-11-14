# Contract: Screens and routes

Look follows the reviewed prototype ("FitMe app prototype" canvas): `#F6F4EF` background,
`#2F6F5E` accent, Space Grotesk headings, Inter text, touch targets ≥ 44 px, bottom tab bar.

| Route | Screen | Notes |
|---|---|---|
| `#/today` (default) | Today | Sample session card: exercise count, estimated minutes, **Start**. Empty state if all marked Not for me. |
| `#/library` | Library | Search, technique and Favourites chips, card grid; marks on cards. |
| `#/library/<id>` | Exercise | Figure, dose, steps, areas, equipment, level, Easier / Standard / Harder, Favourite / Not for me, **Try it**. |
| `#/player?routine=sample` | Player | Full-screen, no tab bar. Figure, name, cues, reps/set or countdown, progress, controls; rating sheet; switch-side prompt; summary at the end. |
| `#/player?routine=single:<id>&v=<version>` | Player | Same, one exercise. |
| `#/schedule`, `#/progress` | Placeholder | "Coming soon". |
| `#/profile` | Profile | Name, email, Sign out. |
| `#/review` | Figure review | Dev and preview builds only; all figures by batch. |
