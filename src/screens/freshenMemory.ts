// What "Try something new" was showing, kept while the owner looks at an exercise and comes back
// to the set (spec 012 US1). In memory only; forgotten on leaving the set for anywhere else.
import type { SetItem } from '../sets/edit'
import type { Suggestion } from '../sets/freshen'

export interface FreshenUndo {
  before: SetItem[]
  after: SetItem[]
  /** The cards as they were before the accept, so Undo brings them all back. */
  list: Suggestion[]
  text: string
}

export interface FreshenState {
  open: boolean
  list: Suggestion[]
  skipped: string[]
  undo: FreshenUndo | null
  /** Whether any card was accepted or skipped since the list was made. */
  handled: boolean
}

export const CLOSED: FreshenState = {
  open: false,
  list: [],
  skipped: [],
  undo: null,
  handled: false,
}

let kept: { setId: string; state: FreshenState } | null = null

export function recallFreshen(setId: string): FreshenState {
  return kept?.setId === setId ? kept.state : CLOSED
}

export function keepFreshen(setId: string, state: FreshenState): void {
  kept = { setId, state }
}

export function forgetFreshen(): void {
  kept = null
}
