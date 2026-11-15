import { describe, expect, it } from 'vitest'
import type { FigureSpec, Limbs, Pose } from '../exercises/types'
import {
  arrowPaths,
  breathFor,
  interpolatePose,
  labelFor,
  limbSegments,
  phaseAt,
  smoothstep,
  transitionArrows,
  DEFAULT_TIMING,
} from './geometry'

const limbs = (x: number): Limbs => ({
  el: [x, 100],
  wr: [x, 120],
  kn: [x, 140],
  an: [x, 150],
  to: [x + 10, 150],
})
const A: Pose = { head: [50, 50], sh: [60, 60], hip: [100, 60], N: limbs(10), F: limbs(20) }
const B: Pose = {
  head: [70, 30],
  sh: [60, 60],
  hip: [100, 20],
  ctrl: [80, 10],
  N: limbs(30),
  F: limbs(40),
}

const spec2: FigureSpec = {
  view: 'side',
  keyframes: [A, B],
  arrows: [[{ p: [0, 0], q: [10, 0], bend: 4 }]],
  labels: ['Up', 'Down'],
  breath: ['out', 'in'],
  alt: 'test',
}

describe('smoothstep', () => {
  it('clamps and eases', () => {
    expect(smoothstep(-1)).toBe(0)
    expect(smoothstep(0)).toBe(0)
    expect(smoothstep(0.5)).toBe(0.5)
    expect(smoothstep(1)).toBe(1)
    expect(smoothstep(2)).toBe(1)
    expect(smoothstep(0.25)).toBeLessThan(0.25)
  })
})

describe('phaseAt', () => {
  const { hold, move } = DEFAULT_TIMING
  it('holds on keyframe 0 at the start', () => {
    expect(phaseAt(0, 2)).toEqual({ transition: 0, k: 0, moving: false })
    expect(phaseAt(hold * 0.9, 2).moving).toBe(false)
  })
  it('moves from keyframe 0 to 1 after the hold', () => {
    const p = phaseAt(hold + move / 2, 2)
    expect(p.transition).toBe(0)
    expect(p.moving).toBe(true)
    expect(p.k).toBeCloseTo(0.5)
  })
  it('then holds and moves back on transition 1', () => {
    const p = phaseAt(hold + move + hold + move / 2, 2)
    expect(p.transition).toBe(1)
    expect(p.moving).toBe(true)
  })
  it('loops', () => {
    const period = 2 * (hold + move)
    expect(phaseAt(period + 0.01, 2).transition).toBe(0)
  })
  it('handles 3 keyframes', () => {
    expect(phaseAt(2 * (hold + move) + hold + move / 2, 3).transition).toBe(2)
  })
})

describe('interpolatePose', () => {
  it('returns the endpoints at k = 0 and 1', () => {
    expect(interpolatePose(A, B, 0).hip).toEqual(A.hip)
    expect(interpolatePose(A, B, 1).hip).toEqual(B.hip)
    expect(interpolatePose(A, B, 1).N.el).toEqual(B.N.el)
  })
  it('blends halfway', () => {
    const m = interpolatePose(A, B, 0.5)
    expect(m.head).toEqual([60, 40])
    expect(m.F.wr).toEqual([30, 120])
  })
  it('defaults the spine control to the straight midpoint', () => {
    expect(interpolatePose(A, B, 0).ctrl).toEqual([80, 60])
    expect(interpolatePose(A, B, 1).ctrl).toEqual([80, 10])
  })
})

describe('transitions', () => {
  it('uses the given arrows for transition 0', () => {
    expect(transitionArrows(spec2, 0)).toEqual(spec2.arrows[0])
  })
  it('reverses them for the return of a two-pose figure when not given', () => {
    expect(transitionArrows(spec2, 1)).toEqual([{ p: [10, 0], q: [0, 0], bend: -4 }])
  })
  it('gives each transition its label and breath', () => {
    expect(labelFor(spec2, 1)).toBe('Down')
    expect(breathFor(spec2, 0)).toBe('out')
    expect(breathFor({ ...spec2, breath: undefined }, 0)).toBeUndefined()
  })
})

describe('arrowPaths', () => {
  it('draws a line ending short of the tip and a head at the tip', () => {
    const { line, head } = arrowPaths({ p: [0, 0], q: [100, 0], bend: 0 })
    expect(line.startsWith('M0.0 0.0')).toBe(true)
    expect(head.startsWith('M100.0 0.0')).toBe(true)
    expect(line).toContain('93.0 0.0')
  })
})

describe('limbSegments', () => {
  it('attaches side-view limbs at the shoulder and hip', () => {
    const segs = limbSegments(A, 'side')
    const nearThigh = segs.find((s) => s.side === 'N' && s.part === 'thigh')!
    expect([nearThigh.x1, nearThigh.y1]).toEqual(A.hip)
  })
  it('offsets front-view limbs to each side', () => {
    const segs = limbSegments(A, 'front')
    const right = segs.find((s) => s.side === 'N' && s.part === 'upperArm')!
    const left = segs.find((s) => s.side === 'F' && s.part === 'upperArm')!
    expect(right.x1).toBeLessThan(A.sh[0])
    expect(left.x1).toBeGreaterThan(A.sh[0])
  })
})
