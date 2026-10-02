import { useState, type ReactNode } from 'react'
import { MembershipContext } from './membership'

export function MembershipProvider({ children }: { children: ReactNode }) {
  // IDs of the boards the user has joined
  const [joined, setJoined] = useState<Set<number>>(new Set())

  function isJoined(communityId: number) {
    return joined.has(communityId)
  }

  function toggle(communityId: number) {
    const next = new Set(joined)
    if (next.has(communityId)) next.delete(communityId)
    else next.add(communityId)
    setJoined(next)
  }

  return <MembershipContext.Provider value={{ isJoined, toggle }}>{children}</MembershipContext.Provider>
}
