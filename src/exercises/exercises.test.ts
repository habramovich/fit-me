// Validates every exercise against specs/002-exercise-library-player/data-model.md.
import { describe, expect, it } from 'vitest'
import { transitionArrows } from '../figure/geometry'
import { allExercises, estimateSeconds, formatDose, formatRange, searchExercises } from './index'
import type { FigureSpec, Limbs, Point, Pose, Version } from './types'

const isPoint = (p: unknown): p is Point =>
  Array.isArray(p) &&
  p.length === 2 &&
  p.every((n) => typeof n === 'number' && Number.isFinite(n) && n >= -10 && n <= 260)

function checkLimbs(l: Limbs) {
  for (const j of ['el', 'wr', 'kn', 'an', 'to'] as const) expect(isPoint(l[j]), j).toBe(true)
}

function checkPose(p: Pose) {
  for (const j of ['head', 'sh', 'hip'] as const) expect(isPoint(p[j]), j).toBe(true)
  if (p.ctrl) expect(isPoint(p.ctrl)).toBe(true)
  checkLimbs(p.N)
  checkLimbs(p.F)
}

function checkFigure(f: FigureSpec, repeated: boolean) {
  const n = f.keyframes.length
  expect(n).toBeGreaterThanOrEqual(2)
  expect(n).toBeLessThanOrEqual(4)
  f.keyframes.forEach(checkPose)
  expect(f.labels).toHaveLength(n)
  f.labels.forEach((l) => expect(l.length).toBeGreaterThan(0))
  for (let i = 0; i < n; i++) {
    const arrows = transitionArrows(f, i)
    // A ring (hoop) can show the path instead of arrows.
    expect(arrows.length, `arrows for transition ${i}`).toBeGreaterThanOrEqual(f.ring ? 0 : 1)
    expect(arrows.length).toBeLessThanOrEqual(2)
    arrows.forEach((a) => expect(isPoint(a.p) && isPoint(a.q)).toBe(true))
  }
  if (f.breath) expect(f.breath).toHaveLength(n)
  if (repeated && f.view === 'side') {
    expect(f.breath, 'repeated side-view movements say when to breathe in and out').toBeDefined()
  }
  expect(f.alt.length).toBeGreaterThan(20)
}

function checkVersion(v: Version) {
  const d = v.dose
  const [min, max] = d.range
  if (d.kind === 'reps') {
    expect(min).toBeGreaterThanOrEqual(1)
    expect(max).toBeLessThanOrEqual(50)
    expect(d.reps).toBeGreaterThanOrEqual(min)
    expect(d.reps).toBeLessThanOrEqual(max)
    expect(d.sets).toBeGreaterThanOrEqual(1)
    expect(d.sets).toBeLessThanOrEqual(5)
  } else {
    expect(min).toBeGreaterThanOrEqual(5)
    expect(max).toBeLessThanOrEqual(300)
    expect(d.seconds).toBeGreaterThanOrEqual(min)
    expect(d.seconds).toBeLessThanOrEqual(max)
  }
  expect(v.steps.length).toBeGreaterThanOrEqual(2)
  expect(v.steps.length).toBeLessThanOrEqual(6)
  expect(v.cues.length).toBeGreaterThanOrEqual(2)
  expect(v.cues.length).toBeLessThanOrEqual(3)
  expect(v.breathing.length).toBeGreaterThan(10)
  checkFigure(v.figure, d.kind === 'reps')
}

describe('exercise library', () => {
  it('has unique kebab-case ids', () => {
    const ids = allExercises.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/))
  })

  it('contains the owner’s eight favourites (FR-007)', () => {
    const ids = allExercises.map((e) => e.id)
    for (const id of [
      'pelvic-tilts',
      'cat-cow',
      'hip-circles',
      'shoulder-rotations',
      'dead-bug',
      'glute-bridge',
      'figure-four',
      'bird-dog',
    ]) {
      expect(ids).toContain(id)
    }
  })

  describe.each(allExercises.map((e) => [e.id, e] as const))('%s', (_id, e) => {
    it('has complete metadata', () => {
      expect(e.name.length).toBeGreaterThan(0)
      expect(e.name.length).toBeLessThanOrEqual(40)
      expect(e.worksAreas.length).toBeGreaterThan(0)
      expect(e.equipment.length).toBeGreaterThan(0)
      expect(e.phases.length).toBeGreaterThan(0)
      expect(e.batch).toBeGreaterThanOrEqual(1)
    })

    it('has valid versions', () => {
      checkVersion(e.standard)
      if (e.easier) checkVersion(e.easier)
      if (e.harder) checkVersion(e.harder)
    })

    it('has a low-impact version if cardio (FR-002b)', () => {
      if (e.technique !== 'cardio') return
      const versions = [e.standard, e.easier, e.harder].filter(Boolean) as Version[]
      expect(versions.some((v) => v.lowImpact)).toBe(true)
    })
  })
})

describe('helpers', () => {
  it('searches by name, technique and body area', () => {
    expect(searchExercises('bird').map((e) => e.id)).toEqual(['bird-dog'])
    expect(searchExercises('hips').length).toBeGreaterThan(1)
    expect(searchExercises('YOGA').every((e) => e.technique === 'yoga')).toBe(true)
    expect(searchExercises('')).toHaveLength(allExercises.length)
    expect(searchExercises('zzz')).toHaveLength(0)
  })

  it('formats doses and ranges', () => {
    expect(formatDose({ kind: 'reps', reps: 8, range: [6, 10], sets: 2, perSide: true })).toBe(
      '2 × 8 per side',
    )
    expect(formatDose({ kind: 'reps', reps: 10, range: [8, 15], sets: 1, perSide: false })).toBe(
      '10',
    )
    expect(formatDose({ kind: 'time', seconds: 30, range: [20, 45], perSide: true })).toBe(
      '30 s per side',
    )
    expect(formatRange({ kind: 'time', seconds: 30, range: [20, 45], perSide: true })).toBe(
      '20–45 s recommended',
    )
  })

  it('estimates time including both sides and rests', () => {
    const v = allExercises.find((e) => e.id === 'dead-bug')!.standard
    // 8 reps × 2 sets × 2 sides × 4 s + 20 s rest + 10 s transition
    expect(estimateSeconds(v)).toBe(8 * 2 * 2 * 4 + 20 + 10)
  })
})
