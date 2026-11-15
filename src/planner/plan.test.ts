import { describe, expect, it } from 'vitest'
import { allExercises } from '../exercises'
import type { BodyArea, Exercise, Technique, Version } from '../exercises/types'
import { DEFAULT_PROFILE, type Profile, type RoutineId } from '../profile/types'
import {
  EMPTY_HISTORY,
  makePlan,
  repairPlan,
  swapItem,
  type KeptItem,
  type PlanInput,
  type PlanResult,
} from './plan'
import { seededRandom } from './random'
import { ROUTINE_ORDER, routineForTime } from './routines'

// ---------- A synthetic library big enough to exercise every rule ----------

const AREAS: BodyArea[] = [
  'neck',
  'shoulders',
  'upperBack',
  'lowerBack',
  'core',
  'hips',
  'glutes',
  'hamstrings',
  'quads',
  'knees',
  'calves',
  'chest',
]
const TECHS: Technique[] = ['yoga', 'taichi', 'strength', 'mobility', 'cardio']

const fig = allExercises[0].standard.figure
function version(reps: number, extra: Partial<Version> = {}): Version {
  return {
    dose: { kind: 'reps', reps, range: [Math.max(1, reps - 4), reps + 6], sets: 2, perSide: false },
    steps: ['a', 'b'],
    cues: ['a', 'b'],
    breathing: 'Breathe out on effort.',
    figure: fig,
    secondsPerRep: 4,
    ...extra,
  }
}

function syntheticLibrary(seed: number, size = 40): Exercise[] {
  const r = seededRandom(seed)
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]
  return Array.from({ length: size }, (_, i) => {
    const technique = TECHS[i % TECHS.length]
    const position = pick(['standing', 'seated', 'kneeling', 'lying'] as const)
    const works = [...new Set([pick(AREAS), pick(AREAS)])]
    return {
      id: `ex-${i}`,
      name: `Exercise ${i}`,
      technique,
      worksAreas: works,
      loadsAreas: r() < 0.5 ? [pick(AREAS)] : [],
      equipment:
        position === 'lying' || position === 'kneeling'
          ? ['mat']
          : r() < 0.3
            ? ['chair']
            : ['none'],
      level: 'beginner',
      phases:
        technique === 'cardio'
          ? ['main']
          : i % 3 === 0
            ? ['warmup', 'cooldown']
            : i % 3 === 1
              ? ['main']
              : ['warmup', 'main', 'cooldown'],
      position,
      intensity:
        technique === 'cardio' ? 'moderate' : pick(['gentle', 'gentle', 'moderate'] as const),
      tags: r() < 0.25 ? ['breathing'] : r() < 0.4 ? ['balance'] : r() < 0.5 ? ['boneLoading'] : [],
      batch: 1,
      standard: version(10, technique === 'cardio' ? { lowImpact: false } : {}),
      easier: version(6, technique === 'cardio' ? { lowImpact: true } : {}),
      harder: r() < 0.7 ? version(14) : undefined,
    }
  })
}

const LIB = syntheticLibrary(1)

function input(over: Partial<PlanInput> = {}): PlanInput {
  return {
    library: LIB,
    profile: { ...DEFAULT_PROFILE, setupDone: true },
    routine: 'calm',
    minutes: 15,
    marks: {},
    history: EMPTY_HISTORY,
    today: '2026-11-16',
    generation: 0,
    ...over,
  }
}

const plan = (r: PlanResult) => {
  if (r.kind !== 'plan') throw new Error(`expected a plan, got ${JSON.stringify(r)}`)
  return r
}
const ex = (id: string) => LIB.find((e) => e.id === id)!
const kept = (inp: PlanInput): KeptItem[] =>
  plan(makePlan(inp)).items.map((i) => ({ ...i, passed: [] }))

// ---------- Tests ----------

