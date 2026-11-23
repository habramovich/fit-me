import { useEffect, useMemo } from 'react'
import type { SessionUser } from '../auth/session'
import { saveProfile, type UserRecord } from '../data/repo/users'
import { PosesPrefContext, type PosesPref } from '../figure/poses'
import { FigureStyleContext } from '../figure/style'
import { useHistory } from '../planner/usePlan'
import { PlanPlayer } from '../player/PlanPlayer'
import { PlayerScreen } from '../player/PlayerScreen'
import { SetPlayer } from '../player/SetPlayer'
import { withDefaults } from '../profile/types'
import { ExerciseDetail } from '../screens/ExerciseDetail'
import { forgetFreshen } from '../screens/freshenMemory'
import { Library } from '../screens/Library'
import { PlanView } from '../screens/PlanView'
import { Profile } from '../screens/Profile'
import { Progress } from '../screens/Progress'
import { Review } from '../screens/Review'
import { Schedule } from '../screens/Schedule'
import { ScheduleItemForm } from '../screens/ScheduleItemForm'
import { reviewEnabled } from '../screens/reviewEnabled'
import { Setup } from '../screens/Setup'
import { SetView } from '../screens/SetView'
import { Songs } from '../screens/Songs'
import { Today } from '../screens/Today'
import { setAudioWanted } from '../sound/engine'
import { SoundPrefsContext, type SoundPrefs } from '../sound/prefs'
import { MarksProvider } from './marks'
import { PlansProvider } from './plans'
import { ScheduleProvider } from './schedule'
import { SetsProvider } from './sets'
import { useRoute } from './router'
import { TabBar } from './TabBar'
import './app.css'

export function Shell({ user, record }: { user: SessionUser; record: UserRecord | null }) {
  const route = useRoute()
  // Try something new keeps its cards across a look at an exercise, but not beyond (012).
  useEffect(() => {
    if (route.name !== 'set' && route.name !== 'exercise') forgetFreshen()
  }, [route.name])
  const name = record?.displayName || user.displayName || user.email
  const profile = withDefaults(record?.profile)
  const history = useHistory(user.uid)
  // The planner waits for the real profile: defaults could make kept items look unfit.
  const plannerProfile = record !== null ? profile : null
  const sound: SoundPrefs = useMemo(
    () => ({
      music: profile.sessionMusic,
      cues: profile.soundCues,
      setMusic: (on) => void saveProfile(user.uid, { sessionMusic: on }).catch(() => {}),
    }),
    [profile.sessionMusic, profile.soundCues, user.uid],
  )
  useEffect(() => setAudioWanted(sound.music || sound.cues), [sound.music, sound.cues])
  const poses: PosesPref = useMemo(
    () => ({
      show: profile.showPoses,
      setShow: (on) => void saveProfile(user.uid, { showPoses: on }).catch(() => {}),
    }),
    [profile.showPoses, user.uid],
  )

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
      screen = <Library addTo={effective.addTo} phase={effective.phase} />
      break
    case 'exercise':
      screen = <ExerciseDetail id={effective.id} uid={user.uid} profile={profile} />
      break
    case 'plan':
      screen = <PlanView params={effective.plan} profile={plannerProfile} history={history} />
      break
    case 'set':
      screen = <SetView id={effective.id} profile={plannerProfile} />
      break
    case 'player':
      if (effective.routine.startsWith('set:')) {
        screen = (
          <SetPlayer key={effective.routine} id={effective.routine.slice(4)} uid={user.uid} />
        )
        break
      }
      if (effective.routine === 'plan' && effective.plan) {
        screen = (
          <PlanPlayer
            key={JSON.stringify(effective)}
            plan={effective.plan}
            profile={plannerProfile}
            history={history}
            uid={user.uid}
          />
        )
        break
      }
      // Keyed so a new routine starts a fresh player.
      screen = (
        <PlayerScreen
          key={JSON.stringify(effective)}
          routine={effective.routine}
          version={effective.version}
          uid={user.uid}
        />
      )
      break
    case 'setup':
      screen = <Setup uid={user.uid} profile={profile} step={effective.step} />
      break
    case 'schedule':
      screen = <Schedule />
      break
    case 'scheduleItem':
      screen = (
        <ScheduleItemForm
          key={effective.id ?? effective.kind}
          id={effective.id}
          kind={effective.kind}
          profile={profile}
        />
      )
      break
    case 'progress':
      screen = <Progress uid={user.uid} profile={profile} />
      break
    case 'profile':
      screen = <Profile user={user} record={record} profile={profile} />
      break
    case 'songs':
      screen = <Songs />
      break
    case 'review':
      screen = reviewEnabled() ? <Review /> : <Today name={name} profile={profile} />
      break
  }

  const fullScreen = effective.name === 'player' || effective.name === 'setup'
  return (
    <MarksProvider uid={user.uid}>
      <SetsProvider uid={user.uid}>
        <PlansProvider uid={user.uid}>
          <ScheduleProvider uid={user.uid}>
            <FigureStyleContext.Provider value={profile.figureStyle}>
              <SoundPrefsContext.Provider value={sound}>
                <PosesPrefContext.Provider value={poses}>
                  <div className={fullScreen ? 'shell shell--full' : 'shell'}>
                    {screen}
                    {!fullScreen && <TabBar route={effective} />}
                  </div>
                </PosesPrefContext.Provider>
              </SoundPrefsContext.Provider>
            </FigureStyleContext.Provider>
          </ScheduleProvider>
        </PlansProvider>
      </SetsProvider>
    </MarksProvider>
  )
}
