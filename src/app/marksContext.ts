import { createContext, useContext } from 'react'
import type { Mark, Marks } from '../data/repo/marks'

export interface MarksValue {
  marks: Marks
  /** False until the first snapshot (cache or server) has arrived. */
  loaded: boolean
  setMark: (exerciseId: string, mark: Mark | null) => void
}

export const MarksContext = createContext<MarksValue>({
  marks: {},
  loaded: true,
  setMark: () => {},
})

export function useMarks(): MarksValue {
  return useContext(MarksContext)
}
