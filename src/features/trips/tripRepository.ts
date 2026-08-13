import { db, type Viaje } from '@/lib/db'
import { newId } from '@/lib/id'
import { getCurrency } from '@/lib/currencies'
import { writeAndQueue } from '@/features/sync/queue'

export interface NuevoViajeInput {
  userId: string
  nombre: string
  destino: string
  fechaSalida: string // YYYY-MM-DD
  fechaRegreso: string | null // null = viaje abierto (FR-006)
  presupuestoTotal: number // unidad mínima de `moneda`
  moneda: string
}

export async function crearViaje(input: NuevoViajeInput): Promise<Viaje> {
  if (!Number.isFinite(input.presupuestoTotal) || input.presupuestoTotal <= 0) {
    throw new Error('El presupuesto debe ser mayor a cero.')
  }
  getCurrency(input.moneda) // lanza si la moneda no está en el catálogo acotado

  const ahora = new Date().toISOString()
  const viaje: Viaje = {
    id: newId(),
    user_id: input.userId,
    nombre: input.nombre,
    destino: input.destino,
    fecha_salida: input.fechaSalida,
    fecha_regreso: input.fechaRegreso,
    presupuesto_total: input.presupuestoTotal,
    moneda: input.moneda,
    created_at: ahora,
    updated_at: ahora,
  }

  await writeAndQueue({ table: db.viajes, entidad: 'viaje', operacion: 'crear', record: viaje })
  return viaje
}

export interface ActualizarViajeInput {
  id: string
  nombre: string
  destino: string
  fechaSalida: string
  fechaRegreso: string | null
  presupuestoTotal: number
  // La moneda es inmutable tras la creación (FR-009) — no se puede editar acá.
}

export async function actualizarViaje(input: ActualizarViajeInput): Promise<Viaje> {
  const existente = await db.viajes.get(input.id)
  if (!existente) {
    throw new Error('El viaje no existe.')
  }
  if (!Number.isFinite(input.presupuestoTotal) || input.presupuestoTotal <= 0) {
    throw new Error('El presupuesto debe ser mayor a cero.')
  }

  const actualizado: Viaje = {
    ...existente,
    nombre: input.nombre,
    destino: input.destino,
    fecha_salida: input.fechaSalida,
    fecha_regreso: input.fechaRegreso,
    presupuesto_total: input.presupuestoTotal,
    updated_at: new Date().toISOString(),
  }

  await writeAndQueue({
    table: db.viajes,
    entidad: 'viaje',
    operacion: 'actualizar',
    record: actualizado,
  })
  return actualizado
}

/** Borra en cascada todos sus gastos; las categorías de la cuenta no se ven afectadas (FR-054). */
export async function eliminarViaje(viajeId: string): Promise<void> {
  const viaje = await db.viajes.get(viajeId)
  if (!viaje) return

  const gastos = await db.gastos.where('trip_id').equals(viajeId).toArray()
  for (const gasto of gastos) {
    await writeAndQueue({ table: db.gastos, entidad: 'gasto', operacion: 'eliminar', record: gasto })
  }

  await writeAndQueue({ table: db.viajes, entidad: 'viaje', operacion: 'eliminar', record: viaje })
}
