import Icon from './Icon'
import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls, useDragControls, useReducedMotion, type PanInfo } from 'motion/react'
import { createCommunity } from '../api'

// Apple's momentum projection: where a flick of this velocity (px/s) would coast to rest
function project(velocity: number, decelerationRate = 0.998) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

const DISMISS_DISTANCE = 140

const inputClass =
  'w-full bg-surface-container rounded-2xl px-space-md py-space-sm text-on-surface font-body-lg text-body-lg placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container'
const labelClass = 'font-body-sm text-body-sm text-on-surface-variant'

export default function CreateCommunityModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reduceMotion = useReducedMotion()
  const scrim = useAnimationControls()
  const panel = useAnimationControls()
  const dragControls = useDragControls()
  const closing = useRef(false)
  // Captured during the first render, before autoFocus moves focus into the form
  const [opener] = useState(() => document.activeElement as HTMLElement | null)

  // Critically damped by default: nothing here was thrown, so no bounce
  const settle = reduceMotion ? { duration: 0.15 } : { type: 'spring' as const, bounce: 0, duration: 0.4 }

  // Enter, and hand focus back to whatever opened the modal on exit
  useEffect(() => {
    scrim.start({ opacity: 1, transition: { duration: 0.25 } })
    panel.start({ y: 0, scale: 1, opacity: 1, transition: settle })
    return () => opener?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Exit along the path it entered; a drag-dismiss keeps the finger's velocity
  function dismiss(velocityY = 0) {
    if (closing.current) return
    closing.current = true
    scrim.start({ opacity: 0, transition: { duration: 0.2 } })
    // Unmount once the exit has played; the panel is invisible or off-screen by then
    let exitMs = 350
    if (reduceMotion) {
      exitMs = 160
      panel.start({ opacity: 0, transition: { duration: 0.15 } })
    } else if (velocityY > 0) {
      exitMs = 450
      panel.start({
        y: window.innerHeight,
        transition: { type: 'spring', bounce: 0, duration: 0.4, velocity: velocityY },
      })
    } else {
      panel.start({ y: 24, scale: 0.96, opacity: 0, transition: { type: 'spring', bounce: 0, duration: 0.3 } })
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

  function handleDragEnd(_: PointerEvent, info: PanInfo) {
    // A near-instant release can report a non-finite velocity; a spring given NaN never moves
    const velocity = Number.isFinite(info.velocity.y) ? info.velocity.y : 0
    // Choose the destination from where the flick is *going*, not where it was released
    if (info.offset.y + project(velocity) > DISMISS_DISTANCE) {
      dismiss(velocity)
    } else {
      // A little bounce is earned here: the gesture carried momentum
      panel.start({ y: 0, transition: { type: 'spring', bounce: 0.2, duration: 0.4, velocity } })
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault()
    setSubmitting(true)

    if (name.trim().length === 0) {
      setError("Community name must be present!")
      setSubmitting(false)
      return
    }

    try {
      await createCommunity(name, description, location)
    } catch (error) {
      console.log(error)
      setError( error instanceof Error ? error.message : 'Something went wrong')
      setSubmitting(false)
      return
    }
    
    onCreated()
    setSubmitting(false)
    dismiss()
  }

  return (
    // Dark overlay over the whole page; clicking it closes the modal
    <motion.div
      initial={{ opacity: 0 }}
      animate={scrim}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => dismiss()}
    >
      {/* The panel. stopPropagation so clicks inside don't reach the overlay and close it.
          A bottom sheet on phones, a centered card on larger screens. */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-community-title"
        initial={reduceMotion ? { opacity: 0 } : { y: 24, scale: 0.96, opacity: 0 }}
        animate={panel}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.12, bottom: 0 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className="w-full max-w-lg rounded-t-[24px] rounded-b-none bg-surface-container-low p-space-xl pt-space-sm shadow-[0_24px_64px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] sm:rounded-[24px] sm:pt-space-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab area: drag from here (or the header) to dismiss */}
        <div
          className="-mx-space-xl mb-space-xs flex cursor-grab touch-none justify-center py-space-sm active:cursor-grabbing sm:hidden"
          onPointerDown={(e) => dragControls.start(e)}
          aria-hidden="true"
        >
          <span className="h-1 w-9 rounded-full bg-black/15" />
        </div>
        <div
          className="flex items-start justify-between gap-space-md mb-space-lg touch-none sm:touch-auto"
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button')) return
            dragControls.start(e)
          }}
        >
          <div>
            <h2 id="create-community-title" className="font-headline-md text-headline-md text-on-surface">
              New Community
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Start a board for your neighborhood. Every Spark posted in it fades within 7 days.
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

        {/* onSubmit handler, prevent default */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg">
          <label className="flex flex-col gap-space-xs">
            <span className={labelClass}>
              Name <span className="text-primary">*</span>
            </span>
            {/* name input */}
            <input value={name} type="text" autoFocus className={inputClass} onChange={(e) => {
              setName(e.target.value)
            }} placeholder="e.g. TU Delft Makerspace Crew" />
          </label>

          <label className="flex flex-col gap-space-xs">
            <span className={labelClass}>Description</span>
            {/* description input */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="What is this board for?"
            />
          </label>

          <label className="flex flex-col gap-space-xs">
            <span className={labelClass}>Location</span>
            {/* location, using Nominatim */}
            <input value={location} onChange={(e) => setLocation(e.target.value)} type="text" className={inputClass} placeholder="e.g. Mekelweg, Delft" />
          </label>

          {/* error handler */}
          {error && (<p className="flex items-center gap-space-xs rounded-xl bg-error-container/40 px-space-md py-space-sm font-body-sm text-body-sm text-error">
            <Icon name="error" className="text-base" />
            {error}
          </p>)}
          
          <div className="flex justify-end gap-space-sm mt-space-xs">
            <button
              type="button"
              onClick={() => dismiss()}
              className="px-space-lg py-2 rounded-full font-body-md text-body-md text-on-surface bg-surface-container-high hover:bg-surface-container-highest transition-[background-color,transform] duration-100 active:scale-[0.97]"
            >
              Cancel
            </button>
            {/* disable while submitting */}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-space-xs px-space-lg py-2 rounded-full font-body-md text-body-md font-medium bg-primary-container text-on-primary-container transition-[filter,transform] duration-100 hover:brightness-110 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="add" className="text-base" />
              Create Community
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
