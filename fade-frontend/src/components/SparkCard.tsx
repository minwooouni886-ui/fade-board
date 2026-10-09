import type { ApiPost } from '../api'

const SPARK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

function timeRemaining(expiresAt: string, now: number) {
  const ms = new Date(expiresAt).getTime() - now
  if (ms <= 0) {
    return { label: 'Faded', urgent: true, decay: 0 }
  }
  const decay = Math.min(1, Math.max(0, ms / SPARK_WINDOW_MS))
  const totalMinutes = Math.floor(ms / (1000 * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  const seconds = String(Math.floor(ms / 1000) % 60).padStart(2, '0')
  const label = days >= 1 ? `${days}d ${hours}h left` : (hours >= 1 ? `${hours}h ${minutes}m left`: (totalMinutes >= 5 ? `${minutes}m left` : `${minutes}m ${seconds}s left`))
  const urgent = totalMinutes < 5
  return { label, urgent, decay }
}

export default function SparkCard({ post, now }: { post: ApiPost, now: number }) {
  const { label, urgent, decay } = timeRemaining(post.expires_at, now)

  return (
    // The whole card fades as the Spark nears expiry
    <article
      className="flex flex-col rounded-[20px] bg-surface-container-low p-space-lg pb-space-md"
      style={{ opacity: 0.6 + 0.4 * decay }}
    >
      {/* Header — category on the left, time left on the right */}
      <div className="flex items-baseline justify-between gap-space-md font-body-sm text-body-sm">
        <span className="truncate text-outline">{post.category}</span>
        <span className={`shrink-0 tabular-nums ${urgent ? 'text-error' : 'text-outline'}`}>
          {label}
        </span>
      </div>

      {/* Title & body */}
      <div className="mt-space-sm flex flex-col gap-space-xs">
        <h3 className="font-headline-sm text-headline-sm font-medium tracking-[-0.01em] text-on-surface">
          {post.title}
        </h3>
        {post.description && (
          <p className="font-body-md text-body-md text-on-surface-variant">{post.description}</p>
        )}
      </div>

      {/* Decay line */}
      <div className="mt-space-lg h-[3px] overflow-hidden rounded-full bg-black/[0.07]">
        <div
          className="h-full rounded-full bg-primary-container"
          style={{ width: `${Math.max(2, Math.round(decay * 100))}%` }}
        />
      </div>
    </article>
  )
}
