// Web Audio engine (009, research R1–R6): one shared AudioContext, synthesized music voices and
// cues. Everything is a no-op where Web Audio is missing (tests, old browsers). Not unit-tested:
// jsdom has no audio; the musical decisions live in compose.ts and cues.ts.
import { makeComposer, type Composer, type NoteEvent } from './compose'
import type { Cue } from './cues'
import type { Mood } from './mood'

/** Audio Session API (Safari 16.4+); not in TypeScript's DOM types yet. */
type NavigatorWithSession = Navigator & { audioSession?: { type: string } }

const MUSIC_LEVEL = 0.32
const CUE_LEVEL = 0.7
const LOOKAHEAD = 0.3
const SCHEDULE_EVERY_MS = 50

interface Engine {
  ctx: AudioContext
  /** Fades the music in and out. */
  music: GainNode
  /** Dips the music while a cue plays. */
  duck: GainNode
  cues: GainNode
  noise: AudioBuffer
}

let engine: Engine | null = null
/** Create the context on the next tap only when the person may hear something. */
let wanted = false

function audioContextClass(): typeof AudioContext | undefined {
  if (typeof window === 'undefined') return undefined
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  )
}

function gainNode(ctx: AudioContext, value: number): GainNode {
  const g = ctx.createGain()
  g.gain.value = value
  return g
}

/** A decaying burst of noise: a soft room for the reverb. */
function impulse(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3
  }
  return buffer
}

function getEngine(): Engine | null {
  if (engine) return engine
  const Ctor = audioContextClass()
  if (!Ctor) return null
  // Mix with other apps' audio rather than interrupting it (FR-009, research R3).
  try {
    const nav = navigator as NavigatorWithSession
    if (nav.audioSession) nav.audioSession.type = 'ambient'
  } catch {
    // Not supported: the browser decides.
  }
  const ctx = new Ctor()
  const limiter = ctx.createDynamicsCompressor()
  limiter.connect(ctx.destination)
  const master = gainNode(ctx, 0.9)
  master.connect(limiter)
  const duck = gainNode(ctx, 1)
  duck.connect(master)
  const music = gainNode(ctx, 0)
  music.connect(duck)
  const reverb = ctx.createConvolver()
  reverb.buffer = impulse(ctx, 2.5)
  const wet = gainNode(ctx, 0.3)
  music.connect(reverb)
  reverb.connect(wet)
  wet.connect(duck)
  const cues = gainNode(ctx, CUE_LEVEL)
  cues.connect(master)
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
  const n = noise.getChannelData(0)
  for (let i = 0; i < n.length; i++) n[i] = Math.random() * 2 - 1
  engine = { ctx, music, duck, cues, noise }
  return engine
}

/** Marks whether the person has music or cues on, so the next tap prepares audio. */
export function setAudioWanted(on: boolean): void {
  wanted = on
}

/** Starts (or restarts) audio from a user gesture; browsers only allow sound after one. */
export function unlockAudio(): void {
  if (!engine && !wanted) return
  const e = getEngine()
  if (!e || e.ctx.state === 'running') return
  e.ctx.resume().catch(() => {})
  // iOS unlocks on a sound started inside the gesture: play one silent sample.
  const src = e.ctx.createBufferSource()
  src.buffer = e.ctx.createBuffer(1, 1, e.ctx.sampleRate)
  src.connect(e.ctx.destination)
  src.start()
}

/** Listens for the first taps and key presses (capture, so nothing can stop them). */
export function installAudioUnlock(): void {
  if (!audioContextClass()) return
  window.addEventListener('pointerdown', unlockAudio, { capture: true })
  window.addEventListener('keydown', unlockAudio, { capture: true })
}

/** True when sound can be heard now (or there is no Web Audio at all, so nothing to fix). */
export function audioRunning(): boolean {
  if (!audioContextClass()) return true
  return engine?.ctx.state === 'running'
}

// ---- Voices ----

const freq = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

/** Live sources, so stopping the music can silence notes already scheduled. */
const live = new Set<AudioScheduledSourceNode>()

function track(src: AudioScheduledSourceNode, stopAt: number) {
  live.add(src)
  src.onended = () => live.delete(src)
  src.stop(stopAt)
}

function osc(ctx: AudioContext, type: OscillatorType, hz: number, at: number): OscillatorNode {
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(hz, at)
  o.start(at)
  return o
}

