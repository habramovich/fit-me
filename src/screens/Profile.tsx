import { signOutUser } from '../auth/signIn'
import type { SessionUser } from '../auth/session'
import { saveProfile, type UserRecord } from '../data/repo/users'
import type { Profile as ProfileData } from '../profile/types'
import {
  AboutYouSection,
  CareSection,
  FocusSection,
  GoalsSection,
  HomeSection,
  RoutineDefaultsSection,
  TechniquesSection,
} from './profileSections'

const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export function Profile({
  user,
  record,
  profile,
}: {
  user: SessionUser
  record: UserRecord | null
  profile: ProfileData
}) {
  const name = record?.displayName || user.displayName || user.email
  // Each change saves at once (FR-003); the record listener brings it back to the screen.
  const save = (patch: Partial<ProfileData>) => void saveProfile(user.uid, patch).catch(() => {})
  const props = { profile, onChange: save }

  return (
    <main className="screen">
      <header className="profile-head">
        <div className="avatar" aria-hidden="true">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1>{name}</h1>
          <p className="muted">{user.email}</p>
        </div>
      </header>
      <p className="muted small">Changes save as you go and apply to your next plan.</p>

      <GoalsSection {...props} />
      <FocusSection {...props} />
      <CareSection {...props} />
      <TechniquesSection {...props} />
      <HomeSection {...props} />
      <RoutineDefaultsSection {...props} />
      <AboutYouSection {...props} />

      <p className="muted small">
        {record?.lastSignInAt
          ? `Last signed in ${formatter.format(record.lastSignInAt)}`
          : 'Saving your sign-in…'}
      </p>
      <button type="button" className="btn btn--outline" onClick={() => void signOutUser()}>
        Sign out
      </button>
    </main>
  )
}
