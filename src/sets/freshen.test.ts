import { describe, expect, it } from 'vitest'
import type { Marks } from '../data/repo/marks'
import type { SavedSet } from '../data/repo/sets'
import { allExercises, estimateSeconds, getExercise } from '../exercises'
import type { BodyArea, Dose, Intensity, Phase } from '../exercises/types'
import { EMPTY_HISTORY, eligible, fitsPhase, makePlan } from '../planner/plan'
import { ROUTINE_ORDER } from '../planner/routines'
import { DEFAULT_PROFILE, type Profile, type RoutineId } from '../profile/types'
import { fromPlan, MAX_SET_ITEMS, type SetItem } from './edit'
import {
  anotherIdea,
  applySuggestion,
  characterOf,
  revalidate,
  reviewSet,
  suggest,
  type FreshenInput,
  type Suggestion,
} from './freshen'

type TestSet = Pick<SavedSet, 'id' | 'source' | 'items'>

const PROFILE: Profile = { ...DEFAULT_PROFILE, setupDone: true }
const RESTRICTIVE: Profile = {
  ...PROFILE,
  level: 'advanced',
  avoidAreas: ['knees'],
  goEasyAreas: ['lowerBack'],
  equipment: ['mat', 'chair', 'wall'],
  techniques: { ...PROFILE.techniques, taichi: 'none' },
}
const DATES = ['2026-11-22', '2026-11-23', '2026-12-01']

function item(exerciseId: string, phase: Phase, version: SetItem['version'] = 'standard'): SetItem {
  const e = getExercise(exerciseId)!
  return { exerciseId, version, phase, dose: e[version]!.dose }
}

function input(set: TestSet, over: Partial<FreshenInput> = {}): FreshenInput {
  return {
    set,
    library: allExercises,
    profile: PROFILE,
    marks: {},
    today: DATES[0],
    skipped: [],
    ...over,
  }
}

function planned(
  routine: RoutineId,
  minutes: number,
  today: string,
  profile: Profile,
): TestSet | null {
  const r = makePlan({
    library: allExercises,
    profile,
    routine,
    minutes,
    marks: {},
    history: EMPTY_HISTORY,
    today,
    generation: 0,
    covered: [],
  })
  if (r.kind !== 'plan') return null
  return {
    id: `s-${routine}-${minutes}-${today}`,
    source: `plan:${routine}`,
    items: fromPlan(r.items),
  }
}

/** Sets saved from plans of every routine, two lengths, three dates, two profiles. */
const SAMPLES: { set: TestSet; profile: Profile }[] = []
for (const profile of [PROFILE, RESTRICTIVE]) {
  for (const routine of ROUTINE_ORDER) {
    for (const minutes of [10, 25]) {
      for (const today of DATES) {
        const set = planned(routine, minutes, today, profile)
        if (set) SAMPLES.push({ set, profile })
      }
    }
  }
}
const gentleHandMade: TestSet = {
  id: 'h1',
  source: 'manual',
  items: [
    item('pelvic-tilts', 'warmup'),
    item('butterfly', 'main'),
    item('childs-pose', 'cooldown'),
  ],
}
const moderateHandMade: TestSet = {
  id: 'h2',
  source: 'manual',
  items: [item('cat-cow', 'warmup'), item('glute-bridge', 'main'), item('figure-four', 'cooldown')],
}
const emptyHandMade: TestSet = { id: 'h3', source: 'manual', items: [] }
for (const set of [gentleHandMade, moderateHandMade, emptyHandMade]) {
  SAMPLES.push({ set, profile: PROFILE }, { set, profile: RESTRICTIVE })
}

const RANK: Intensity[] = ['gentle', 'moderate', 'vigorous']
const areasOf = (items: readonly SetItem[]) =>
  new Set(items.flatMap((i) => getExercise(i.exerciseId)?.worksAreas ?? []))
const secondsOf = (i: SetItem) => {
  const v = getExercise(i.exerciseId)![i.version]!
  return estimateSeconds({ ...v, dose: i.dose })
}
const atBound = (d: Dose) => {
  const value = d.kind === 'reps' ? d.reps : d.seconds
  return value === d.range[0] || value === d.range[1]
}

