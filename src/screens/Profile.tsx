import { signOutUser } from '../auth/signIn'
import type { SessionUser } from '../auth/session'
import type { UserRecord } from '../data/repo/users'

const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export function Profile({ user, record }: { user: SessionUser; record: UserRecord | null }) {
  const name = record?.displayName || user.displayName || user.email
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
      <p className="muted">
        {record?.lastSignInAt
          ? `Last signed in ${formatter.format(record.lastSignInAt)}`
          : 'Saving your sign-in…'}
      </p>
      <div className="card">
        <p className="muted">
          Goals, techniques, sensitive areas and equipment will be set here in a later update.
        </p>
      </div>
      <button type="button" className="btn btn--outline" onClick={() => void signOutUser()}>
        Sign out
      </button>
    </main>
  )
}