function lowpass(ctx: AudioContext, hz: number): BiquadFilterNode {
  const f = ctx.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = hz
  f.Q.value = 0.4
  return f
}

/** A percussive envelope: quick attack, exponential decay. */
function strike(ctx: AudioContext, at: number, peak: number, decay: number): GainNode {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), at + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, at + decay)
  return g
}

function playNote(e: Engine, ev: NoteEvent, at: number, secondsPerBeat: number) {
  const { ctx } = e
  const dur = ev.beats * secondsPerBeat
  const hz = freq(ev.midi)
  switch (ev.voice) {
    case 'pad': {
      const filter = lowpass(ctx, 900)
      const env = ctx.createGain()
      const attack = Math.min(1.5, dur / 3)
      const end = at + dur + 1.5
      env.gain.setValueAtTime(0, at)
      env.gain.linearRampToValueAtTime(ev.velocity * 0.09, at + attack)
      env.gain.setValueAtTime(ev.velocity * 0.09, at + dur)
      env.gain.linearRampToValueAtTime(0, end)
      filter.connect(env).connect(e.music)
      const a = osc(ctx, 'triangle', hz, at)
      const b = osc(ctx, 'sawtooth', hz, at)
      b.detune.value = 7
      const bLevel = gainNode(ctx, 0.25)
      a.connect(filter)
      b.connect(bLevel).connect(filter)
      track(a, end)
      track(b, end)
      break
    }
    case 'bell': {
      const decay = dur + 1
      const env = strike(ctx, at, ev.velocity * 0.16, decay)
      env.connect(e.music)
      const a = osc(ctx, 'sine', hz, at)
      const b = osc(ctx, 'sine', hz * 2.76, at)
      const bLevel = gainNode(ctx, 0.12)
      a.connect(env)
      b.connect(bLevel).connect(env)
      track(a, at + decay)
      track(b, at + decay)
      break
    }
    case 'pluck': {
      const decay = Math.min(1, dur + 0.3)
      const env = strike(ctx, at, ev.velocity * 0.13, decay)
      const filter = lowpass(ctx, 2200)
      filter.connect(env).connect(e.music)
      const a = osc(ctx, 'triangle', hz, at)
      a.connect(filter)
      track(a, at + decay)
      break
    }
    case 'bass': {
      const decay = dur + 0.1
      const env = strike(ctx, at, ev.velocity * 0.28, decay)
      const filter = lowpass(ctx, 500)
      filter.connect(env).connect(e.music)
      const a = osc(ctx, 'triangle', hz, at)
      a.connect(filter)
      track(a, at + decay)
      break
    }
    case 'kick': {
      const env = strike(ctx, at, ev.velocity * 0.45, 0.28)
      env.connect(e.music)
      const a = osc(ctx, 'sine', 120, at)
      a.frequency.exponentialRampToValueAtTime(45, at + 0.12)
      a.connect(env)
      track(a, at + 0.3)
      break
    }
    case 'shaker': {
      const env = strike(ctx, at, ev.velocity * 0.1, 0.07)
      const filter = ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.value = 6000
      filter.connect(env).connect(e.music)
      const src = ctx.createBufferSource()
      src.buffer = e.noise
      src.connect(filter)
      src.start(at, Math.random() * 0.5)
      track(src, at + 0.08)
      break
    }
  }
}

// ---- Music ----

/** One composer per mood for the app's lifetime, so pausing and resuming carries on. */
const composers: Partial<Record<Mood, Composer>> = {}
let playing: { mood: Mood; composer: Composer; nextBarAt: number; timer: number } | null = null
let haltTimer: number | undefined
let previewTimer: number | undefined

function fadeMusic(e: Engine, to: number, seconds: number) {
  const g = e.music.gain
  const now = e.ctx.currentTime
  g.cancelScheduledValues(now)
  g.setValueAtTime(g.value, now)
  g.linearRampToValueAtTime(to, now + seconds)
}

