import { db, type Categoria } from '@/lib/db'
import { newId } from '@/lib/id'
import { writeAndQueue } from '@/features/sync/queue'

interface SeedCategoria {
  nombre: string
  emoji: string
  protegida: boolean
}

/** Seed inicial por cuenta nueva (Assumptions de spec.md). "Otro" es la única protegida. */
const CATEGORIAS_INICIALES: SeedCategoria[] = [
  { nombre: 'Alojamiento', emoji: '🏨', protegida: false },
  { nombre: 'Comida', emoji: '🍔', protegida: false },
  { nombre: 'Transporte', emoji: '🚗', protegida: false },
  { nombre: 'Actividades', emoji: '🎟️', protegida: false },
  { nombre: 'Compras', emoji: '🛍️', protegida: false },
  { nombre: 'Salud', emoji: '💊', protegida: false },
  { nombre: 'Telecom', emoji: '📶', protegida: false },
  { nombre: 'Otro', emoji: '🗂️', protegida: true },
]

export async function seedCategoriasIniciales(userId: string): Promise<void> {
  const ahora = new Date().toISOString()
  for (const categoria of CATEGORIAS_INICIALES) {
    const record: Categoria = {
      id: newId(),
      user_id: userId,
      nombre: categoria.nombre,
      emoji: categoria.emoji,
      protegida: categoria.protegida,
      created_at: ahora,
      updated_at: ahora,
    }
    await writeAndQueue({
      table: db.categorias,
      entidad: 'categoria',
      operacion: 'crear',
      record,
    })
  }
}
