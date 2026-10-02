import { Link } from 'react-router-dom'
import Icon from './Icon'
import { useMembership } from '../context/membership'
import type { Community } from '../data/mock'

export default function CommunityCard({ community }: { community: Community }) {
  const { isJoined, toggle } = useMembership()
  const joined = isJoined(community.id)

  return (
    <div className="group relative flex flex-col bg-surface-container-low rounded-xl p-space-lg transition-all duration-200 hover:-translate-y-1 shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-space-xs">
        <h3 className="font-headline-sm text-headline-sm text-on-surface transition-colors group-hover:text-primary">
          {community.name}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 min-h-[2.5rem]">
          {community.description}
        </p>
      </div>

      {/* Visual preview */}
      <div className="relative my-space-md h-32 w-full rounded-lg overflow-hidden bg-surface-container-highest">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          src={community.image}
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-on-surface font-label-sm text-label-sm bg-surface-container-lowest/90 px-2 py-0.5 rounded-full">
          <Icon name="location_on" className="text-xs text-primary-container" />
          <span>{community.distanceLabel}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-space-xs flex items-center justify-end">
        {joined ? (
          <Link
            to={`/communities/${community.id}`}
            className="flex items-center gap-1 px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors shadow-sm bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface"
          >
            <span>Enter Board</span>
            <Icon name="arrow_forward" className="text-sm" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => toggle(community.id)}
            className="flex items-center gap-1 px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors shadow-sm bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-bold"
          >
            <Icon name="add" className="text-sm" />
            <span>Join Board</span>
          </button>
        )}
      </div>
    </div>
  )
}
