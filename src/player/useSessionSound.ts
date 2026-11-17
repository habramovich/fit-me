// Music and cues for a running session (009, research R4–R6). The decisions are here; the sound
// itself comes from the engine.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cueFor } from '../sound/cues'
import { audioRunning, playCue, startMusic, stopMusic, unlockAudio } from '../sound/engine'
import type { Mood } from '../sound/mood'
import { useSoundPrefs } from '../sound/prefs'
import type { PlayerState } from './machine'

/** Pause and hide fade quickly; finishing or leaving fades gently. */
const QUICK_FADE = 0.3
const GENTLE_FADE = 1.5
/** How long the browser gets to start audio before we ask for a tap. */
const CHECK_AFTER_MS = 500

function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden')
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
  return visible
}

export interface SessionSound {
  /** Sound is wanted but the browser has not started it: show "Tap to start sound". */
  needsTap: boolean
  /** Call from a tap. */
  retry: () => void
}

export function useSessionSound(state: PlayerState, mood: Mood): SessionSound {
  const { music, cues } = useSoundPrefs()
  const visible = usePageVisible()
  const finished = state.phase === 'finished'
  const wantMusic = music && !state.paused && !finished && visible
  const wantSound = (music || cues) && !finished && visible
  const [attempt, setAttempt] = useState(0)
  /** The last check found audio not running. */
  const [stuck, setStuck] = useState(false)

  // How the music should fade if it stops now; read by the music effect's cleanup.
  const fade = useRef(GENTLE_FADE)
  useLayoutEffect(() => {
    fade.current = state.paused || !visible ? QUICK_FADE : GENTLE_FADE
  }, [state.paused, visible])

  useEffect(() => {
    if (!wantMusic) return
    startMusic(mood)
    return () => stopMusic(fade.current)
  }, [wantMusic, mood, attempt])

  // Ask for a tap if the browser kept audio off.
  useEffect(() => {
    if (!wantSound) return
    const timer = window.setTimeout(() => setStuck(!audioRunning()), CHECK_AFTER_MS)
    return () => window.clearTimeout(timer)
  }, [wantSound, attempt])
  const needsTap = wantSound && stuck

  // Cues follow the player's state changes.
  const prev = useRef(state)
  useEffect(() => {
    const cue = cueFor(prev.current, state)
    prev.current = state
    if (cue && cues && visible) playCue(cue)
  }, [state, cues, visible])

  const retry = useCallback(() => {
    unlockAudio()
    setAttempt((a) => a + 1)
  }, [])

  return { needsTap, retry }
}
