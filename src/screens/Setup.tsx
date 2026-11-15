// First-run setup: six short, skippable steps (spec 003 US1, FR-002).
import { useState } from 'react'
import { href, navigate } from '../app/router'
import { saveProfile } from '../data/repo/users'
import { suggestGoals, suggestTechniques } from '../profile/suggest'
import { DEFAULT_PROFILE, type Profile } from '../profile/types'
import {
  AboutYouSection,
  CareSection,
  FocusSection,
  GoalsSection,
  HomeSection,
  TechniquesSection,
} from './profileSections'

const STEPS = 6

export function Setup({ uid, profile, step }: { uid: string; profile: Profile; step: number }) {
  const [draft, setDraft] = useState<Profile>(profile)
  const [techniquesTouched, setTechniquesTouched] = useState(
    JSON.stringify(profile.techniques) !== JSON.stringify(DEFAULT_PROFILE.techniques),
  )
  const change = (patch: Partial<Profile>) => {
    if (patch.techniques) setTechniquesTouched(true)
    setDraft((d) => ({ ...d, ...patch }))
  }

  /** Saves this step's fields and moves on, adding suggestions for the next step. */
  const next = () => {
    let d = draft
    if (step === 1 && d.goals.length === 0) d = { ...d, goals: suggestGoals(d) }
    if (step === 2 && !techniquesTouched) d = { ...d, techniques: suggestTechniques(d.goals) }
    setDraft(d)
    const fields: (keyof Profile)[][] = [
      ['ageRange', 'sex'],
      ['goals'],
      ['focusAreas'],
      ['goEasyAreas', 'avoidAreas'],
      ['techniques', 'level'],
      ['equipment', 'tryNew'],
    ]
    const patch = Object.fromEntries(fields[step - 1].map((k) => [k, d[k]])) as Partial<Profile>
    if (step === STEPS) {
      void saveProfile(uid, { ...patch, setupDone: true }).catch(() => {})
      navigate({ name: 'today' })
    } else {
      void saveProfile(uid, patch).catch(() => {})
      navigate({ name: 'setup', step: step + 1 })
    }
  }

  const skip = () => {
    if (step === STEPS) {
      void saveProfile(uid, { setupDone: true }).catch(() => {})
      navigate({ name: 'today' })
    } else navigate({ name: 'setup', step: step + 1 })
  }

  const skipAll = () => {
    void saveProfile(uid, { setupDone: true }).catch(() => {})
    navigate({ name: 'today' })
  }

  const section = [
    AboutYouSection,
    GoalsSection,
    FocusSection,
    CareSection,
    TechniquesSection,
    HomeSection,
  ][step - 1]
  const Section = section

  return (
    <main className="screen">
      <header className="stack-sm">
        <p className="muted small">
          Set up your profile · step {step} of {STEPS}
        </p>
        <div className="segments" aria-hidden="true">
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} className={i < step ? 'seg seg--done' : 'seg'} />
          ))}
        </div>
        {step === 1 && <h1>Let’s plan around you</h1>}
        {step === 2 && <p className="muted small">Suggested from your answers; change anything.</p>}
      </header>

      <Section profile={draft} onChange={change} />

      <div className="stack-sm">
        <button type="button" className="btn btn--primary btn--big" onClick={next}>
          {step === STEPS ? 'Finish' : 'Next'}
        </button>
        <button type="button" className="btn btn--outline" onClick={skip}>
          Skip this step
        </button>
        {step === 1 && (
          <button type="button" className="btn btn--link" onClick={skipAll}>
            Skip setup for now
          </button>
        )}
        {step > 1 && (
          <a className="btn btn--link" href={href({ name: 'setup', step: step - 1 })}>
            Back
          </a>
        )}
      </div>
    </main>
  )
}
