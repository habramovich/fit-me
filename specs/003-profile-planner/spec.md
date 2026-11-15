# Feature Specification: Profile and Session Planner

**Feature Branch**: `003-profile-planner`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "Before batch 2, let's work on my profile so pulled exercises will be
helpful: I'm a woman in my early 50s, want to focus on mobility and maintaining strength. Key areas
to focus: shoulders and hips, while not forgetting other areas. Want to start my day in a calm and
meditative way; a lot of office sitting during the day." Decisions: profile and planner together;
save age range and sex; routines Calm morning, Desk break, Strength keeper, Weekend longer and
Cardio; no areas to go easy on right now.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set up my profile (Priority: P1)

The first time a person opens FitMe after this update, they're asked a few short questions: age
range, sex (optional), goals, areas to focus on, areas to go easy on or avoid, which techniques
they like and how much, level, and equipment at home. Sensible defaults are pre-selected from
their answers (for example, a woman in her 50s gets balance and bone-strength suggested). They can
skip any question. Everything can be changed later on the Profile tab, and is the same on all
their devices.

**Why this priority**: Every planned session depends on the profile. Without it the app can only
replay a fixed list.

**Independent Test**: Complete setup on the phone, change two answers on the tablet's Profile tab,
reload the phone and see the changes.

**Acceptance Scenarios**:

1. **Given** a signed-in person with no profile, **When** they open the app, **Then** a short
   setup (at most 6 screens) starts, each screen skippable, ending on Today.
2. **Given** a person who picks age range 50–59 and sex woman, **When** they reach the goals
   screen, **Then** mobility, balance and bone strength are suggested (pre-selected, removable).
3. **Given** a completed profile, **When** the person changes an answer on the Profile tab,
   **Then** it is saved without a separate Save button and shown on their other devices.
4. **Given** a person who skips setup, **When** they use the app, **Then** it works with neutral
   defaults and Today invites them to finish their profile.
5. **Given** a family member, **When** they set up their own profile, **Then** nothing of the
   owner's profile is shown to them and age and sex are optional.

---

### User Story 2 - Get a session planned around me (Priority: P1)

On Today the person picks a routine (Calm morning, Desk break, Strength keeper, Weekend longer or
Cardio) and how many minutes they have, and taps **Plan**. FitMe shows the planned session:
warm-up, main and cool-down, with the reason each exercise was chosen ("hips: your focus area",
"new for you", "favourite"). They can swap one exercise for another suitable one, reshuffle the
whole plan, or tap **Start**.

**Why this priority**: This is the core promise: set the time, press start, follow along, with
sessions that fit the person rather than a fixed list.

**Independent Test**: With the owner's profile, plan a 15-minute Calm morning and a 5-minute Desk
break; check total time, the routine's character, the focus areas, and that no excluded exercise
appears.

**Acceptance Scenarios**:

1. **Given** a profile and a routine, **When** the person picks 15 minutes and taps Plan, **Then**
   the plan's estimated time is within 2 minutes of 15, with warm-up, main and cool-down.
2. **Given** Calm morning, **When** a plan is made, **Then** it uses only gentle exercises
   (breathing, yoga, tai chi, slow mobility) and starts and ends with calm moves.
3. **Given** Desk break, **When** a plan is made, **Then** it uses only exercises that can be
   done standing or seated without a mat, and targets hips, upper back, chest and neck.
4. **Given** Strength keeper, **When** a plan is made, **Then** at least half of the main part is
   strength or balance work, and legs, glutes, back and balance are all covered.
5. **Given** focus areas shoulders and hips, **When** several plans are made, **Then** shoulders
   and hips appear in most plans, and other areas still appear across a week of plans.
6. **Given** an exercise marked Not for me, or one that loads an area set to Avoid, **When** a
   plan is made, **Then** it never appears; an area set to Go easy gets the easier version.
7. **Given** a technique set to None, **When** a plan is made, **Then** no exercise of that
   technique appears.
