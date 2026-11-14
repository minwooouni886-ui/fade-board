import Icon from './Icon'
import LocationPicker from './LocationPicker'
import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { ApiError, createCommunity, searchLocations, type GeocodeResult } from '../api'

const inputClass =
  'w-full bg-surface-container rounded-lg px-space-md py-space-sm text-on-surface font-body-lg text-body-lg placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary'
const labelClass = 'font-body-sm text-body-sm text-on-surface-variant'
// Board names longer than this don't fit the cards on the home page.
// Keep in sync with MAX_NAME_LENGTH in fade-backend/src/routes/communitiesRoutes.js
const MAX_NAME_LENGTH = 40

export default function CreateCommunityModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selected, setSelected] = useState<GeocodeResult | null>(null)

  const reduceMotion = useReducedMotion()
  const scrim = useAnimationControls()
  const panel = useAnimationControls()
  const closing = useRef(false)
  const pressedOnScrim = useRef(false)
  
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

  // Exit along the path it entered
  function dismiss() {
    if (closing.current) return
    closing.current = true
    scrim.start({ opacity: 0, transition: { duration: 0.2 } })
    // Unmount once the exit has played; the panel is invisible by then
    let exitMs = 350
    if (reduceMotion) {
      exitMs = 160
      panel.start({ opacity: 0, transition: { duration: 0.15 } })
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

  // Nominatim's policy forbids search-as-you-type, so a search only runs when the user asks for it
  // (Enter or the search button). Each search gets an id; a response is dropped if a newer
  // search, an edit or a pick has happened since.
  const searchId = useRef(0)

  // Forget any results and ignore a search still in flight
  function resetSearch() {
    searchId.current++
    setSuggestions([])
    setSearching(false)
    setSearched(false)
    setSearchError(null)
  }

  async function handleSearch() {
    const query = location.trim()
    if (query.length === 0) return
    resetSearch()
    const id = searchId.current
    setSearching(true)
    try {
      const results = await searchLocations(query)
      if (id !== searchId.current) return
      setSuggestions(results)
    } catch (e) {
      if (id !== searchId.current) return
      setSearchError(
        e instanceof ApiError && e.status === 429
          ? 'Too many searches. Please wait a moment and try again.'
          : 'Location search is unavailable. You can still type an address.',
      )
    }
    setSearching(false)
    setSearched(true)
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
      await createCommunity(name, description, selected?.label ?? location, selected?.lat ?? null, selected?.lon ?? null)
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
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 sm:items-center sm:p-4"
      // Only a press that started on the overlay may close it, so dragging out of the panel doesn't
      onPointerDown={(e) => {
        pressedOnScrim.current = e.target === e.currentTarget
      }}
      onClick={() => {
        if (pressedOnScrim.current) dismiss()
      }}
    >
      {/* The panel. stopPropagation so clicks inside don't reach the overlay and close it.
          A bottom sheet on phones, a centered card on larger screens. */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-community-title"
        initial={reduceMotion ? { opacity: 0 } : { y: 24, scale: 0.96, opacity: 0 }}
        animate={panel}
        className="w-full max-w-lg rounded-t-lg rounded-b-none bg-paper text-ink p-space-xl cutout sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-space-md mb-space-lg">
          <div>
            <h2 id="create-community-title" className="font-headline-md text-headline-md text-on-surface">
              New board
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Start a board for your neighborhood. Every note pinned to it comes down within 7 days.
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
            <span className={`${labelClass} flex justify-between`}>
              <span>
                Name <span className="text-primary">*</span>
              </span>
              {/* Live count so people see the limit before they hit it */}
              <span className={`tabular-nums ${name.length >= MAX_NAME_LENGTH ? 'font-bold text-ink' : ''}`}>
                {name.length}/{MAX_NAME_LENGTH}
              </span>
            </span>
            {/* name input; maxLength stops typing or pasting past the limit */}
            <input value={name} type="text" autoFocus maxLength={MAX_NAME_LENGTH} className={inputClass} onChange={(e) => {
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
            <LocationPicker
              value={location}
              onChange={(v) => {
                setLocation(v)
                // Editing the text invalidates the chosen coordinates and any old results
                if (selected && v !== selected.name) setSelected(null)
                resetSearch()
              }}
              suggestions={suggestions}
              searching={searching}
              searched={searched}
              error={searchError}
              selected={selected}
              onSearch={handleSearch}
              onSelect={(place) => {
                resetSearch()
                setSelected(place)
                setLocation(place.name)
              }}
              onClear={() => {
                resetSearch()
                setSelected(null)
                setLocation('')
              }}
            />
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
              className="press flex items-center gap-space-xs px-space-lg py-2 rounded-full font-body-md text-body-md font-bold bg-primary-container text-on-primary-container disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="add" className="text-base" />
              Create board
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
