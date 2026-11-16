import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { warriorTwo } from '../exercises/data/warrior-two'
import { Figure } from './Figure'
import { FigureStyleContext } from './style'

const spec = warriorTwo.standard.figure
const isDoodle = (c: HTMLElement) =>
  c.querySelector('figure')!.classList.contains('fm-figure--doodle')

describe('Figure style', () => {
  it('draws Classic by default', () => {
    const { container } = render(<Figure spec={spec} thumbnail />)
    expect(isDoodle(container)).toBe(false)
  })

  it('draws Doodle when the context says so', () => {
    const { container } = render(
      <FigureStyleContext.Provider value="doodle">
        <Figure spec={spec} thumbnail />
      </FigureStyleContext.Provider>,
    )
    expect(isDoodle(container)).toBe(true)
  })

  it('lets the figureStyle prop override the context', () => {
    const { container } = render(
      <FigureStyleContext.Provider value="doodle">
        <Figure spec={spec} thumbnail figureStyle="classic" />
      </FigureStyleContext.Provider>,
    )
    expect(isDoodle(container)).toBe(false)
  })

  it('keeps the same screen-reader description in both styles', () => {
    const label = (style: 'classic' | 'doodle') =>
      render(<Figure spec={spec} figureStyle={style} still={0} />)
        .container.querySelector('svg[role="img"]')!
        .getAttribute('aria-label')
    expect(label('doodle')).toBe(spec.alt)
    expect(label('classic')).toBe(spec.alt)
  })
})
