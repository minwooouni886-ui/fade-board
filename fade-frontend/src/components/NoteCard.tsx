import type { ApiPost } from '../api'
import { paperFor } from '../paper'

function timeRemaining(createdAt: string, expiresAt: string, now: number) {
  const end = new Date(expiresAt).getTime()
  const ms = end - now
  if (ms <= 0) {
    return { label: 'Faded', urgent: true, left: 0 }
  }
  // Share of this note's own lifetime that's left, so a new 1-hour note starts with a full bar too
  const lifetime = end - new Date(createdAt).getTime()
  const left = lifetime > 0 ? Math.min(1, ms / lifetime) : 1

  const totalMinutes = Math.floor(ms / (1000 * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  const seconds = String(Math.floor(ms / 1000) % 60).padStart(2, '0')
  const label = days >= 1 ? `${days}d ${hours}h left` : (hours >= 1 ? `${hours}h ${minutes}m left`: (totalMinutes >= 5 ? `${minutes}m left` : `${minutes}m ${seconds}s left`))
  const urgent = totalMinutes < 5
  return { label, urgent, left }
}

export default function NoteCard({ post, now }: { post: ApiPost, now: number }) {
  const { label, urgent, left } = timeRemaining(post.created_at, post.expires_at, now)
  const { paper, sticker, tilt, stickerTilt } = paperFor(post.id)
  // In the timeline notes sit nearly straight, like the board cards, so the list reads cleanly
  const noteTilt = `${parseFloat(tilt) / 4}deg`

  return (
    // A cut-out note stuck on the page, with its category as a sticker on the top edge
    <article
      style={{ '--tilt': noteTilt, backgroundColor: paper } as React.CSSProperties}
      className="notice cutout relative flex flex-col px-space-lg pt-space-xl pb-space-lg text-ink"
    >
      {post.category && (
        <span className="sticker" style={{ backgroundColor: sticker, '--sticker-tilt': stickerTilt } as React.CSSProperties}>
          {post.category}
        </span>
      )}

      <h3 className="font-headline-sm text-headline-sm font-extrabold [overflow-wrap:anywhere]">{post.title}</h3>
      {post.description && (
        <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant [overflow-wrap:anywhere]">{post.description}</p>
      )}
      <p className={`mt-space-md font-body-sm text-body-sm font-extrabold tabular-nums ${urgent ? 'text-error' : ''}`}>{label}</p>

      {/* Time-left bar that shrinks as the time runs out. It sits inside the note instead of on its
          edge: an ink bar touching the ink border left a light anti-aliasing seam on tilted notes.
          Ink shows on every paper color. The countdown above says the same in words,
          so the bar is hidden from screen readers. */}
      <div className="mt-space-sm h-1.5 overflow-hidden rounded-full bg-ink/15" aria-hidden="true">
        <div
          className={`time-bar h-full rounded-full ${urgent ? 'bg-error' : 'bg-ink'}`}
          style={{ width: `${left * 100}%` }}
        />
      </div>
    </article>
  )
}
