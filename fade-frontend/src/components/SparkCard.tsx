import { useState } from 'react'
import Icon from './Icon'
import type { Spark } from '../data/mock'

const tagText: Record<Spark['tags'][number]['tone'], string> = {
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
  primary: 'text-primary',
  muted: 'text-on-surface-variant',
}

export default function SparkCard({ spark }: { spark: Spark }) {
  const [boosted, setBoosted] = useState(false)
  const boostCount = spark.boosts + (boosted ? 1 : 0)

  return (
    <article className="relative flex flex-col bg-surface-container-low rounded-2xl p-space-xl shadow-md transition-transform hover:-translate-y-0.5 overflow-hidden">
      {/* Ambient decay bar strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-surface-container-highest overflow-hidden">
        <div
          className={`h-full relative ${spark.decayUrgent ? 'bg-primary-container' : 'bg-secondary'}`}
          style={{ width: `${Math.round(spark.decay * 100)}%` }}
        >
          {spark.decayUrgent && (
            <span className="absolute inset-0 bg-primary animate-pulse opacity-75" />
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-space-md mb-space-md">
        <div className="flex items-center gap-space-md min-w-0">
          <img
            className="w-11 h-11 rounded-full object-cover shrink-0"
            src={spark.author.avatar}
            alt=""
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                {spark.author.name}
              </span>
              {spark.author.verified && (
                <Icon name="verified" className="text-sm text-secondary" title="Verified Local" />
              )}
              {spark.author.badge && (
                <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded-md bg-secondary-container/50 text-secondary">
                  {spark.author.badge}
                </span>
              )}
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
              {spark.author.meta}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 px-space-md py-1 rounded-full shrink-0 ${
            spark.countdown.tone === 'error'
              ? 'bg-error-container/40 text-error shadow-sm'
              : 'bg-secondary-container/30 text-secondary'
          } ${spark.countdown.urgent ? 'animate-pulse' : ''}`}
        >
          <Icon name={spark.countdown.icon} className="text-sm" />
          <span className="font-label-sm text-label-sm font-bold tracking-wider">
            {spark.countdown.label}
          </span>
        </div>
      </div>

      {/* Title & body */}
      <div className="flex flex-col gap-space-xs mb-space-md">
        <h3 className="font-headline-md text-headline-md text-on-surface font-bold">{spark.title}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          {spark.body}
        </p>
      </div>

      {/* Inline image attachment */}
      {spark.image && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden mb-space-md bg-surface-container">
          <img className="w-full h-full object-cover" src={spark.image.src} alt="" />
          {spark.image.pin && (
            <div className="absolute bottom-space-md left-space-md bg-surface-container-lowest/90 backdrop-blur-md px-space-md py-1 rounded-full flex items-center gap-space-xs text-on-surface">
              <Icon name="pin_drop" className="text-sm text-primary" />
              <span className="font-label-sm text-label-sm">{spark.image.pin}</span>
            </div>
          )}
        </div>
      )}

      {/* Figma preview */}
      {spark.figma && (
        <div className="relative w-full rounded-xl bg-surface-container-highest p-space-md mb-space-md overflow-hidden">
          <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-surface-variant/40">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
              <Icon name="design_services" className="text-base text-primary" />
              <span>Figma Preview • {spark.figma.file}</span>
            </div>
            <span className="font-label-sm text-label-sm bg-surface-container text-on-surface px-space-xs py-0.5 rounded">
              Interactive Frame
            </span>
          </div>
          <div className="relative w-full h-56 rounded-lg overflow-hidden">
            <img className="w-full h-full object-cover" src={spark.figma.src} alt="" />
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-space-xs mb-space-lg">
        {spark.tags.map((tag) => (
          <span
            key={tag.label}
            className={`font-label-sm text-label-sm px-space-md py-0.5 rounded-full bg-surface-container font-semibold ${tagText[tag.tone]}`}
          >
            {tag.label}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-space-md bg-surface-container-lowest/40 -mx-space-xl -mb-space-xl px-space-xl pb-space-lg rounded-b-2xl">
        <div className="flex items-center gap-space-lg">
          <button
            type="button"
            onClick={() => setBoosted((v) => !v)}
            aria-pressed={boosted}
            className={`group/boost transition-colors duration-150 ${
              boosted ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="flex items-center gap-space-xs origin-center transition-transform duration-150 ease-out will-change-transform group-hover/boost:scale-110">
              <Icon name="rocket_launch" className="text-lg" />
              <span className="font-label-md text-label-md font-bold">{boostCount}</span>
              <span className="font-label-sm text-label-sm">Boosts</span>
            </span>
          </button>

          <div className="flex items-center gap-space-xs text-on-surface-variant">
            <Icon name="chat_bubble" className="text-lg" />
            <span className="font-label-md text-label-md">{spark.comments} comments</span>
          </div>
        </div>

        <div className="flex items-center gap-space-xs">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="Bookmark"
          >
            <Icon name="bookmark_border" className="text-lg" />
          </button>
          <button
            type="button"
            className="flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-colors"
          >
            <Icon name="reply" className="text-sm" />
            <span>Reply</span>
          </button>
        </div>
      </div>
    </article>
  )
}
