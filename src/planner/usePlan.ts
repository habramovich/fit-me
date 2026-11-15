// Gathers the planner's inputs (profile, marks, recent history) and makes the plan.
import { useEffect, useMemo, useState } from 'react'
import type { PlanParams } from '../app/router'
import { useMarks } from '../app/marksContext'
import { recentSessions } from '../data/repo/sessions'
import { allExercises } from '../exercises'
import type { Profile } from '../profile/types'
import { summariseHistory, todayKey } from './history'
import { EMPTY_HISTORY, makePlan, type HistorySummary, type PlanResult } from './plan'

/** Recent history, loaded once per mount; null while loading. */
export function useHistory(uid: string): HistorySummary | null {
  const [history, setHistory] = useState<HistorySummary | null>(null)
  useEffect(() => {
    let cancelled = false
    recentSessions(uid, 14).then(
      (s) => !cancelled && setHistory(summariseHistory(s)),
      () => !cancelled && setHistory(EMPTY_HISTORY),
    )
    return () => {
      cancelled = true
    }
  }, [uid])
  return history
}

export function usePlan(
  params: PlanParams,
  profile: Profile,
  history: HistorySummary | null,
): PlanResult | null {
  const { marks } = useMarks()
  const [today] = useState(() => todayKey())
  return useMemo(
    () =>
      history === null
        ? null
        : makePlan({
            library: allExercises,
            profile,
            routine: params.routine,
            minutes: params.minutes,
            marks,
            history,
            today,
            shuffle: params.shuffle,
            swaps: params.swaps,
          }),
    [params, profile, marks, history, today],
  )
}

// The plan screen hands the exact plan to the player (so a late history load can't change it).
// After a reload the player recomputes it from the same route params.
let handoff: { key: string; result: PlanResult } | null = null
export const planKey = (p: PlanParams) => JSON.stringify(p)
export function handOffPlan(params: PlanParams, result: PlanResult): void {
  handoff = { key: planKey(params), result }
}
export function takeHandedOffPlan(params: PlanParams): PlanResult | null {
  return handoff && handoff.key === planKey(params) ? handoff.result : null
}
