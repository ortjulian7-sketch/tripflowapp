import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Icon } from '@/components/Icon'
import { IconButton } from '@/components/IconButton'
import { useToast } from '@/components/Toast'
import { db, type Viaje } from '@/lib/db'
import { eliminarViaje } from '@/features/trips/tripRepository'

interface TripSwitcherProps {
  viaje: Viaje
  trips: Viaje[]
  onSelect: (tripId: string) => void
  onDeleted: () => void
}

/**
 * Identidad del viaje + selector, en un único elemento (Figma node 204:1479
 * "CDMX Agosto '26 ⌄"): nombre + destino no se repiten en ningún otro lugar
 * de la pantalla. Cuando hay más de un viaje, un <select> nativo transparente
 * se superpone al texto para el cambio de viaje (FR-012, FR-013) — el
 * chevron vive en un espacio reservado aparte para nunca solaparse con el
 * texto, sin importar qué tan largo sea el nombre.
 */
export function TripSwitcher({ viaje, trips, onSelect, onDeleted }: TripSwitcherProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [confirmando, setConfirmando] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  const cantidadGastos = useLiveQuery(
    () => db.gastos.where('trip_id').equals(viaje.id).count(),
    [viaje.id],
  )

  async function confirmarEliminacion() {
    setEliminando(true)
    try {
      await eliminarViaje(viaje.id)
      setConfirmando(false)
      onDeleted()
      showToast('Viaje eliminado.')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No pudimos eliminar el viaje.', 'error')
    } finally {
      setEliminando(false)
    }
  }

  const puedeSwitchear = trips.length > 1

  return (
    <div className="flex min-w-0 shrink items-center gap-1">
      <div className="relative min-w-0">
        <h1
          className={`truncate text-[13px] font-semibold text-text-primary ${puedeSwitchear ? 'pr-5' : ''}`}
        >
          {viaje.nombre}
        </h1>
        <p className={`truncate text-xs text-text-secondary ${puedeSwitchear ? 'pr-5' : ''}`}>
          {viaje.destino}
        </p>
        {puedeSwitchear && (
          <>
            <Icon
              name="chevron-down"
              size={14}
              className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-icon-secondary"
            />
            <select
              aria-label="Cambiar de viaje"
              value={viaje.id}
              onChange={(event) => onSelect(event.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.nombre}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      <IconButton
        icon="plus"
        label="Nuevo viaje"
        variant="secondary"
        className="!h-8 !w-8 !shadow-none"
        onClick={() => navigate('/viajes/nuevo')}
      />
      <IconButton
        icon="trash"
        label="Eliminar viaje"
        variant="secondary"
        className="!h-8 !w-8 !shadow-none"
        onClick={() => setConfirmando(true)}
      />

      <ConfirmDialog
        open={confirmando}
        title="Eliminar viaje"
        description={`Esta acción es permanente: se van a borrar "${viaje.nombre}" y ${
          cantidadGastos ?? 0
        } gasto(s) registrados. No se puede deshacer.`}
        onCancel={() => setConfirmando(false)}
        onConfirm={confirmarEliminacion}
        loading={eliminando}
      />
    </div>
  )
}