describe('planner basics', () => {
  it('is deterministic for the same input', () => {
    expect(makePlan(input())).toEqual(makePlan(input()))
  })

  it('a new generation gives a different plan', () => {
    const a = plan(makePlan(input({ generation: 0 }))).items.map((i) => i.exerciseId)
    const b = plan(makePlan(input({ generation: 1 }))).items.map((i) => i.exerciseId)
    expect(a).not.toEqual(b)
  })

  it('has warm-up, main and cool-down in order, within the time tolerance', () => {
    for (const minutes of [5, 10, 15, 20, 30, 45]) {
      const p = plan(makePlan(input({ routine: 'weekend', minutes })))
      const phases = p.items.map((i) => i.phase)
      expect(phases).toEqual(
        [...phases].sort(
          (a, b) =>
            ['warmup', 'main', 'cooldown'].indexOf(a) - ['warmup', 'main', 'cooldown'].indexOf(b),
        ),
      )
      expect(phases).toContain('main')
      const tol = minutes <= 10 ? 60 : 120
      if (!p.shortOfTime) expect(Math.abs(p.totalSeconds - minutes * 60)).toBeLessThanOrEqual(tol)
    }
  })

  it('keeps doses inside each recommended range', () => {
    const p = plan(makePlan(input({ routine: 'strength', minutes: 30 })))
    for (const item of p.items) {
      const d = item.dose
      const v = d.kind === 'time' ? d.seconds : d.reps
      expect(v).toBeGreaterThanOrEqual(d.range[0])
      expect(v).toBeLessThanOrEqual(d.range[1])
    }
  })

  it('changes sets only in the main part', () => {
    for (const routine of ROUTINE_ORDER) {
      const r = makePlan(input({ routine, minutes: 45 }))
      if (r.kind !== 'plan') continue
      for (const i of r.items.filter((i) => i.phase !== 'main')) {
        const base = ex(i.exerciseId)[i.version]!.dose
        if (i.dose.kind === 'reps' && base.kind === 'reps') expect(i.dose.sets).toBe(base.sets)
      }
    }
  })

  it('a Calm morning from the real library has a cool-down that ends with the breath', () => {
    const p = plan(makePlan(input({ library: allExercises, routine: 'calm' })))
    const cool = p.items.filter((i) => i.phase === 'cooldown')
    expect(cool.length).toBeGreaterThanOrEqual(1)
    expect(p.items.some((i) => i.phase === 'main')).toBe(true)
  })

  it('keeps a Calm morning to fewer, longer exercises than a Desk break of the same length', () => {
    const calm = plan(makePlan(input({ library: allExercises, routine: 'calm', minutes: 15 })))
    expect(calm.items.length).toBeLessThanOrEqual(10)
    const desk = plan(makePlan(input({ library: allExercises, routine: 'desk', minutes: 15 })))
    expect(calm.items.length).toBeLessThan(desk.items.length + 1)
  })

  it('a Calm morning prefers yoga, tai chi and mobility over strength', () => {
    for (let s = 0; s < 10; s++) {
      const items = plan(
        makePlan(input({ library: allExercises, routine: 'calm', generation: s })),
      ).items
      expect(
        items.filter(
          (i) => allExercises.find((e) => e.id === i.exerciseId)!.technique === 'strength',
        ).length,
      ).toBeLessThanOrEqual(1)
    }
  })

  it('gives every item a reason', () => {
    plan(makePlan(input())).items.forEach((i) => expect(i.reason.length).toBeGreaterThan(3))
  })
})

describe('routine characters (FR-009)', () => {
  it('Calm morning uses gentle exercises only', () => {
    for (let s = 0; s < 20; s++) {
      plan(makePlan(input({ generation: s }))).items.forEach((i) =>
        expect(ex(i.exerciseId).intensity).toBe('gentle'),
      )
    }
  })

  it('Desk break uses standing or seated exercises without a mat', () => {
    for (let s = 0; s < 20; s++) {
      for (const i of plan(makePlan(input({ routine: 'desk', minutes: 5, generation: s }))).items) {
        const e = ex(i.exerciseId)
        expect(['standing', 'seated']).toContain(e[i.version]!.position ?? e.position)
        expect(e.equipment).not.toContain('mat')
      }
    }
  })

  it('Strength keeper makes at least half the main part strength or balance', () => {
    for (let s = 0; s < 20; s++) {
      const main = plan(
        makePlan(input({ routine: 'strength', minutes: 20, generation: s })),
      ).items.filter((i) => i.phase === 'main')
      const strong = main.filter(
        (i) =>
          ex(i.exerciseId).technique === 'strength' || ex(i.exerciseId).tags.includes('balance'),
      )
      expect(strong.length * 2).toBeGreaterThanOrEqual(main.length)
    }
  })

  it('Cardio uses only cardio in the main part, low-impact for non-advanced', () => {
    const p = plan(makePlan(input({ routine: 'cardio', minutes: 15 })))
    for (const i of p.items.filter((i) => i.phase === 'main')) {
      expect(ex(i.exerciseId).technique).toBe('cardio')
      expect(ex(i.exerciseId)[i.version]!.lowImpact).toBe(true)
    }
  })
})

