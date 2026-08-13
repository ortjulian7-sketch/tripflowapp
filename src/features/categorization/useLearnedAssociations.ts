import { useLiveQuery } from 'dexie-react-hooks'
import { db, type AsociacionAprendida } from '@/lib/db'

export function useLearnedAssociations(userId: string | undefined): AsociacionAprendida[] | undefined {
  return useLiveQuery(
    () => (userId ? db.asociaciones_aprendidas.where('user_id').equals(userId).toArray() : []),
    [userId],
  )
}
