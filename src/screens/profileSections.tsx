// Profile sections shared by first-run setup (one per step) and the Profile tab (all at once).
import {
  BODY_AREA_LABEL,
  TECHNIQUES,
  TECHNIQUE_LABEL,
  type BodyArea,
  type Level,
} from '../exercises/types'
import { warriorTwo } from '../exercises/data/warrior-two'
import { Figure } from '../figure/Figure'
import { FIGURE_STYLES } from '../figure/style'
import { ROUTINES, ROUTINE_ORDER } from '../planner/routines'
import {
  AGE_LABEL,
  AMOUNT_LABEL,
  EQUIPMENT_LABEL,
  FIGURE_STYLE_LABEL,
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
import { previewCues, previewMood } from '../sound/engine'
import { MOODS, MOOD_LABEL } from '../sound/mood'
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

/** Figure style (007): Classic or Doodle, each shown as a small preview of the same pose. */
export function FigureStyleSection({ profile, onChange }: SectionProps) {
  return (
    <section className="stack" aria-labelledby="fig-h">
      <h2 id="fig-h">Figure style</h2>
      <div className="style-pick" role="group" aria-labelledby="fig-h">
        {FIGURE_STYLES.map((s) => (
          // The button's hit area stretches over the whole card (see .style-pick__option button).
          <div
            key={s}
            className={
              profile.figureStyle === s
                ? 'style-pick__option style-pick__option--on'
                : 'style-pick__option'
            }
          >
            <div aria-hidden="true">
              <Figure spec={warriorTwo.standard.figure} thumbnail figureStyle={s} />
            </div>
            <button
              type="button"
              aria-pressed={profile.figureStyle === s}
              onClick={() => onChange({ figureStyle: s })}
            >
              {FIGURE_STYLE_LABEL[s]}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

type OnOff = 'off' | 'on'
const ON_OFF: OnOff[] = ['off', 'on']
const ON_OFF_LABEL: Record<OnOff, string> = { off: 'Off', on: 'On' }
const onOff = (b: boolean): OnOff => (b ? 'on' : 'off')

/** Sound (009): music and cues in the player, previews, and song ideas. */
export function SoundSection({ profile, onChange }: SectionProps) {
  return (
    <section className="stack" aria-labelledby="sound-h">
      <h2 id="sound-h">Sound</h2>
      <div className="card card--list">
        <div className="row-control">
          <span>Music during sessions</span>
          <Segmented
            label="Music during sessions"
            options={ON_OFF}
            labels={ON_OFF_LABEL}
            value={onOff(profile.sessionMusic)}
            onChange={(v) => onChange({ sessionMusic: v === 'on' })}
          />
        </div>
        <div className="row-control">
          <span>Sound cues</span>
          <Segmented
            label="Sound cues"
            options={ON_OFF}
            labels={ON_OFF_LABEL}
            value={onOff(profile.soundCues)}
            onChange={(v) => onChange({ soundCues: v === 'on' })}
          />
        </div>
      </div>
      <p className="muted small">
        Music suits the session: Calm for calm mornings and weekends, Steady for desk breaks and
        strength, Upbeat for cardio. Cues chime as a countdown ends, at side switches and before the
        next exercise.
      </p>
      <h3 className="small">Hear a sample</h3>
      <div className="sound-hear">
        {MOODS.map((m) => (
          <button key={m} type="button" className="btn btn--outline" onClick={() => previewMood(m)}>
            {MOOD_LABEL[m]}
          </button>
        ))}
        <button type="button" className="btn btn--outline" onClick={() => previewCues()}>
          Cues
        </button>
      </div>
      <p className="muted small">
        If cues pause music you play from another app, turn cues off while you use your own
        playlist.
      </p>
      <a className="btn btn--outline" href="#/songs">
        Song ideas for your playlist
      </a>
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
