import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  markPlanViewed,
  savePlan,
  updatePlanItems,
  watchPlans,
  type KeptPlan,
} from '../data/repo/plans'
import type { KeptItem } from '../planner/plan'
import { PlansContext } from './plansContext'

/** Keeps the person's kept plans in memory, applying changes optimistically (spec 006 US1). */
export function PlansProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [plans, setPlans] = useState<KeptPlan[] | null>(null)

  useEffect(() => watchPlans(uid, setPlans, () => setPlans([])), [uid])

  const patch = (id: string, change: Partial<KeptPlan>) =>
    setPlans((all) => all?.map((p) => (p.id === id ? { ...p, ...change } : p)) ?? all)

  const latestUnused = useMemo(
    () =>
      (plans ?? [])
        .filter((p) => p.usedAt === null && p.items.length > 0)
        .reduce<KeptPlan | null>(
          (best, p) =>
            !best || (p.viewedAt?.getTime() ?? 0) > (best.viewedAt?.getTime() ?? 0) ? p : best,
          null,
        ),
    [plans],
  )

  const value = {
    uid,
    plans,
    latestUnused,
    put: (plan: KeptPlan) => {
      setPlans((all) => [plan, ...(all ?? []).filter((p) => p.id !== plan.id)])
      savePlan(uid, plan)
    },
    setItems: (id: string, items: KeptItem[], notes: string[]) => {
      patch(id, { items, notes })
      updatePlanItems(uid, id, items, notes)
    },
    viewed: (id: string) => {
      patch(id, { viewedAt: new Date() })
      markPlanViewed(uid, id)
    },
  }

  return <PlansContext.Provider value={value}>{children}</PlansContext.Provider>
}
