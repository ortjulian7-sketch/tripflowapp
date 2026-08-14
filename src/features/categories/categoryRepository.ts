import { db, type Categoria } from '@/lib/db'
import { newId } from '@/lib/id'
import { writeAndQueue } from '@/features/sync/queue'

async function nombreYaExiste(userId: string, nombre: string, excluirId?: string): Promise<boolean> {
  const categorias = await db.categorias.where('user_id').equals(userId).toArray()
  return categorias.some((categoria) => categoria.nombre === nombre && categoria.id !== excluirId)
}

export async function crearCategoria(
  userId: string,
  nombre: string,
  emoji: string,
): Promise<Categoria> {
  const nombreLimpio = nombre.trim()
  if (!nombreLimpio) {
    throw new Error('El nombre no puede estar vacío.')
  }
  const emojiLimpio = emoji.trim()
  if (!emojiLimpio) {
    throw new Error('El emoji no puede estar vacío.')
  }
  if (await nombreYaExiste(userId, nombreLimpio)) {
    throw new Error('Ya existe una categoría con ese nombre.')
  }

  const ahora = new Date().toISOString()
  const categoria: Categoria = {
    id: newId(),
    user_id: userId,
    nombre: nombreLimpio,
    emoji: emojiLimpio,
    protegida: false,
    created_at: ahora,
    updated_at: ahora,
  }
  await writeAndQueue({
    table: db.categorias,
    entidad: 'categoria',
    operacion: 'crear',
    record: categoria,
  })
  return categoria
}

export async function editarCategoria(
  categoriaId: string,
  nuevoNombre: string,
  nuevoEmoji: string,
): Promise<Categoria> {
  const categoria = await db.categorias.get(categoriaId)
  if (!categoria) {
    throw new Error('La categoría no existe.')
  }

  const nombreLimpio = nuevoNombre.trim()
  if (!nombreLimpio) {
    throw new Error('El nombre no puede estar vacío.')
  }
  const emojiLimpio = nuevoEmoji.trim()
  if (!emojiLimpio) {
    throw new Error('El emoji no puede estar vacío.')
  }
  if (await nombreYaExiste(categoria.user_id, nombreLimpio, categoriaId)) {
    throw new Error('Ya existe una categoría con ese nombre.')
  }

  const actualizada: Categoria = {
    ...categoria,
    nombre: nombreLimpio,
    emoji: emojiLimpio,
    updated_at: new Date().toISOString(),
  }
  await writeAndQueue({
    table: db.categorias,
    entidad: 'categoria',
    operacion: 'actualizar',
    record: actualizada,
  })
  return actualizada
}

/** Rechaza "Otro" (protegida) y cualquier categoría con al menos un gasto asociado (FR-028). */
export async function eliminarCategoria(categoriaId: string): Promise<void> {
  const categoria = await db.categorias.get(categoriaId)
  if (!categoria) return

  if (categoria.protegida) {
    throw new Error('"Otro" es una categoría permanente y no se puede eliminar.')
  }

  const cantidadGastos = await db.gastos.where('categoria_id').equals(categoriaId).count()
  if (cantidadGastos > 0) {
    throw new Error('No se puede eliminar: esta categoría tiene gastos asociados.')
  }

  // Cascada: sus asociaciones aprendidas se eliminan también (esos términos
  // vuelven a resolverse desde cero — edge case de la spec).
  const asociaciones = await db.asociaciones_aprendidas
    .where('categoria_id')
    .equals(categoriaId)
    .toArray()
  for (const asociacion of asociaciones) {
    await writeAndQueue({
      table: db.asociaciones_aprendidas,
      entidad: 'asociacion_aprendida',
      operacion: 'eliminar',
      record: asociacion,
    })
  }

  await writeAndQueue({
    table: db.categorias,
    entidad: 'categoria',
    operacion: 'eliminar',
    record: categoria,
  })
}
