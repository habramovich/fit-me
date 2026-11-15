import { describe, expect, it } from 'vitest'
import type { Dose } from '../exercises/types'
import {
  MAX_SET_ITEMS,
  addItem,
  fromPlan,
  moveDown,
  moveTo,
  moveUp,
  removeItem,
  type SetItem,
} from './edit'

const dose: Dose = { kind: 'reps', reps: 8, range: [6, 10], sets: 1, perSide: false }
const it_ = (id: string, phase: SetItem['phase']): SetItem => ({
  exerciseId: id,
  version: 'standard',
  phase,
  dose,
})
const ids = (items: SetItem[]) => items.map((i) => `${i.phase[0]}:${i.exerciseId}`)

const base = [
  it_('a', 'warmup'),
  it_('b', 'warmup'),
  it_('c', 'main'),
  it_('d', 'main'),
  it_('e', 'cooldown'),
]

describe('set editing', () => {
  it('moves within a part', () => {
    expect(ids(moveTo(base, 3, 'main', 0))).toEqual(['w:a', 'w:b', 'm:d', 'm:c', 'c:e'])
  })

  it('moves across parts, e.g. main → top of warm-up', () => {
    expect(ids(moveTo(base, 2, 'warmup', 0))).toEqual(['w:c', 'w:a', 'w:b', 'm:d', 'c:e'])
  })

  it('moves into an empty part', () => {
    const noCool = base.slice(0, 4)
    expect(ids(moveTo(noCool, 0, 'cooldown', 0))).toEqual(['w:b', 'm:c', 'm:d', 'c:a'])
  })

  it('clamps the position to the part', () => {
    expect(ids(moveTo(base, 0, 'main', 99))).toEqual(['w:b', 'm:c', 'm:d', 'm:a', 'c:e'])
  })

  it('Move up crosses into the end of the previous part', () => {
    expect(ids(moveUp(base, 2))).toEqual(['w:a', 'w:b', 'w:c', 'm:d', 'c:e'])
    expect(ids(moveUp(base, 1))).toEqual(['w:b', 'w:a', 'm:c', 'm:d', 'c:e'])
    expect(moveUp(base, 0)).toBe(base) // first warm-up item: nowhere to go
  })

  it('Move down crosses into the start of the next part', () => {
    expect(ids(moveDown(base, 1))).toEqual(['w:a', 'm:b', 'm:c', 'm:d', 'c:e'])
    expect(ids(moveDown(base, 3))).toEqual(['w:a', 'w:b', 'm:c', 'c:d', 'c:e'])
    expect(moveDown(base, 4)).toBe(base)
  })

  it('Move up from main skips an empty warm-up into it', () => {
    const noWarm = base.slice(2)
    expect(ids(moveUp(noWarm, 0))).toEqual(['w:c', 'm:d', 'c:e'])
  })

  it('adds at the end of a part, allowing duplicates', () => {
    const added = addItem(base, it_('a', 'cooldown'))
    expect(ids(added)).toEqual(['w:a', 'w:b', 'm:c', 'm:d', 'c:e', 'c:a'])
    expect(ids(addItem(base, it_('x', 'main')))).toEqual(['w:a', 'w:b', 'm:c', 'm:d', 'm:x', 'c:e'])
  })

  it(`caps a set at ${MAX_SET_ITEMS} items`, () => {
    const full = Array.from({ length: MAX_SET_ITEMS }, (_, i) => it_(`x${i}`, 'main'))
    expect(addItem(full, it_('y', 'main'))).toBe(full)
  })

  it('removes an item', () => {
    expect(ids(removeItem(base, 2))).toEqual(['w:a', 'w:b', 'm:d', 'c:e'])
  })

  it('makes a set from a plan, keeping order, versions and doses', () => {
    const items = fromPlan([
      { exerciseId: 'a', version: 'easier', dose, phase: 'warmup', reason: 'x', seconds: 30 },
      { exerciseId: 'b', version: 'standard', dose, phase: 'main', reason: 'y', seconds: 30 },
    ])
    expect(items).toEqual([
      { exerciseId: 'a', version: 'easier', phase: 'warmup', dose },
      { exerciseId: 'b', version: 'standard', phase: 'main', dose },
    ])
  })
})
