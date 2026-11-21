# Data Model: Schedule

All under `users/{uid}`; owner-only (Principle V). Rules: [contracts/firestore-access.md](contracts/firestore-access.md).

## Schedule item: `users/{uid}/schedule/{itemId}` (new)

Random id. One document per class or planned home session (research R1).

| Field | Type | Notes |
|---|---|---|
| `schemaVersion` | number | `1` |
| `kind` | `'class'` \| `'home'` | |
| `days` | number[] | ISO weekdays, `1` Monday … `7` Sunday; 1–7 entries, no repeats, sorted |
| `start` | string | `"HH:MM"`, 24-hour local time |
| `minutes` | number | class 5–240 (start + minutes ≤ 24:00); home 5–90 |
| `name` | string | class only: 1–40 characters, trimmed |
| `type` | `'yoga'` \| `'taichi'` \| `'strength'` \| `'mobility'` \| `'cardio'` \| `'other'` | class only |
| `routine` | `'calm'` \| `'desk'` \| `'strength'` \| `'weekend'` \| `'cardio'` | home only |
| `createdAt`, `updatedAt` | timestamp | server time |

Edits write only the changed fields plus `updatedAt`. Delete removes the document; attendance
stays.

App type (`src/schedule/types.ts`):

```ts
type ClassType = Technique | 'other'
type ScheduleItem =
  | { id; kind: 'class'; name; type: ClassType; days: Weekday[]; start: string; minutes }
  | { id; kind: 'home'; routine: RoutineId; days: Weekday[]; start: string; minutes }
```

A document with an unknown `kind` or missing fields is skipped when read (a newer app's data).

## Attendance: `users/{uid}/attendance/{classId}_{YYYY-MM-DD}` (new)

Deterministic id: one per class per day (FR-011, research R2).

| Field | Type | Notes |
|---|---|---|
| `schemaVersion` | number | `1` |
| `classId` | string | the schedule item's id (it may be deleted later) |
| `date` | string | `"YYYY-MM-DD"`, local |
| `status` | `'attended'` \| `'skipped'` | |
| `minutes` | number | 5–240; the class's duration unless changed; kept for `skipped` too |
| `name`, `type`, `start` | as on the class | copied when recorded (FR-010) |
| `updatedAt` | timestamp | server time |

State transitions per class and date:

```text
(none) ──Yes──▶ attended ──Not this time──▶ skipped
   ▲               │  ▲                        │
   └────Undo───────┘  └──────────Yes───────────┘
   ▲                                           │
   └──────────────────Undo─────────────────────┘
```

Changing minutes updates `minutes` only. Allowed for dates from Monday of last week to today
(FR-008); the app enforces the window, the rules check only the shape.

Read: watched where `date >= <60 days ago>` (one-field range, automatic index).

## Derived (not stored)

- **Occurrence**: an item on a date: `{ item, date, startsAt: Date, endsAt: Date }`;
  `weekOccurrences(items, monday)` lists them for 7 days in start order.
- **Today's entry**: an occurrence plus status: `class` → `attended | skipped | open`;
  `home` → `done | open`; `passed` when `endsAt` < now (research R4).
- **Planned choice**: `{ routine, minutes } | null`, the first open home entry today (research R5).
- **Cover** (planner input): `{ name, type: Technique, when: 'today' | 'yesterday' }` (research R6).
- **Class session** (Progress): a `StatSession` with `routine: 'class:<name>'`, `items: []`,
  `activeSeconds: minutes × 60`, `startedAt` from date + start, `classType` (research R9).

## Changed

- `PlanInput.covered: Cover[]`; `PlanResult` (`kind: 'plan'`) gains `notes: string[]`; a new kept
  plan stores them in its existing `notes` field (no shape change to `plans`).
- `StatSession` gains optional `classType: ClassType`; `TechniqueShare.technique` becomes
  `ClassType` (adds `'other'`).
- `sessions` repo gains `watchSessionsSince(uid, since)`; no shape change.
