// Minimal hash routing (research R8): #/today, #/library, #/library/<id>, #/plan?…, #/player?…
import { useEffect, useState } from 'react'
import type { RoutineId } from '../profile/types'

export interface PlanParams {
  routine: RoutineId
  minutes: number
  shuffle: number
  /** Item index → times swapped. */
  swaps: Record<number, number>
}

export type Route =
  | { name: 'today' }
  | { name: 'library' }
  | { name: 'exercise'; id: string }
  | { name: 'plan'; plan: PlanParams }
  | { name: 'player'; routine: string; version?: string; plan?: PlanParams }
  | { name: 'setup'; step: number }
  | { name: 'schedule' }
  | { name: 'progress' }
  | { name: 'profile' }
  | { name: 'review' }

const ROUTINE_IDS: RoutineId[] = ['calm', 'desk', 'strength', 'weekend', 'cardio']

function parsePlan(params: URLSearchParams): PlanParams {
  const r = params.get('r') as RoutineId | null
  const swaps: Record<number, number> = {}
  for (const pair of (params.get('w') ?? '').split(',').filter(Boolean)) {
    const [i, n] = pair.split('.').map(Number)
    if (Number.isInteger(i) && Number.isInteger(n) && n > 0) swaps[i] = n
  }
  return {
    routine: r && ROUTINE_IDS.includes(r) ? r : 'calm',
    minutes: Math.min(90, Math.max(5, Number(params.get('m')) || 15)),
    shuffle: Math.max(0, Number(params.get('s')) || 0),
    swaps,
  }
}

function planQuery(p: PlanParams): URLSearchParams {
  const q = new URLSearchParams({ r: p.routine, m: String(p.minutes), s: String(p.shuffle) })
  const w = Object.entries(p.swaps)
    .filter(([, n]) => n > 0)
    .map(([i, n]) => `${i}.${n}`)
    .join(',')
  if (w) q.set('w', w)
  return q
}

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '')
  const [path, query = ''] = raw.split('?')
  const parts = path.split('/').filter(Boolean)
  const params = new URLSearchParams(query)
  switch (parts[0]) {
    case 'library':
      return parts[1] ? { name: 'exercise', id: decodeURIComponent(parts[1]) } : { name: 'library' }
    case 'plan':
      return { name: 'plan', plan: parsePlan(params) }
    case 'player': {
      const routine = params.get('routine') ?? 'sample'
      return {
        name: 'player',
        routine,
        version: params.get('v') ?? undefined,
        plan: routine === 'plan' ? parsePlan(params) : undefined,
      }
    }
    case 'setup':
      return { name: 'setup', step: Math.min(6, Math.max(1, Number(parts[1]) || 1)) }
    case 'schedule':
    case 'progress':
    case 'profile':
    case 'review':
      return { name: parts[0] }
    default:
      return { name: 'today' }
  }
}

export function href(route: Route): string {
  switch (route.name) {
    case 'exercise':
      return `#/library/${encodeURIComponent(route.id)}`
    case 'plan':
      return `#/plan?${planQuery(route.plan).toString()}`
    case 'player': {
      const p = route.plan ? planQuery(route.plan) : new URLSearchParams()
      p.set('routine', route.routine)
      if (route.version) p.set('v', route.version)
      return `#/player?${p.toString()}`
    }
    case 'setup':
      return `#/setup/${route.step}`
    default:
      return `#/${route.name}`
  }
}

export function navigate(route: Route): void {
  window.location.hash = href(route)
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  useEffect(() => {
    const update = () => {
      setRoute(parseRoute(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return route
}
