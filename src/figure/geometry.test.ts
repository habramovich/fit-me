import { describe, expect, it } from 'vitest'
import type { FigureSpec, Limbs, Pose } from '../exercises/types'
import {
  arrowPaths,
  breathFor,
  face,
  facingFor,
  interpolatePose,
  labelFor,
  limbPath,
  limbSegments,
  phaseAt,
  sideFacing,
  torsoOutline,
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

// Doodle (007)
type P = [number, number]
const joints = (el: P, wr: P, kn: P, an: P, to: P): Limbs => ({ el, wr, kn, an, to })
// Standing, knees bent forward (to the left), toes pointing left: a figure facing left.
const standing: Pose = {
  head: [97, 27],
  sh: [100, 50],
  hip: [102, 100],
  N: joints([100, 76], [98, 100], [96, 126], [100, 150], [88, 151]),
  F: joints([102, 76], [100, 100], [98, 126], [102, 150], [90, 151]),
}
const mirror = (p: Pose): Pose => {
  const m = (q: P): P => [250 - q[0], q[1]]
  const ml = (l: Limbs) => joints(m(l.el), m(l.wr), m(l.kn), m(l.an), m(l.to))
  return { head: m(p.head), sh: m(p.sh), hip: m(p.hip), N: ml(p.N), F: ml(p.F) }
}
// Lying on the back, head on the left.
const lying: Pose = {
  head: [40, 138],
  sh: [64, 137],
  hip: [122, 137],
  N: joints([90, 145], [116, 147], [150, 112], [166, 146], [182, 148]),
  F: joints([88, 143], [114, 145], [152, 112], [168, 146], [184, 148]),
}
const sideSpec = (kf: Pose, nose?: FigureSpec['nose']): FigureSpec => ({
  view: 'side',
  keyframes: [kf],
  arrows: [],
  labels: [],
  alt: '',
  nose,
})

describe('doodle facing', () => {
  it('guesses left for a standing figure facing left, and right for its mirror', () => {
    expect(sideFacing([standing])).toBe(1)
    expect(sideFacing([mirror(standing)])).toBe(-1)
  })

  it('puts the side-view eye and nose on the facing side', () => {
    const left = face(standing, 'side', 1)
    expect(left.nose![0]).toBeLessThan(standing.head[0])
    expect(left.eyes[0][0]).toBeLessThan(standing.head[0])
    expect(face(standing, 'side', -1).nose![0]).toBeGreaterThan(standing.head[0])
  })

  it('honours each nose override', () => {
    for (const [pose, nose, axis, sign] of [
      [lying, 'up', 1, -1],
      [lying, 'down', 1, 1],
      [standing, 'left', 0, -1],
      [standing, 'right', 0, 1],
    ] as const) {
      const n = face(pose, 'side', facingFor(sideSpec(pose, nose))).nose!
      expect(Math.sign(n[axis] - pose.head[axis])).toBe(sign)
    }
  })

  it('uses the guess without an override, and faces the viewer in front view', () => {
    expect(facingFor(sideSpec(standing))).toBe(sideFacing([standing]))
    expect(facingFor({ ...sideSpec(standing, 'right'), view: 'front' })).toBe(1)
  })

  it('draws two level eyes above the smile in front view (head upright)', () => {
    const f = face({ ...standing, head: [100, 27] }, 'front')
    expect(f.eyes).toHaveLength(2)
    expect(f.eyes[0][1]).toBeCloseTo(f.eyes[1][1])
    expect(f.nose).toBeUndefined()
    expect(Number(f.mouth.split(' ')[1])).toBeGreaterThan(f.eyes[0][1])
  })
})

describe('doodle outlines', () => {
  it('draws the shirt as a closed path', () => {
    const d = torsoOutline(interpolatePose(standing, standing, 0), 'side')
    expect(d.startsWith('M')).toBe(true)
    expect(d.endsWith('Z')).toBe(true)
  })

  it('draws a limb through every joint', () => {
    const d = limbPath([
      [0, 0],
      [10, 20],
      [30, 25],
    ])
    expect(d.startsWith('M0.0 0.0')).toBe(true)
    expect(d).toContain(' 10.0 20.0')
    expect(d.endsWith(' 30.0 25.0')).toBe(true)
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
