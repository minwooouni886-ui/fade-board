import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import SparkCard from '../components/SparkCard'
import { useMembership } from '../context/membership'
import {
  communities,
  sparks,
  currentUser,
  fadingToday,
  filterTabs,
} from '../data/mock'

const lifespans = ['24h', '3d', '7d Max']

export default function Community() {
  const { id } = useParams()
  const community = useMemo(
    () => communities.find((c) => String(c.id) === id),
    [id],
  )
  const feed = useMemo(() => {
    const scoped = sparks.filter((s) => String(s.communityId) === id)
    return scoped.length ? scoped : sparks
  }, [id])

  const [activeTab, setActiveTab] = useState(filterTabs[0].key)
  const [lifespan, setLifespan] = useState(lifespans[0])
  const [draft, setDraft] = useState('')
  const { isJoined, toggle, memberCount } = useMembership()

  if (!community) {
    return (
      <div className="py-16 flex flex-col items-center gap-space-md text-center">
        <title>Fade · Board not found</title>
        <Icon name="cloud_off" className="text-4xl text-on-surface-variant" />
        <h1 className="font-headline-md text-headline-md text-on-surface">Board not found</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          This board may have already faded.
        </p>
        <Link
          to="/"
          className="mt-2 px-space-lg py-space-xs rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold"
        >
          Back to Explore
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full pb-16 pt-gutter">
      <title>{`Fade · ${community.name}`}</title>
      {/* Board sub-header hero */}
      <div className="relative w-full rounded-2xl bg-surface-container-low p-space-xl mb-gutter shadow-sm overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-primary-container/15 via-tertiary/10 to-transparent pointer-events-none blur-2xl" />
        <div className="relative flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
              <Link className="hover:text-primary transition-colors" to="/">
                Communities
              </Link>
              <Icon name="chevron_right" className="text-sm" />
              <span className="text-on-surface font-headline-sm">{community.name}</span>
              <span className="ml-space-xs px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm">
                Live Hub
              </span>
            </div>
            <div className="flex items-center gap-space-lg">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
                <span className="text-on-surface font-bold">{memberCount(community)}</span> members online
              </div>
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                <Icon name="dynamic_feed" className="text-base text-primary" />
                <span className="text-on-surface font-bold">{community.liveSparks}</span> live Sparks
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-space-xs max-w-2xl">
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
              {community.name}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {community.description}
            </p>
            <div className="flex items-center gap-space-xs mt-space-xs font-label-sm text-label-sm text-on-surface-variant">
              <Icon name="schedule" className="text-sm text-tertiary" />
              <span>Every Spark fades within 7 days — nothing here is kept.</span>
            </div>
            <div className="mt-space-sm">
              {isJoined(community.id) ? (
                <button
                  type="button"
                  onClick={() => toggle(community.id)}
                  className="group/join flex items-center gap-space-xs px-space-lg py-space-xs rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold transition-colors hover:bg-error-container hover:text-on-error-container"
                >
                  <Icon name="check" className="text-sm group-hover/join:hidden" />
                  <Icon name="logout" className="text-sm hidden group-hover/join:inline" />
                  <span className="group-hover/join:hidden">Joined</span>
                  <span className="hidden group-hover/join:inline">Leave board</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => toggle(community.id)}
                  className="flex items-center gap-space-xs px-space-lg py-space-xs rounded-full bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-md text-label-md font-bold transition-colors shadow-sm"
                >
                  <Icon name="add" className="text-sm" />
                  <span>Join Board</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action bar / feed tabs */}
      <div className="flex flex-wrap items-center justify-between gap-space-md mb-gutter">
        <div className="flex items-center gap-space-xs bg-surface-container-low p-1.5 rounded-full">
          {filterTabs.map((tab) => {
            const isActive = tab.key === activeTab
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-space-lg py-space-xs rounded-full font-label-md text-label-md transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <Icon name={tab.icon} className={`text-sm ${isActive ? '' : tab.tone}`} />
                {tab.label}
                {tab.dot && <span className="w-2 h-2 rounded-full bg-primary-container" />}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-space-md">
          <div className="relative flex items-center">
            <Icon
              name="filter_list"
              className="absolute left-space-md text-on-surface-variant text-base pointer-events-none"
            />
            <input
              className="bg-surface-container-low rounded-full pl-9 pr-space-md py-space-xs text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm focus:outline-none focus:bg-surface-container w-64 transition-colors"
              placeholder="Filter tags, authors, roles..."
              type="text"
            />
          </div>
          <button
            type="button"
            className="flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-label-md text-label-md px-space-lg py-space-xs rounded-full shadow-md transition-all"
          >
            <Icon name="add_circle" className="text-base" />
            <span>New Spark</span>
          </button>
        </div>
      </div>

      {/* Inline rapid composer */}
      <div className="bg-surface-container-low rounded-2xl p-space-lg mb-gutter shadow-sm">
        <div className="flex items-start gap-space-md">
          <img
            className="w-10 h-10 rounded-full object-cover shrink-0"
            src={currentUser.avatar}
            alt=""
          />
          <div className="flex flex-col flex-1 gap-space-sm">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full bg-surface-container rounded-xl p-space-md text-on-surface placeholder:text-on-surface-variant font-body-md text-body-md focus:outline-none resize-none transition-colors"
              placeholder="Drop a design critique, studio desk share, or brief gig — your Spark fades out automatically"
              rows={2}
            />
            <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
              <div className="flex items-center gap-space-xs bg-surface-container px-space-md py-1 rounded-full">
                <Icon name="timer" className="text-sm text-tertiary" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Fade after:
                </span>
                <div className="flex items-center gap-1 ml-1">
                  {lifespans.map((span) => (
                    <button
                      key={span}
                      type="button"
                      onClick={() => setLifespan(span)}
                      className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm ${
                        lifespan === span
                          ? 'bg-primary-container text-on-primary-container'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {span}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-space-sm">
                {['link', 'image', 'location_on'].map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <Icon name={icon} className="text-base" />
                  </button>
                ))}
                <button
                  type="button"
                  className="ml-space-xs px-space-lg py-1.5 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-bold hover:bg-primary hover:text-on-primary transition-all"
                >
                  Ignite Spark
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Main feed */}
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          {feed.map((spark) => (
            <SparkCard key={spark.id} spark={spark} />
          ))}
        </div>

        {/* Right sidebar */}
        <aside className="lg:col-span-4 flex flex-col gap-gutter">
          {/* Fading out today */}
          <div className="relative bg-surface-container-low rounded-2xl p-space-lg shadow-sm overflow-hidden">
            <div className="flex items-center justify-between pb-space-md mb-space-md border-b border-surface-container-highest">
              <div className="flex items-center gap-space-xs">
                <Icon name="hourglass_empty" className="text-primary-container text-xl animate-bounce" />
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Fading Out Today
                </span>
              </div>
              <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-error-container/60 text-error font-bold">
                &lt; 6h Left
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              These Sparks fade within hours. Capture notes or contact the creator now.
            </p>
            <div className="flex flex-col gap-space-md">
              {fadingToday.map((item) => (
                <div
                  key={item.title}
                  className="p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-label-sm text-label-sm font-bold ${item.tone}`}>
                      {item.left}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {item.handle}
                    </span>
                  </div>
                  <p className="font-label-md text-label-md text-on-surface font-semibold line-clamp-1">
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {item.place}
                    </span>
                    <Icon name="signal_cellular_alt" className="text-sm text-tertiary" />
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="px-space-md py-space-sm text-on-surface-variant font-body-sm text-body-sm flex items-center justify-between">
            <span>Curated for SoHo creatives</span>
            <a className="text-primary hover:underline font-label-sm text-label-sm" href="#policy">
              Board Policy &amp; Ethics
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}
