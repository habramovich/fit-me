import { describe, expect, it } from 'vitest'
import { MOODS } from './mood'
import { SONGS, amazonMusicUrl } from './songs'

describe('song ideas', () => {
  it('has 8–12 songs per mood', () => {
    for (const mood of MOODS) {
      const n = SONGS.filter((s) => s.mood === mood).length
      expect(n).toBeGreaterThanOrEqual(8)
      expect(n).toBeLessThanOrEqual(12)
    }
  })

  it('has no empty fields and no duplicates', () => {
    const seen = new Set<string>()
    for (const s of SONGS) {
      expect(s.title.trim()).not.toBe('')
      expect(s.artist.trim()).not.toBe('')
      expect(s.why.trim()).not.toBe('')
      const key = `${s.title}|${s.artist}`.toLowerCase()
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })

  it('links to an Amazon Music search for only the title and artist', () => {
    const song = SONGS.find((s) => s.title === 'Lovely Day')!
    expect(amazonMusicUrl(song)).toBe(
      'https://music.amazon.com/search/Lovely%20Day%20Bill%20Withers',
    )
    for (const s of SONGS) {
      const url = amazonMusicUrl(s)
      expect(url.startsWith('https://music.amazon.com/search/')).toBe(true)
      expect(decodeURIComponent(url.slice('https://music.amazon.com/search/'.length))).toBe(
        `${s.title} ${s.artist}`,
      )
    }
  })
})
