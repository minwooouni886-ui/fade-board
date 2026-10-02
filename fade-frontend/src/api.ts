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

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`)
  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`)
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

export function fetchCommunities() {
  return apiFetch<ApiCommunity[]>('/communities')
}

export function fetchCommunityPosts(communityId: string | number) {
  return apiFetch<ApiPost[]>(`/communities/${communityId}/posts`)
}

export function createCommunity(name: string, description: string | null, location: string | null) {
  return apiPost<ApiCommunity[]>('/communities', {name, description, location})
}

export function createPost() {}
