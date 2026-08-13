import type { Table } from 'dexie'
import { db, type EntidadSync, type OperacionSync } from '@/lib/db'

interface WriteAndQueueParams<T extends { id: string }> {
  // El tercer genérico (tipo de inserción) se deja en `any`: Dexie hace `id`
  // opcional al insertar en tablas con auto-incremento, lo que no aplica acá
  // (siempre generamos el id nosotros con `newId()`) y esa diferencia de
  // forma rompe la comparación estructural de `modify()` si se tipa estricto.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<T, string, any>
  entidad: EntidadSync
  operacion: OperacionSync
  record: T
}

/**
 * Único camino de escritura de la app (contracts/sync-contract.md § Empuje):
 * guarda en IndexedDB y encola el cambio en `cambios_pendientes` dentro de la
 * misma transacción. Ninguna pantalla escribe directo contra Supabase — así
 * cada creación/edición/eliminación funciona igual con o sin conexión
 * (FR-045 a FR-049) y nunca se pierde un dato registrado offline (FR-049).
 */
export async function writeAndQueue<T extends { id: string }>({
  table,
  entidad,
  operacion,
  record,
}: WriteAndQueueParams<T>): Promise<void> {
  await db.transaction('rw', table, db.cambios_pendientes, async () => {
    if (operacion === 'eliminar') {
      await table.delete(record.id)
    } else {
      await table.put(record)
    }
    await db.cambios_pendientes.add({
      entidad,
      entidad_id: record.id,
      operacion,
      intentado_at: null,
    })
  })
}
