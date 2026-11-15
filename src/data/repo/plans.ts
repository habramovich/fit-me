// Kept plans (spec 006): the plan the person was shown, per routine and length, so it doesn't
// change until they change it or do it. See specs/006-session-feedback/data-model.md.
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { KeptItem } from '../../planner/plan'
import type { RoutineId } from '../../profile/types'

export const KEPT_PLAN_SCHEMA_VERSION = 1

export interface KeptPlan {
  id: string
  routine: RoutineId
  minutes: number
  generation: number
  items: KeptItem[]
  notes: string[]
  shortOfTime: boolean
  plannedAt: Date | null
  viewedAt: Date | null
  usedAt: Date | null
  sessionId: string | null
}

export const planId = (routine: RoutineId, minutes: number) => `${routine}-${minutes}`

/** Firestore rejects `undefined` fields (e.g. an absent optional dose note): drop them. */
const clean = (items: KeptItem[]): KeptItem[] => JSON.parse(JSON.stringify(items)) as KeptItem[]

const date = (v: unknown) => (v as Timestamp | null | undefined)?.toDate?.() ?? null

function fromData(id: string, data: DocumentData): KeptPlan {
  return {
    id,
    routine: data.routine as RoutineId,
    minutes: Number(data.minutes),
    generation: typeof data.generation === 'number' ? data.generation : 0,
    items: ((data.items as KeptItem[] | undefined) ?? []).map((i) => ({
      ...i,
      passed: i.passed ?? [],
    })),
    notes: (data.notes as string[] | undefined) ?? [],
    shortOfTime: data.shortOfTime === true,
    plannedAt: date(data.plannedAt),
    viewedAt: date(data.viewedAt),
    usedAt: date(data.usedAt),
    sessionId: typeof data.sessionId === 'string' ? data.sessionId : null,
  }
}

/** Subscribes to the person's kept plans. */
export function watchPlans(
  uid: string,
  onData: (plans: KeptPlan[]) => void,
  onError: (err: unknown) => void,
): () => void {
  return onSnapshot(
    collection(db, 'users', uid, 'plans'),
    (snap) =>
      onData(snap.docs.map((d) => fromData(d.id, d.data({ serverTimestamps: 'estimate' })))),
    onError,
  )
}

/**
 * Reads one plan, from the server when online (so a fresh device doesn't mistake an empty cache
 * for "no plan"), else from the cache. Null when there is none.
 */
export async function getPlan(uid: string, id: string): Promise<KeptPlan | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'plans', id))
    return snap.exists() ? fromData(snap.id, snap.data({ serverTimestamps: 'estimate' })) : null
  } catch {
    return null
  }
}

/** Writes a new generation of a plan (the whole document). Not awaited: offline writes queue. */
export function savePlan(uid: string, plan: KeptPlan): void {
  void setDoc(doc(db, 'users', uid, 'plans', plan.id), {
    schemaVersion: KEPT_PLAN_SCHEMA_VERSION,
    routine: plan.routine,
    minutes: plan.minutes,
    generation: plan.generation,
    items: clean(plan.items),
    notes: plan.notes,
    shortOfTime: plan.shortOfTime,
    plannedAt: serverTimestamp(),
    viewedAt: serverTimestamp(),
    usedAt: null,
    sessionId: null,
  }).catch(() => {})
}

export function updatePlanItems(uid: string, id: string, items: KeptItem[], notes: string[]): void {
  void updateDoc(doc(db, 'users', uid, 'plans', id), { items: clean(items), notes }).catch(() => {})
}

export function markPlanViewed(uid: string, id: string): void {
  void updateDoc(doc(db, 'users', uid, 'plans', id), { viewedAt: serverTimestamp() }).catch(
    () => {},
  )
}

export function markPlanUsed(uid: string, id: string, sessionId: string): void {
  void updateDoc(doc(db, 'users', uid, 'plans', id), {
    usedAt: serverTimestamp(),
    sessionId,
  }).catch(() => {})
}
