import { useSyncStatus } from './SyncProvider'
import type { EstadoSync } from './useSync'

const ETIQUETAS: Record<EstadoSync, string> = {
  sincronizado: 'Todo sincronizado',
  pendiente: 'Cambios pendientes',
  sincronizando: 'Sincronizando…',
}

const PUNTOS: Record<EstadoSync, string> = {
  sincronizado: 'bg-status-success',
  pendiente: 'bg-status-warning',
  sincronizando: 'bg-status-warning animate-pulse',
}

/** Indicador visible de los tres estados de FR-048, derivado de la cola de cambios pendientes. */
export function SyncIndicator() {
  const estado = useSyncStatus()

  return (
    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PUNTOS[estado]}`} aria-hidden="true" />
      {ETIQUETAS[estado]}
    </div>
  )
}