8. **Given** the trying-new setting "A mix", **When** a plan is made, **Then** it includes one or
   two exercises the person hasn't done before, when the library has any that fit.
9. **Given** a plan, **When** the person taps Swap on one exercise, **Then** it is replaced by
   another that fits the same phase and routine; **When** they tap Reshuffle, **Then** a
   different valid plan appears.
10. **Given** a routine the library cannot fill yet (for example Cardio before cardio exercises
    exist), **When** the person picks it, **Then** FitMe says so plainly and suggests another
    routine instead of making a thin plan.
11. **Given** the person did a session yesterday, **When** a plan is made, **Then** it avoids
    repeating yesterday's main exercises where alternatives exist.

---

### User Story 3 - Routine defaults (Priority: P2)

Each routine has a default length the person can change in their profile (Calm morning 15,
Desk break 5, Strength keeper 20, Weekend longer 35, Cardio 15 minutes). Today pre-selects the
routine that suits the time of day (Calm morning before 11:00, Desk break 11:00–17:00 on weekdays,
Weekend longer on Saturday and Sunday mornings) with its default length, so most days it's two
taps: Plan, Start.

**Why this priority**: Reduces daily friction; the planner works without it.

**Independent Test**: Open Today at 7:30 on a weekday and at 14:00 on a weekday, and see Calm
morning and Desk break pre-selected with their default minutes.

**Acceptance Scenarios**:

1. **Given** a weekday at 7:30, **When** Today opens, **Then** Calm morning with its default
   minutes is pre-selected.
2. **Given** the person changes Desk break's default to 8 minutes, **When** they pick Desk break,
   **Then** 8 minutes is pre-selected.

---

### Edge Cases

- No profile and no history: the planner uses neutral defaults (every technique "Some", no focus
  areas) and still produces a valid plan.
- Every exercise for a phase is excluded: the plan leaves that phase short and says why.
- The requested time is shorter than one exercise: the plan holds one short exercise and says
  it's a minimum.
- Offline: planning works offline (the library is in the app; history and profile come from the
  local cache).
- The owner later adds an area to Avoid: plans made after that respect it; a plan already in
  progress is not changed.
- A person changes level from Beginner to Intermediate: standard versions are preferred over
  easier ones from the next plan on.

## Requirements *(mandatory)*

### Functional Requirements

**Profile**

- **FR-001**: The profile MUST hold: age range (under 30, 30–39, 40–49, 50–59, 60–69, 70+, or not
  given), sex (woman, man, or not given), goals (mobility, strength, balance, bone strength,
  flexibility, stress relief, posture, energy), focus areas, areas to go easy on and areas to
  avoid (from the body areas used by the library), technique preference per technique (None,
  Some, Lots), level (beginner, intermediate, advanced), equipment at home, trying-new setting
  (mostly favourites, a mix, mostly new), and default minutes per routine.
- **FR-002**: First-run setup MUST cover the profile in at most 6 short screens, each skippable,
  and MUST pre-select suggestions from earlier answers (age range and sex → goals; goals →
  techniques), which the person can change.
- **FR-003**: The Profile tab MUST show and edit every profile field, saving each change
  immediately, and keep Sign out and the account details from feature 002.
- **FR-004**: The profile MUST be private to the person and the same on all their devices. Age
  range and sex MUST be optional and MUST only be used to suggest defaults.

**Planner**

- **FR-005**: Today MUST let the person pick a routine (Calm morning, Desk break, Strength
  keeper, Weekend longer, Cardio) and minutes (5, 10, 15, 20, 30, 45), then Plan.
- **FR-006**: A plan MUST have warm-up, main and cool-down parts sized to the routine, with a
  total estimated time within 2 minutes of the request (or within 1 minute for 5–10 minute
  requests), adjusting doses only within each exercise's recommended range.
- **FR-007**: The planner MUST exclude exercises marked Not for me, exercises of a technique set
  to None, exercises that load an area set to Avoid, and exercises needing equipment the person
  doesn't have; it MUST use the easier version for exercises that load an area set to Go easy.
