import { useMemo, useState, type ReactNode } from 'react'
import { MembershipContext, type MembershipValue } from './membership'

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [joined, setJoined] = useState<Set<number>>(() => new Set())

  const value = useMemo<MembershipValue>(() => {
    const isJoined = (communityId: number) => joined.has(communityId)
    return {
      isJoined,
      toggle: (communityId) =>
        setJoined((prev) => {
          const next = new Set(prev)
          if (next.has(communityId)) next.delete(communityId)
          else next.add(communityId)
          return next
        }),
      memberCount: (community) => community.members + (isJoined(community.id) ? 1 : 0),
    }
  }, [joined])

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>
}
