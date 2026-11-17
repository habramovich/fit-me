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

describe('withDefaults: sound (009)', () => {
  it('defaults to music off and cues on', () => {
    expect(withDefaults(null).sessionMusic).toBe(false)
    expect(withDefaults(null).soundCues).toBe(true)
    expect(withDefaults({ weeklyMinutes: 60 }).sessionMusic).toBe(false)
  })

  it('keeps stored choices', () => {
    const p = withDefaults({ sessionMusic: true, soundCues: false })
    expect(p.sessionMusic).toBe(true)
    expect(p.soundCues).toBe(false)
  })

  it('reads a non-boolean value as the default', () => {
    const stored = { sessionMusic: 'yes', soundCues: 0 } as unknown as Partial<Profile>
    expect(withDefaults(stored).sessionMusic).toBe(false)
    expect(withDefaults(stored).soundCues).toBe(true)
  })
})
