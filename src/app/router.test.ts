import { describe, expect, it } from 'vitest'
import { href, parseRoute, updateTrail, type Route } from './router'

describe('in-app trail', () => {
  it('pushes new screens and pops on back', () => {
    let t = ['#/today']
    t = updateTrail(t, '#/plan?r=calm')
    t = updateTrail(t, '#/library/cat-cow')
    expect(t).toEqual(['#/today', '#/plan?r=calm', '#/library/cat-cow'])
    t = updateTrail(t, '#/plan?r=calm') // browser back
    expect(t).toEqual(['#/today', '#/plan?r=calm'])
    t = updateTrail(t, '#/plan?r=calm') // same hash again
    expect(t).toEqual(['#/today', '#/plan?r=calm'])
  })
})

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

  it('parses plan params, clamping bad values and ignoring old shuffle/swap params', () => {
    expect(parseRoute('#/plan?r=desk&m=5&s=2&w=1.2,3.1')).toEqual({
      name: 'plan',
      plan: { routine: 'desk', minutes: 5 },
    })
    expect(parseRoute('#/plan?r=nope&m=999')).toEqual({
      name: 'plan',
      plan: { routine: 'calm', minutes: 90 },
    })
  })

  it('parses sets and the library add mode', () => {
    expect(parseRoute('#/set/abc')).toEqual({ name: 'set', id: 'abc' })
    expect(parseRoute('#/library?addTo=abc&phase=cooldown')).toEqual({
      name: 'library',
      addTo: 'abc',
      phase: 'cooldown',
    })
    expect(parseRoute('#/library?addTo=abc&phase=nope')).toMatchObject({ phase: 'main' })
  })

  it('parses setup steps', () => {
    expect(parseRoute('#/setup/3')).toEqual({ name: 'setup', step: 3 })
    expect(parseRoute('#/setup/9')).toEqual({ name: 'setup', step: 6 })
  })

  it('round-trips through href', () => {
    const routes: Route[] = [
      { name: 'today' },
      { name: 'library' },
      { name: 'exercise', id: 'bird-dog' },
      { name: 'player', routine: 'single:bird-dog', version: 'harder' },
      { name: 'profile' },
      { name: 'review' },
      { name: 'setup', step: 2 },
      { name: 'set', id: 'abc' },
      { name: 'library', addTo: 'abc', phase: 'warmup' },
      { name: 'plan', plan: { routine: 'strength', minutes: 20 } },
      { name: 'player', routine: 'plan', plan: { routine: 'calm', minutes: 15 } },
    ]
    for (const r of routes) {
      const parsed = parseRoute(href(r))
      expect(parsed).toEqual(r.name === 'player' ? { ...r } : r)
    }
  })
})
