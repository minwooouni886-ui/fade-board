export type ApiCommunity = {
  id: number
  name: string
  description: string | null
  location: string | null
}

export type ApiPost = {
  id: number
  community_id: number
  title: string
  description: string | null
  category: string | null
  expires_at: string
}

export type GeocodeResult = {
  name: string
  label: string
  lat: number
  lon: number
}

// Carries the HTTP status so callers can react to specific failures, like 429
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`)
  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed with status ${res.status}`, res.status)
  }
  return res.json()
}

// for creating posts and communities
async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error)
  }
  return res.json()
}

// for fetching geocode results
export function searchLocations(query: string) {
  return apiFetch<GeocodeResult[]>(`/geocode?q=${encodeURIComponent(query)}`)
}

export function fetchCommunities() {
  return apiFetch<ApiCommunity[]>('/communities')
}

export function fetchCommunityPosts(communityId: string | number) {
  return apiFetch<ApiPost[]>(`/communities/${communityId}/posts`)
}

export function createCommunity(name: string, description: string | null, location: string | null, lat: number | null, lon: number | null) {
  return apiPost<ApiCommunity>('/communities', {name, description, location, lat, lon})
}

export function createPost(communityId: string | number, title: string, description: string | null, category: string | null, durationHours: number) {
  return apiPost<ApiPost[]>(`/communities/${communityId}/posts`, { title, description, category, duration_hours: durationHours })
}