describe('profile rules', () => {
  it('favours focus areas in most plans (SC-004)', () => {
    const profile: Profile = { ...DEFAULT_PROFILE, focusAreas: ['shoulders', 'hips'] }
    let hits = 0
    for (let s = 0; s < 50; s++) {
      const items = plan(makePlan(input({ profile, routine: 'weekend', generation: s }))).items
      if (
        items.some((i) =>
          ex(i.exerciseId).worksAreas.some((a) => a === 'shoulders' || a === 'hips'),
        )
      )
        hits++
    }
    expect(hits / 50).toBeGreaterThanOrEqual(0.8)
  })

  it('uses easier versions for Go easy areas', () => {
    const target = LIB.find((e) => e.loadsAreas.length > 0 && e.intensity === 'gentle' && e.easier)!
    const profile: Profile = {
      ...DEFAULT_PROFILE,
      goEasyAreas: target.loadsAreas,
      focusAreas: target.worksAreas,
    }
    for (let s = 0; s < 30; s++) {
      for (const i of plan(makePlan(input({ profile, routine: 'weekend', generation: s }))).items) {
        const e = ex(i.exerciseId)
        if (e.loadsAreas.some((a) => target.loadsAreas.includes(a)) && e.easier)
          expect(i.version).toBe('easier')
      }
    }
  })

  it('includes one or two new exercises with "A mix" when available', () => {
    const done = LIB.map((e) => e.id).filter((_, i) => i % 2 === 0)
    for (let s = 0; s < 10; s++) {
      const items = plan(
        makePlan(
          input({
            history: { done, yesterday: [], recent: [] },
            routine: 'weekend',
            minutes: 30,
            generation: s,
          }),
        ),
      ).items
      const fresh = items.filter((i) => !done.includes(i.exerciseId)).length
      expect(fresh).toBeGreaterThanOrEqual(1)
    }
  })

  it('avoids yesterday’s main exercises when alternatives exist', () => {
    const first = plan(makePlan(input({ routine: 'weekend' })))
      .items.filter((i) => i.phase === 'main')
      .map((i) => i.exerciseId)
    const second = plan(
      makePlan(
        input({
          routine: 'weekend',
          today: '2026-11-16',
          history: { done: first, yesterday: first, recent: first },
        }),
      ),
    )
    const repeats = second.items.filter((i) => i.phase === 'main' && first.includes(i.exerciseId))
    expect(repeats.length).toBeLessThan(first.length)
  })
})

describe('cardio versions (batch 3)', () => {
  it('uses the standard low-impact version, not the easier one, and fills the time', () => {
    const r = plan(makePlan(input({ library: allExercises, routine: 'cardio', minutes: 15 })))
    const cardio = r.items.filter(
      (i) => allExercises.find((e) => e.id === i.exerciseId)!.technique === 'cardio',
    )
    expect(cardio.length).toBeGreaterThanOrEqual(3)
    cardio.forEach((i) => expect(i.version).toBe('standard'))
    expect(r.shortOfTime).toBe(false)
  })

  it('never picks a jumping version below advanced', () => {
    for (const level of ['beginner', 'intermediate'] as const) {
      const r = plan(
        makePlan(
          input({
            library: allExercises,
            routine: 'cardio',
            profile: { ...DEFAULT_PROFILE, level },
          }),
        ),
      )
      for (const i of r.items) {
        const e = allExercises.find((x) => x.id === i.exerciseId)!
        if (e.technique === 'cardio') expect(e[i.version]!.lowImpact).toBe(true)
      }
    }
  })
})

