import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Icon from '../components/Icon'
import NoteCard from '../components/NoteCard'
import CreateNoteModal from '../components/CreateNoteModal'
import CoverArt from '../components/CoverArt'
import MapCover from '../components/MapCover'
import { paperFor } from '../paper'
import { fetchCommunities, fetchCommunityPosts, type ApiCommunity, type ApiPost } from '../api'

// How long an expired note stays on screen reading "Faded" before it dissolves
const FADE_HOLD_MS = 600
const HOUR_MS = 60 * 60 * 1000

// Which timeline group a note falls in, by when it comes down
function groupFor(expiresAt: number, now: number) {
  if (expiresAt - now < HOUR_MS) return 'Coming down soon'
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)
  if (expiresAt <= endOfToday.getTime()) return 'Later today'
  if (expiresAt <= endOfToday.getTime() + 24 * HOUR_MS) return 'Tomorrow'
  return 'Later this week'
}

export default function Community() {
  const { id } = useParams()
  const reduceMotion = useReducedMotion()
  const [community, setCommunity] = useState<ApiCommunity | null>(null)
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [composerOpen, setComposerOpen] = useState(false)
  const noteButton = useRef<HTMLButtonElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Load the board and its posts from the backend when the page opens
  useEffect(() => {
    if (!id) return

    Promise.all([fetchCommunities(), fetchCommunityPosts(id)])
      .then(([allCommunities, communityPosts]) => {
        setCommunity(allCommunities.find((c) => String(c.id) === id) ?? null)
        // Only keep posts that haven't expired yet
        setPosts(communityPosts.filter((p) => new Date(p.expires_at).getTime() > Date.now()))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [id])

  // Reload the feed after a new note is pinned
  function refreshPosts() {
    if (!id) return
    fetchCommunityPosts(id).then((all) =>
      setPosts(all.filter((p) => new Date(p.expires_at).getTime() > Date.now())),
    )
  }

  // Loading, error, or board not found: show a simple message instead of the page
  if (status !== 'ready' || !community) {
    let message = 'Board not found.'
    if (status === 'loading') message = 'Loading board...'
    if (status === 'error') message = "Couldn't load this board. Is the backend running?"

    return <p className="py-16 text-center font-body-lg text-body-lg text-on-surface-variant">{message}</p>
  }

  // Derived from `now` on every tick: a note leaves the feed once its hold has passed,
  // while the header counts only the notes that are still up
  const visiblePosts = posts.filter((p) => new Date(p.expires_at).getTime() + FADE_HOLD_MS > now)
  const liveCount = posts.filter((p) => new Date(p.expires_at).getTime() > now).length

  // A note dissolves in place (fade, shrink a little, blur) and arrives the same way in reverse.
  // Reduced motion keeps only the cross-fade.
  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: 'blur(4px)' }
  const shown = reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)' }
  const dissolve = reduceMotion ? { duration: 0.2 } : { duration: 0.35, ease: 'easeOut' as const }

  const { paper } = paperFor(community.id)
  const hasMap = community.lat != null && community.lon != null

  // Timeline: notes sorted by when they come down, split into groups. Each group is its own block,
  // so its label only sticks while that group's notes are on screen (one long list made every
  // passed label pile up at the top).
  const sorted = [...visiblePosts].sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime())
  const groups: { label: string; posts: ApiPost[] }[] = []
  for (const post of sorted) {
    const label = groupFor(new Date(post.expires_at).getTime(), now)
    if (groups.at(-1)?.label !== label) groups.push({ label, posts: [] })
    groups.at(-1)!.posts.push(post)
  }

  const countLabel = liveCount === 1 ? '1 note up' : `${liveCount} notes up`

  return (
    <div className="flex w-full flex-col pb-16">
      <title>{`Fade · ${community.name}`}</title>

      {/* Header: a full-width band with the board's image as its background and its details on top.
          The ink line under it separates the board from its notes. mx-[calc(50%-50vw)] lets the band
          reach both edges of the window from inside the page's centered column. */}
      <header className="relative mx-[calc(50%-50vw)] mb-12 border-b-2 border-ink">
        <CoverArt id={community.id} paper={paper} className="absolute inset-0 h-full w-full" />
        {/* Like Luma: a dark ink shade over the photo, heaviest behind the text so white text stays
            readable and lighter on the right so the photo shows. On narrow screens the text covers
            the whole photo, so the shade is even. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-ink/70 md:bg-transparent md:bg-gradient-to-r md:from-ink/85 md:from-30% md:via-ink/60 md:to-ink/20"
        />
        <div className="relative mx-auto max-w-5xl px-margin py-14 text-paper sm:px-8 sm:py-20">
          <div className="max-w-xl">
            {community.location && (
              <p className="flex items-center gap-1 font-headline-sm text-headline-sm font-medium">
                <Icon name="location_on" className="text-xl" />
                {community.location}
              </p>
            )}
            <h1 className="taped mt-space-sm font-display-lg-mobile sm:font-display-lg text-display-lg-mobile sm:text-display-lg font-black">
              <span className="tape tape-light">{community.name}</span>
            </h1>
            <hr className="my-space-lg border-t-2 border-paper/30" />
            {community.description && (
              <p className="font-body-lg text-body-lg text-paper/90">{community.description}</p>
            )}
            <div className="mt-space-lg flex flex-wrap items-center gap-space-md">
              <button
                ref={noteButton}
                type="button"
                onClick={() => setComposerOpen(true)}
                className="press flex items-center gap-space-xs px-space-lg py-2 rounded-full font-body-md text-body-md font-bold bg-sun text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-paper"
              >
                <Icon name="push_pin" className="text-base" />
                Pin a note
              </button>
              <p className="font-body-sm text-body-sm font-bold">{countLabel}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Below: the timeline of notes, with a sidebar of the board's details next to it */}
      <div className="grid items-start gap-space-xl lg:grid-cols-[minmax(0,1fr)_17rem]">
        <section>
          <h2 className="mb-space-lg font-headline-md text-headline-md font-black">Notes</h2>

          {/* A dashed line down the left, group headings on it, notes beside it */}
          <div className="relative pl-8">
            {/* One solid line the group dots sit on and the notes branch off from */}
            <span aria-hidden="true" className="absolute bottom-0 left-[7px] top-2 w-0.5 bg-ink/25" />
            {visiblePosts.length === 0 && (
              // Waits for the last note to finish dissolving before it appears
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.3, delay: reduceMotion ? 0.2 : 0.4 } }}
                className="rounded-sm border-2 border-dashed border-ink/40 p-space-xl text-center text-on-surface-variant font-body-md text-body-md"
              >
                Nothing pinned up right now. Pin the first note.
              </motion.p>
            )}
            {/* popLayout takes a leaving note out of the flow at once, so the notes below glide up
                into its place with a critically damped spring while it dissolves.
                initial={false}: the first render shows the timeline without animating every note in. */}
            <AnimatePresence initial={false} mode="popLayout">
              {groups.map((group) => (
                <motion.section
                  key={group.label}
                  layout={!reduceMotion}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, layout: { type: 'spring', bounce: 0, duration: 0.4 } }}
                  className="relative mt-space-lg first:mt-0"
                >
                  {/* The group's dot sits right on the line, joined to its label by a short stroke.
                      It sticks under the top bar while this group's notes scroll past, then leaves
                      with them. */}
                  <h3 className="sticky top-[66px] z-10 -ml-8 mb-space-md flex w-fit items-center">
                    <span aria-hidden="true" className="h-4 w-4 shrink-0 rounded-full border-2 border-ink bg-sun" />
                    <span aria-hidden="true" className="h-0.5 w-2.5 bg-ink" />
                    <span className="rounded-full border-2 border-ink bg-paper px-3 py-0.5 font-body-sm text-body-sm font-black shadow-[2px_2px_0_#1F1A3A]">
                      {group.label}
                    </span>
                  </h3>
                  <AnimatePresence initial={false} mode="popLayout">
                    {group.posts.map((post) => (
                      <motion.div
                        key={post.id}
                        layout={!reduceMotion}
                        initial={hidden}
                        animate={shown}
                        exit={hidden}
                        transition={{
                          ...dissolve,
                          layout: { type: 'spring', bounce: 0, duration: 0.4 },
                        }}
                        className="relative mb-space-lg"
                      >
                        <NoteCard post={post} now={now} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.section>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Sidebar: just the board's name, description and where it is; stays in view while the
            timeline scrolls on wide screens */}
        <aside className="cutout bg-paper p-space-lg lg:sticky lg:top-20">
          <h2 className="taped font-headline-sm text-headline-sm font-black">
            <span className="tape">{community.name}</span>
          </h2>
          {community.description && (
            <p className="mt-space-sm font-body-sm text-body-sm text-on-surface-variant">{community.description}</p>
          )}
          {/* Where the board is, at the bottom of the sidebar, edge to edge */}
          {hasMap && (
            <MapCover
              lat={community.lat!}
              lon={community.lon!}
              paper={paper}
              spanX={1}
              className="-mx-space-lg -mb-space-lg mt-space-md h-40 border-t-2 border-ink"
            />
          )}
        </aside>
      </div>

      {composerOpen && (
        <CreateNoteModal
          communityId={String(community.id)}
          originRef={noteButton}
          onClose={() => setComposerOpen(false)}
          onCreated={refreshPosts}
        />
      )}
    </div>
  )
}
