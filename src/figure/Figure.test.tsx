import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { warriorTwo } from '../exercises/data/warrior-two'
import { Figure } from './Figure'
import { PoseStrip, PoseStripIfShown, PosesToggle } from './PoseStrip'
import { PosesPrefContext } from './poses'
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

describe('Figure caption (011)', () => {
  it('always keeps the caption row in a full figure, even without a label', () => {
    const withLabel = render(<Figure spec={spec} still={0} />).container
    expect(withLabel.querySelector('figcaption')?.textContent).toContain(spec.labels[0])
    const noLabels = { ...spec, labels: spec.labels.map(() => '') }
    const empty = render(<Figure spec={noLabels} still={0} />).container
    const caption = empty.querySelector('figcaption')
    expect(caption).not.toBeNull()
    expect(caption).toHaveAttribute('aria-hidden', 'true')
  })

  it('has no caption in a thumbnail', () => {
    const { container } = render(<Figure spec={spec} thumbnail />)
    expect(container.querySelector('figcaption')).toBeNull()
  })
})

describe('Pose strip (011 US6)', () => {
  it('draws each key pose numbered, with the move that starts there', () => {
    render(<PoseStrip spec={spec} />)
    const poses = screen.getAllByRole('listitem')
    expect(poses).toHaveLength(spec.keyframes.length)
    poses.forEach((pose, i) => {
      expect(pose).toHaveAccessibleName(`Pose ${i + 1} of ${spec.keyframes.length}`)
      expect(pose).toHaveTextContent(spec.labels[i])
    })
    // The whole-movement description isn't repeated for every pose.
    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })

  it('is hidden by default; the toggle saves the choice', async () => {
    const user = userEvent.setup()
    render(
      <>
        <PosesToggle />
        <PoseStripIfShown spec={spec} />
      </>,
    )
    expect(screen.queryByRole('list', { name: 'Key poses' })).not.toBeInTheDocument()
    const setShow = vi.fn()
    render(
      <PosesPrefContext.Provider value={{ show: false, setShow }}>
        <PosesToggle />
      </PosesPrefContext.Provider>,
    )
    await user.click(screen.getAllByRole('button', { name: 'Show poses' })[1])
    expect(setShow).toHaveBeenCalledWith(true)
  })

  it('shows the strip when the person has it on', () => {
    render(
      <PosesPrefContext.Provider value={{ show: true, setShow: () => {} }}>
        <PosesToggle />
        <PoseStripIfShown spec={spec} />
      </PosesPrefContext.Provider>,
    )
    expect(screen.getByRole('list', { name: 'Key poses' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hide poses' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
