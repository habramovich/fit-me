import { signOutUser } from '../auth/signIn'
import type { SessionUser } from '../auth/session'
import type { UserRecord } from '../data/repo/users'

const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export function Home({ user, record }: { user: SessionUser; record: UserRecord | null }) {
  const name = record?.displayName || user.displayName || user.email

  return (
    <main className="screen">
      <h1>Hi, {name}</h1>
      <p className="note">
        {record?.lastSignInAt
          ? `Last signed in ${formatter.format(record.lastSignInAt)}`
          : 'Saving your sign-in…'}
      </p>
      <button type="button" onClick={() => void signOutUser()}>
        Sign out
      </button>
    </main>
  )
}
