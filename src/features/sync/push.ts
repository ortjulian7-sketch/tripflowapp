import { db, type CambioPendiente, type Categoria, type EntidadSync } from '@/lib/db'
import { supabase } from '@/lib/supabase'

const TABLA_SUPABASE: Record<EntidadSync, string> = {
  viaje: 'viajes',
  gasto: 'gastos',
  categoria: 'categorias',
  asociacion_aprendida: 'asociaciones_aprendidas',
}

const CODIGO_VIOLACION_UNICA = '23505'

/**
 * Dos dispositivos pueden vincular datos de invitado a la misma cuenta casi
 * al mismo tiempo (contracts/guest-link-contract.md): cada uno resuelve
 * "¿ya existe esta categoría?" contra una foto momentánea del servidor, así
 * que ambos pueden crear localmente una categoría con el mismo nombre antes
 * de que el push del otro se complete. El choque real recién aparece acá,
 * contra la constraint `unique(user_id, nombre)` de Supabase — se resuelve
 * remapeando al registro remoto que ganó la carrera, en vez de reintentar
 * este cambio para siempre (lo que además congelaría el pull, que nunca
 * corre mientras queden cambios pendientes).
 */
async function resolverConflictoDeNombreDeCategoria(duplicada: Categoria): Promise<boolean> {
  const { data: ganadora } = await supabase
    .from('categorias')
    .select('id')
    .eq('user_id', duplicada.user_id)
    .eq('nombre', duplicada.nombre)
    .neq('id', duplicada.id)
    .maybeSingle()

  const idGanador = (ganadora as { id: string } | null)?.id
  if (!idGanador) return false // no se pudo resolver todavía: se reintenta en el próximo ciclo

  await db.transaction(
    'rw',
    db.categorias,
    db.gastos,
    db.asociaciones_aprendidas,
    db.cambios_pendientes,
    async () => {
      await db.gastos.where('categoria_id').equals(duplicada.id).modify({ categoria_id: idGanador })
      await db.asociaciones_aprendidas
        .where('categoria_id')
        .equals(duplicada.id)
        .modify({ categoria_id: idGanador })
      await db.categorias.delete(duplicada.id)
      await db.cambios_pendientes
        .where('entidad_id')
        .equals(duplicada.id)
        .filter((cambio) => cambio.entidad === 'categoria')
        .delete()
    },
  )
  return true
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

  if (error && cambio.entidad === 'categoria' && error.code === CODIGO_VIOLACION_UNICA) {
    return await resolverConflictoDeNombreDeCategoria(registro as Categoria)
  }

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