describe('characterOf', () => {
  it('uses the routine of a set saved from a plan', () => {
    const ch = characterOf({ source: 'plan:desk', items: [] }, allExercises, PROFILE)
    expect(ch.handMade).toBe(false)
    expect(ch.routine.id).toBe('desk')
    expect(ch.maxIntensity).toBeNull()
  })

  it('caps a hand-made set at its most intense exercise', () => {
    expect(characterOf(gentleHandMade, allExercises, PROFILE).maxIntensity).toBe('gentle')
    expect(characterOf(moderateHandMade, allExercises, PROFILE).maxIntensity).toBe('moderate')
    expect(characterOf(emptyHandMade, allExercises, PROFILE).maxIntensity).toBe('moderate')
    expect(
      characterOf(emptyHandMade, allExercises, { ...PROFILE, level: 'advanced' }).maxIntensity,
    ).toBe('vigorous')
  })

  it('treats an unknown source as hand-made', () => {
    expect(characterOf({ source: 'plan:nope', items: [] }, allExercises, PROFILE).handMade).toBe(
      true,
    )
  })
})

describe('suggest: rules (SC-002)', () => {
  it('has sample sets from every routine', () => {
    const routines = new Set(SAMPLES.map((s) => s.set.source))
    for (const r of ROUTINE_ORDER) expect(routines).toContain(`plan:${r}`)
  })

  it('every suggestion is new to the set, fits the profile, the character and its part', () => {
    let count = 0
    for (const { set, profile } of SAMPLES) {
      for (const today of DATES) {
        const ch = characterOf(set, allExercises, profile)
        for (const s of suggest(input(set, { profile, today }))) {
          count++
          const e = getExercise(s.item.exerciseId)!
          const where = `${set.id} ${s.key} ${e.id}`
          expect(
            set.items.some((i) => i.exerciseId === e.id),
            where,
          ).toBe(false)
          expect(eligible(e, { profile, marks: {} }, ch.routine), where).toBe(s.item.version)
          expect(
            e.loadsAreas.some((a) => profile.avoidAreas.includes(a)),
            where,
          ).toBe(false)
          expect(profile.techniques[e.technique], where).not.toBe('none')
          if (ch.maxIntensity) {
            expect(RANK.indexOf(e.intensity), where).toBeLessThanOrEqual(
              RANK.indexOf(ch.maxIntensity),
            )
          }
          const v = e[s.item.version]!
          if (set.source === 'plan:desk') {
            expect(['standing', 'seated'], where).toContain(v.position ?? e.position)
            for (const q of v.equipment ?? e.equipment)
              expect(['none', 'chair', 'wall'], where).toContain(q)
          }
          if (set.source === 'plan:calm') expect(e.intensity, where).toBe('gentle')
          if (set.source === 'plan:cardio' && s.item.phase === 'main')
            expect(e.technique, where).toBe('cardio')
          const c = { exercise: e, versionKey: s.item.version, version: v, jitter: 0 }
          expect(fitsPhase(c, s.item.phase, ch.routine, true), where).toBe(true)
        }
      }
    }
    expect(count).toBeGreaterThan(50)
  })

  it('never suggests an exercise marked Not for me', () => {
    const { set } = SAMPLES[0]
    const first = suggest(input(set))
    const marks: Marks = Object.fromEntries(first.map((s) => [s.item.exerciseId, 'notForMe']))
    const again = suggest(input(set, { marks }))
    for (const s of again) expect(marks[s.item.exerciseId]).toBeUndefined()
  })

  it('uses the easier version for a go-easy area', () => {
    const profile = { ...PROFILE, goEasyAreas: allExercises.flatMap((e) => e.loadsAreas) }
    for (const { set } of SAMPLES.slice(0, 6)) {
      for (const s of suggest(input(set, { profile }))) {
        const e = getExercise(s.item.exerciseId)!
        const usable = e.easier && !e.easier.equipment && !e.easier.position
        if (usable && e.loadsAreas.length > 0) expect(s.item.version, e.id).toBe('easier')
      }
    }
  })

  it('only suggests an exercise for the parts the owner likes it in', () => {
    const { set } = SAMPLES.find((s) => s.set.source === 'plan:weekend')!
    const first = suggest(input(set))
    const phasePrefs = Object.fromEntries(
      first.map((s) => [s.item.exerciseId, [s.item.phase === 'main' ? 'cooldown' : 'main']]),
    ) as Record<string, Phase[]>
    const profile = { ...PROFILE, phasePrefs }
    for (const s of suggest(input(set, { profile }))) {
      const prefs = phasePrefs[s.item.exerciseId]
      if (prefs) expect(prefs).toContain(s.item.phase)
    }
  })
})

