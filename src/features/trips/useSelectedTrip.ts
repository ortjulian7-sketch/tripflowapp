import { useState } from 'react'
import type { Viaje } from '@/lib/db'
import { useActiveTrip } from './useActiveTrip'
import { useTrips } from './useTrips'

const STORAGE_KEY = 'tripflow:selected-trip-id'

interface UseSelectedTripResult {
  viaje: Viaje | undefined
  trips: Viaje[] | undefined
  selectTrip: (tripId: string | null) => void
}

/**
 * Persiste la elección de viaje fuera del hook para que pantallas que no lo
 * usan (p. ej. `NuevoViajePage`) puedan marcar como elegido el viaje recién
 * creado antes de navegar al resumen — si no, seguiría mandando la elección
 * previa (o ninguna) y el resumen mostraría otro viaje.
 */
export function setSelectedTripId(tripId: string | null): void {
  if (tripId) localStorage.setItem(STORAGE_KEY, tripId)
  else localStorage.removeItem(STORAGE_KEY)
}

/**
 * El viaje elegido a mano (persistido localmente) manda sobre el
 * seleccionado por defecto (useActiveTrip). Si el viaje elegido ya no existe
 * (se eliminó — US10), cae solo de nuevo al criterio por defecto.
 */
export function useSelectedTrip(userId: string | undefined): UseSelectedTripResult {
  const trips = useTrips(userId)
  const defaultTrip = useActiveTrip(userId)
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : localStorage.getItem(STORAGE_KEY),
  )

  function selectTrip(tripId: string | null) {
    setSelectedId(tripId)
    setSelectedTripId(tripId)
  }

  const seleccionado = selectedId ? trips?.find((trip) => trip.id === selectedId) : undefined

  return { viaje: seleccionado ?? defaultTrip, trips, selectTrip }
}
