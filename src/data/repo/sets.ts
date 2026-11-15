import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '../../firebase'
import type { SetItem } from '../../sets/edit'

export const SET_SCHEMA_VERSION = 1

export interface SavedSet {
  id: string
  name: string
  source: string
  items: SetItem[]
  updatedAt: Date | null
}

/** Subscribes to the person's sets, most recently changed first. */
export function watchSets(
  uid: string,
  onData: (sets: SavedSet[]) => void,
  onError: (err: unknown) => void,
): () => void {
  return onSnapshot(
    collection(db, 'users', uid, 'sets'),
    (snap) => {
      const sets = snap.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' })
        return {
          id: d.id,
          name: (data.name as string) ?? 'Untitled',
          source: (data.source as string) ?? 'manual',
          items: (data.items as SetItem[] | undefined) ?? [],
          updatedAt: (data.updatedAt as Timestamp | null)?.toDate() ?? null,
        }
      })
      sets.sort((a, b) => (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0))
      onData(sets)
    },
    onError,
  )
}

/** Creates a set and returns its id. Not awaited: offline writes queue. */
export function createSet(uid: string, name: string, items: SetItem[], source: string): string {
  const ref = doc(collection(db, 'users', uid, 'sets'))
  void setDoc(ref, {
    schemaVersion: SET_SCHEMA_VERSION,
    name,
    source,
    items,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }).catch(() => {})
  return ref.id
}

export function saveSetItems(uid: string, id: string, items: SetItem[]): void {
  void updateDoc(doc(db, 'users', uid, 'sets', id), { items, updatedAt: serverTimestamp() }).catch(
    () => {},
  )
}

export function renameSet(uid: string, id: string, name: string): void {
  void updateDoc(doc(db, 'users', uid, 'sets', id), { name, updatedAt: serverTimestamp() }).catch(
    () => {},
  )
}

export function deleteSet(uid: string, id: string): void {
  void deleteDoc(doc(db, 'users', uid, 'sets', id)).catch(() => {})
}
