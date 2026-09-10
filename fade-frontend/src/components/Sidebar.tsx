import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'
import Logo from './Logo'
import { currentUser } from '../data/mock'

const navItems = [
  { path: '/', label: 'Explore Communities', icon: 'explore', end: true },
  { path: '/my-boards', label: 'My Boards', icon: 'dashboard_customize' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col justify-between p-margin">
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

          <a
            className="flex items-center justify-between px-space-md py-space-md rounded-xl text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high hover:text-on-surface transition-colors"
            href="#expiring-soon"
          >
            <div className="flex items-center gap-space-md">
              <Icon name="hourglass_bottom" className="text-lg text-primary-container" />
              <span>Expiring Soon</span>
            </div>
            <span className="font-label-sm text-label-sm bg-primary-container text-on-primary-container px-space-xs py-0.5 rounded-full font-bold">
              24h
            </span>
          </a>

          <a
            className="flex items-center gap-space-md px-space-md py-space-md rounded-xl text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high hover:text-on-surface transition-colors"
            href="#activity"
          >
            <Icon name="bolt" className="text-lg text-tertiary" />
            <span>Activity &amp; Sparks</span>
          </a>
        </nav>
      </div>

      <div className="flex flex-col gap-space-md">
        <button
          type="button"
          className="flex items-center gap-space-md w-full text-left bg-surface-container hover:bg-surface-container-high transition-colors rounded-xl p-space-md shadow-[0_1px_8px_rgba(0,0,0,0.12)] ring-1 ring-surface-container-high"
        >
          <img
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-surface-container-highest shrink-0"
            src={currentUser.avatar}
          />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-label-md text-label-md text-on-surface truncate">
              {currentUser.name}
            </span>
            <span className="font-label-sm text-label-sm text-secondary truncate">
              {currentUser.status}
            </span>
          </div>
          <Icon
            name="more_vert"
            className="text-on-surface-variant text-lg shrink-0"
          />
        </button>
      </div>
    </aside>
  )
}
