// Progress tab (005): this week, trends, body areas and recent sessions.
import { useEffect, useMemo, useState } from 'react'
import { href } from '../app/router'
import { useSchedule } from '../app/scheduleContext'
import { useSets } from '../app/setsContext'
import { recentSessions, type PastSession } from '../data/repo/sessions'
import { BODY_AREA_LABEL } from '../exercises/types'
import type { Profile } from '../profile/types'
import { CLASS_TYPE_LABEL } from '../schedule/types'
import {
  areaCoverage,
  classSessions,
  countedSessions,
  recentList,
  routineLabel,
  streaks,
  techniqueMix,
  weeklyMinutes,
  weekSummary,
  type StatSession,
  type WeekMinutes,
} from '../progress/stats'
import '../progress/progress.css'

/** Enough for 8 weeks of bars and a streak. */
const DAYS_READ = 60

const weekFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' })
const whenFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

type Loaded =
  { status: 'loading' } | { status: 'error' } | { status: 'ok'; sessions: PastSession[] }

function useProgressSessions(uid: string): Loaded {
  const [state, setState] = useState<Loaded>({ status: 'loading' })
  useEffect(() => {
    let cancelled = false
    recentSessions(uid, DAYS_READ).then(
      (sessions) => !cancelled && setState({ status: 'ok', sessions }),
      () => !cancelled && setState({ status: 'error' }),
    )
    return () => {
      cancelled = true
    }
  }, [uid])
  return state
}

export function Progress({ uid, profile }: { uid: string; profile: Profile }) {
  const loaded = useProgressSessions(uid)
  const { attendance } = useSchedule()
  const [now] = useState(() => new Date())
  // Attended classes count like sessions (010).
  const all = useMemo(
    () =>
      loaded.status === 'ok' && attendance !== null
        ? [...loaded.sessions, ...classSessions(attendance)]
        : null,
    [loaded, attendance],
  )

  return (
    <main className="screen">
      <h1>Progress</h1>
      {loaded.status !== 'error' && !all && <p className="muted">Loading your sessions…</p>}
      {loaded.status === 'error' && (
        <p className="card" role="alert">
          Couldn’t load your sessions. Check your connection and open Progress again.
        </p>
      )}
      {all && <ProgressBody sessions={all} now={now} profile={profile} />}
    </main>
  )
}

