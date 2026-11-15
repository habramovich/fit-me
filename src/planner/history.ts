// Summarises past sessions for the planner (research R3).
import type { PastSession } from '../data/repo/sessions'
import type { HistorySummary } from './plan'

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function todayKey(now = new Date()): string {
  return dayKey(now)
}

export function summariseHistory(sessions: PastSession[], now = new Date()): HistorySummary {
  const yesterday = dayKey(new Date(now.getTime() - 86_400_000))
  const weekAgo = now.getTime() - 7 * 86_400_000
  const done = new Set<string>()
  const yest = new Set<string>()
  const recent = new Set<string>()
  for (const s of sessions) {
    for (const item of s.items) {
      if (item.outcome !== 'done') continue
      done.add(item.exerciseId)
      if (dayKey(s.startedAt) === yesterday) yest.add(item.exerciseId)
      if (s.startedAt.getTime() >= weekAgo) recent.add(item.exerciseId)
    }
  }
  return { done: [...done], yesterday: [...yest], recent: [...recent] }
}
