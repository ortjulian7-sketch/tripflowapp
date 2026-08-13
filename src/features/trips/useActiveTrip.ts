import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Viaje } from '@/lib/db'
import { toDateOnlyString, today } from '@/lib/dates'

/**
 * Viaje mostrado por defecto: el que contiene hoy en su rango de fechas; si
 * ninguno lo hace, el último creado. Consulta reactiva — se recalcula sola
 * cuando cambian los viajes en IndexedDB.
 */
export function useActiveTrip(userId: string | undefined): Viaje | undefined {
  return useLiveQuery(async () => {
    if (!userId) return undefined
    const viajes = await db.viajes.where('user_id').equals(userId).toArray()
    if (viajes.length === 0) return undefined

    const hoy = toDateOnlyString(today())
    const enCurso = viajes.find(
      (viaje) =>
        viaje.fecha_salida <= hoy && (viaje.fecha_regreso === null || viaje.fecha_regreso >= hoy),
    )
    if (enCurso) return enCurso

    return viajes.reduce((ultimo, actual) => (actual.created_at > ultimo.created_at ? actual : ultimo))
  }, [userId])
}
