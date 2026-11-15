// The person's figure style (007): Classic (solid figure) or Doodle (line drawing with a face).
import { createContext, useContext } from 'react'

export type FigureStyle = 'classic' | 'doodle'

export const FIGURE_STYLES: readonly FigureStyle[] = ['classic', 'doodle']

/** Provided by the shell from the profile; Classic outside it (tests, review renders). */
export const FigureStyleContext = createContext<FigureStyle>('classic')

export function useFigureStyle(): FigureStyle {
  return useContext(FigureStyleContext)
}
