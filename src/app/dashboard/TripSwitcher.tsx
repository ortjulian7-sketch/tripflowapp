import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { IconButton } from '@/components/IconButton'
import { Input } from '@/components/Input'
import { db, type Viaje } from '@/lib/db'
import { eliminarViaje } from '@/features/trips/tripRepository'

interface TripSwitcherProps {
  viaje: Viaje
  trips: Viaje[]
  onSelect: (tripId: string) => void
  onDeleted: () => void
}

/** Selector de viaje: todos los números y gastos del resumen dependen de este viaje (FR-012, FR-013). */
export function TripSwitcher({ viaje, trips, onSelect, onDeleted }: TripSwitcherProps) {
  const navigate = useNavigate()
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
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {trips.length > 1 && (
        <div className="flex-1">
          <Input
            type="select"
            label="Viaje"
            showLabel={false}
            value={viaje.id}
            onChange={onSelect}
            options={trips.map((trip) => ({
              value: trip.id,
              label: `${trip.nombre} — ${trip.destino}`,
            }))}
          />
        </div>
      )}
      <IconButton
        icon="plus"
        label="Nuevo viaje"
        variant="secondary"
        onClick={() => navigate('/viajes/nuevo')}
      />
      <IconButton
        icon="trash"
        label="Eliminar viaje"
        variant="secondary"
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
