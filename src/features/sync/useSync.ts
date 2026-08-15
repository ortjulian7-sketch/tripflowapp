import { useCallback, useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { empujarCambiosPendientes } from './push'
import { extraerDesdeSupabase } from './pull'

export type EstadoSync = 'sincronizado' | 'pendiente' | 'sincronizando'

/**
 * Dispara sincronización automática sin ninguna acción de la persona
 * (FR-047): al abrir la app con conexión, al recuperar conexión (evento
 * `online`) y cada vez que un CRUD encola un cambio nuevo en
 * `cambios_pendientes` (vía `useLiveQuery`) — así SyncIndicator refleja el
 * estado real sin depender de un refresh de página. Nunca hace pull mientras
 * queden cambios sin empujar: reconciliar contra el servidor antes de que
 * esos cambios lleguen borraría datos registrados offline (FR-049).
 */
export function useSync(habilitado: boolean): EstadoSync {
  const [sincronizando, setSincronizando] = useState(false)
  const enCursoRef = useRef(false)
  const montadoRef = useRef(true)
  const cantidadPendientes = useLiveQuery(() => db.cambios_pendientes.count(), [], 0)

  useEffect(() => {
    montadoRef.current = true
    return () => {
      montadoRef.current = false
    }
  }, [])

  const sincronizar = useCallback(async () => {
    if (!navigator.onLine || enCursoRef.current) return
    enCursoRef.current = true
    if (montadoRef.current) setSincronizando(true)
    try {
      await empujarCambiosPendientes()
      const quedanPendientes = await db.cambios_pendientes.count()
      if (quedanPendientes === 0) {
        await extraerDesdeSupabase()
      }
    } finally {
      enCursoRef.current = false
      if (montadoRef.current) setSincronizando(false)
    }
  }, [])

  useEffect(() => {
    if (!habilitado) return
    sincronizar()
    window.addEventListener('online', sincronizar)
    return () => window.removeEventListener('online', sincronizar)
  }, [habilitado, sincronizar])

  // Cualquier CRUD pasa por writeAndQueue y encola una fila en
  // cambios_pendientes; ese cambio llega acá vía useLiveQuery y dispara el
  // push de inmediato, en vez de esperar al próximo evento `online` o a que
  // se recargue la página.
  useEffect(() => {
    if (!habilitado || !(cantidadPendientes ?? 0)) return
    sincronizar()
  }, [habilitado, cantidadPendientes, sincronizar])

  if (sincronizando) return 'sincronizando'
  if ((cantidadPendientes ?? 0) > 0) return 'pendiente'
  return 'sincronizado'
}
