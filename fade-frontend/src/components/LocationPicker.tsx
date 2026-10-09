import { useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Icon from './Icon'
import type { GeocodeResult } from '../api'

type Props = {
  value: string
  onChange: (value: string) => void
  suggestions: GeocodeResult[]
  searching: boolean
  /** a search for the current text has finished */
  searched: boolean
  error: string | null
  selected: GeocodeResult | null
  onSearch: () => void
  onSelect: (place: GeocodeResult) => void
  onClear: () => void
}

const inputClass =
  'w-full bg-surface-container rounded-2xl pl-space-md pr-12 py-space-sm text-on-surface font-body-lg text-body-lg placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container'

// Nominatim names are one long comma list: "Mekelweg, Delft, Zuid-Holland, Nederland"
function splitName(name: string): [string, string] {
  const [title, ...rest] = name.split(', ')
  return [title, rest.join(', ')]
}

export default function LocationPicker({ value, onChange, suggestions, searching, searched, error, selected, onSearch, onSelect, onClear }: Props) {
  const reduceMotion = useReducedMotion()
  const listId = useId()
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const isSelected = selected !== null && selected.name === value
  const canSearch = value.trim().length >= 3
  const showEmpty = searched && !searching && suggestions.length === 0 && !error
  // Nothing searched yet for this text: tell the user how to start a search
  const showHint = canSearch && !searched && !searching && !error && suggestions.length === 0
  const open = focused && !isSelected && canSearch && (searching || suggestions.length > 0 || showEmpty || !!error || showHint)

  function choose(place: GeocodeResult) {
    setActiveIndex(-1)
    onSelect(place)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // Enter picks the highlighted place, otherwise it runs a search (never submits the form mid-search)
    if (e.key === 'Enter' && !isSelected) {
      if (open && activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault()
        choose(suggestions[activeIndex])
      } else if (canSearch) {
        e.preventDefault()
        onSearch()
      }
      return
    }
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (suggestions.length === 0 ? -1 : (i + 1) % suggestions.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (suggestions.length === 0 ? -1 : (i <= 0 ? suggestions.length - 1 : i - 1)))
    } else if (e.key === 'Escape') {
      // First Escape closes the list; the modal's own handler never sees it
      e.nativeEvent.stopPropagation()
      setFocused(false)
    }
  }

  // Grows from the input, shrinks back into it
  const enter = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, scale: 0.97, y: -4 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.97, y: -4 },
      }

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setActiveIndex(-1)
          setFocused(true)
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        className={inputClass}
        placeholder="e.g. Mekelweg, Delft"
      />

      {/* Right edge: search button, spinner while searching, check + clear once a place is chosen */}
      <div className="absolute inset-y-0 right-space-sm flex items-center gap-1">
        {searching && !isSelected && (
          <Icon name="progress_activity" className="animate-spin text-xl text-outline" />
        )}
        {!searching && !isSelected && canSearch && (
          <button
            type="button"
            onClick={onSearch}
            aria-label="Search locations"
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-[background-color,transform] duration-100 hover:bg-surface-container-high hover:text-on-surface active:scale-[0.94]"
          >
            <Icon name="search" className="text-xl" />
          </button>
        )}
        {isSelected && (
          <>
            <Icon name="check_circle" title="Location set" className="text-xl text-primary" />
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear location"
              className="flex h-6 w-6 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <Icon name="close" className="text-base" />
            </button>
          </>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            {...enter}
            transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', bounce: 0, duration: 0.25 }}
            style={{ transformOrigin: 'top' }}
            // Keep focus in the input while the pointer is on the list
            onMouseDown={(e) => e.preventDefault()}
            className="absolute left-0 right-0 top-full z-10 mt-space-xs overflow-hidden rounded-2xl bg-white/85 shadow-[0_12px_32px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.06] backdrop-blur-xl backdrop-saturate-150 [@media(prefers-reduced-transparency:reduce)]:bg-white [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none"
          >
            <ul id={listId} role="listbox" className="max-h-[40vh] overflow-y-auto p-1">
              {suggestions.map((place, i) => {
                const [title, rest] = splitName(place.name)
                const active = i === activeIndex
                return (
                  <motion.li
                    key={`${place.lat},${place.lon},${i}`}
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={active}
                    initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: reduceMotion ? 0 : i * 0.02 }}
                  >
                    <button
                      type="button"
                      onClick={() => choose(place)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex min-h-11 w-full items-center gap-space-sm rounded-xl px-space-sm py-2 text-left transition-[background-color,transform] duration-100 active:scale-[0.98] ${
                        active ? 'bg-black/[0.06]' : 'hover:bg-black/[0.04]'
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
                        <Icon name="location_on" className="text-lg" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-body-md text-body-md font-medium text-on-surface">{title}</span>
                        {rest && (
                          <span className="block truncate font-body-sm text-body-sm text-on-surface-variant">{rest}</span>
                        )}
                      </span>
                    </button>
                  </motion.li>
                )
              })}

              {suggestions.length === 0 && searching && (
                <li className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">Searching…</li>
              )}
              {error && !searching && (
                <li role="alert" className="flex items-start gap-space-xs px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">
                  <Icon name="schedule" className="mt-px text-base" />
                  {error}
                </li>
              )}
              {showHint && (
                <li className="flex items-center gap-space-xs px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">
                  <Icon name="keyboard_return" className="text-base" />
                  Press Enter to search
                </li>
              )}
              {showEmpty && (
                <li className="px-space-md py-space-sm font-body-sm text-body-sm text-on-surface-variant">
                  No places found. Try a street and city.
                </li>
              )}
            </ul>
            <p className="border-t border-black/[0.06] px-space-md py-1.5 text-[11px] text-outline">
              ©{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-outline/40 underline-offset-2 hover:text-on-surface-variant"
              >
                OpenStreetMap contributors
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <p aria-live="polite" className="sr-only">
        {open && suggestions.length > 0 ? `${suggestions.length} results` : ''}
      </p>
    </div>
  )
}
