import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'
import Logo from './Logo'

const navItems = [
  { path: '/', label: 'Explore Communities', icon: 'explore', end: true },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col p-margin">
      <div className="flex flex-col gap-space-xl">
        <div className="flex flex-col items-start px-space-xs">
          <Link
            to="/"
            aria-label="fade — home"
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Logo className="h-9 w-auto max-w-full text-on-surface" />
          </Link>
          <span className="font-label-sm text-label-sm text-secondary uppercase mt-1 tracking-wider">
            7-day ephemeral
          </span>
        </div>

        <nav className="flex flex-col gap-space-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-space-md px-space-md py-space-md rounded-xl transition-colors font-label-md text-label-md',
                  isActive
                    ? 'bg-surface-container text-primary font-bold shadow-[0_1px_8px_rgba(0,0,0,0.04)]'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                ].join(' ')
              }
            >
              <Icon name={item.icon} className="text-lg" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
