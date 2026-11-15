import type { SessionUser } from '../auth/session'
import type { UserRecord } from '../data/repo/users'
import { useHistory } from '../planner/usePlan'
import { PlayerScreen } from '../player/PlayerScreen'
import { withDefaults } from '../profile/types'
import { ExerciseDetail } from '../screens/ExerciseDetail'
import { Library } from '../screens/Library'
import { Placeholder } from '../screens/Placeholder'
import { PlanView } from '../screens/PlanView'
import { Profile } from '../screens/Profile'
import { Review } from '../screens/Review'
import { reviewEnabled } from '../screens/reviewEnabled'
import { Setup } from '../screens/Setup'
import { Today } from '../screens/Today'
import { MarksProvider } from './marks'
import { useRoute } from './router'
import { TabBar } from './TabBar'
import './app.css'

export function Shell({ user, record }: { user: SessionUser; record: UserRecord | null }) {
  const route = useRoute()
  const name = record?.displayName || user.displayName || user.email
  const profile = withDefaults(record?.profile)
  const history = useHistory(user.uid)

  // First run: setup until done (only once the record has loaded, to avoid a flash).
  const needsSetup = record !== null && !profile.setupDone
  const effective =
    needsSetup && route.name !== 'setup' && route.name !== 'profile'
      ? { name: 'setup' as const, step: 1 }
      : route

  let screen
  switch (effective.name) {
    case 'today':
      screen = <Today name={name} profile={profile} />
      break
    case 'library':
      screen = <Library />
      break
    case 'exercise':
      screen = <ExerciseDetail id={effective.id} />
      break
    case 'plan':
      screen = <PlanView params={effective.plan} profile={profile} history={history} />
      break
    case 'player':
      // Keyed so a new routine starts a fresh player.
      screen = (
        <PlayerScreen
          key={JSON.stringify(effective)}
          routine={effective.routine}
          version={effective.version}
          plan={effective.plan}
          profile={profile}
          history={history}
          uid={user.uid}
        />
      )
      break
    case 'setup':
      screen = <Setup uid={user.uid} profile={profile} step={effective.step} />
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
      screen = <Profile user={user} record={record} profile={profile} />
      break
    case 'review':
      screen = reviewEnabled() ? <Review /> : <Today name={name} profile={profile} />
      break
  }

  const fullScreen = effective.name === 'player' || effective.name === 'setup'
  return (
    <MarksProvider uid={user.uid}>
      <div className={fullScreen ? 'shell shell--full' : 'shell'}>
        {screen}
        {!fullScreen && <TabBar route={effective} />}
      </div>
    </MarksProvider>
  )
}