function ProgressBody({
  sessions,
  now,
  profile,
}: {
  sessions: StatSession[]
  now: Date
  profile: Profile
}) {
  const { sets } = useSets()
  const stats = useMemo(
    () => ({
      week: weekSummary(sessions, now, profile.weeklyMinutes),
      streak: streaks(sessions, now),
      weeks: weeklyMinutes(sessions, now),
      mix: techniqueMix(sessions, now),
      areas: areaCoverage(sessions, now, profile.focusAreas),
      recent: recentList(sessions),
    }),
    [sessions, now, profile.weeklyMinutes, profile.focusAreas],
  )

  if (countedSessions(sessions).length === 0) {
    return (
      <div className="card stack-sm">
        <p>
          <strong>No sessions yet.</strong>
        </p>
        <p className="muted">
          Finish an exercise in any session and your minutes, streak and body areas will show here.
        </p>
        <a className="btn btn--primary" href={href({ name: 'today' })}>
          Start a session
        </a>
      </div>
    )
  }

  const setName = (id: string) => sets?.find((s) => s.id === id)?.name
  const { week, streak } = stats
  const left = Math.max(0, week.goal - week.minutes)

  return (
    <>
      <section className="card stack-sm" aria-labelledby="week-h">
        <h2 id="week-h" className="small muted prog-eyebrow">
          This week
        </h2>
        <p className="prog-hero">
          <strong>{week.minutes}</strong> of {week.goal} min
        </p>
        <div
          className="prog-meter"
          role="progressbar"
          aria-label="Minutes this week"
          aria-valuemin={0}
          aria-valuemax={week.goal}
          aria-valuenow={Math.min(week.minutes, week.goal)}
          aria-valuetext={`${week.minutes} of ${week.goal} minutes`}
        >
          <span style={{ width: `${week.fraction * 100}%` }} />
        </div>
        <p className="small muted">
          {left > 0 ? `${left} min to your weekly goal.` : 'Weekly goal reached. Well done.'}
        </p>
        <dl className="prog-tiles">
          <div>
            <dt>Sessions</dt>
            <dd>{week.sessions}</dd>
          </div>
          <div>
            <dt>Day streak</dt>
            <dd>{streak.current}</dd>
          </div>
          <div>
            <dt>Best streak</dt>
            <dd>{streak.best}</dd>
          </div>
        </dl>
      </section>

      <WeeklyChart weeks={stats.weeks} goal={week.goal} />

      <section className="card stack-sm" aria-labelledby="mix-h">
        <h2 id="mix-h">Technique mix</h2>
        <p className="small muted">Last 4 weeks, by minutes.</p>
        {stats.mix.length === 0 ? (
          <p className="muted">Nothing in the last 4 weeks.</p>
        ) : (
          <>
            <div className="prog-stack" aria-hidden="true">
              {stats.mix.map((m) => (
                <span
                  key={m.technique}
                  className={`prog-fill--${m.technique}`}
                  style={{ flexGrow: m.minutes }}
                />
              ))}
            </div>
            <ul className="prog-legend">
              {stats.mix.map((m) => (
                <li key={m.technique}>
                  <span className={`prog-swatch prog-fill--${m.technique}`} aria-hidden="true" />
                  <span className="prog-legend__name">{CLASS_TYPE_LABEL[m.technique]}</span>
                  <span className="prog-legend__value">
                    {m.minutes} min · {m.percent}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="card stack-sm" aria-labelledby="areas-h">
        <h2 id="areas-h">Body areas, last 7 days</h2>
        {stats.areas.worked.length === 0 ? (
          <p className="muted">No exercises done in the last 7 days.</p>
        ) : (
          <ul className="prog-areas" aria-label="Areas worked">
            {stats.areas.worked.map((a) => (
              <li key={a.area} className={a.focus ? 'prog-area prog-area--focus' : 'prog-area'}>
                <span>{capital(BODY_AREA_LABEL[a.area])}</span>
                <span className="prog-area__count">{a.count}×</span>
                {a.focus && <span className="prog-area__badge">Focus</span>}
              </li>
            ))}
          </ul>
        )}
        {stats.areas.notWorked.length > 0 && (
          <p className="small">
            <span className="muted">Not worked: </span>
            {stats.areas.notWorked.map((a, i) => (
              <span key={a.area}>
                {i > 0 && ', '}
                {a.focus ? (
                  <strong>{BODY_AREA_LABEL[a.area]} (focus)</strong>
                ) : (
                  BODY_AREA_LABEL[a.area]
                )}
              </span>
            ))}
          </p>
        )}
      </section>

      <section className="stack-sm" aria-labelledby="recent-h">
        <h2 id="recent-h">Recent sessions</h2>
        <ul className="prog-recent">
          {stats.recent.map((s) => {
            const rated = [
              s.ratings.easy && `${s.ratings.easy} too easy`,
              s.ratings.right && `${s.ratings.right} just right`,
              s.ratings.hard && `${s.ratings.hard} too hard`,
            ].filter(Boolean)
            return (
              <li key={s.id} className="card">
                <div className="row-between">
                  <strong>{routineLabel(s.routine, setName)}</strong>
                  <span>{s.minutes} min</span>
                </div>
                <p className="small muted">
                  {whenFormat.format(s.startedAt)} · {s.isClass ? 'Class' : `${s.done} done`}
                  {s.skipped > 0 && ` · ${s.skipped} skipped`}
                </p>
                {rated.length > 0 && <p className="small">{rated.join(' · ')}</p>}
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}

function WeeklyChart({ weeks, goal }: { weeks: WeekMinutes[]; goal: number }) {
  const [picked, setPicked] = useState(weeks.length - 1)
  const top = Math.max(goal * 1.15, ...weeks.map((w) => w.minutes)) || 1
  const pct = (m: number) => `${(m / top) * 100}%`
  const label = (w: WeekMinutes, i: number) =>
    i === weeks.length - 1 ? 'This week' : `Week of ${weekFormat.format(w.start)}`
  const current = weeks[picked]

  return (
    <section className="card stack-sm" aria-labelledby="weeks-h">
      <h2 id="weeks-h">Minutes per week</h2>
      <p className="prog-readout" aria-live="polite">
        {label(current, picked)}: <strong>{current.minutes} min</strong>
        <span className="muted">
          {' '}
          · {current.minutes >= goal ? 'goal reached' : `${goal - current.minutes} below goal`}
        </span>
      </p>
      <div className="prog-chart">
        <div className="prog-goal" style={{ bottom: pct(goal) }}>
          <span>Goal {goal}</span>
        </div>
        {weeks.map((w, i) => (
          <button
            key={w.start.getTime()}
            type="button"
            className={i === picked ? 'prog-col prog-col--on' : 'prog-col'}
            aria-label={`${label(w, i)}: ${plural(w.minutes, 'minute')}`}
            aria-pressed={i === picked}
            onClick={() => setPicked(i)}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setPicked(i)}
          >
            <span className="prog-bar" style={{ height: w.minutes > 0 ? pct(w.minutes) : 0 }} />
          </button>
        ))}
      </div>
      <div className="prog-axis" aria-hidden="true">
        {weeks.map((w, i) => (
          <span key={w.start.getTime()}>
            {/* Every other week, so labels don't touch on a phone. */}
            {i === weeks.length - 1
              ? 'Now'
              : (weeks.length - 1 - i) % 2 === 0
                ? weekFormat.format(w.start)
                : ''}
          </span>
        ))}
      </div>
      <details className="small">
        <summary>Show as a table</summary>
        <table className="prog-table">
          <thead>
            <tr>
              <th scope="col">Week</th>
              <th scope="col">Minutes</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w, i) => (
              <tr key={w.start.getTime()}>
                <td>{label(w, i)}</td>
                <td>{w.minutes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}
