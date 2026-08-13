import { createContext, useContext, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useSync, type EstadoSync } from './useSync'

const SyncContext = createContext<EstadoSync>('sincronizado')

/**
 * Corre el motor de sincronización una sola vez para toda la app (no solo
 * dentro del AppShell), así los cambios hechos durante el onboarding o
 * "nuevo viaje" también se sincronizan apenas hay conexión.
 */
export function SyncProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const estado = useSync(!!session)
  return <SyncContext.Provider value={estado}>{children}</SyncContext.Provider>
}

export function useSyncStatus(): EstadoSync {
  return useContext(SyncContext)
}
