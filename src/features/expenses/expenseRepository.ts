import { db, type Gasto } from '@/lib/db'
import { newId } from '@/lib/id'
import { writeAndQueue } from '@/features/sync/queue'

export interface NuevoGastoInput {
  tripId: string
  categoriaId: string
  monto: number // unidad mínima de la moneda del viaje (heredada, nunca se pregunta — FR-016)
  descripcion: string
  fecha: string // YYYY-MM-DD
  categoriaElegidaManualmente: boolean
}

export async function crearGasto(input: NuevoGastoInput): Promise<Gasto> {
  if (!Number.isFinite(input.monto) || input.monto <= 0) {
    throw new Error('El monto debe ser mayor a cero.')
  }
  if (!input.descripcion.trim()) {
    throw new Error('La descripción no puede estar vacía.')
  }
  const categoria = await db.categorias.get(input.categoriaId)
  if (!categoria) {
    throw new Error('La categoría elegida no existe.')
  }

  const ahora = new Date().toISOString()
  const gasto: Gasto = {
    id: newId(),
    trip_id: input.tripId,
    categoria_id: input.categoriaId,
    monto: input.monto,
    descripcion: input.descripcion.trim(),
    fecha: input.fecha,
    momento_registro: ahora,
    categoria_elegida_manualmente: input.categoriaElegidaManualmente,
    created_at: ahora,
    updated_at: ahora,
  }

  await writeAndQueue({ table: db.gastos, entidad: 'gasto', operacion: 'crear', record: gasto })
  return gasto
}

export interface ActualizarGastoInput {
  id: string
  categoriaId: string
  monto: number
  descripcion: string
  fecha: string
  categoriaElegidaManualmente: boolean
}

export async function actualizarGasto(input: ActualizarGastoInput): Promise<Gasto> {
  const existente = await db.gastos.get(input.id)
  if (!existente) {
    throw new Error('El gasto no existe.')
  }
  if (!Number.isFinite(input.monto) || input.monto <= 0) {
    throw new Error('El monto debe ser mayor a cero.')
  }
  if (!input.descripcion.trim()) {
    throw new Error('La descripción no puede estar vacía.')
  }
  const categoria = await db.categorias.get(input.categoriaId)
  if (!categoria) {
    throw new Error('La categoría elegida no existe.')
  }

  const actualizado: Gasto = {
    ...existente,
    categoria_id: input.categoriaId,
    monto: input.monto,
    descripcion: input.descripcion.trim(),
    fecha: input.fecha,
    categoria_elegida_manualmente: input.categoriaElegidaManualmente,
    updated_at: new Date().toISOString(),
  }

  await writeAndQueue({
    table: db.gastos,
    entidad: 'gasto',
    operacion: 'actualizar',
    record: actualizado,
  })
  return actualizado
}

/** Eliminación permanente, sin recuperación (FR-019). */
export async function eliminarGasto(id: string): Promise<void> {
  const existente = await db.gastos.get(id)
  if (!existente) return
  await writeAndQueue({ table: db.gastos, entidad: 'gasto', operacion: 'eliminar', record: existente })
}
