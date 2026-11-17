// Song ideas (009 US3): suggestions per mood, each opening an Amazon Music search.
import { useState } from 'react'
import { goBack } from '../app/router'
import { MOODS, MOOD_LABEL, type Mood } from '../sound/mood'
import { SONGS, amazonMusicUrl } from '../sound/songs'

const MOOD_HINT: Record<Mood, string> = {
  calm: 'Calm morning, Weekend longer',
  steady: 'Desk break, Strength keeper',
  upbeat: 'Cardio',
}

export function Songs() {
  const [offline, setOffline] = useState(false)
  return (
    <main className="screen">
      <button
        type="button"
        className="back-link back-link--button"
        onClick={() => goBack({ name: 'profile' })}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Profile
      </button>
      <div className="stack-sm">
        <h1>Song ideas</h1>
        <p className="muted small">
          Tap a song to find it in Amazon Music and add it to your own playlist. FitMe can’t add
          songs for you; tapping tells Amazon only which song you picked.
        </p>
      </div>
      {offline && (
        <div className="card notice notice--row" role="status">
          <span className="small">Opening a song needs a connection.</span>
          <button type="button" className="btn btn--link" onClick={() => setOffline(false)}>
            OK
          </button>
        </div>
      )}
      {MOODS.map((mood) => (
        <section key={mood} className="stack" aria-labelledby={`songs-${mood}`}>
          <div className="stack-sm">
            <h2 id={`songs-${mood}`}>{MOOD_LABEL[mood]}</h2>
            <p className="muted small">{MOOD_HINT[mood]}</p>
          </div>
          <ul className="card card--list song-list">
            {SONGS.filter((s) => s.mood === mood).map((s) => (
              <li key={`${s.title}|${s.artist}`}>
                <a
                  href={amazonMusicUrl(s)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="song"
                  onClick={(e) => {
                    if (!navigator.onLine) {
                      e.preventDefault()
                      setOffline(true)
                    }
                  }}
                >
                  <span className="song__title">{s.title}</span>
                  <span className="muted small">
                    {s.artist} · {s.why}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
