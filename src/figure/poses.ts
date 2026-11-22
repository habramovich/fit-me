// Whether the still row of key poses shows under figures (011 US6), provided by the shell from
// the profile so the choice follows the person across screens and devices.
import { createContext, useContext } from 'react'

export interface PosesPref {
  show: boolean
  /** Saves the choice. */
  setShow: (on: boolean) => void
}

/** Outside the shell (tests, review renders) the row is hidden and the choice isn't saved. */
export const PosesPrefContext = createContext<PosesPref>({ show: false, setShow: () => {} })

export function usePosesPref(): PosesPref {
  return useContext(PosesPrefContext)
}
