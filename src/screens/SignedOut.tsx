import { useState } from 'react'
import { signInWithGoogle } from '../auth/signIn'

export function SignedOut() {
  const [error, setError] = useState<string | null>(null)

  // Called straight from the click so the browser allows the popup.
  const onClick = () => {
    setError(null)
    void signInWithGoogle().then(setError)
  }

  return (
    <main className="screen">
      <h1>FitMe</h1>
      <p>Your home workouts, planned around you.</p>
      <button type="button" className="primary" onClick={onClick}>
        Sign in with Google
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </main>
  )
}
