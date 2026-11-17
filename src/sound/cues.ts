// Sound cues (009, research R6). Pure: which cue, if any, a player state change should play.
import type { PlayerState } from '../player/machine'

export type Cue = 'tick' | 'chime' | 'switch' | 'start'

export function cueFor(prev: PlayerState, next: PlayerState): Cue | null {
  if (next.paused || next.phase === 'finished' || prev === next) return null
  if (next.phase === 'switchSide' && prev.phase !== 'switchSide') return 'switch'
  // A new exercise, or the second side, begins.
  if (
    next.phase === 'doing' &&
    (next.index !== prev.index || (next.side !== prev.side && next.side === 2))
  )
    return 'start'
  const timed = next.items[next.index]?.dose.kind === 'time'
  if (!timed || next.index !== prev.index) return null
  // The countdown ran out on its own (finishing early is the person's own tap: no chime).
  if (prev.phase === 'doing' && next.phase === 'rating' && prev.remaining === 1) return 'chime'
  if (
    prev.phase === 'doing' &&
    next.phase === 'doing' &&
    next.remaining < prev.remaining &&
    next.remaining >= 1 &&
    next.remaining <= 3
  )
    return 'tick'
  return null
}
