// Plays a kept plan (spec 006 US1): loads (or makes) it, then hands its items to the player.
// The loader unmounts once playing starts, so the plan isn't re-resolved mid-session.
import { useEffect, useState } from 'react'
import { href, type PlanParams } from '../app/router'
import { getExercise } from '../exercises'
import type { HistorySummary } from '../planner/plan'
import { useKeptPlan } from '../planner/usePlan'
import type { Profile } from '../profile/types'
import type { PlayItem } from './machine'
import { PlayerScreen } from './PlayerScreen'

interface Start {
  items: PlayItem[]
  planId: string
}

export function PlanPlayer({
  plan,
  profile,
  history,
  uid,
}: {
  plan: PlanParams
  profile: Profile | null
  history: HistorySummary | null
  uid: string
}) {
  const [start, setStart] = useState<Start | null>(null)
  if (!start)
    return <PlanLoader plan={plan} profile={profile} history={history} onReady={setStart} />
  return (
    <PlayerScreen
      routine="plan"
      plan={plan}
      setItems={start.items}
      planId={start.planId}
      uid={uid}
    />
  )
}

function PlanLoader({
  plan,
  profile,
  history,
  onReady,
}: {
  plan: PlanParams
  profile: Profile | null
  history: HistorySummary | null
  onReady: (start: Start) => void
}) {
  const kept = useKeptPlan(plan.routine, plan.minutes, profile, history)
  const ready = kept.status === 'ready' ? kept.plan : null
  useEffect(() => {
    if (!ready) return
    onReady({
      planId: ready.id,
      items: ready.items
        .filter((i) => getExercise(i.exerciseId))
        .map((i) => ({ exerciseId: i.exerciseId, version: i.version, dose: i.dose })),
    })
  }, [ready, onReady])

  return (
    <main className="screen">
      {kept.status === 'insufficient' ? (
        <>
          <p>There aren’t enough exercises for this session yet.</p>
          <a href={href({ name: 'plan', plan })}>Back to the plan</a>
        </>
      ) : (
        <p className="muted">Loading your session…</p>
      )}
    </main>
  )
}
