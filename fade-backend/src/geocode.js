// Remembers recent searches so repeats never reach Nominatim: key -> { results, expires }
// Lives in memory, no persistence
const cache = new Map()
const CACHE_TTL_MS = 60 * 60 * 1000
const CACHE_MAX_ENTRIES = 500
const MAX_QUEUE_WAIT_MS = 5000
const SLOT_MS = 1000
// Nominatim's policy requires a User-Agent that identifies the application;
const USER_AGENT = process.env.NOMINATIM_USER_AGENT
let nextSlot = 0

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Rate limiter queue
async function throttled(fn) {
    const now = Date.now()
    const start = Math.max(now, nextSlot)
    // Checks if queue wait time is too long
    if (start - now > MAX_QUEUE_WAIT_MS) {
        const err = new Error("Too many requests, please try again later")
        err.status = 429
        throw err
    }
    nextSlot = start + SLOT_MS
    // Ensure the process waits until the enxt available slot
    await sleep(start - now)
    return fn()
}

// Short "place, city" label, e.g. "Mekelweg, Delft", instead of Nominatim's full display_name
export function buildLabel(res) {
    const address = res.address ?? {}
    const place = res.name || address.road || address.pedestrian || address.neighbourhood || address.suburb
    const city = address.city ?? address.town ?? address.village ?? address.municipality

    // A search for just "Delft" gives the same value twice; show it once
    const parts = [place, city].filter((part, i, all) => part && part !== all[i - 1])
    return parts.length > 0 ? parts.join(', ') : res.display_name.split(', ')[0]
}

export default async function geocode(queryLocation) {
    // "Mekelweg " and "mekelweg" are the same search
    const key = queryLocation.trim().toLowerCase()
    const hit = cache.get(key)
    if (hit && hit.expires > Date.now()) {
        return hit.results
    }

    if (!USER_AGENT) {
        throw new Error('NOMINATIM_USER_AGENT is not set; add it to fade-backend/.env (see README)')
    }

    const urlBuilder = new URLSearchParams({ q: queryLocation, format: 'json', limit: '5', addressdetails: '1'}).toString()
    const url = `https://nominatim.openstreetmap.org/search?${urlBuilder}`

    const response = await throttled(() => fetch(url, {
        headers: {
            'User-Agent': USER_AGENT,
            'Accept-Language': 'en'
        },
    }))

    if (!response.ok) {
        throw new Error(`Nominatim request failed with status ${response.status}`)
    }

    const array = await response.json()
    const results = array.map(res => ({name: res.display_name, label: buildLabel(res), lat: Number(res.lat), lon: Number(res.lon)}))

    // Map keeps insertion order, so the first key is the oldest entry
    if (cache.size >= CACHE_MAX_ENTRIES) {
        cache.delete(cache.keys().next().value)
    }
    cache.set(key, { results, expires: Date.now() + CACHE_TTL_MS })
    return results
}