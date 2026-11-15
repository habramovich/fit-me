import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'

export type Mark = 'favourite' | 'notForMe'
export type Marks = Record<string, Mark>

/** Subscribes to the person's marks. Returns an unsubscribe function. */
export function watchMarks(
  uid: string,
  onData: (marks: Marks) => void,
  onError: (err: unknown) => void,
): () => void {
  return onSnapshot(
    collection(db, 'users', uid, 'exerciseMarks'),
    (snap) => {
      const marks: Marks = {}
      snap.forEach((d) => {
        const m = d.get('mark')
        if (m === 'favourite' || m === 'notForMe') marks[d.id] = m
      })
      onData(marks)
    },
    onError,
  )
}

/** Sets or clears (null) a mark. Not awaited by callers: offline writes queue. */
export function setMark(uid: string, exerciseId: string, mark: Mark | null): Promise<void> {
  const ref = doc(db, 'users', uid, 'exerciseMarks', exerciseId)
  if (mark === null) return deleteDoc(ref)
  return setDoc(ref, { mark, updatedAt: serverTimestamp() })
}