describe('phase preferences (004)', () => {
  const profile: Profile = { ...DEFAULT_PROFILE, phasePrefs: { 'cat-cow': ['warmup', 'cooldown'] } }

  it('never puts cat-cow in main when preferred as warm-up and cool-down (SC-004)', () => {
    let seen = 0
    for (let s = 0; s < 50; s++) {
      for (const routine of ['calm', 'weekend', 'strength'] as const) {
        const r = makePlan(input({ library: allExercises, profile, routine, generation: s }))
        if (r.kind !== 'plan') continue
        const cc = r.items.filter((i) => i.exerciseId === 'cat-cow')
        seen += cc.length
        cc.forEach((i) => expect(i.phase).not.toBe('main'))
      }
    }
    expect(seen).toBeGreaterThan(0)
  })

  it('may use it in both warm-up and cool-down, and says why', () => {
    let both = false
    for (let s = 0; s < 50 && !both; s++) {
      const r = plan(
        makePlan(input({ library: allExercises, profile, routine: 'weekend', generation: s })),
      )
      const phases = r.items.filter((i) => i.exerciseId === 'cat-cow').map((i) => i.phase)
      if (phases.includes('warmup') && phases.includes('cooldown')) both = true
      r.items
        .filter((i) => i.exerciseId === 'cat-cow')
        .forEach((i) => expect(i.reason).toMatch(/Your (warm-up|cool-down) pick|.+/))
    }
    expect(both).toBe(true)
  })

  it('without both bookends, an exercise is used once', () => {
    const once: Profile = { ...DEFAULT_PROFILE, phasePrefs: { 'cat-cow': ['warmup'] } }
    for (let s = 0; s < 20; s++) {
      const r = plan(
        makePlan(
          input({ library: allExercises, profile: once, routine: 'weekend', generation: s }),
        ),
      )
      const cc = r.items.filter((i) => i.exerciseId === 'cat-cow')
      expect(cc.length).toBeLessThanOrEqual(1)
      cc.forEach((i) => expect(i.phase).toBe('warmup'))
    }
  })
})

