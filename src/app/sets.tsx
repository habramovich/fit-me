import { useEffect, useState, type ReactNode } from 'react'
import {
  createSet,
  deleteSet,
  renameSet,
  saveSetItems,
  watchSets,
  type SavedSet,
} from '../data/repo/sets'
import type { SetItem } from '../sets/edit'
import { SetsContext } from './setsContext'

/** Keeps the person's sets in memory, applying edits optimistically. */
export function SetsProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [sets, setSets] = useState<SavedSet[] | null>(null)

  useEffect(() => watchSets(uid, setSets, () => setSets([])), [uid])

  const patch = (id: string, change: Partial<SavedSet>) =>
    setSets((all) => all?.map((s) => (s.id === id ? { ...s, ...change } : s)) ?? all)

  const value = {
    sets,
    create: (name: string, items: SetItem[], source: string) => {
      const id = createSet(uid, name, items, source)
      setSets((all) => [{ id, name, source, items, updatedAt: new Date() }, ...(all ?? [])])
      return id
    },
    saveItems: (id: string, items: SetItem[]) => {
      patch(id, { items, updatedAt: new Date() })
      saveSetItems(uid, id, items)
    },
    rename: (id: string, name: string) => {
      patch(id, { name })
      renameSet(uid, id, name)
    },
    remove: (id: string) => {
      setSets((all) => all?.filter((s) => s.id !== id) ?? all)
      deleteSet(uid, id)
    },
  }

  return <SetsContext.Provider value={value}>{children}</SetsContext.Provider>
}
