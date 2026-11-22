import { describe, expect, it } from 'vitest'
import { suggestGoals, suggestTechniques } from './suggest'
import { DEFAULT_PROFILE, withDefaults } from './types'

describe('suggestions', () => {
  it('suggests mobility, balance and bone strength for a woman in her 50s', () => {
    expect(suggestGoals({ ageRange: '50s', sex: 'woman' })).toEqual(
      expect.arrayContaining(['mobility', 'balance', 'boneStrength', 'strength']),
    )
  })

  it('suggests at least mobility with no age given', () => {
    expect(suggestGoals({ ageRange: null, sex: null })).toContain('mobility')
  })

  it('gives "Lots" to the two techniques the goals point to most, "Some" to the rest', () => {
    const t = suggestTechniques(['stressRelief', 'boneStrength'])
    expect(t.yoga).toBe('lots')
    expect(t.taichi).toBe('lots')
    expect(t.strength).toBe('some')
    expect(t.cardio).toBe('some')
  })

  it('suits a woman in her 50s who wants mobility and calm: mobility and yoga lead', () => {
    const goals = [...suggestGoals({ ageRange: '50s', sex: 'woman' }), 'stressRelief' as const]
    const t = suggestTechniques(goals)
    expect(t.mobility).toBe('lots')
    expect(t.yoga).toBe('lots')
    expect(t.strength).toBe('some')
    expect(t.taichi).toBe('some')
  })

  it('suggests nothing as None', () => {
    expect(Object.values(suggestTechniques([]))).toEqual([
      'some',
      'some',
      'some',
      'some',
      'some',
      'some',
    ])
  })

  it('points Flexibility to Stretching and Yoga (011)', () => {
    const t = suggestTechniques(['flexibility'])
    expect(t.stretching).toBe('lots')
    expect(t.yoga).toBe('lots')
    expect(t.mobility).toBe('some')
  })
})

describe('withDefaults', () => {
  it('fills a missing profile and partial nested fields', () => {
    expect(withDefaults(undefined)).toEqual(DEFAULT_PROFILE)
    const p = withDefaults({
      techniques: { yoga: 'lots' } as never,
      routineMinutes: { calm: 20 } as never,
    })
    expect(p.techniques.yoga).toBe('lots')
    expect(p.techniques.cardio).toBe('some')
    expect(p.routineMinutes.calm).toBe(20)
    expect(p.routineMinutes.desk).toBe(5)
  })
})
