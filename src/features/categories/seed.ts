import { db, type Categoria } from '@/lib/db'
import { newId } from '@/lib/id'
import { writeAndQueue } from '@/features/sync/queue'

/** Catálogo candidato del onboarding (contracts/onboarding-categorias-contract.md): no se persiste hasta confirmar. */
export const CATEGORIAS_CANDIDATAS: { nombre: string; emoji: string }[] = [
  { nombre: 'Alojamiento', emoji: '🏨' },
  { nombre: 'Comida', emoji: '🍔' },
  { nombre: 'Licor', emoji: '🍺' },
  { nombre: 'Transporte', emoji: '🚗' },
  { nombre: 'Actividades', emoji: '🎟️' },
  { nombre: 'Compras', emoji: '🛍️' },
  { nombre: 'Salud', emoji: '💊' },
  { nombre: 'Telecom', emoji: '📶' },
]

/** Protegida: nunca aparece en la grilla de selección, siempre se persiste al confirmar (FR-012). */
export const OTRO = { nombre: 'Otro', emoji: '🗂️' }

async function crearCategoria(userId: string, nombre: string, emoji: string, protegida: boolean): Promise<void> {
  const ahora = new Date().toISOString()
  const record: Categoria = {
    id: newId(),
    user_id: userId,
    nombre,
    emoji,
    protegida,
    created_at: ahora,
    updated_at: ahora,
  }
  await writeAndQueue({ table: db.categorias, entidad: 'categoria', operacion: 'crear', record })
}

/**
 * Confirmación del onboarding (contracts/onboarding-categorias-contract.md):
 * persiste las candidatas elegidas más siempre "Otro", en una sola pasada.
 */
export async function guardarSeleccionInicial(
  userId: string,
  nombresSeleccionados: Set<string>,
): Promise<void> {
  for (const candidata of CATEGORIAS_CANDIDATAS) {
    if (nombresSeleccionados.has(candidata.nombre)) {
      await crearCategoria(userId, candidata.nombre, candidata.emoji, false)
    }
  }
  await crearCategoria(userId, OTRO.nombre, OTRO.emoji, true)
}
