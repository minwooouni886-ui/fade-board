import Icon from './Icon'

export default function Topbar() {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-xl">
      <div className="flex items-center gap-space-lg">
        <div className="flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full">
          <Icon name="near_me" className="text-base text-primary-container" />
          <span className="font-label-sm text-label-sm text-on-surface">
            SoHo, New York (2km)
          </span>
        </div>
        <div className="relative flex items-center">
          <Icon
            name="search"
            className="absolute left-space-md text-on-surface-variant text-base pointer-events-none"
          />
          <input
            className="bg-surface-container-high rounded-full pl-9 pr-space-md py-space-xs text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-highest w-72 transition-colors"
            placeholder="Search local boards, sparks, tags..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-space-md">
        <button
          type="button"
          className="flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high text-on-surface px-space-md py-space-xs rounded-full transition-colors"
        >
          <Icon name="tune" className="text-base" />
          <span className="font-label-sm text-label-sm">Filter Radius</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-space-xs bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-md text-label-md px-space-lg py-space-xs rounded-full shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all"
        >
          <Icon name="add" className="text-base" />
          <span>New Spark</span>
        </button>
      </div>
    </header>
  )
}
