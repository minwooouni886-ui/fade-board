import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Icon from '../components/Icon'
import SparkCard from '../components/SparkCard'
import CreateSparkModal from '../components/CreateSparkModal'
import { fetchCommunities, fetchCommunityPosts, type ApiCommunity, type ApiPost } from '../api'

// How long an expired Spark stays on screen reading "Faded" before it dissolves
const FADE_HOLD_MS = 600

export default function Community() {
  const { id } = useParams()
  const reduceMotion = useReducedMotion()
  const [community, setCommunity] = useState<ApiCommunity | null>(null)
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [composerOpen, setComposerOpen] = useState(false)
  const sparkButton = useRef<HTMLButtonElement>(null)
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

  // Reload the feed after a new Spark is posted
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

    return <p className="py-16 text-center font-body-md text-body-md text-on-surface-variant">{message}</p>
  }

  // Derived from `now` on every tick: a Spark leaves the feed once its hold has passed,
  // while the header counts only the Sparks that are still alive
  const visiblePosts = posts.filter((p) => new Date(p.expires_at).getTime() + FADE_HOLD_MS > now)
  const liveCount = posts.filter((p) => new Date(p.expires_at).getTime() > now).length

  // A Spark dissolves in place (fade, shrink a little, blur) and arrives the same way in reverse.
  // Reduced motion keeps only the cross-fade.
  const hidden = reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: 'blur(4px)' }
  const shown = reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)' }
  const dissolve = reduceMotion ? { duration: 0.2 } : { duration: 0.35, ease: 'easeOut' as const }

  return (
    <div className="flex flex-col w-full pb-16 pt-12">
      <title>{`Fade · ${community.name}`}</title>

      {/* Board header */}
      <div className="flex flex-col gap-space-xs mb-space-xl max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{community.name}</h1>
          <button
            ref={sparkButton}
            type="button"
            onClick={() => setComposerOpen(true)}
            className="flex items-center gap-space-xs px-space-lg py-2 rounded-full font-body-md text-body-md font-medium bg-primary-container text-on-primary-container transition-[filter,transform] duration-100 hover:brightness-110 active:scale-[0.97]"
          >
            <Icon name="bolt" className="text-base" />
            New Spark
          </button>
        </div>
        <p className="font-body-lg text-body-lg text-on-surface-variant">{community.description}</p>
        <p className="flex items-center gap-space-xs mt-space-xs font-body-sm text-body-sm text-outline">
          <Icon name="schedule" className="text-base" />
          {liveCount} live Sparks · every Spark fades within 7 days
        </p>
      </div>

      {/* Feed */}
      <div className="relative flex flex-col gap-space-md max-w-3xl">
        {visiblePosts.length === 0 && (
          // Waits for the last card to finish dissolving before it appears
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3, delay: reduceMotion ? 0.2 : 0.4 } }}
            className="p-space-xl rounded-[20px] bg-surface-container-low text-center text-on-surface-variant font-body-md text-body-md"
          >
            No active Sparks in this board right now.
          </motion.p>
        )}
        {/* popLayout takes a leaving card out of the flow at once, so the cards below glide up
            into its place with a critically damped spring while it dissolves.
            initial={false}: the first render shows the feed without animating every card in. */}
        <AnimatePresence initial={false} mode="popLayout">
          {visiblePosts.map((post) => (
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
            >
              <SparkCard post={post} now={now} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {composerOpen && (
        <CreateSparkModal
          communityId={String(community.id)}
          originRef={sparkButton}
          onClose={() => setComposerOpen(false)}
          onCreated={refreshPosts}
        />
      )}
    </div>
  )
}
