// Keeps the screen on while the player is open (FR-020, research R6).
import { useEffect, useState } from 'react'

export type WakeLockStatus = 'active' | 'unsupported' | 'refused' | 'idle'

export function useWakeLock(enabled: boolean): WakeLockStatus {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const [status, setStatus] = useState<'active' | 'refused' | 'idle'>('idle')

  useEffect(() => {
    if (!enabled || !supported) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const request = async () => {
      try {
        const l = await navigator.wakeLock.request('screen')
        if (cancelled) {
          void l.release()
          return
        }
        lock = l
        setStatus('active')
      } catch {
        if (!cancelled) setStatus('refused')
      }
    }

    // The browser drops the lock when the page is hidden; take it again on return.
    const onVisible = () => {
      if (document.visibilityState === 'visible' && (lock === null || lock.released)) void request()
    }

    void request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      if (lock && !lock.released) void lock.release()
    }
  }, [enabled, supported])

  return supported ? status : 'unsupported'
}
