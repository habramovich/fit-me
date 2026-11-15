// Minimal hash routing (research R8): #/today, #/library, #/library/<id>, #/player?…, etc.
import { useEffect, useState } from 'react'

export type Route =
  | { name: 'today' }
  | { name: 'library' }
  | { name: 'exercise'; id: string }
  | { name: 'player'; routine: string; version?: string }
  | { name: 'schedule' }
  | { name: 'progress' }
  | { name: 'profile' }
  | { name: 'review' }

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#\/?/, '')
  const [path, query = ''] = raw.split('?')
  const parts = path.split('/').filter(Boolean)
  const params = new URLSearchParams(query)
  switch (parts[0]) {
    case 'library':
      return parts[1] ? { name: 'exercise', id: decodeURIComponent(parts[1]) } : { name: 'library' }
    case 'player':
      return {
        name: 'player',
        routine: params.get('routine') ?? 'sample',
        version: params.get('v') ?? undefined,
      }
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
    case 'player': {
      const p = new URLSearchParams({ routine: route.routine })
      if (route.version) p.set('v', route.version)
      return `#/player?${p.toString()}`
    }
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
