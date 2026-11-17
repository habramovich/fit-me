// Song ideas for the person's own Amazon Music playlist (009, research R7). Fixed content, the
// same for everyone; the owner checks every link before release.
import type { Mood } from './mood'

export interface Song {
  title: string
  artist: string
  mood: Mood
  /** Why it suits the mood, in a few words. */
  why: string
}

export const SONGS: readonly Song[] = [
  // Calm: slow, mostly instrumental, no strong beat.
  {
    mood: 'calm',
    title: 'Weightless',
    artist: 'Marconi Union',
    why: 'Slow ambient, made to unwind',
  },
  { mood: 'calm', title: 'Gymnopédie No. 1', artist: 'Erik Satie', why: 'Slow solo piano' },
  { mood: 'calm', title: 'Clair de lune', artist: 'Claude Debussy', why: 'Gentle piano, no beat' },
  { mood: 'calm', title: 'Nuvole Bianche', artist: 'Ludovico Einaudi', why: 'Calm, flowing piano' },
  { mood: 'calm', title: 'Saman', artist: 'Ólafur Arnalds', why: 'Soft piano, very slow' },
  { mood: 'calm', title: 'An Ending (Ascent)', artist: 'Brian Eno', why: 'Floating, no beat' },
  { mood: 'calm', title: 'Spiegel im Spiegel', artist: 'Arvo Pärt', why: 'Slow violin and piano' },
  { mood: 'calm', title: 'Watermark', artist: 'Enya', why: 'Soft and spacious' },
  { mood: 'calm', title: 'River Flows in You', artist: 'Yiruma', why: 'Flowing piano' },
  {
    mood: 'calm',
    title: 'The Lark Ascending',
    artist: 'Ralph Vaughan Williams',
    why: 'Long, slow violin lines; good for tai chi',
  },

  // Steady: relaxed, even beat for strength work and desk breaks.
  { mood: 'steady', title: 'Lovely Day', artist: 'Bill Withers', why: 'Relaxed, even beat' },
  {
    mood: 'steady',
    title: 'Three Little Birds',
    artist: 'Bob Marley & The Wailers',
    why: 'Easy, unhurried lilt',
  },
  {
    mood: 'steady',
    title: 'Put Your Records On',
    artist: 'Corinne Bailey Rae',
    why: 'Light, steady groove',
  },
  { mood: 'steady', title: 'Banana Pancakes', artist: 'Jack Johnson', why: 'Laid-back strum' },
  { mood: 'steady', title: 'Africa', artist: 'Toto', why: 'Mid-tempo and steady' },
  {
    mood: 'steady',
    title: 'Everybody Wants to Rule the World',
    artist: 'Tears for Fears',
    why: 'Smooth, rolling beat',
  },
  { mood: 'steady', title: 'Riptide', artist: 'Vance Joy', why: 'Bright, even strum' },
  { mood: 'steady', title: 'Dreams', artist: 'Fleetwood Mac', why: 'Smooth, steady groove' },
  { mood: 'steady', title: 'Stand by Me', artist: 'Ben E. King', why: 'Classic, unhurried beat' },
  { mood: 'steady', title: 'Here Comes the Sun', artist: 'The Beatles', why: 'Bright and easy' },

  // Upbeat: danceable, good for low-impact cardio.
  { mood: 'upbeat', title: 'September', artist: 'Earth, Wind & Fire', why: 'Joyful, danceable' },
  {
    mood: 'upbeat',
    title: 'I Wanna Dance with Somebody (Who Loves Me)',
    artist: 'Whitney Houston',
    why: 'Bright dance pop',
  },
  { mood: 'upbeat', title: 'Dancing Queen', artist: 'ABBA', why: 'Easy to step along to' },
  {
    mood: 'upbeat',
    title: 'Uptown Funk',
    artist: 'Mark Ronson feat. Bruno Mars',
    why: 'Funky, steady stomp',
  },
  {
    mood: 'upbeat',
    title: "Can't Stop the Feeling!",
    artist: 'Justin Timberlake',
    why: 'Feel-good groove',
  },
  {
    mood: 'upbeat',
    title: 'Walking on Sunshine',
    artist: 'Katrina and the Waves',
    why: 'Brisk and cheerful',
  },
  { mood: 'upbeat', title: 'Le Freak', artist: 'Chic', why: 'Disco, a beat on every step' },
  { mood: 'upbeat', title: 'Shut Up and Dance', artist: 'Walk the Moon', why: 'Energetic march' },
  { mood: 'upbeat', title: 'Levitating', artist: 'Dua Lipa', why: 'Light disco-pop beat' },
  { mood: 'upbeat', title: 'Good as Hell', artist: 'Lizzo', why: 'Confident, bouncy beat' },
]

/** An Amazon Music search for the song: carries only its title and artist (FR-014). */
export function amazonMusicUrl(song: Song): string {
  return `https://music.amazon.com/search/${encodeURIComponent(`${song.title} ${song.artist}`)}`
}
