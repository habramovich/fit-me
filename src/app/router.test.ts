import { describe, expect, it } from 'vitest'
import { href, parseRoute, type Route } from './router'

describe('router', () => {
  it('defaults to today', () => {
    expect(parseRoute('')).toEqual({ name: 'today' })
    expect(parseRoute('#/nonsense')).toEqual({ name: 'today' })
  })

  it('parses library and exercise routes', () => {
    expect(parseRoute('#/library')).toEqual({ name: 'library' })
    expect(parseRoute('#/library/dead-bug')).toEqual({ name: 'exercise', id: 'dead-bug' })
  })

  it('parses the player with routine and version', () => {
    expect(parseRoute('#/player?routine=single%3Adead-bug&v=easier')).toEqual({
      name: 'player',
      routine: 'single:dead-bug',
      version: 'easier',
    })
    expect(parseRoute('#/player')).toEqual({
      name: 'player',
      routine: 'sample',
      version: undefined,
    })
  })

  it('round-trips through href', () => {
    const routes: Route[] = [
      { name: 'today' },
      { name: 'library' },
      { name: 'exercise', id: 'bird-dog' },
      { name: 'player', routine: 'single:bird-dog', version: 'harder' },
      { name: 'profile' },
      { name: 'review' },
    ]
    for (const r of routes) {
      const parsed = parseRoute(href(r))
      expect(parsed).toEqual(r.name === 'player' ? { ...r } : r)
    }
  })
})
