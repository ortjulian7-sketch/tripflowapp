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
    if (tripId) localStorage.setItem(STORAGE_KEY, tripId)
    else localStorage.removeItem(STORAGE_KEY)
  }

  const seleccionado = selectedId ? trips?.find((trip) => trip.id === selectedId) : undefined

  return { viaje: seleccionado ?? defaultTrip, trips, selectTrip }
}
