import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { getOrCreateActiveIdentity, peekActiveIdentity } from './activeIdentity'

interface IdentityContextValue {
  userId: string | null
  isGuest: boolean
  loading: boolean
  establecerInvitado: () => string
}

const IdentityContext = createContext<IdentityContextValue | null>(null)

/**
 * `userId` es `null` mientras no exista ninguna identidad establecida
 * (contracts/entrada-gate-contract.md): a diferencia de antes, ya no crea una
 * identidad de invitado como efecto de montarse — eso solo ocurre cuando la
 * persona toca "Continuar como invitado" en Bienvenida (`establecerInvitado`).
 *
 * `version` fuerza recalcular `userId` cuando `establecerInvitado()` escribe
 * `localStorage` sin que cambie `session`/`loading` — sin eso, el gate de
 * ruteo seguiría leyendo el `userId` memoizado (`null`) y rebotaría de vuelta
 * a Bienvenida apenas la persona la elige.
 */
export function IdentityProvider({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const [version, setVersion] = useState(0)

  const value = useMemo<IdentityContextValue>(
    () => ({
      userId: session?.user.id ?? peekActiveIdentity(),
      isGuest: !session,
      loading,
      establecerInvitado: () => {
        const id = getOrCreateActiveIdentity()
        setVersion((actual) => actual + 1)
        return id
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, loading, version],
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
