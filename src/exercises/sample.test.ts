import { describe, expect, it } from 'vitest'
import { SAMPLE_ORDER, estimateMinutes, sampleRoutine, singleRoutine } from './sample'

describe('sample routine', () => {
  it('has the eight favourites in order', () => {
    expect(sampleRoutine({}).map((i) => i.exerciseId)).toEqual([...SAMPLE_ORDER])
  })

  it('leaves out exercises marked Not for me, keeps favourites', () => {
    const ids = sampleRoutine({ 'glute-bridge': 'notForMe', 'dead-bug': 'favourite' }).map(
      (i) => i.exerciseId,
    )
    expect(ids).not.toContain('glute-bridge')
    expect(ids).toContain('dead-bug')
    expect(ids).toHaveLength(7)
  })

  it('takes about 15 minutes', () => {
    const minutes = estimateMinutes(sampleRoutine({}))
    expect(minutes).toBeGreaterThanOrEqual(12)
    expect(minutes).toBeLessThanOrEqual(20)
  })

  it('builds a single-exercise routine, falling back to standard', () => {
    expect(singleRoutine('bird-dog', 'easier')[0].version).toBe('easier')
    expect(singleRoutine('nope')).toEqual([])
  })
})
