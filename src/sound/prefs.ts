// The person's sound choices (009), provided by the shell from the profile.
import { createContext, useContext } from 'react'

export interface SoundPrefs {
  music: boolean
  cues: boolean
  /** Saves the music choice (the player's music button and Profile share it). */
  setMusic: (on: boolean) => void
}

/** Outside the shell (tests, review) there is no sound. */
export const SoundPrefsContext = createContext<SoundPrefs>({
  music: false,
  cues: false,
  setMusic: () => {},
})

export function useSoundPrefs(): SoundPrefs {
  return useContext(SoundPrefsContext)
}
