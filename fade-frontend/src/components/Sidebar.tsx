import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon'
import Logo from './Logo'

const navItems = [
  { path: '/', label: 'Explore Communities', icon: 'explore', end: true },
]

/** Translucent top bar: content scrolls underneath it. */
export default function Sidebar() {
  return (
    <header className="material-bar sticky top-0 z-50 border-b border-black/[0.1]">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-margin sm:px-8">
        <Link
          to="/"
          aria-label="fade — home"
          className="rounded-lg transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Logo className="h-8 w-auto text-on-surface" />
        </Link>

        <nav className="flex items-center gap-space-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                [
                  'flex items-center gap-space-xs rounded-full px-space-md py-1.5 font-body-md text-body-md transition-[background-color,color,transform] duration-100 active:scale-[0.97]',
                  isActive
                    ? 'bg-black/[0.07] text-on-surface font-medium'
                    : 'text-on-surface-variant hover:bg-black/[0.04] hover:text-on-surface',
                ].join(' ')
              }
            >
              <Icon name={item.icon} className="text-lg" />
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
