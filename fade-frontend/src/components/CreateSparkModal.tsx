import Icon from './Icon'
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { createPost } from '../api'

const inputClass =
  'w-full bg-surface-container rounded-2xl px-space-md py-space-sm text-on-surface font-body-lg text-body-lg placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container'
const labelClass = 'font-body-sm text-body-sm text-on-surface-variant'

// Every Spark fades; the backend accepts 1 to 168 hours
const durations = [
  { label: '1 hour', hours: 1 },
  { label: '24 hours', hours: 24 },
  { label: '3 days', hours: 72 },
  { label: '7 days', hours: 168 },
]

type Props = {
  communityId: string
  // The button that opened the composer; the panel grows out of it and shrinks back into it
  originRef: RefObject<HTMLElement | null>
  onClose: () => void
  onCreated: () => void
}

export default function CreateSparkModal({ communityId, originRef, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [hours, setHours] = useState(24)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reduceMotion = useReducedMotion()
  const scrim = useAnimationControls()
  const panel = useAnimationControls()
  const panelRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const pressedOnScrim = useRef(false)

  // Critically damped: the panel was opened by a tap, not thrown, so no bounce
  const settle = reduceMotion ? { duration: 0.15 } : { type: 'spring' as const, bounce: 0, duration: 0.4 }

  // Anchor the scale to the opening button's center, before the first paint
  useLayoutEffect(() => {
    const el = panelRef.current
    const origin = originRef.current
    if (!el || !origin) return
    const b = origin.getBoundingClientRect()
    const p = el.getBoundingClientRect()
    el.style.transformOrigin = `${b.left + b.width / 2 - p.left}px ${b.top + b.height / 2 - p.top}px`
  }, [originRef])

  // Enter, and hand focus back to the button on exit
  useEffect(() => {
    const opener = originRef.current
    scrim.start({ opacity: 1, transition: { duration: 0.25 } })
    panel.start({ scale: 1, opacity: 1, transition: settle })
    return () => opener?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Exit along the path it entered: back into the button
  function dismiss() {
    if (closing.current) return
    closing.current = true
    scrim.start({ opacity: 0, transition: { duration: 0.2 } })
    let exitMs = 350
    if (reduceMotion) {
      exitMs = 160
      panel.start({ opacity: 0, transition: { duration: 0.15 } })
    } else {
      panel.start({ scale: 0.9, opacity: 0, transition: { type: 'spring', bounce: 0, duration: 0.3 } })
    }
    window.setTimeout(onClose, exitMs)
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    if (title.trim().length === 0) {
      setError('Give your Spark a title.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await createPost(communityId, title.trim(), description.trim() || null, category.trim() || null, hours)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
      return
    }

    onCreated()
    setSubmitting(false)
    dismiss()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={scrim}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 backdrop-blur-sm sm:items-center sm:p-4"
      // Only a press that started on the overlay may close it, so dragging out of the panel doesn't
      onPointerDown={(e) => {
        pressedOnScrim.current = e.target === e.currentTarget
      }}
      onClick={() => {
        if (pressedOnScrim.current) dismiss()
      }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-spark-title"
        initial={reduceMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
        animate={panel}
        className="w-full max-w-lg rounded-t-[24px] rounded-b-none bg-surface-container-low p-space-xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-space-md mb-space-lg">
          <div>
            <h2 id="create-spark-title" className="font-headline-md text-headline-md text-on-surface">
              New Spark
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Share something with your neighbors. It fades when the time runs out.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dismiss()}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg">
          <label className="flex flex-col gap-space-xs">
            <span className={labelClass}>
              Title <span className="text-primary">*</span>
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              autoFocus
              className={inputClass}
              placeholder="e.g. Free couch on Oudeweg"
            />
          </label>

          <label className="flex flex-col gap-space-xs">
            <span className={labelClass}>Details</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Anything people should know?"
            />
          </label>

          <label className="flex flex-col gap-space-xs">
            <span className={labelClass}>Category</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              type="text"
              className={inputClass}
              placeholder="e.g. Free stuff, Event, Help"
            />
          </label>

          <fieldset className="flex flex-col gap-space-xs">
            <legend className={`${labelClass} mb-space-xs`}>Fades after</legend>
            <div className="flex flex-wrap gap-space-sm">
              {durations.map((d) => {
                const active = d.hours === hours
                return (
                  <button
                    key={d.hours}
                    type="button"
                    onClick={() => setHours(d.hours)}
                    aria-pressed={active}
                    className={`px-space-lg py-2 rounded-full font-body-md text-body-md transition-[background-color,color,transform] duration-100 active:scale-[0.97] ${
                      active
                        ? 'bg-primary-container text-on-primary-container font-medium'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>
          </fieldset>

          {error && (
            <p className="flex items-center gap-space-xs rounded-xl bg-error-container/40 px-space-md py-space-sm font-body-sm text-body-sm text-error">
              <Icon name="error" className="text-base" />
              {error}
            </p>
          )}

          <div className="flex justify-end gap-space-sm mt-space-xs">
            <button
              type="button"
              onClick={() => dismiss()}
              className="px-space-lg py-2 rounded-full font-body-md text-body-md text-on-surface bg-surface-container-high hover:bg-surface-container-highest transition-[background-color,transform] duration-100 active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-space-xs px-space-lg py-2 rounded-full font-body-md text-body-md font-medium bg-primary-container text-on-primary-container transition-[filter,transform] duration-100 hover:brightness-110 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="bolt" className="text-base" />
              Post Spark
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
