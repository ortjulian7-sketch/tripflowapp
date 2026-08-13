import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Viaje } from '@/lib/db'

export function useTrips(userId: string | undefined): Viaje[] | undefined {
  return useLiveQuery(
    () => (userId ? db.viajes.where('user_id').equals(userId).toArray() : []),
    [userId],
  )
}
