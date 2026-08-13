import { db, type AsociacionAprendida } from '@/lib/db'
import { newId } from '@/lib/id'
import { writeAndQueue } from '@/features/sync/queue'
import { normalizarTexto } from './normalize'

/**
 * Upsert por (user_id, termino): la corrección más reciente prevalece porque
 * reemplaza la misma fila en vez de crear un duplicado (FR-022).
 */
export async function registrarCorreccion(
  userId: string,
  descripcion: string,
  categoriaId: string,
): Promise<void> {
  const termino = normalizarTexto(descripcion)
  if (!termino) return

  const existente = await db.asociaciones_aprendidas
    .where('[user_id+termino]')
    .equals([userId, termino])
    .first()

  const ahora = new Date().toISOString()
  const record: AsociacionAprendida = {
    id: existente?.id ?? newId(),
    user_id: userId,
    termino,
    categoria_id: categoriaId,
    created_at: existente?.created_at ?? ahora,
    updated_at: ahora,
  }

  await writeAndQueue({
    table: db.asociaciones_aprendidas,
    entidad: 'asociacion_aprendida',
    operacion: existente ? 'actualizar' : 'crear',
    record,
  })
}
