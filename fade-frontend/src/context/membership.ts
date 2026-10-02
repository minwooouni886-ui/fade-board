import { createContext, useContext } from 'react'

export type MembershipValue = {
  isJoined: (communityId: number) => boolean
  toggle: (communityId: number) => void
}

export const MembershipContext = createContext<MembershipValue | null>(null)

export function useMembership() {
  const ctx = useContext(MembershipContext)
  if (!ctx) throw new Error('useMembership must be used within MembershipProvider')
  return ctx
}
