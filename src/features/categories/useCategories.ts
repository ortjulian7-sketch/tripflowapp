import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Categoria } from '@/lib/db'

export function useCategories(userId: string | undefined): Categoria[] | undefined {
  return useLiveQuery(
    () => (userId ? db.categorias.where('user_id').equals(userId).toArray() : []),
    [userId],
  )
}
