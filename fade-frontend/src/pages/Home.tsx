import { useMemo, useState } from 'react'
import Icon from '../components/Icon'
import CommunityCard from '../components/CommunityCard'
import SparkBurst from '../components/SparkBurst'
import { communities, categoryPills } from '../data/mock'

const sortOptions = [
  { key: 'nearest', label: 'Nearest', icon: 'near_me' },
  { key: 'active', label: 'Most Active', icon: 'group' },
  { key: 'newest', label: 'Newest', icon: 'schedule' },
] as const

type SortKey = (typeof sortOptions)[number]['key']

export default function Home() {
  const [sort, setSort] = useState<SortKey>('nearest')

  const sortedCommunities = useMemo(() => {
    const list = [...communities]
    switch (sort) {
      case 'nearest':
        return list.sort(
          (a, b) => parseFloat(a.distanceLabel) - parseFloat(b.distanceLabel),
        )
      case 'active':
        return list.sort((a, b) => b.liveSparks - a.liveSparks)
      case 'newest':
        return list.sort((a, b) => b.id - a.id)
    }
  }, [sort])

  return (
    <div className="flex flex-col w-full pb-16">
      <title>Fade · Explore Communities</title>
      {/* Top context ribbon & headline zone */}
      <div className="pt-8 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col max-w-2xl">
          <div className="flex items-center gap-space-sm mb-2">
            <span className="inline-flex items-center gap-1.5 px-space-md py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Radius Active: 2.5 km
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
            Nearby Communities &amp; Boards
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">
            Every Spark fades after 7 days. Connect with high-tempo neighborhood pulses
            before they&apos;re gone.
          </p>
        </div>

        {/* Live ambient stats */}
        <div className="flex items-center gap-3 bg-surface-container-high px-space-lg py-space-md rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] self-start md:self-auto">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
              Active Nearby
            </span>
            <span className="font-headline-md text-headline-md text-primary font-bold tracking-tight leading-none mt-0.5">
              142 Sparks
            </span>
          </div>
          <div className="w-px h-8 bg-surface-variant mx-1" />
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
              Fading Today
            </span>
            <span className="font-headline-md text-headline-md text-tertiary-fixed-dim font-bold tracking-tight leading-none mt-0.5">
              38 Sparks
            </span>
          </div>
        </div>
      </div>

      {/* Filter, radius & category controls */}
      <div className="bg-surface-container p-space-md rounded-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] mb-8 flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center">
        <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-1">
          {categoryPills.map((pill) => (
            <button
              key={pill.label}
              type="button"
              className={`px-space-md py-space-xs rounded-full font-label-md text-label-md transition-all shrink-0 flex items-center gap-1.5 ${
                pill.active
                  ? 'bg-primary-container text-on-primary-container shadow-sm font-bold'
                  : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name={pill.icon} className={`text-sm ${pill.tone}`} />
              <span>{pill.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-space-sm shrink-0 border-t xl:border-t-0 pt-3 xl:pt-0 border-surface-variant">
          <button
            type="button"
            className="flex items-center gap-space-xs bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md px-space-md py-space-xs rounded-full transition-colors"
          >
            <Icon name="radar" className="text-sm text-primary" />
            <span>Within 2.0 km</span>
            <Icon name="expand_more" className="text-sm text-on-surface-variant" />
          </button>

          <div className="flex items-center gap-1.5 bg-surface-container-low rounded-full p-1">
            <span className="pl-space-sm pr-1 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider hidden sm:inline">
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
                  className={`flex items-center gap-1.5 px-space-md py-1 rounded-full font-label-sm text-label-sm transition-colors ${
                    isActive
                      ? 'bg-surface-bright text-on-surface font-bold shadow-sm'
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
        </div>
      </div>

      {/* Board grid — fixed-size cards, left-aligned, never full-bleed */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,360px))]">
        {sortedCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>

      {/* Create new board anchor tile */}
      <div className="mt-8 bg-surface-container p-space-lg rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.16)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-space-lg">
          <div className="relative w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-primary-container/30 shadow-[0_6px_22px_rgba(255,107,74,0.22)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(255,107,74,0.30),transparent_62%)]" />
            <SparkBurst className="spark-burst relative w-10 h-10" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Spark a Fresh Community Board
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Have an immediate neighborhood question, a rooftop meetup, or a studio tool
              exchange? Launch a topic that lives with your block and fades on its own after 7 days.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
          <button
            type="button"
            className="px-space-md py-space-xs rounded-full font-label-md text-label-md bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors"
          >
            Read Board Guidelines
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-space-lg py-2.5 rounded-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-md text-label-md transition-all shadow-md font-bold"
          >
            <Icon name="bolt" className="text-base" />
            <span>Pin New Board</span>
          </button>
        </div>
      </div>
    </div>
  )
}
