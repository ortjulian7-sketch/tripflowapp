import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Gasto } from '@/lib/db'

/** Gastos del viaje seleccionado, aislados por trip_id (FR-012). */
export function useExpenses(tripId: string | undefined): Gasto[] | undefined {
  return useLiveQuery(
    () => (tripId ? db.gastos.where('trip_id').equals(tripId).toArray() : []),
    [tripId],
  )
}
