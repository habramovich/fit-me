// Generated session music (009, research R1–R2). Pure: a seeded composer that writes one bar of
// notes at a time; the engine turns them into sound. It never loops: chords come from a random
// choice of progressions and the melody and arpeggio are random walks.
import type { Mood } from './mood'

export type Voice = 'pad' | 'bell' | 'pluck' | 'bass' | 'kick' | 'shaker'

export interface NoteEvent {
  /** Start, in beats from the start of the bar (0 ≤ beat < 4). */
  beat: number
  voice: Voice
  /** MIDI note number; ignored by kick and shaker. */
  midi: number
  /** Length in beats (may run past the bar). */
  beats: number
  /** Loudness, 0 < velocity ≤ 1. */
  velocity: number
}

export const BEATS_PER_BAR = 4

/** Major scale, as semitones above the key's root. */
export const MAJOR = [0, 2, 4, 5, 7, 9, 11]
/** Major pentatonic: melody notes that sit well over every chord used. */
const PENTATONIC = [0, 2, 4, 7, 9]

interface MoodDef {
  bpm: number
  /** MIDI number of the key's root, in the pad's octave. */
  root: number
  /** Chord roots as major-scale degrees (0 = I … 5 = vi); one is picked at random each time. */
  progressions: number[][]
  barsPerChord: number
  /** Melody slots: one per `step` beats, sounding with probability `density`. */
  melody: { voice: 'bell' | 'pluck'; step: number; density: number; beats: number }
  /** Broken-chord notes on every `step` beats, or none. */
  arpeggio?: { step: number; density: number }
  /** Bass note beats within the bar. */
  bass: number[]
  kick: number[]
  shaker: number[]
}

export const MOOD_DEFS: Record<Mood, MoodDef> = {
  calm: {
    bpm: 60,
    root: 62, // D
    progressions: [
      [0, 3, 5, 3],
      [0, 4, 5, 3],
      [5, 3, 0, 4],
      [3, 0, 4, 0],
      [0, 5, 3, 4],
    ],
    barsPerChord: 2,
    melody: { voice: 'bell', step: 1, density: 0.3, beats: 3 },
    bass: [],
    kick: [],
    shaker: [],
  },
  steady: {
    bpm: 84,
    root: 55, // G
    progressions: [
      [0, 4, 5, 3],
      [5, 3, 0, 4],
      [0, 5, 3, 4],
      [3, 4, 0, 5],
    ],
    barsPerChord: 1,
    melody: { voice: 'bell', step: 1, density: 0.2, beats: 2 },
    arpeggio: { step: 0.5, density: 0.7 },
    bass: [0, 2],
    kick: [0, 2],
    shaker: [],
  },
  upbeat: {
    bpm: 112,
    root: 60, // C
    progressions: [
      [0, 4, 5, 3],
      [5, 3, 0, 4],
      [0, 3, 4, 3],
      [3, 0, 4, 5],
    ],
    barsPerChord: 1,
    melody: { voice: 'bell', step: 0.5, density: 0.3, beats: 1 },
    arpeggio: { step: 0.5, density: 0.9 },
    bass: [0, 1.5, 2, 3],
    kick: [0, 1, 2, 3],
    shaker: [0.5, 1.5, 2.5, 3.5],
  },
}

/** Small, fast seeded PRNG; returns numbers in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** The note `degree` steps up the major scale from the root (degrees may exceed 6). */
function scaleNote(root: number, degree: number): number {
  const octave = Math.floor(degree / 7)
  return root + 12 * octave + MAJOR[((degree % 7) + 7) % 7]
}

/** Triad on a scale degree: root, third and fifth. */
function triad(root: number, degree: number): number[] {
  return [0, 2, 4].map((d) => scaleNote(root, degree + d))
}

export interface Composer {
  mood: Mood
  bpm: number
  secondsPerBar: number
  nextBar(): NoteEvent[]
}

export function makeComposer(mood: Mood, seed: number): Composer {
  const def = MOOD_DEFS[mood]
  const rnd = mulberry32(seed)
  const pick = <T>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)]
  const vel = (base: number, spread = 0.15) =>
    Math.min(1, Math.max(0.05, base + (rnd() - 0.5) * spread))

  // Melody notes: two octaves of the pentatonic scale above the pad.
  const melodyNotes: number[] = []
  for (const octave of [12, 24]) for (const s of PENTATONIC) melodyNotes.push(def.root + octave + s)
  let melodyAt = Math.floor(melodyNotes.length / 2)

  let progression = pick(def.progressions)
  let chordIndex = 0
  let barInChord = 0

  function nextChord() {
    barInChord = 0
    chordIndex++
    if (chordIndex >= progression.length) {
      chordIndex = 0
      // A different progression next time, so the harmony keeps moving.
      const others = def.progressions.filter((p) => p !== progression)
      progression = pick(others.length > 0 ? others : def.progressions)
    }
  }

  function nextBar(): NoteEvent[] {
    const events: NoteEvent[] = []
    const degree = progression[chordIndex]
    const chord = triad(def.root, degree)
    const chordLow = chord.map((n) => n - 12)

    // Pad: the chord held for the whole chord span, plus the root an octave down.
    if (barInChord === 0) {
      const beats = def.barsPerChord * BEATS_PER_BAR
      for (const n of [chordLow[0] - 12, ...chord])
        events.push({ beat: 0, voice: 'pad', midi: n, beats, velocity: vel(0.5, 0.1) })
    }

    if (def.arpeggio) {
      let at = Math.floor(rnd() * 3)
      for (let beat = 0; beat < BEATS_PER_BAR; beat += def.arpeggio.step) {
        if (rnd() < def.arpeggio.density) {
          const n = chord[at % 3] + (at >= 3 ? 12 : 0)
          events.push({
            beat,
            voice: 'pluck',
            midi: n,
            beats: def.arpeggio.step * 1.5,
            velocity: vel(beat % 1 === 0 ? 0.55 : 0.4),
          })
        }
        at = Math.min(5, Math.max(0, at + pick([-1, 1, 1, 2])))
      }
    }

    for (let beat = 0; beat < BEATS_PER_BAR; beat += def.melody.step) {
      if (rnd() >= def.melody.density) continue
      melodyAt = Math.min(
        melodyNotes.length - 1,
        Math.max(0, melodyAt + pick([-2, -1, -1, 0, 1, 1, 2])),
      )
      events.push({
        beat,
        voice: def.melody.voice,
        midi: melodyNotes[melodyAt],
        beats: def.melody.beats,
        velocity: vel(0.45, 0.25),
      })
    }

    def.bass.forEach((beat, i) => {
      // Root on the downbeats, sometimes the fifth in between.
      const n = i > 0 && beat % 2 !== 0 && rnd() < 0.5 ? chordLow[2] - 12 : chordLow[0] - 12
      events.push({ beat, voice: 'bass', midi: n, beats: 0.9, velocity: vel(0.6, 0.1) })
    })
    for (const beat of def.kick)
      events.push({
        beat,
        voice: 'kick',
        midi: 0,
        beats: 0.25,
        velocity: vel(beat === 0 ? 0.7 : 0.55, 0.1),
      })
    for (const beat of def.shaker)
      events.push({ beat, voice: 'shaker', midi: 0, beats: 0.1, velocity: vel(0.3, 0.2) })

    barInChord++
    if (barInChord >= def.barsPerChord) nextChord()
    return events
  }

  return { mood, bpm: def.bpm, secondsPerBar: (60 / def.bpm) * BEATS_PER_BAR, nextBar }
}
