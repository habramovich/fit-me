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

describe('withDefaults: stretching (011)', () => {
  it('follows the stored Mobility amount until Stretching is chosen', () => {
    const techniques = { ...DEFAULT_PROFILE.techniques, mobility: 'none' } as Record<
      string,
      unknown
    >
    delete techniques.stretching
    expect(withDefaults({ techniques } as Partial<Profile>).techniques.stretching).toBe('none')
    expect(withDefaults({ techniques: { mobility: 'lots' } as never }).techniques.stretching).toBe(
      'lots',
    )
  })

  it('keeps a chosen Stretching amount', () => {
    const p = withDefaults({
      techniques: { ...DEFAULT_PROFILE.techniques, mobility: 'none', stretching: 'lots' },
    })
    expect(p.techniques.stretching).toBe('lots')
  })

  it('defaults to Some', () => {
    expect(withDefaults(null).techniques.stretching).toBe('some')
  })
})

describe('withDefaults: showPoses (011)', () => {
  it('is off by default and keeps a stored choice', () => {
    expect(withDefaults(null).showPoses).toBe(false)
    expect(withDefaults({ showPoses: true }).showPoses).toBe(true)
  })

  it('reads a non-boolean value as off', () => {
    expect(withDefaults({ showPoses: 'yes' } as unknown as Partial<Profile>).showPoses).toBe(false)
  })
})
