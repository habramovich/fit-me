import type { SessionUser } from '../auth/session'
import type { UserRecord } from '../data/repo/users'
import { PlayerScreen } from '../player/PlayerScreen'
import { ExerciseDetail } from '../screens/ExerciseDetail'
import { Library } from '../screens/Library'
import { Placeholder } from '../screens/Placeholder'
import { Profile } from '../screens/Profile'
import { Review } from '../screens/Review'
import { reviewEnabled } from '../screens/reviewEnabled'
import { Today } from '../screens/Today'
import { MarksProvider } from './marks'
import { useRoute } from './router'
import { TabBar } from './TabBar'
import './app.css'

export function Shell({ user, record }: { user: SessionUser; record: UserRecord | null }) {
  const route = useRoute()
  const name = record?.displayName || user.displayName || user.email

  let screen
  switch (route.name) {
    case 'today':
      screen = <Today name={name} />
      break
    case 'library':
      screen = <Library />
      break
    case 'exercise':
      screen = <ExerciseDetail id={route.id} />
      break
    case 'player':
      // Keyed so a new routine starts a fresh player.
      screen = (
        <PlayerScreen
          key={`${route.routine}:${route.version}`}
          routine={route.routine}
          version={route.version}
          uid={user.uid}
        />
      )
      break
    case 'schedule':
      screen = (
        <Placeholder
          title="Schedule"
          text="Your classes and planned home sessions will appear here."
        />
      )
      break
    case 'progress':
      screen = (
        <Placeholder
          title="Progress"
          text="Streaks, minutes and how your exercises are levelling up will appear here."
        />
      )
      break
    case 'profile':
      screen = <Profile user={user} record={record} />
      break
    case 'review':
      screen = reviewEnabled() ? <Review /> : <Today name={name} />
      break
  }

  const fullScreen = route.name === 'player'
  return (
    <MarksProvider uid={user.uid}>
      <div className={fullScreen ? 'shell shell--full' : 'shell'}>
        {screen}
        {!fullScreen && <TabBar route={route} />}
      </div>
    </MarksProvider>
  )
}