- **FR-008**: The planner MUST favour, in this order of weight: the routine's character (see
  FR-009), the person's focus areas, favourites, the technique preference, and variety (not
  repeating yesterday's main exercises; covering other areas across the week).
- **FR-009**: Each routine MUST have a character the planner respects:
  - Calm morning: gentle intensity only; breathing or slow movement first and last; yoga, tai
    chi and mobility preferred.
  - Desk break: standing or seated exercises only, no mat; hips, upper back, chest, neck.
  - Strength keeper: at least half the main part strength or balance work; legs, glutes, back
    and balance covered; ages 50+ also include bone-loading (e.g. calf raises, sit-to-stand)
    when available.
  - Weekend longer: a mix of all preferred techniques, longer holds, at least one tai chi move
    when available.
  - Cardio: cardio exercises in the main part, low-impact versions unless the person's level is
    advanced; mobility warm-up and cool-down.
- **FR-010**: With "A mix", a plan MUST include 1–2 exercises the person has never done (when
  any fit); "Mostly favourites" at most 1 per week; "Mostly new" prefers new ones throughout.
- **FR-011**: The plan screen MUST show each exercise's reason in a short phrase, total time,
  and offer Swap per exercise, Reshuffle, and Start.
- **FR-012**: When the library can't fill a routine with at least 3 suitable exercises, the
  planner MUST say so and suggest another routine.
- **FR-013**: The same inputs and the same shuffle number MUST always give the same plan, so a
  plan can be explained and tested.
- **FR-014**: Planning MUST work offline.

**Routine defaults**

- **FR-015**: Today MUST pre-select a routine by time of day and day of week (US3) with that
  routine's default minutes, both changeable.

**Exercise data**

- **FR-016**: Each exercise MUST record its position (standing, seated, kneeling, lying) and
  intensity (gentle, moderate, vigorous), so routines can select by them. Batch 1 MUST be updated
  accordingly.

### Key Entities

- **Profile**: the fields in FR-001, stored with the person's record, with a data-shape version.
- **Routine**: one of five built-in session types with a character (FR-009) and a default length.
- **Plan**: the planner's output: ordered items (exercise, version, dose, phase, reason), total
  estimated time, and the shuffle number that produced it. Not stored; the session (feature 002)
  records what was done.
- **History** (read only): the person's past sessions from feature 002, used for "new for you"
  and for variety.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: First-run setup takes under 2 minutes.
- **SC-002**: On a typical morning, the owner goes from opening the app to the first exercise in
  3 taps or fewer (Plan, Start, plus at most one change).
- **SC-003**: Across 1,000 generated plans with varied profiles in automated tests, 100% respect
  the exclusions (FR-007) and the time tolerance (FR-006).
- **SC-004**: With the owner's profile, shoulders and hips appear in at least 80% of plans, and
  every body area in the library appears at least once across 7 consecutive daily plans (when
  the library allows).
- **SC-005**: The owner rates at least 4 of 5 planned Calm mornings as "felt calm" when asked
  informally after a week.

## Assumptions

- The owner's profile (from her description): age 50–59, woman; goals mobility, strength,
  balance, bone strength, stress relief; focus areas shoulders and hips; nothing to go easy on;
  techniques yoga Lots, tai chi Some, mobility Lots, strength Some, cardio Some; level beginner
  to intermediate (she picks); trying new: a mix. She enters it herself through setup; nothing is
  written to her account without her doing it.
- With only the 8 batch-1 exercises, plans will repeat a lot and Desk break and Cardio can't be
  filled; batch 2 (next) adds calm-morning, desk-break and strength-keeper moves, and a later
  batch adds cardio.
- Ratings (Too easy / Too hard) start changing doses in the separate progression feature, not
  here.
- No reminders or notifications in this feature.
- Pelvic-floor-friendly options for women are a possible later refinement; sex is stored now so
  it doesn't need asking again.
