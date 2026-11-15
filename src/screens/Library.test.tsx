import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MarksProvider } from '../app/marks'
import { allExercises } from '../exercises'
import { Library } from './Library'

const setMark = vi.hoisted(() => vi.fn(async () => {}))
vi.mock('../data/repo/marks', () => ({
  watchMarks: (_uid: string, onData: (m: Record<string, string>) => void) => {
    onData({ 'dead-bug': 'favourite', 'glute-bridge': 'notForMe' })
    return () => {}
  },
  setMark,
}))

function renderLibrary() {
  render(
    <MarksProvider uid="u1">
      <Library />
    </MarksProvider>,
  )
}

const cards = () => within(screen.getByRole('list')).getAllByRole('listitem')

describe('Library', () => {
  it('lists every exercise with name and dose', () => {
    renderLibrary()
    expect(cards()).toHaveLength(allExercises.length)
    expect(screen.getByText('Bird dog')).toBeInTheDocument()
    expect(screen.getAllByText(/recommended/).length).toBeGreaterThan(0)
  })

  it('searches by body area', async () => {
    renderLibrary()
    await userEvent.type(screen.getByLabelText('Search exercises'), 'shoulders')
    const names = cards().map((c) => within(c).getByRole('link').textContent)
    expect(names.some((n) => n?.includes('Shoulder rotations'))).toBe(true)
    expect(names.some((n) => n?.includes('Glute bridge'))).toBe(false)
  })

  it('filters by technique and by favourites', async () => {
    renderLibrary()
    await userEvent.click(screen.getByRole('button', { name: 'Yoga' }))
    expect(cards().every((c) => within(c).getByText('Yoga'))).toBe(true)
    await userEvent.click(screen.getByRole('button', { name: 'Favourites' }))
    expect(cards()).toHaveLength(1)
    expect(screen.getByText('Dead bug')).toBeInTheDocument()
  })

  it('shows marks and toggles a favourite', async () => {
    renderLibrary()
    expect(screen.getByText('Not for me')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Add Bird dog to favourites' }))
    expect(setMark).toHaveBeenCalledWith('u1', 'bird-dog', 'favourite')
  })

  it('shows an empty state that clears the search', async () => {
    renderLibrary()
    await userEvent.type(screen.getByLabelText('Search exercises'), 'zzz')
    expect(screen.getByText('No exercises match.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear search and filters' }))
    expect(cards()).toHaveLength(allExercises.length)
  })
})
