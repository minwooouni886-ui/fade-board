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
      <title>Fade · Explore boards</title>
      {/* Headline */}
      <div className="pt-14 pb-10 flex flex-col max-w-xl">
        <h1 className="taped font-display-lg-mobile sm:font-display-lg text-display-lg-mobile sm:text-display-lg font-black leading-[1.45] sm:leading-[1.45]">
          <span className="tape">Neighborhood boards</span>
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-5">
          Pin up what&apos;s happening around you. Every note comes down on its own,
          within a week.
        </p>
      </div>

      {/* Sort controls + New board button */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-1 cutout bg-paper rounded-full p-1">
          <span className="pl-space-sm pr-1 font-body-sm text-body-sm text-on-surface-variant hidden sm:inline">
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
                    ? 'bg-sun text-ink font-bold'
                    : 'text-on-surface-variant hover:text-ink'
                }`}
              >
                <Icon name={opt.icon} className="text-sm" />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
        
        {/* New board button and its modal */}
        <button
          type="button"
          onClick={() => setModalView(true)}
          className="press flex items-center gap-space-xs px-space-lg py-2 rounded-full font-body-md text-body-md font-bold bg-sun text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <Icon name="add" className="text-base" />
          New board
        </button>
      </div>
      {modalView && <CreateCommunityModal 
        onClose={() => setModalView(false)} 
        onCreated={() => fetchCommunities().then(updated => setCommunities(updated))}
      />}
      {/* Board grid: cut-out cards with room for their tilt and stickers */}
      <div className="grid items-start gap-x-6 gap-y-12 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {sortedCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>
    </div>
  )
}
