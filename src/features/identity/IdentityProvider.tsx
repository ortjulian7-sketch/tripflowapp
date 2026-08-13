import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { getOrCreateActiveIdentity } from './activeIdentity'

interface IdentityContextValue {
  userId: string
  isGuest: boolean
  loading: boolean
}

const IdentityContext = createContext<IdentityContextValue | null>(null)

/** Generaliza `session.user.id` a la identidad activa del dispositivo (research.md §2): con o sin cuenta, siempre hay un `userId`. */
export function IdentityProvider({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  const value = useMemo<IdentityContextValue>(
    () => ({
      userId: session?.user.id ?? getOrCreateActiveIdentity(),
      isGuest: !session,
      loading,
    }),
    [session, loading],
  )

  return <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>
}

export function useIdentity(): IdentityContextValue {
  const context = useContext(IdentityContext)
  if (!context) {
    throw new Error('useIdentity debe usarse dentro de IdentityProvider')
  }
  return context
}
