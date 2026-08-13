import { db, type CambioPendiente, type EntidadSync } from '@/lib/db'
import { supabase } from '@/lib/supabase'

const TABLA_SUPABASE: Record<EntidadSync, string> = {
  viaje: 'viajes',
  gasto: 'gastos',
  categoria: 'categorias',
  asociacion_aprendida: 'asociaciones_aprendidas',
}

async function registroLocal(cambio: CambioPendiente) {
  switch (cambio.entidad) {
    case 'viaje':
      return db.viajes.get(cambio.entidad_id)
    case 'gasto':
      return db.gastos.get(cambio.entidad_id)
    case 'categoria':
      return db.categorias.get(cambio.entidad_id)
    case 'asociacion_aprendida':
      return db.asociaciones_aprendidas.get(cambio.entidad_id)
  }
}

async function empujarCambio(cambio: CambioPendiente): Promise<boolean> {
  const tablaSupabase = TABLA_SUPABASE[cambio.entidad]

  if (cambio.operacion === 'eliminar') {
    const { error } = await supabase.from(tablaSupabase).delete().eq('id', cambio.entidad_id)
    return !error
  }

  const registro = await registroLocal(cambio)
  if (!registro) return true // se borró localmente después de encolar: nada que empujar

  // Sin generación de tipos desde el esquema de Supabase, el cliente no
  // puede inferir la fila esperada por tabla — el registro local (mismos
  // nombres de columna que contracts/data-schema.md) ya tiene la forma correcta.
  const { error } = await supabase
    .from(tablaSupabase)
    .upsert(registro as unknown as Record<string, unknown>)
  return !error
}

/**
 * Empuja la cola de cambios pendientes hacia Supabase (contracts/sync-contract.md
 * § Empuje). Cada cambio se quita de la cola solo tras un push exitoso; si
 * falla, permanece para el siguiente intento — ningún dato offline se pierde (FR-049).
 */
export async function empujarCambiosPendientes(): Promise<void> {
  const pendientes = await db.cambios_pendientes.toArray()
  for (const cambio of pendientes) {
    if (cambio.id === undefined) continue
    const exito = await empujarCambio(cambio)
    if (exito) {
      await db.cambios_pendientes.delete(cambio.id)
    } else {
      await db.cambios_pendientes.update(cambio.id, { intentado_at: new Date().toISOString() })
    }
  }
}