describe('suggest: balance', () => {
  it('never lowers the number of areas worked, except a repair (SC-003)', () => {
    for (const { set, profile } of SAMPLES) {
      const before = areasOf(set.items).size
      for (const s of suggest(input(set, { profile }))) {
        if (s.change.kind === 'replace' && s.change.repair) continue
        expect(
          areasOf(applySuggestion(set.items, s)).size,
          `${set.id} ${s.key}`,
        ).toBeGreaterThanOrEqual(before)
      }
    }
  })

  it('a Replace keeps about the same time (SC-004)', () => {
    let replaces = 0
    for (const { set, profile } of SAMPLES) {
      for (const s of suggest(input(set, { profile }))) {
        if (s.change.kind !== 'replace') continue
        replaces++
        const target = s.change.target
        const old = set.items.find(
          (i) => i.exerciseId === target.exerciseId && i.phase === target.phase,
        )!
        const diff = Math.abs(secondsOf(s.item) - secondsOf(old))
        if (!atBound(s.item.dose)) expect(diff, `${set.id} ${s.key}`).toBeLessThanOrEqual(60)
      }
    }
    expect(replaces).toBeGreaterThan(10)
  })

  it('fills an obvious gap: a Calm set with no upper-back work (SC-005)', () => {
    const set: TestSet = {
      id: 'calm-no-upper',
      source: 'plan:calm',
      items: [
        item('pelvic-tilts', 'warmup'),
        item('butterfly', 'main'),
        item('childs-pose', 'main'),
        item('figure-four', 'cooldown'),
        item('knee-to-chest', 'cooldown'),
      ],
    }
    expect(areasOf(set.items).has('upperBack')).toBe(false)
    for (const today of DATES) {
      const list = suggest(input(set, { today }))
      expect(
        list.some((s) => getExercise(s.item.exerciseId)!.worksAreas.includes('upperBack')),
      ).toBe(true)
      const focused = suggest(
        input(set, { today, profile: { ...PROFILE, focusAreas: ['upperBack'] } }),
      )
      expect(focused.some((s) => s.gap === 'upperBack')).toBe(true)
    }
  })

  it('in Strength keeper, a main strength move is replaced by another strength move', () => {
    for (const { set, profile } of SAMPLES.filter((s) => s.set.source === 'plan:strength')) {
      for (const s of suggest(input(set, { profile }))) {
        if (s.change.kind !== 'replace' || s.change.target.phase !== 'main') continue
        if (getExercise(s.change.target.exerciseId)!.technique !== 'strength') continue
        expect(getExercise(s.item.exerciseId)!.technique).toBe('strength')
      }
    }
  })

  it('shows at most three, never sharing an exercise, a replaced item or a gap', () => {
    for (const { set, profile } of SAMPLES) {
      const list = suggest(input(set, { profile }))
      expect(list.length).toBeLessThanOrEqual(3)
      const ids = list.map((s) => s.item.exerciseId)
      expect(new Set(ids).size).toBe(ids.length)
      const keys = list.map((s) => s.key)
      expect(new Set(keys).size).toBe(keys.length)
      const gaps = list.map((s) => s.gap).filter((g): g is BodyArea => g !== null)
      expect(new Set(gaps).size).toBe(gaps.length)
    }
  })

  it('mixes Adds and Replaces when both are possible', () => {
    // A large set may get only Replaces: every Add would pile onto areas it already works.
    const full = SAMPLES.map(({ set, profile }) => suggest(input(set, { profile }))).filter(
      (list) => list.length === 3,
    )
    const mixed = full.filter((list) => new Set(list.map((s) => s.change.kind)).size === 2)
    expect(mixed.length / full.length).toBeGreaterThan(0.5)
    const set: TestSet = {
      id: 'mix',
      source: 'plan:calm',
      items: [
        item('pelvic-tilts', 'warmup'),
        item('butterfly', 'main'),
        item('childs-pose', 'main'),
      ],
    }
    expect(new Set(suggest(input(set)).map((s) => s.change.kind))).toEqual(
      new Set(['add', 'replace']),
    )
  })
})

