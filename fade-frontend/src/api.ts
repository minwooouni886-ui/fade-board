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

export function fetchCommunities() {
  return apiFetch<ApiCommunity[]>('/communities')
}

export function fetchCommunityPosts(communityId: string | number) {
  return apiFetch<ApiPost[]>(`/communities/${communityId}/posts`)
}
