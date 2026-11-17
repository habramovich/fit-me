import { describe, expect, it } from 'vitest'
import { MAJOR, MOOD_DEFS, makeComposer, type NoteEvent } from './compose'
import { MOODS } from './mood'

const PITCHED = new Set(['pad', 'bell', 'pluck', 'bass'])

function bars(mood: (typeof MOODS)[number], seed: number, minutes: number): NoteEvent[][] {
  const c = makeComposer(mood, seed)
  const n = Math.ceil((minutes * 60) / c.secondsPerBar)
  return Array.from({ length: n }, () => c.nextBar())
}

/** A bar's pitched content (no pad, which is held across bars), as a comparable string. */
const tune = (bar: NoteEvent[]) =>
  bar
    .filter((e) => e.voice !== 'pad' && PITCHED.has(e.voice))
    .map((e) => `${e.voice}${e.beat}:${e.midi}`)
    .join(' ')

describe('makeComposer', () => {
  it('is deterministic for a seed and varies between seeds', () => {
    for (const mood of MOODS) {
      expect(bars(mood, 7, 1)).toEqual(bars(mood, 7, 1))
      expect(bars(mood, 7, 1)).not.toEqual(bars(mood, 8, 1))
    }
  })

  it('writes well-formed bars in the key', () => {
    for (const mood of MOODS) {
      const { root } = MOOD_DEFS[mood]
      for (const bar of bars(mood, 3, 10)) {
        for (const e of bar) {
          expect(e.beat).toBeGreaterThanOrEqual(0)
          expect(e.beat).toBeLessThan(4)
          expect(e.velocity).toBeGreaterThan(0)
          expect(e.velocity).toBeLessThanOrEqual(1)
          expect(e.beats).toBeGreaterThan(0)
          if (PITCHED.has(e.voice)) expect(MAJOR).toContain((((e.midi - root) % 12) + 12) % 12)
        }
      }
    }
  })

  it('gives each mood its own character', () => {
    const calm = bars('calm', 1, 2).flat()
    expect(calm.some((e) => e.voice === 'kick' || e.voice === 'shaker')).toBe(false)
    expect(calm.some((e) => e.voice === 'pad')).toBe(true)
    for (const bar of bars('upbeat', 1, 2)) {
      const kicks = bar.filter((e) => e.voice === 'kick').map((e) => e.beat)
      expect(kicks).toEqual([0, 1, 2, 3])
    }
    expect(MOOD_DEFS.calm.bpm).toBeLessThan(MOOD_DEFS.steady.bpm)
    expect(MOOD_DEFS.steady.bpm).toBeLessThan(MOOD_DEFS.upbeat.bpm)
  })

  it('does not loop over a 10-minute session (FR-006)', () => {
    for (const mood of MOODS) {
      for (const seed of [1, 2, 3]) {
        const tunes = bars(mood, seed, 10).map(tune)
        const windows = new Set<string>()
        for (let i = 0; i + 8 <= tunes.length; i++) {
          const w = tunes.slice(i, i + 8).join(' | ')
          expect(windows.has(w)).toBe(false)
          windows.add(w)
        }
        for (let i = 0; i + 8 <= tunes.length; i++) {
          const a = tunes.slice(i, i + 4).join(' | ')
          const b = tunes.slice(i + 4, i + 8).join(' | ')
          expect(a).not.toBe(b)
        }
      }
    }
  })
})
