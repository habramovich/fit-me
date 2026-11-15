import { createContext, useContext } from 'react'
import type { KeptPlan } from '../data/repo/plans'
import type { KeptItem } from '../planner/plan'

export interface PlansValue {
  uid: string
  /** null while loading. */
  plans: KeptPlan[] | null
  /** The unused plan viewed most recently, for Today. */
  latestUnused: KeptPlan | null
  /** Stores a new generation of a plan (replacing any earlier one for that routine and length). */
  put: (plan: KeptPlan) => void
  /** Changes a plan's items (Swap, repair) and notes. */
  setItems: (id: string, items: KeptItem[], notes: string[]) => void
  viewed: (id: string) => void
}

export const PlansContext = createContext<PlansValue>({
  uid: '',
  plans: [],
  latestUnused: null,
  put: () => {},
  setItems: () => {},
  viewed: () => {},
})

export function usePlans(): PlansValue {
  return useContext(PlansContext)
}
