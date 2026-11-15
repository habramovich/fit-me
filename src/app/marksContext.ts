import { createContext, useContext } from 'react'
import type { Mark, Marks } from '../data/repo/marks'

export interface MarksValue {
  marks: Marks
  setMark: (exerciseId: string, mark: Mark | null) => void
}

export const MarksContext = createContext<MarksValue>({ marks: {}, setMark: () => {} })

export function useMarks(): MarksValue {
  return useContext(MarksContext)
}
