import type { Route } from './router'

type Tab = 'today' | 'library' | 'schedule' | 'progress' | 'profile'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'today',
    label: 'Today',
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  {
    id: 'library',
    label: 'Library',
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
  { id: 'progress', label: 'Progress', icon: <path d="M5 20V11M11 20V5M17 20v-6M3 20h18" /> },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </>
    ),
  },
]

function activeTab(route: Route): Tab | null {
  if (route.name === 'exercise') return 'library'
  if (route.name === 'plan' || route.name === 'set') return 'today'
  if (route.name === 'songs') return 'profile'
  if (route.name === 'player' || route.name === 'review' || route.name === 'setup') return null
  return route.name
}

export function TabBar({ route }: { route: Route }) {
  const active = activeTab(route)
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map((t) => (
        <a
          key={t.id}
          href={`#/${t.id}`}
          className="tabbar__tab"
          aria-current={active === t.id ? 'page' : undefined}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            {t.icon}
          </svg>
          {t.label}
        </a>
      ))}
    </nav>
  )
}
