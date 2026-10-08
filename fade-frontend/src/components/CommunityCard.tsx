import { Link } from 'react-router-dom'
import Icon from './Icon'
import type { ApiCommunity } from '../api'

export default function CommunityCard({ community }: { community: ApiCommunity }) {
  return (
    <Link
      to={`/communities/${community.id}`}
      className="group flex min-h-[10rem] flex-col gap-space-md rounded-[20px] bg-surface-container-low p-space-lg transition-[transform,background-color] duration-100 ease-out hover:bg-surface-container active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="flex flex-col gap-space-xs">
        <h3 className="font-headline-sm text-headline-sm font-medium tracking-[-0.01em] text-on-surface">
          {community.name}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
          {community.description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between font-body-sm text-body-sm text-outline">
        <span className="flex items-center gap-1 min-w-0">
          <Icon name="location_on" className="text-base text-primary-container" />
          <span className="truncate">{community.location}</span>
        </span>
        <Icon
          name="chevron_right"
          className="text-xl transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  )
}
