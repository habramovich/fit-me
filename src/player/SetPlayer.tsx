// Plays a saved set once the sets have loaded (spec 004 FR-007).
import { useSets } from '../app/setsContext'
import { getExercise } from '../exercises'
import type { HistorySummary } from '../planner/plan'
import type { Profile } from '../profile/types'
import { PlayerScreen } from './PlayerScreen'

export function SetPlayer({
  id,
  profile,
  history,
  uid,
}: {
  id: string
  profile: Profile
  history: HistorySummary | null
  uid: string
}) {
  const { sets } = useSets()
  if (sets === null) {
    return (
      <main className="screen">
        <p className="muted">Loading your set…</p>
      </main>
    )
  }
  const set = sets.find((s) => s.id === id)
  // Exercises no longer in the library are skipped.
  const items = (set?.items ?? [])
    .filter((i) => getExercise(i.exerciseId))
    .map((i) => ({ exerciseId: i.exerciseId, version: i.version, dose: i.dose }))
  return (
    <PlayerScreen
      routine={`set:${id}`}
      setItems={items}
      profile={profile}
      history={history}
      uid={uid}
    />
  )
}
