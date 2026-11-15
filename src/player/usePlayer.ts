// Drives the player machine: wall-clock ticks, pause when hidden, session saving, wake lock.
import { useEffect, useMemo, useReducer, useRef } from 'react'
import { markPlanUsed } from '../data/repo/plans'
import { finishSession, recordItems, startSession, type SessionItem } from '../data/repo/sessions'
import { initPlayer, playerReducer, type PlayItem, type PlayerState } from './machine'
import { useWakeLock, type WakeLockStatus } from './wakeLock'

export interface UsePlayer {
  state: PlayerState
  dispatch: React.Dispatch<Parameters<typeof playerReducer>[1]>
  wakeLock: WakeLockStatus
}

function toSessionItems(items: PlayItem[], outcomes: PlayerState['outcomes']): SessionItem[] {
  const out: SessionItem[] = []
  outcomes.forEach((o, i) => {
    if (!o) return
    const item = items[i]
    out.push({
      exerciseId: item.exerciseId,
      version: item.version,
      outcome: o.outcome,
      rating: o.rating,
    })
  })
  return out
}

export function usePlayer(
  items: PlayItem[],
  routine: string,
  uid: string | null,
  /** A kept plan being played: marked used on the first exercise done (spec 006 FR-004). */
  planId?: string,
): UsePlayer {
  const [state, dispatch] = useReducer(playerReducer, items, initPlayer)
  const sessionId = useRef<string | null>(null)
  // Latest active seconds, read when saving (ticks alone never cause a write).
  const elapsed = useRef(0)
  useEffect(() => {
    elapsed.current = state.elapsed
  }, [state.elapsed])
  const finished = state.phase === 'finished'
  const wakeLock = useWakeLock(!finished)

  // One tick per wall-clock second, so throttled timers don't drift.
  useEffect(() => {
    let last = Date.now()
    const timer = setInterval(() => {
      const now = Date.now()
      let elapsed = Math.floor((now - last) / 1000)
      if (elapsed <= 0) return
      last += elapsed * 1000
      // After a long background gap, don't fast-forward through the session.
      elapsed = Math.min(elapsed, 2)
      for (let i = 0; i < elapsed; i++) dispatch({ type: 'tick' })
    }, 250)
    return () => clearInterval(timer)
  }, [])

  // Pause when the app goes to the background.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden') dispatch({ type: 'hidden' })
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Save the session: create on start, update as outcomes change, finish at the end.
  // Depends on `outcomes` only, so the per-second ticks never cause a write.
  const { outcomes } = state
  const sessionItems = useMemo(() => toSessionItems(state.items, outcomes), [state.items, outcomes])
  useEffect(() => {
    if (!uid || items.length === 0) return
    if (sessionId.current === null) sessionId.current = startSession(uid, routine)
  }, [uid, routine, items.length])
  useEffect(() => {
    if (!uid || sessionId.current === null) return
    if (finished) finishSession(uid, sessionId.current, sessionItems, elapsed.current)
    else if (sessionItems.length > 0)
      recordItems(uid, sessionId.current, sessionItems, elapsed.current)
  }, [uid, finished, sessionItems])

  const planUsed = useRef(false)
  useEffect(() => {
    if (!uid || !planId || planUsed.current || sessionId.current === null) return
    if (!sessionItems.some((i) => i.outcome === 'done')) return
    planUsed.current = true
    markPlanUsed(uid, planId, sessionId.current)
  }, [uid, planId, sessionItems])

  return { state, dispatch, wakeLock }
}