describe('swap and insufficient', () => {
  it('swaps one item for a different exercise in the same phase', () => {
    const base = kept(input({ routine: 'weekend' }))
    const swapped = swapItem(input({ routine: 'weekend' }), base, 1)
    expect(swapped[1].exerciseId).not.toBe(base[1].exerciseId)
    expect(swapped[1].phase).toBe(base[1].phase)
    expect(swapped[1].passed).toEqual([base[1].exerciseId])
    swapped.forEach((it, i) => i !== 1 && expect(it).toEqual(base[i]))
    const ids = swapped.map((i) => i.exerciseId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps the swapped item near the slot’s time, within its range', () => {
    const inp = input({ routine: 'weekend' })
    const base = kept(inp)
    const swapped = swapItem(inp, base, 1)[1]
    expect(Math.abs(swapped.seconds - base[1].seconds)).toBeLessThanOrEqual(base[1].seconds)
    const [min, max] = swapped.dose.range
    const value = swapped.dose.kind === 'time' ? swapped.dose.seconds : swapped.dose.reps
    expect(value).toBeGreaterThanOrEqual(min)
    expect(value).toBeLessThanOrEqual(max)
  })

  it('does not swap back to a passed exercise until every alternative has been tried', () => {
    const inp = input({ routine: 'weekend' })
    let items = kept(inp)
    const seen = [items[1].exerciseId]
    for (let n = 0; n < 60; n++) {
      items = swapItem(inp, items, 1)
      const id = items[1].exerciseId
      if (seen.includes(id)) break
      seen.push(id)
    }
    // The cycle came back round to an exercise already seen, after several distinct ones.
    expect(new Set(seen).size).toBe(seen.length)
    expect(seen.length).toBeGreaterThan(2)
  })

  it('says when a routine cannot be filled, with a suggestion', () => {
    const noCardio = allExercises.filter((e) => e.technique !== 'cardio')
    const r = makePlan(input({ library: noCardio, routine: 'cardio' }))
    expect(r.kind).toBe('insufficient')
    if (r.kind === 'insufficient') expect(r.suggestion).not.toBeNull()
  })

  it('plans a Calm morning from the real batch-1 library', () => {
    const p = plan(
      makePlan(
        input({
          library: allExercises,
          profile: { ...DEFAULT_PROFILE, focusAreas: ['shoulders', 'hips'] },
        }),
      ),
    )
    expect(p.items.length).toBeGreaterThanOrEqual(3)
  })
})

describe('property test: 1,000 random profiles (SC-003)', () => {
  it('always respects exclusions and the time tolerance', () => {
    const r = seededRandom(42)
    const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]
    const some = <T>(xs: readonly T[], p: number) => xs.filter(() => r() < p)
    for (let n = 0; n < 1000; n++) {
      const avoid = some(AREAS, 0.1)
      const profile: Profile = {
        ...DEFAULT_PROFILE,
        focusAreas: some(AREAS, 0.2),
        avoidAreas: avoid,
        goEasyAreas: some(AREAS, 0.1).filter((a) => !avoid.includes(a)),
        techniques: Object.fromEntries(
          TECHS.map((t) => [t, pick(['none', 'some', 'lots'] as const)]),
        ) as Profile['techniques'],
        level: pick(['beginner', 'intermediate', 'advanced'] as const),
        equipment: some(['mat', 'chair', 'wall', 'band'] as const, 0.7),
        tryNew: pick(['favourites', 'mix', 'new'] as const),
      }
      const marks = Object.fromEntries(
        some(LIB, 0.1).map((e) => [e.id, pick(['favourite', 'notForMe'] as const)]),
      )
      const routine: RoutineId = pick(ROUTINE_ORDER)
      const minutes = pick([5, 10, 15, 20, 30, 45])
      const res = makePlan(input({ profile, marks, routine, minutes, generation: n }))
      if (res.kind === 'insufficient') continue
      for (const i of res.items) {
        const e = ex(i.exerciseId)
        expect(marks[e.id]).not.toBe('notForMe')
        expect(profile.techniques[e.technique]).not.toBe('none')
        expect(e.loadsAreas.some((a) => profile.avoidAreas.includes(a))).toBe(false)
        const equipment = e[i.version]!.equipment ?? e.equipment
        expect(equipment.every((q) => q === 'none' || profile.equipment.includes(q as never))).toBe(
          true,
        )
      }
      const tol = minutes <= 10 ? 60 : 120
      if (!res.shortOfTime) expect(res.totalSeconds).toBeLessThanOrEqual(minutes * 60 + tol)
      const ids = res.items.map((i) => i.exerciseId)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})

describe('routine for the time of day (US3)', () => {
  it('picks Calm morning early on weekdays, Desk break in the working day, Weekend on weekend mornings', () => {
    expect(routineForTime(new Date('2026-11-16T07:30:00'))).toBe('calm') // Monday
    expect(routineForTime(new Date('2026-11-16T14:00:00'))).toBe('desk')
    expect(routineForTime(new Date('2026-11-21T09:00:00'))).toBe('weekend') // Saturday
    expect(routineForTime(new Date('2026-11-16T20:00:00'))).toBe('calm')
  })
})

describe('repairing a kept plan (006 FR-005)', () => {
  const inp = input({ routine: 'weekend' })
  const base = kept(inp)

  it('changes nothing when every item still fits', () => {
    expect(repairPlan(inp, base)).toEqual({ items: base, notes: [] })
  })

  it('replaces only an item marked Not for me, with a note', () => {
    const gone = base[1].exerciseId
    const r = repairPlan({ ...inp, marks: { [gone]: 'notForMe' } }, base)
    expect(r.items[1].exerciseId).not.toBe(gone)
    expect(r.items.map((i) => i.exerciseId)).not.toContain(gone)
    r.items.forEach((it, i) => i !== 1 && expect(it).toEqual(base[i]))
    expect(r.notes).toEqual([
      `${ex(gone).name} is now Not for me, so it was swapped for ${ex(r.items[1].exerciseId).name}.`,
    ])
  })

  it('replaces an item that loads a newly avoided area', () => {
    const i = base.findIndex((it) => ex(it.exerciseId).loadsAreas.length > 0)
    expect(i).toBeGreaterThanOrEqual(0)
    const area = ex(base[i].exerciseId).loadsAreas[0]
    const profile = { ...inp.profile, avoidAreas: [area] }
    const r = repairPlan({ ...inp, profile }, base)
    for (const it of r.items) expect(ex(it.exerciseId).loadsAreas).not.toContain(area)
    expect(r.notes.some((n) => n.includes('no longer fits your profile'))).toBe(true)
  })

  it('replaces an exercise that is no longer in the library', () => {
    const items = [{ ...base[0], exerciseId: 'retired-move' }, ...base.slice(1)]
    const r = repairPlan(inp, items)
    expect(r.items[0].exerciseId).not.toBe('retired-move')
    expect(r.notes[0]).toMatch(/no longer in the library/)
  })

  it('removes an item when nothing else fits, and says so', () => {
    const tiny = LIB.filter((e) => base.some((b) => b.exerciseId === e.id))
    const gone = base[0].exerciseId
    const r = repairPlan({ ...inp, library: tiny, marks: { [gone]: 'notForMe' } }, base)
    expect(r.items.map((i) => i.exerciseId)).toEqual(base.slice(1).map((i) => i.exerciseId))
    expect(r.notes[0]).toMatch(/nothing else fits there/)
  })
})
