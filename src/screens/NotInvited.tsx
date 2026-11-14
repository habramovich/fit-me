import { signOutUser } from '../auth/signIn'

export function NotInvited() {
  return (
    <main className="auth-screen">
      <h1>FitMe</h1>
      <p>FitMe is invite-only. Ask the owner to add you.</p>
      <button type="button" onClick={() => void signOutUser()}>
        Sign out
      </button>
    </main>
  )
}
