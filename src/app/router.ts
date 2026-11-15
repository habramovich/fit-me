// Minimal hash routing (research R8): #/today, #/library, #/library/<id>, #/plan?…, #/player?…
import { useEffect, useState } from 'react'
import type { Phase } from '../exercises/types'
import type { RoutineId } from '../profile/types'

/** A plan is identified by routine and length; its content is kept (spec 006). */
export interface PlanParams {
  routine: RoutineId
  minutes: number
}

export type Route =
  | { name: 'today' }
  | { name: 'library'; addTo?: string; phase?: Phase }
  | { name: 'set'; id: string }
  | { name: 'exercise'; id: string }
  | { name: 'plan'; plan: PlanParams }
  | { name: 'player'; routine: string; version?: string; plan?: PlanParams }
  | { name: 'setup'; step: number }
  | { name: 'schedule' }
  | { name: 'progress' }
  | { name: 'profile' }
  | { name: 'review' }

const PHASES: Phase[] = ['warmup', 'main', 'cooldown']
const ROUTINE_IDS: RoutineId[] = ['calm', 'desk', 'strength', 'weekend', 'cardio']

// Links from before 006 may still carry `s` (shuffle) and `w` (swaps); they are ignored.
function parsePlan(params: URLSearchParams): PlanParams {
  const r = params.get('r') as RoutineId | null
  return {
    routine: r && ROUTINE_IDS.includes(r) ? r : 'calm',
    minutes: Math.min(90, Math.max(5, Number(params.get('m')) || 15)),
  }
}

function planQuery(p: PlanParams): URLSearchParams {
  return new URLSearchParams({ r: p.routine, m: String(p.minutes) })
}

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '')
  const [path, query = ''] = raw.split('?')
  const parts = path.split('/').filter(Boolean)
  const params = new URLSearchParams(query)
  switch (parts[0]) {
    case 'library':
      if (parts[1]) return { name: 'exercise', id: decodeURIComponent(parts[1]) }
      return params.get('addTo')
        ? {
            name: 'library',
            addTo: params.get('addTo')!,
            phase: PHASES.includes(params.get('phase') as Phase)
              ? (params.get('phase') as Phase)
              : 'main',
          }
        : { name: 'library' }
    case 'set':
      return parts[1] ? { name: 'set', id: decodeURIComponent(parts[1]) } : { name: 'today' }
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
    case 'library':
      return route.addTo
        ? `#/library?${new URLSearchParams({ addTo: route.addTo, phase: route.phase ?? 'main' })}`
        : '#/library'
    case 'set':
      return `#/set/${encodeURIComponent(route.id)}`
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

// In-app history, so Back can return to the previous screen (spec 004 FR-010).
// A hash change to the entry before the top is a "back"; anything else is a new screen.
export function updateTrail(trail: string[], hash: string): string[] {
  if (trail.length >= 2 && trail[trail.length - 2] === hash) return trail.slice(0, -1)
  if (trail[trail.length - 1] === hash) return trail
  return [...trail, hash].slice(-50)
}
let trail: string[] = typeof window === 'undefined' ? [] : [window.location.hash]

/** Back to the previous in-app screen, or to `fallback` when the app was opened here. */
export function goBack(fallback: Route): void {
  if (trail.length >= 2) window.history.back()
  else navigate(fallback)
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  useEffect(() => {
    const update = () => {
      trail = updateTrail(trail, window.location.hash)
      setRoute(parseRoute(window.location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return route
}
