// Profile sections shared by first-run setup (one per step) and the Profile tab (all at once).
import {
  BODY_AREA_LABEL,
  TECHNIQUES,
  TECHNIQUE_LABEL,
  type BodyArea,
  type Level,
} from '../exercises/types'
import { ROUTINES, ROUTINE_ORDER } from '../planner/routines'
import {
  AGE_LABEL,
  AMOUNT_LABEL,
  EQUIPMENT_LABEL,
  GOAL_LABEL,
  TRY_NEW_LABEL,
  type AgeRange,
  type Amount,
  type Goal,
  type HomeEquipment,
  type Profile,
  type Sex,
  type TryNew,
} from '../profile/types'
import { PICKABLE_AREAS } from '../profile/areas'
import { ChipMulti, ChipOne, Segmented, Stepper } from './controls'

export interface SectionProps {
  profile: Profile
  onChange: (patch: Partial<Profile>) => void
}

const AGES: AgeRange[] = ['u30', '30s', '40s', '50s', '60s', '70plus']
const SEXES: Sex[] = ['woman', 'man']
const SEX_LABEL: Record<Sex, string> = { woman: 'Woman', man: 'Man' }
const GOALS: Goal[] = [
  'mobility',
  'strength',
  'balance',
  'boneStrength',
  'flexibility',
  'stressRelief',
  'posture',
  'energy',
]
const AMOUNTS: Amount[] = ['none', 'some', 'lots']
const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced']
const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}
const EQUIPMENT: HomeEquipment[] = ['mat', 'chair', 'wall', 'band']
const TRY_NEW: TryNew[] = ['favourites', 'mix', 'new']
type Care = 'ok' | 'easy' | 'avoid'
const CARE: Care[] = ['ok', 'easy', 'avoid']
const CARE_LABEL: Record<Care, string> = { ok: 'OK', easy: 'Go easy', avoid: 'Avoid' }
const AREA_LABELS = Object.fromEntries(
  PICKABLE_AREAS.map((a) => [a, cap(BODY_AREA_LABEL[a])]),
) as Record<BodyArea, string>

function cap(s: string) {
  return s[0].toUpperCase() + s.slice(1)
}

export function AboutYouSection({ profile, onChange }: SectionProps) {
  return (
    <section className="stack" aria-labelledby="about-h">
      <div className="stack-sm">
        <h2 id="about-h">About you</h2>
        <p className="muted small">
          Optional. Only used to suggest sensible defaults; private to you.
        </p>
      </div>
      <h3 className="small">Age</h3>
      <ChipOne
        label="Age"
        options={AGES}
        labels={AGE_LABEL}
        value={profile.ageRange}
        onChange={(ageRange) => onChange({ ageRange })}
      />
      <h3 className="small">Sex</h3>
      <ChipOne
        label="Sex"
        options={SEXES}
        labels={SEX_LABEL}
        value={profile.sex}
        onChange={(sex) => onChange({ sex })}
      />
    </section>
  )
}

export function GoalsSection({ profile, onChange }: SectionProps) {
  return (
    <section className="stack" aria-labelledby="goals-h">
      <h2 id="goals-h">Goals</h2>
      <ChipMulti
        label="Goals"
        options={GOALS}
        labels={GOAL_LABEL}
        value={profile.goals}
        onChange={(goals) => onChange({ goals })}
      />
    </section>
  )
}

export function FocusSection({ profile, onChange }: SectionProps) {
  return (
    <section className="stack" aria-labelledby="focus-h">
      <div className="stack-sm">
        <h2 id="focus-h">Areas to work on</h2>
        <p className="muted small">Picked more often; other areas still get their turn.</p>
      </div>
      <ChipMulti
        label="Areas to work on"
        options={PICKABLE_AREAS}
        labels={AREA_LABELS}
        value={profile.focusAreas}
        onChange={(focusAreas) => onChange({ focusAreas })}
      />
    </section>
  )
}