describe('suggest: edges', () => {
  const calm = SAMPLES.find((s) => s.set.source === 'plan:calm' && s.profile === PROFILE)!.set

  it('replaces an item that is now Not for me first, saying why', () => {
    const target = calm.items[1]
    const list = suggest(input(calm, { marks: { [target.exerciseId]: 'notForMe' } }))
    expect(list[0].change).toEqual({
      kind: 'replace',
      target: { exerciseId: target.exerciseId, phase: target.phase },
      repair: true,
    })
    expect(list[0].reason).toContain('is now Not for me')
  })

  it('replaces an item no longer in the library, using the recommended dose', () => {
    const set = {
      ...calm,
      items: [{ ...calm.items[0], exerciseId: 'gone' }, ...calm.items.slice(1)],
    }
    const [first] = suggest(input(set))
    expect(first.change.kind === 'replace' && first.change.repair).toBe(true)
    expect(first.reason).toContain('is no longer in the library')
    const e = getExercise(first.item.exerciseId)!
    expect(first.item.dose).toEqual(e[first.item.version]!.dose)
  })

  it('never picks a favourite to replace', () => {
    const marks: Marks = Object.fromEntries(calm.items.map((i) => [i.exerciseId, 'favourite']))
    const list = suggest(input(calm, { marks }))
    expect(list.some((s) => s.change.kind === 'replace')).toBe(false)
  })

  it('a full set gets no Add; an empty set gets only Adds', () => {
    const full = {
      ...calm,
      items: Array.from({ length: MAX_SET_ITEMS }, (_, i) => calm.items[i % calm.items.length]),
    }
    expect(suggest(input(full)).some((s) => s.change.kind === 'add')).toBe(false)
    const empty = suggest(input(emptyHandMade))
    expect(empty.length).toBeGreaterThan(0)
    expect(empty.every((s) => s.change.kind === 'add')).toBe(true)
  })

  it('leaves out skipped exercises', () => {
    const first = suggest(input(calm))
    const skipped = [first[0].item.exerciseId]
    expect(suggest(input(calm, { skipped })).some((s) => s.item.exerciseId === skipped[0])).toBe(
      false,
    )
  })

  it('is the same all day', () => {
    expect(suggest(input(calm))).toEqual(suggest(input(calm)))
  })

  it('suggests nothing when every suitable exercise is already in the set', () => {
    const library = allExercises.filter((e) => calm.items.some((i) => i.exerciseId === e.id))
    expect(suggest(input(calm, { library }))).toEqual([])
  })
})

describe('applySuggestion', () => {
  const set = SAMPLES.find((s) => s.set.source === 'plan:weekend')!.set

  it('adds at the end of the part, or replaces in place', () => {
    for (const s of suggest(input(set))) {
      const next = applySuggestion(set.items, s)
      const change = s.change
      if (change.kind === 'add') {
        expect(next.length).toBe(set.items.length + 1)
        const inPart = next.filter((i) => i.phase === change.phase)
        expect(inPart[inPart.length - 1]).toBe(s.item)
      } else {
        const target = change.target
        const idx = set.items.findIndex(
          (i) => i.exerciseId === target.exerciseId && i.phase === target.phase,
        )
        expect(next.length).toBe(set.items.length)
        expect(next[idx]).toBe(s.item)
      }
    }
  })

  it('leaves the items unchanged when the target is gone', () => {
    const s: Suggestion = {
      key: 'replace:nope:main',
      change: { kind: 'replace', target: { exerciseId: 'nope', phase: 'main' }, repair: false },
      item: set.items[0],
      reason: '',
      gap: null,
      passed: [],
      hasAnother: false,
    }
    expect(applySuggestion(set.items, s)).toBe(set.items)
  })
})

describe('revalidate', () => {
  const set = SAMPLES.find((s) => s.set.source === 'plan:calm' && s.profile === PROFILE)!.set
  const list = suggest(input(set))

  it('keeps everything while nothing changed', () => {
    expect(revalidate(input(set), list)).toEqual(list)
  })

  it('drops a suggestion whose exercise is now in the set', () => {
    const items = [...set.items, { ...list[0].item, phase: 'cooldown' as Phase }]
    const next = revalidate(input({ ...set, items }), list)
    expect(next.some((s) => s.key === list[0].key)).toBe(false)
  })

  it('drops a Replace whose target is gone', () => {
    const r = list.find((s) => s.change.kind === 'replace')!
    const target = r.change.kind === 'replace' ? r.change.target : null
    const items = set.items.filter((i) => i.exerciseId !== target!.exerciseId)
    expect(revalidate(input({ ...set, items }), list).some((s) => s.key === r.key)).toBe(false)
  })

  it('drops a suggestion whose gap is now filled', () => {
    const g = list.find((s) => s.gap)
    if (!g) return
    const filler = allExercises.find(
      (e) => e.worksAreas.includes(g.gap!) && !list.some((s) => s.item.exerciseId === e.id),
    )!
    const items = [...set.items, item(filler.id, 'main')]
    expect(revalidate(input({ ...set, items }), list).some((s) => s.key === g.key)).toBe(false)
  })

  it('drops a suggestion just marked Not for me, and an Add once the set is full', () => {
    const marks: Marks = { [list[0].item.exerciseId]: 'notForMe' }
    expect(revalidate(input(set, { marks }), list).some((s) => s.key === list[0].key)).toBe(false)
    const full = Array.from({ length: MAX_SET_ITEMS }, (_, i) => set.items[i % set.items.length])
    expect(
      revalidate(input({ ...set, items: full }), list).some((s) => s.change.kind === 'add'),
    ).toBe(false)
  })
})

