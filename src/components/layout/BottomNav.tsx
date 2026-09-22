import { NavLink } from 'react-router-dom'
import { BodyIcon, CalendarIcon, ChartIcon, DumbbellIcon, UserIcon } from '@/components/icons'

const items = [
  { to: '/', label: 'Hoy', icon: DumbbellIcon, end: true },
  { to: '/calendario', label: 'Calendario', icon: CalendarIcon, end: false },
  { to: '/estadisticas', label: 'Stats', icon: ChartIcon, end: false },
  { to: '/cuerpo', label: 'Cuerpo', icon: BodyIcon, end: false },
  { to: '/perfil', label: 'Perfil', icon: UserIcon, end: false },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-(--color-border) bg-(--color-surface)/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegación principal"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-(--color-accent)' : 'text-(--color-ink-muted)'
                }`
              }
            >
              <Icon width={22} height={22} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
