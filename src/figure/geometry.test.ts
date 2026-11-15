import { describe, expect, it } from 'vitest'
import type { FigureSpec, Limbs, Pose } from '../exercises/types'
import {
  arrowPaths,
  breathFor,
  holdEntrySeconds,
  holdPhaseAt,
  interpolatePose,
  labelFor,
  limbSegments,
  phaseAt,
  timingFor,
  ringDot,
  ringPaths,
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

describe('timing per pace (006 US2)', () => {
  const cycle = (t: { hold: number; move: number }, n: number) => n * (t.hold + t.move)

  it('slow: one cycle takes one repetition, with a short pause in each pose', () => {
    const t = timingFor('slow', 2, 4)
    expect(cycle(t, 2)).toBeCloseTo(4)
    expect(t.hold).toBeGreaterThan(0)
    expect(t.hold).toBeLessThan(t.move)
    expect(cycle(timingFor('slow', 4, 6), 4)).toBeCloseTo(6)
  })

  it('flowing: never pauses; reps follow their time, timed forms move slowly', () => {
    expect(timingFor('flowing', 2, 10)).toEqual({ hold: 0, move: 5 })
    expect(timingFor('flowing', 2).hold).toBe(0)
    expect(timingFor('flowing', 2).move).toBeGreaterThanOrEqual(2)
    expect(phaseAt(0.01, 2, timingFor('flowing', 2)).moving).toBe(true)
  })

  it('brisk: a two-pose step cycle takes at most a second', () => {
    expect(cycle(timingFor('brisk', 2), 2)).toBeLessThanOrEqual(1)
    expect(timingFor('brisk', 2).move).toBeLessThan(timingFor('slow', 2, 3).move)
  })

  it('hold: moves into the held pose, then stays there', () => {
    const t = timingFor('hold', 2)
    const entry = holdEntrySeconds(1, t)
    expect(holdPhaseAt(0, 2, 1, t)).toEqual({ transition: 0, k: 0, moving: false })
    expect(holdPhaseAt(entry / 2 + 0.3, 2, 1, t).moving).toBe(true)
    for (const s of [entry, entry + 5, entry + 60]) {
      expect(holdPhaseAt(s, 2, 1, t)).toEqual({ transition: 1, k: 0, moving: false, held: true })
    }
    // A three-pose hold goes through the middle pose to the last.
    expect(holdPhaseAt(holdEntrySeconds(2, t) + 1, 3, 2, t).transition).toBe(2)
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

describe('ring', () => {
  const ring = {
    center: [100, 100] as [number, number],
    rx: 30,
    ry: 10,
    start: Math.PI,
    dir: -1 as const,
  }

  it('starts at the given angle and moves a quarter turn per transition (4 keyframes)', () => {
    const at0 = ringDot(ring, 4, { transition: 0, k: 0, moving: false }).point
    expect(at0[0]).toBeCloseTo(70)
    expect(at0[1]).toBeCloseTo(100)
    const at1 = ringDot(ring, 4, { transition: 1, k: 0, moving: false })
    expect(at1.point[0]).toBeCloseTo(100)
    expect(at1.point[1]).toBeCloseTo(110) // front (bottom) of the hoop
    expect(at1.front).toBe(true)
    expect(ringDot(ring, 4, { transition: 3, k: 0, moving: false }).front).toBe(false)
  })

  it('draws the back half over the top and the front half under', () => {
    const { back, front } = ringPaths(ring)
    expect(back).toBe('M130.0 100.0 A30 10 0 0 0 70.0 100.0')
    expect(front).toBe('M70.0 100.0 A30 10 0 0 0 130.0 100.0')
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
