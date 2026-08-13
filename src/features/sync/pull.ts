import type { Table } from 'dexie'
import { db, type AsociacionAprendida, type Categoria, type Gasto, type Viaje } from '@/lib/db'
import { supabase } from '@/lib/supabase'

interface ConMarcaDeTiempo {
  id: string
  updated_at: string
}

/**
 * Reconciliación por comparación de listas completas (contracts/sync-contract.md
 * § Extracción): lo ausente en el servidor se elimina localmente; para lo
 * presente en ambos lados, gana el `updated_at` más reciente.
 */
async function reconciliar<T extends ConMarcaDeTiempo>(
  // El tercer genérico se deja abierto por la misma razón que en queue.ts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabla: Table<T, string, any>,
  remotos: T[],
): Promise<void> {
  const locales = await tabla.toArray()
  const remotosPorId = new Map(remotos.map((registro) => [registro.id, registro]))
  const localesPorId = new Map(locales.map((registro) => [registro.id, registro]))

  for (const local of locales) {
    if (!remotosPorId.has(local.id)) {
      await tabla.delete(local.id)
    }
  }

  for (const remoto of remotos) {
    const local = localesPorId.get(remoto.id)
    if (!local || new Date(remoto.updated_at) > new Date(local.updated_at)) {
      await tabla.put(remoto)
    }
  }
}

/**
 * Extracción desde Supabase. RLS ya limita cada consulta a la cuenta
 * autenticada (contracts/data-schema.md), así que no hace falta filtrar por
 * user_id acá.
 */
export async function extraerDesdeSupabase(): Promise<void> {
  const [viajes, categorias, gastos, asociaciones] = await Promise.all([
    supabase.from('viajes').select('*'),
    supabase.from('categorias').select('*'),
    supabase.from('gastos').select('*'),
    supabase.from('asociaciones_aprendidas').select('*'),
  ])

  if (!viajes.error && viajes.data) await reconciliar(db.viajes, viajes.data as Viaje[])
  if (!categorias.error && categorias.data) {
    await reconciliar(db.categorias, categorias.data as Categoria[])
  }
  if (!gastos.error && gastos.data) await reconciliar(db.gastos, gastos.data as Gasto[])
  if (!asociaciones.error && asociaciones.data) {
    await reconciliar(db.asociaciones_aprendidas, asociaciones.data as AsociacionAprendida[])
  }
}
