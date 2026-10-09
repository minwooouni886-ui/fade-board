import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import SparkCard from '../components/SparkCard'
import CreateSparkModal from '../components/CreateSparkModal'
import { fetchCommunities, fetchCommunityPosts, type ApiCommunity, type ApiPost } from '../api'

export default function Community() {
  const { id } = useParams()
  const [community, setCommunity] = useState<ApiCommunity | null>(null)
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [composerOpen, setComposerOpen] = useState(false)
  const sparkButton = useRef<HTMLButtonElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

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
          {posts.length} live Sparks · every Spark fades within 7 days
        </p>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-space-md max-w-3xl">
        {posts.length === 0 && (
          <p className="p-space-xl rounded-[20px] bg-surface-container-low text-center text-on-surface-variant font-body-md text-body-md">
            No active Sparks in this board right now.
          </p>
        )}
        {posts.map((post) => (
          <SparkCard key={post.id} post={post} />
        ))}
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
