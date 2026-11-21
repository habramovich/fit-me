// Recent history for the planner, and the kept plan for a routine and length (spec 006 US1).
import { useEffect, useMemo, useState } from 'react'
import { useMarks } from '../app/marksContext'
import { usePlans } from '../app/plansContext'
import { useSchedule } from '../app/scheduleContext'
import { getPlan, planId, type KeptPlan } from '../data/repo/plans'
import { recentSessions } from '../data/repo/sessions'
import { allExercises } from '../exercises'
import type { Profile, RoutineId } from '../profile/types'
import { covers } from '../schedule/week'
import { summariseHistory, todayKey } from './history'
import {
  coverNotes,
  EMPTY_HISTORY,
  makePlan,
  repairPlan,
  swapItem,
  type HistorySummary,
  type PlanInput,
} from './plan'

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

export type KeptPlanState =
  | { status: 'loading' }
  | { status: 'insufficient'; suggestion: RoutineId | null }
  | {
      status: 'ready'
      plan: KeptPlan
      totalSeconds: number
      swap: (index: number) => void
      reshuffle: () => void
    }

/**
 * The plan the person has been shown for this routine and length, made and kept on first view.
 * It changes only by Swap, Reshuffle, or a repair of items that no longer fit; once used, the
 * next view makes a new one. `profile` is null until the person's record has loaded.
 */
export function useKeptPlan(
  routine: RoutineId,
  minutes: number,
  profile: Profile | null,
  history: HistorySummary | null,
): KeptPlanState {
  const { uid, plans, put, setItems } = usePlans()
  const { marks, loaded: marksLoaded } = useMarks()
  const [now] = useState(() => new Date())
  const today = todayKey(now)
  // Today's classes shape a new plan (spec 010 US4); wait for the schedule like the profile.
  const schedule = useSchedule()
  const covered = useMemo(
    () =>
      schedule.items !== null && schedule.attendance !== null
        ? covers(schedule.items, schedule.attendance, now)
        : null,
    [schedule.items, schedule.attendance, now],
  )
  const id = planId(routine, minutes)
  const watched = plans?.find((p) => p.id === id) ?? null
  const live = watched && watched.usedAt === null && watched.items.length > 0 ? watched : null
  /** The server's copy, read once when the watched list has no live plan. */
  const [fetched, setFetched] = useState<{ id: string; plan: KeptPlan | null } | null>(null)
  const [insufficient, setInsufficient] = useState<{
    id: string
    suggestion: RoutineId | null
  } | null>(null)

  const plansLoaded = plans !== null
  const input = useMemo<Omit<PlanInput, 'generation'> | null>(
    () =>
      plansLoaded && profile !== null && history !== null && marksLoaded && covered !== null
        ? { library: allExercises, profile, routine, minutes, marks, history, today, covered }
        : null,
    [plansLoaded, profile, history, marksLoaded, covered, routine, minutes, marks, today],
  )

  const fresh = (previous: KeptPlan | null) => {
    if (!input) return
    const generation = previous ? previous.generation + 1 : 0
    const result = makePlan({ ...input, generation })
    if (result.kind === 'insufficient') {
      setInsufficient({ id, suggestion: result.suggestion })
      return
    }
    const now = new Date()
    put({
      id,
      routine,
      minutes,
      generation,
      items: result.items.map((i) => ({ ...i, passed: [] })),
      notes: result.notes,
      shortOfTime: result.shortOfTime,
      plannedAt: now,
      viewedAt: now,
      usedAt: null,
      sessionId: null,
    })
  }

  // No live plan in the watched list: check the server before making one, so a fresh device's
  // empty cache can't replace a plan reviewed elsewhere.
  useEffect(() => {
    if (!input || live || fetched?.id === id) return
    let cancelled = false
    void getPlan(uid, id).then((plan) => !cancelled && setFetched({ id, plan }))
    return () => {
      cancelled = true
    }
  }, [input, live, fetched, id, uid])

  useEffect(() => {
    if (!input || live || fetched?.id !== id || insufficient?.id === id) return
    const server = fetched.plan
    // The server has a live plan the watcher hasn't delivered yet: wait for it.
    if (server && server.usedAt === null && server.items.length > 0) return
    fresh(server ?? watched)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, live, fetched, id, insufficient])

  // Items that no longer fit are replaced as soon as the plan is shown, and the change is kept.
  const repaired = useMemo(
    () =>
      live && input ? repairPlan({ ...input, generation: live.generation }, live.items) : null,
    [live, input],
  )
  useEffect(() => {
    if (!live || !repaired || repaired.notes.length === 0) return
    if (repaired.items.length === 0) fresh(live)
    else setItems(id, repaired.items, [...live.notes, ...repaired.notes])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, repaired])

  if (insufficient?.id === id && !live) {
    return { status: 'insufficient', suggestion: insufficient.suggestion }
  }
  if (!live || !input || !repaired || repaired.items.length === 0) return { status: 'loading' }

  const plan: KeptPlan =
    repaired.notes.length > 0
      ? { ...live, items: repaired.items, notes: [...live.notes, ...repaired.notes] }
      : live
  return {
    status: 'ready',
    plan,
    totalSeconds: plan.items.reduce((sum, i) => sum + i.seconds, 0),
    // A swap clears repair notes but keeps the notes about today's classes.
    swap: (index) =>
      setItems(
        id,
        swapItem({ ...input, generation: plan.generation }, plan.items, index),
        plan.notes.filter((n) => coverNotes(routine, input.covered).includes(n)),
      ),
    reshuffle: () => fresh(plan),
  }
}
