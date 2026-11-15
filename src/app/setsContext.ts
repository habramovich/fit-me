import { createContext, useContext } from 'react'
import type { SavedSet } from '../data/repo/sets'
import type { SetItem } from '../sets/edit'

export interface SetsValue {
  /** null while loading. */
  sets: SavedSet[] | null
  create: (name: string, items: SetItem[], source: string) => string
  saveItems: (id: string, items: SetItem[]) => void
  rename: (id: string, name: string) => void
  remove: (id: string) => void
}

export const SetsContext = createContext<SetsValue>({
  sets: [],
  create: () => '',
  saveItems: () => {},
  rename: () => {},
  remove: () => {},
})

export function useSets(): SetsValue {
  return useContext(SetsContext)
}
