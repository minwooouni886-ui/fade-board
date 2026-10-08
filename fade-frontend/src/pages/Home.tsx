import { useState, useEffect } from 'react'
import Icon from '../components/Icon'
import CommunityCard from '../components/CommunityCard'
import { fetchCommunities, type ApiCommunity } from '../api'
import CreateCommunityModal from '../components/CreateCommunityModal'

type SortKey = 'nearest' | 'newest'

const sortOptions: { key: SortKey; label: string; icon: string }[] = [
  // { key: 'nearest', label: 'Nearest', icon: 'near_me' }, Will add when PostGIS is added
  { key: 'newest', label: 'Newest', icon: 'schedule' }
]

export default function Home() {
  const [communities, setCommunities] = useState<ApiCommunity[]>([])
  const [modalView, setModalView] = useState(false)

  useEffect( () => {
    fetchCommunities().then(communityList => {
      setCommunities(communityList)
    })
  }, [])

  const [sort, setSort] = useState<SortKey>('newest')

  // Copy the list (sort() changes the array it's called on), then sort it
  const sortedCommunities = [...communities].sort((a, b) => {
    // if (sort === 'nearest') return parseFloat(a.distanceLabel) - parseFloat(b.distanceLabel)
    return b.id - a.id // newest first
  })

  return (
    <div className="flex flex-col w-full pb-16">
      <title>Fade · Explore Communities</title>
      {/* Headline */}
      <div className="pt-12 pb-8 flex flex-col max-w-xl">
        <p className="font-body-sm text-body-sm text-primary mb-space-sm">7-day ephemeral</p>
        <h1 className="font-display-lg-mobile sm:font-display-lg text-display-lg-mobile sm:text-display-lg text-on-surface">
          Nearby Communities &amp; Boards
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-3">
          Every Spark fades after 7 days. Connect with high-tempo neighborhood pulses
          before they&apos;re gone.
        </p>
      </div>

      {/* Sort controls + New Community button */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-1 bg-surface-container-low rounded-full p-1">
          <span className="pl-space-sm pr-1 font-body-sm text-body-sm text-outline hidden sm:inline">
            Sort
          </span>
          {sortOptions.map((opt) => {
            const isActive = opt.key === sort
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSort(opt.key)}
                aria-pressed={isActive}
                className={`flex items-center gap-1.5 px-space-md py-1 rounded-full font-body-sm text-body-sm transition-[background-color,color,transform] duration-100 active:scale-[0.97] ${
                  isActive
                    ? 'bg-surface-bright text-on-surface font-medium'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon
                  name={opt.icon}
                  className={`text-sm ${isActive ? 'text-primary' : ''}`}
                />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
        
        {/* new community button modal */}
        <button
          type="button"
          onClick={() => setModalView(true)}
          className="flex items-center gap-space-xs px-space-lg py-2 rounded-full font-body-md text-body-md font-medium bg-primary-container text-on-primary-container transition-[filter,transform] duration-100 hover:brightness-110 active:scale-[0.97]"
        >
          <Icon name="add" className="text-base" />
          New Community
        </button>
      </div>
      {modalView && <CreateCommunityModal 
        onClose={() => setModalView(false)} 
        onCreated={() => fetchCommunities().then(updated => setCommunities(updated))}
      />}
      {/* Board grid — fixed-size cards, left-aligned, never full-bleed */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {sortedCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>
    </div>
  )
}
