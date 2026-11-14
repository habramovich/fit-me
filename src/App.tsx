import './App.css'
import { useSession } from './auth/useSession'
import { Home } from './screens/Home'
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
      return <Home user={state.user} record={record} />
  }
}