export function CareSection({ profile, onChange }: SectionProps) {
  const careOf = (a: BodyArea): Care =>
    profile.avoidAreas.includes(a) ? 'avoid' : profile.goEasyAreas.includes(a) ? 'easy' : 'ok'
  const set = (a: BodyArea, c: Care) => {
    const goEasyAreas = profile.goEasyAreas.filter((x) => x !== a)
    const avoidAreas = profile.avoidAreas.filter((x) => x !== a)
    if (c === 'easy') goEasyAreas.push(a)
    if (c === 'avoid') avoidAreas.push(a)
    onChange({ goEasyAreas, avoidAreas })
  }
  return (
    <section className="stack" aria-labelledby="care-h">
      <div className="stack-sm">
        <h2 id="care-h">Sensitive areas</h2>
        <p className="muted small">
          “Go easy” picks gentler versions. “Avoid” leaves out anything that loads that area.
        </p>
      </div>
      <div className="card card--list">
        {PICKABLE_AREAS.map((a) => (
          <div key={a} className="row-control">
            <span>{AREA_LABELS[a]}</span>
            <Segmented
              label={AREA_LABELS[a]}
              options={CARE}
              labels={CARE_LABEL}
              value={careOf(a)}
              onChange={(c) => set(a, c)}
              tone={{ easy: 'tone-warm', avoid: 'tone-dark' }}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export function TechniquesSection({ profile, onChange }: SectionProps) {
  return (
    <section className="stack" aria-labelledby="tech-h">
      <div className="stack-sm">
        <h2 id="tech-h">Techniques</h2>
        <p className="muted small">How much of each to mix in.</p>
      </div>
      <div className="card card--list">
        {TECHNIQUES.map((t) => (
          <div key={t} className="row-control">
            <span>{TECHNIQUE_LABEL[t]}</span>
            <Segmented
              label={TECHNIQUE_LABEL[t]}
              options={AMOUNTS}
              labels={AMOUNT_LABEL}
              value={profile.techniques[t]}
              onChange={(v) => onChange({ techniques: { ...profile.techniques, [t]: v } })}
            />
          </div>
        ))}
      </div>
      <h3 className="small">Level</h3>
      <Segmented
        label="Level"
        options={LEVELS}
        labels={LEVEL_LABEL}
        value={profile.level}
        onChange={(level) => onChange({ level })}
      />
    </section>
  )
}

export function HomeSection({ profile, onChange }: SectionProps) {
  return (
    <section className="stack" aria-labelledby="home-h">
      <h2 id="home-h">At home</h2>
      <ChipMulti
        label="Equipment"
        options={EQUIPMENT}
        labels={EQUIPMENT_LABEL}
        value={profile.equipment}
        onChange={(equipment) => onChange({ equipment })}
      />
      <h3 className="small">Trying new exercises</h3>
      <Segmented
        label="Trying new exercises"
        options={TRY_NEW}
        labels={TRY_NEW_LABEL}
        value={profile.tryNew}
        onChange={(tryNew) => onChange({ tryNew })}
      />
    </section>
  )
}

export function RoutineDefaultsSection({ profile, onChange }: SectionProps) {
  return (
    <section className="stack" aria-labelledby="rt-h">
      <h2 id="rt-h">Routine lengths</h2>
      <div className="card card--list">
        {ROUTINE_ORDER.map((id) => (
          <Stepper
            key={id}
            label={ROUTINES[id].name}
            value={profile.routineMinutes[id]}
            min={5}
            max={60}
            step={5}
            unit="min"
            onChange={(m) => onChange({ routineMinutes: { ...profile.routineMinutes, [id]: m } })}
          />
        ))}
      </div>
      <h3 className="small">Weekly goal</h3>
      <div className="card card--list">
        <Stepper
          label="Active minutes a week"
          value={profile.weeklyMinutes}
          min={30}
          max={600}
          step={15}
          unit="min"
          onChange={(weeklyMinutes) => onChange({ weeklyMinutes })}
        />
      </div>
    </section>
  )
}
