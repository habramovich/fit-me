import { describe, expect, it } from 'vitest'
import { DEFAULT_PROFILE, withDefaults, type Profile } from './types'

describe('withDefaults: figureStyle', () => {
  it('defaults to classic when missing', () => {
    expect(DEFAULT_PROFILE.figureStyle).toBe('classic')
    expect(withDefaults(null).figureStyle).toBe('classic')
    expect(withDefaults({ weeklyMinutes: 60 }).figureStyle).toBe('classic')
  })

  it('keeps a stored doodle choice', () => {
    expect(withDefaults({ figureStyle: 'doodle' }).figureStyle).toBe('doodle')
  })

  it('reads an unknown value as classic', () => {
    const stored = { figureStyle: 'watercolour' } as unknown as Partial<Profile>
    expect(withDefaults(stored).figureStyle).toBe('classic')
  })
})
