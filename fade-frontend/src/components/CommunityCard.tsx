import { Link } from 'react-router-dom'
import Icon from './Icon'
import CoverArt from './CoverArt'
import type { ApiCommunity } from '../api'
import { paperFor } from '../paper'
import { ago } from '../time'

export default function CommunityCard({ community }: { community: ApiCommunity }) {
  const { paper, sticker, tilt, stickerTilt } = paperFor(community.id)
  const count = community.note_count
  // Board cards stay nearly straight so the grid reads calmly; the loose collage is for notes
  const cardTilt = `${parseFloat(tilt) / 4}deg`

  // The name is the main thing on the card, so it's big; the location and activity sit right under
  // it, and each card is as tall as its content. Names are capped at 40 characters when a board is
  // created, so they never take more than two lines. Hovering (or tabbing to) a card pops it
  // forward and fades in the description.
  const coverBox = 'relative -mx-space-lg -mt-space-xl mb-space-md h-24 w-[calc(100%_+_2.5rem)] max-w-none border-b-2 border-ink'

  const body = (sizer: boolean) => (
    <>
      {/* The board's cover image across the top of the card, edge to edge. The invisible sizer
          copy only needs an empty box of the same height. */}
      {sizer ? (
        <div className={coverBox} />
      ) : (
        // A dark shade and softened colors keep a grid of photos calm to look at; the shade lifts
        // when the card is hovered or focused, so the photo shows properly for the board in view
        <div className={`${coverBox} overflow-hidden`}>
          <CoverArt
            id={community.id}
            paper={paper}
            className="absolute inset-0 h-full w-full saturate-[.8] transition-[filter] duration-200 group-hover:saturate-100 group-focus-within:saturate-100"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-ink/35 transition-opacity duration-200 group-hover:opacity-0 group-focus-within:opacity-0"
          />
        </div>
      )}
      <h3 className="taped font-headline-sm text-[25px] font-black">
        <span className="tape">{community.name}</span>
      </h3>
      {!sizer && community.description && (
        // Two wrappers: the outer one animates its height open, the inner one clips while it does
        <div className="reveal">
          <div>
            <p className="pt-space-sm font-body-sm text-body-sm text-on-surface-variant [overflow-wrap:anywhere]">
              {community.description}
            </p>
          </div>
        </div>
      )}

      {/* Location and activity on their own lines, so a long address doesn't share a row */}
      <div className="flex flex-col gap-1 pt-space-sm font-body-sm text-body-sm font-bold">
        {community.location && (
          <p className="flex min-w-0 items-start gap-1">
            <Icon name="location_on" className="mt-px shrink-0 text-base" />
            {/* Always one line, so the card never jumps in height; the full address is in the tooltip */}
            <span className="truncate" title={community.location}>
              {community.location}
            </span>
          </p>
        )}
        <p className="text-on-surface-variant">
          {community.last_note_at ? `Last note ${ago(community.last_note_at)}` : 'Nothing pinned yet'}
        </p>
      </div>
    </>
  )
  const box = 'flex flex-col px-space-lg pb-space-md pt-space-xl border-2 border-transparent'

  return (
    <div className="board-slot group relative">
      {/* An invisible copy of the closed card holds its place in the grid. The real card sits on
          top of it, so when hovering makes it taller it overlaps the cards below instead of
          pushing the rows down. */}
      <div aria-hidden="true" className={`invisible ${box}`}>
        {body(true)}
      </div>
      <Link
        to={`/communities/${community.id}`}
        style={{ '--tilt': cardTilt, backgroundColor: paper } as React.CSSProperties}
        className={`board-card cutout absolute inset-x-0 top-0 min-h-full ${box} text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-8 focus-visible:outline-ink`}
      >
        <span className="sticker" style={{ backgroundColor: sticker, '--sticker-tilt': stickerTilt } as React.CSSProperties}>
          {count === 0 ? 'Empty' : count === 1 ? '1 note up' : `${count} notes up`}
        </span>
        {body(false)}
      </Link>
    </div>
  )
}
