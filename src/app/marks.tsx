import { useEffect, useState, type ReactNode } from 'react'
import { setMark as saveMark, watchMarks, type Mark, type Marks } from '../data/repo/marks'
import { MarksContext } from './marksContext'

export function MarksProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const [marks, setMarks] = useState<Marks>({})

  useEffect(() => watchMarks(uid, setMarks, () => {}), [uid])

  const setMark = (exerciseId: string, mark: Mark | null) => {
    // Optimistic: the snapshot listener confirms (or reverts) shortly after.
    setMarks((m) => {
      const next = { ...m }
      if (mark === null) delete next[exerciseId]
      else next[exerciseId] = mark
      return next
    })
    void saveMark(uid, exerciseId, mark).catch(() => {})
  }

  return <MarksContext.Provider value={{ marks, setMark }}>{children}</MarksContext.Provider>
}
