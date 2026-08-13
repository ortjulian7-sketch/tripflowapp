import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { empujarCambiosPendientes } from './push'
import { extraerDesdeSupabase } from './pull'

export type EstadoSync = 'sincronizado' | 'pendiente' | 'sincronizando'

/**
 * Dispara sincronización automática (evento `online` + apertura de la app
 * con conexión), sin ninguna acción de la persona (FR-047). Nunca hace pull
 * mientras queden cambios sin empujar: reconciliar contra el servidor antes
 * de que esos cambios lleguen borraría datos registrados offline (FR-049).
 */
export function useSync(habilitado: boolean): EstadoSync {
  const [sincronizando, setSincronizando] = useState(false)
  const cantidadPendientes = useLiveQuery(() => db.cambios_pendientes.count(), [], 0)

  useEffect(() => {
    if (!habilitado) return

    let cancelado = false

    async function sincronizar() {
      if (!navigator.onLine) return
      setSincronizando(true)
      try {
        await empujarCambiosPendientes()
        const quedanPendientes = await db.cambios_pendientes.count()
        if (quedanPendientes === 0) {
          await extraerDesdeSupabase()
        }
      } finally {
        if (!cancelado) setSincronizando(false)
      }
    }

    sincronizar()
    window.addEventListener('online', sincronizar)
    return () => {
      cancelado = true
      window.removeEventListener('online', sincronizar)
    }
  }, [habilitado])

  if (sincronizando) return 'sincronizando'
  if ((cantidadPendientes ?? 0) > 0) return 'pendiente'
  return 'sincronizado'
}
