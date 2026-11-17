import { describe, expect, it } from 'vitest'
import { moodFor } from './mood'

const items = (...ids: string[]) => ids.map((exerciseId) => ({ exerciseId }))

describe('moodFor', () => {
  it('uses the routine for a plan', () => {
    expect(moodFor('plan:calm', [])).toBe('calm')
    expect(moodFor('plan:weekend', [])).toBe('calm')
    expect(moodFor('plan:desk', [])).toBe('steady')
    expect(moodFor('plan:strength', items('cat-cow'))).toBe('steady')
    expect(moodFor('plan:cardio', [])).toBe('upbeat')
  })

  it('takes the most common mood of a set', () => {
    expect(moodFor('set:a', items('march-in-place', 'heel-flicks', 'cat-cow'))).toBe('upbeat')
    expect(moodFor('set:a', items('bird-dog', 'calf-raises', 'march-in-place'))).toBe('steady')
    expect(moodFor('single:cat-cow', items('cat-cow'))).toBe('calm')
  })

  it('breaks a tie toward the calmer mood', () => {
    expect(moodFor('set:a', items('cat-cow', 'bird-dog'))).toBe('calm')
    expect(moodFor('set:a', items('bird-dog', 'march-in-place'))).toBe('steady')
  })

  it('is calm with no known exercises', () => {
    expect(moodFor('sample', [])).toBe('calm')
    expect(moodFor('set:a', items('no-such-exercise'))).toBe('calm')
    expect(moodFor('plan:unknown', [])).toBe('calm')
  })
})
