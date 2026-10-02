import Icon from './Icon'
import { useState } from 'react'
import { createCommunity } from '../api'

const inputClass =
  'w-full bg-surface-container rounded-xl px-space-md py-space-sm text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-container'
const labelClass = 'font-label-md text-label-md text-on-surface'

export default function CreateCommunityModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    onClose()
    setSubmitting(false)
  }

  return (
    // Dark overlay over the whole page; clicking it closes the modal
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* The panel. stopPropagation so clicks inside don't reach the overlay and close it */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-community-title"
        className="w-full max-w-lg rounded-2xl bg-surface-container-low p-space-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-space-md mb-space-lg">
          <div>
            <h2 id="create-community-title" className="font-headline-md text-headline-md text-on-surface font-bold">
              New Community
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Start a board for your neighborhood. Every Spark posted in it fades within 7 days.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
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
            <input value={name} type="text" className={inputClass} onChange={(e) => {
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
              onClick={onClose}
              className="px-space-lg py-space-xs rounded-full font-label-md text-label-md text-on-surface bg-surface-container-high hover:bg-surface-container-highest transition-colors"
            >
              Cancel
            </button>
            {/* disable while submitting */}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-space-xs px-space-lg py-space-xs rounded-full font-label-md text-label-md font-bold bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="add" className="text-base" />
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