function schedule() {
  const e = engine
  if (!e || !playing) return
  const { ctx } = e
  // After the context was suspended, don't race through the bars it missed.
  if (playing.nextBarAt < ctx.currentTime) playing.nextBarAt = ctx.currentTime + 0.05
  const secondsPerBeat = 60 / playing.composer.bpm
  while (playing.nextBarAt < ctx.currentTime + LOOKAHEAD) {
    for (const ev of playing.composer.nextBar())
      playNote(e, ev, playing.nextBarAt + ev.beat * secondsPerBeat, secondsPerBeat)
    playing.nextBarAt += playing.composer.secondsPerBar
  }
}

function halt() {
  if (playing) window.clearInterval(playing.timer)
  playing = null
  const now = engine?.ctx.currentTime ?? 0
  for (const src of live) {
    try {
      src.stop(now)
    } catch {
      // Already stopped.
    }
  }
  live.clear()
}

/** Plays music in a mood, fading in over a second; continues where that mood left off. */
export function startMusic(mood: Mood): void {
  const e = getEngine()
  if (!e) return
  if (e.ctx.state !== 'running') e.ctx.resume().catch(() => {})
  window.clearTimeout(haltTimer)
  window.clearTimeout(previewTimer)
  if (playing && playing.mood !== mood) halt()
  if (!playing) {
    const composer = (composers[mood] ??= makeComposer(mood, Math.floor(Math.random() * 2 ** 31)))
    playing = {
      mood,
      composer,
      nextBarAt: e.ctx.currentTime + 0.1,
      timer: window.setInterval(schedule, SCHEDULE_EVERY_MS),
    }
    schedule()
  }
  fadeMusic(e, MUSIC_LEVEL, 1)
}

/** Fades the music out, then stops scheduling. */
export function stopMusic(fadeSeconds: number): void {
  const e = engine
  window.clearTimeout(previewTimer)
  if (!e || !playing) return
  fadeMusic(e, 0, fadeSeconds)
  window.clearTimeout(haltTimer)
  haltTimer = window.setTimeout(halt, fadeSeconds * 1000 + 100)
}

/** A few seconds of a mood, for Profile. */
export function previewMood(mood: Mood, seconds = 8): void {
  startMusic(mood)
  previewTimer = window.setTimeout(() => stopMusic(1.5), seconds * 1000)
}

// ---- Cues ----

function tone(
  e: Engine,
  type: OscillatorType,
  midi: number,
  at: number,
  peak: number,
  decay: number,
) {
  const env = strike(e.ctx, at, peak, decay)
  env.connect(e.cues)
  const o = osc(e.ctx, type, freq(midi), at)
  o.connect(env)
  o.stop(at + decay + 0.05)
}

/** Plays a cue over the music, dipping the music for a moment so the cue is clear (FR-008). */
export function playCue(cue: Cue): void {
  const e = engine
  if (!e || e.ctx.state !== 'running') return
  const t = e.ctx.currentTime + 0.01
  const d = e.duck.gain
  d.cancelScheduledValues(t)
  d.setValueAtTime(d.value, t)
  d.linearRampToValueAtTime(0.5, t + 0.05)
  d.setValueAtTime(0.5, t + 0.6)
  d.linearRampToValueAtTime(1, t + 1)
  switch (cue) {
    case 'tick':
      tone(e, 'sine', 81, t, 0.25, 0.08)
      break
    case 'chime':
      tone(e, 'sine', 84, t, 0.3, 1.4)
      tone(e, 'sine', 88, t + 0.16, 0.25, 1.6)
      break
    case 'switch':
      tone(e, 'triangle', 79, t, 0.3, 0.25)
      tone(e, 'triangle', 74, t + 0.18, 0.3, 0.25)
      tone(e, 'triangle', 79, t + 0.36, 0.3, 0.35)
      break
    case 'start':
      tone(e, 'sine', 72, t, 0.25, 0.4)
      tone(e, 'sine', 76, t + 0.09, 0.25, 0.4)
      tone(e, 'sine', 79, t + 0.18, 0.28, 0.6)
      break
  }
}

/** Every cue once, spaced out, for Profile. */
export function previewCues(): void {
  const e = getEngine()
  if (!e) return
  if (e.ctx.state !== 'running') e.ctx.resume().catch(() => {})
  const order: [Cue, number][] = [
    ['start', 0],
    ['tick', 1000],
    ['tick', 2000],
    ['tick', 3000],
    ['chime', 4000],
    ['switch', 6000],
  ]
  for (const [cue, ms] of order) window.setTimeout(() => playCue(cue), 150 + ms)
}