describe('anotherIdea (US2)', () => {
  const set = SAMPLES.find((s) => s.set.source === 'plan:weekend' && s.profile === PROFILE)!.set
  const list = suggest(input(set))

  it('keeps the change and never repeats until the ideas run out', () => {
    for (const first of list.filter((s) => s.hasAnother)) {
      let current = list
      const shown = [first.item.exerciseId]
      for (let i = 0; i < 40; i++) {
        current = anotherIdea(input(set), current, first.key)
        const s = current.find((x) => x.key === first.key)!
        expect(s.change).toEqual(first.change)
        const others = current.filter((x) => x !== s).map((x) => x.item.exerciseId)
        expect(others).not.toContain(s.item.exerciseId)
        if (s.passed.length === 1 && i > 0) {
          // The cycle restarted: everything suitable had been shown once.
          expect(new Set(shown).size).toBe(shown.length)
          break
        }
        shown.push(s.item.exerciseId)
        expect(set.items.some((it) => it.exerciseId === s.item.exerciseId)).toBe(false)
      }
    }
  })

  it('results still follow the rules', () => {
    const ch = characterOf(set, allExercises, PROFILE)
    let current = list
    for (const s of list) current = anotherIdea(input(set), current, s.key)
    for (const s of current) {
      const e = getExercise(s.item.exerciseId)!
      expect(eligible(e, { profile: PROFILE, marks: {} }, ch.routine)).toBe(s.item.version)
    }
  })

  it('offers no Another idea when only one exercise fits', () => {
    const only = list[0]
    const library = allExercises.filter(
      (e) => e.id === only.item.exerciseId || set.items.some((i) => i.exerciseId === e.id),
    )
    for (const s of suggest(input(set, { library }))) expect(s.hasAnother).toBe(false)
  })
})

describe('reviewSet (US3)', () => {
  const set: TestSet = {
    id: 'r',
    source: 'plan:calm',
    items: [
      item('pelvic-tilts', 'warmup'),
      item('butterfly', 'main'),
      item('childs-pose', 'main'),
      item('figure-four', 'cooldown'),
    ],
  }

  it('counts areas and techniques', () => {
    const r = reviewSet(set, allExercises, PROFILE)
    expect(r.worked[0]).toBe('lowerBack')
    expect(r.worked).toEqual(expect.arrayContaining(['hips', 'core', 'glutes', 'shoulders']))
    const total = r.techniques.reduce((n, [, k]) => n + k, 0)
    expect(total).toBe(4)
  })

  it('lists missing areas, focus areas first', () => {
    const r = reviewSet(set, allExercises, { ...PROFILE, focusAreas: ['ankles'] })
    expect(r.missing[0]).toBe('ankles')
    expect(r.missing.length).toBeLessThanOrEqual(3)
    expect(r.missing).not.toContain('lowerBack')
  })

  it('flags a short or long part, but not in a very short set', () => {
    const long = {
      ...set,
      items: [...set.items, ...['butterfly', 'childs-pose'].map((id) => item(id, 'main'))],
    }
    const r = reviewSet(
      { ...long, items: long.items.filter((i) => i.phase !== 'cooldown') },
      allExercises,
      PROFILE,
    )
    const by = Object.fromEntries(r.parts.map((p) => [p.phase, p]))
    expect(by.cooldown.seconds).toBe(0)
    expect(by.cooldown.flag).toBe('short')
    expect(by.main.flag).toBe('long')
    const tiny = reviewSet({ ...set, items: [set.items[0]] }, allExercises, PROFILE)
    expect(tiny.parts.every((p) => p.flag === null)).toBe(true)
  })

  it('does not count an item no longer in the library', () => {
    const r = reviewSet(
      { ...set, items: [{ ...set.items[0], exerciseId: 'gone' }] },
      allExercises,
      PROFILE,
    )
    expect(r.worked).toEqual([])
    expect(r.techniques).toEqual([])
  })
})
