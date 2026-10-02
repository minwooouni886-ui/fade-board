import Icon from './Icon'
import type { ApiPost } from '../api'

const SPARK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

function timeRemaining(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) {
    return { label: 'Faded', urgent: true, decay: 0 }
  }
  const decay = Math.min(1, Math.max(0, ms / SPARK_WINDOW_MS))
  const totalMinutes = Math.floor(ms / (1000 * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  const label = days >= 1 ? `${days}d ${hours}h left` : `${hours}h ${minutes}m left`
  const urgent = totalMinutes < 6 * 60
  return { label, urgent, decay }
}

export default function SparkCard({ post }: { post: ApiPost }) {
  const { label, urgent, decay } = timeRemaining(post.expires_at)

  return (
    <article className="relative flex flex-col bg-surface-container-low rounded-2xl p-space-xl shadow-md transition-transform hover:-translate-y-0.5 overflow-hidden">
      {/* Ambient decay bar strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-surface-container-highest overflow-hidden">
        <div
          className={`h-full relative ${urgent ? 'bg-primary-container' : 'bg-secondary'}`}
          style={{ width: `${Math.round(decay * 100)}%` }}
        >
          {urgent && <span className="absolute inset-0 bg-primary animate-pulse opacity-75" />}
        </div>
      </div>

      {/* Header — category on the left, countdown badge on the right */}
      <div className="flex items-center gap-space-md mb-space-md">
        {post.category && (
          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
            {post.category}
          </span>
        )}

        <div
          className={`ml-auto flex items-center gap-1.5 px-space-md py-1 rounded-full shrink-0 ${
            urgent
              ? 'bg-error-container/40 text-error shadow-sm'
              : 'bg-secondary-container/30 text-secondary'
          } ${urgent ? 'animate-pulse' : ''}`}
        >
          <Icon name={urgent ? 'alarm' : 'schedule'} className="text-sm" />
          <span className="font-label-sm text-label-sm font-bold tracking-wider">{label}</span>
        </div>
      </div>

      {/* Title & body */}
      <div className="flex flex-col gap-space-xs">
        <h3 className="font-headline-md text-headline-md text-on-surface font-bold">{post.title}</h3>
        {post.description && (
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {post.description}
          </p>
        )}
      </div>
    </article>
  )
}
