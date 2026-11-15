import './App.css'
import { Shell } from './app/Shell'
import { useSession } from './auth/useSession'
import { NotInvited } from './screens/NotInvited'
import { SignedOut } from './screens/SignedOut'
import { Status } from './screens/Status'

export default function App() {
  const { state, record, online } = useSession()

  switch (state.status) {
    case 'loading':
      return <Status message="Loading…" />
    case 'signedOut':
      return <SignedOut />
    case 'checkingInvite':
      return (
        <Status
          message="Checking your invite…"
          note={online ? undefined : "You're offline. This will finish when you reconnect."}
        />
      )
    case 'notInvited':
      return <NotInvited />
    case 'invited':
      return <Shell user={state.user} record={record} />
  }
}
