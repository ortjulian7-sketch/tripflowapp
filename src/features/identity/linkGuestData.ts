import { db, type Categoria, type EntidadSync } from '@/lib/db'
import { supabase } from '@/lib/supabase'
import { normalizarTexto } from '@/features/categorization/normalize'

export interface MapeoCategorias {
  /** categoriaIdLocal → categoriaIdRemoto, para categorías cuyo nombre ya existe en la cuenta. */
  remapeadas: Map<string, string>
  /** Categorías locales sin coincidencia por nombre: se reasignan tal cual a la cuenta. */
  nuevas: Categoria[]
}

/**
 * Función pura (FR-012): decide qué categorías locales se remapean a una
 * categoría remota existente (mismo nombre normalizado) y cuáles se
 * reasignan como nuevas — sin tocar Dexie ni la red.
 */
export function calcularMapeoCategorias(
  categoriasLocales: Categoria[],
  remotasPorNombre: Map<string, string>,
): MapeoCategorias {
  const remapeadas = new Map<string, string>()
  const nuevas: Categoria[] = []

  for (const categoria of categoriasLocales) {
    const idRemoto = remotasPorNombre.get(normalizarTexto(categoria.nombre))
    if (idRemoto) {
      remapeadas.set(categoria.id, idRemoto)
    } else {
      nuevas.push(categoria)
    }
  }

  return { remapeadas, nuevas }
}

export async function contarViajesLocales(identidadAnterior: string): Promise<number> {
  return db.viajes.where('user_id').equals(identidadAnterior).count()
}

async function peekCategoriasRemotas(): Promise<Map<string, string>> {
  const { data, error } = await supabase.from('categorias').select('id, nombre')
  if (error || !data) return new Map()
  return new Map(
    (data as { id: string; nombre: string }[]).map((c) => [normalizarTexto(c.nombre), c.id]),
  )
}

async function purgarPendientes(entidad: EntidadSync, entidadId: string): Promise<void> {
  await db.cambios_pendientes
    .where('entidad_id')
    .equals(entidadId)
    .filter((cambio) => cambio.entidad === entidad)
    .delete()
}

async function encolarCrearSiNoExiste(entidad: EntidadSync, entidadId: string): Promise<void> {
  const yaPendiente = await db.cambios_pendientes
    .where('entidad_id')
    .equals(entidadId)
    .filter((cambio) => cambio.entidad === entidad && cambio.operacion === 'crear')
    .count()
  if (yaPendiente > 0) return
  await db.cambios_pendientes.add({
    entidad,
    entidad_id: entidadId,
    operacion: 'crear',
    intentado_at: null,
  })
}

/**
 * Camino "Incluir" (FR-010, FR-012, contracts/guest-link-contract.md): fusiona
 * todo lo local de la identidad anterior hacia la cuenta nueva. También se
 * usa cuando no hay viajes que confirmar, para no dejar categorías locales
 * huérfanas bajo la identidad anterior (evita re-sembrar categorías por
 * duplicado la próxima vez que el bootstrap de onboarding las cuente).
 */
export async function incluirDatosLocales(
  identidadAnterior: string,
  nuevoUserId: string,
): Promise<void> {
  const remotasPorNombre = await peekCategoriasRemotas()
  const categoriasLocales = await db.categorias.where('user_id').equals(identidadAnterior).toArray()
  const { remapeadas, nuevas } = calcularMapeoCategorias(categoriasLocales, remotasPorNombre)

  await db.transaction(
    'rw',
    db.viajes,
    db.gastos,
    db.categorias,
    db.asociaciones_aprendidas,
    db.cambios_pendientes,
    async () => {
      for (const categoria of categoriasLocales) {
        const idRemoto = remapeadas.get(categoria.id)
        if (!idRemoto) continue
        await db.gastos.where('categoria_id').equals(categoria.id).modify({ categoria_id: idRemoto })
        await db.asociaciones_aprendidas
          .where('categoria_id')
          .equals(categoria.id)
          .modify({ categoria_id: idRemoto })
        await db.categorias.delete(categoria.id)
        await purgarPendientes('categoria', categoria.id)
      }

      for (const categoria of nuevas) {
        await db.categorias.put({ ...categoria, user_id: nuevoUserId })
        await encolarCrearSiNoExiste('categoria', categoria.id)
      }

      const viajes = await db.viajes.where('user_id').equals(identidadAnterior).toArray()
      for (const viaje of viajes) {
        await db.viajes.put({ ...viaje, user_id: nuevoUserId })
        await encolarCrearSiNoExiste('viaje', viaje.id)

        const gastos = await db.gastos.where('trip_id').equals(viaje.id).toArray()
        for (const gasto of gastos) {
          const idRemoto = remapeadas.get(gasto.categoria_id)
          if (idRemoto) {
            await db.gastos.update(gasto.id, { categoria_id: idRemoto })
          }
          await encolarCrearSiNoExiste('gasto', gasto.id)
        }
      }

      const asociaciones = await db.asociaciones_aprendidas
        .where('user_id')
        .equals(identidadAnterior)
        .toArray()
      for (const asociacion of asociaciones) {
        const idRemoto = remapeadas.get(asociacion.categoria_id)
        await db.asociaciones_aprendidas.put({
          ...asociacion,
          user_id: nuevoUserId,
          categoria_id: idRemoto ?? asociacion.categoria_id,
        })
        await encolarCrearSiNoExiste('asociacion_aprendida', asociacion.id)
      }
    },
  )
}

/** Camino "Descartar" (FR-011): borra del dispositivo todo lo local de la identidad anterior. */
export async function descartarDatosLocales(identidadAnterior: string): Promise<void> {
  await db.transaction(
    'rw',
    db.viajes,
    db.gastos,
    db.categorias,
    db.asociaciones_aprendidas,
    db.cambios_pendientes,
    async () => {
      const viajes = await db.viajes.where('user_id').equals(identidadAnterior).toArray()
      for (const viaje of viajes) {
        const gastos = await db.gastos.where('trip_id').equals(viaje.id).toArray()
        for (const gasto of gastos) {
          await db.gastos.delete(gasto.id)
          await purgarPendientes('gasto', gasto.id)
        }
        await db.viajes.delete(viaje.id)
        await purgarPendientes('viaje', viaje.id)
      }

      const categorias = await db.categorias.where('user_id').equals(identidadAnterior).toArray()
      for (const categoria of categorias) {
        await db.categorias.delete(categoria.id)
        await purgarPendientes('categoria', categoria.id)
      }

      const asociaciones = await db.asociaciones_aprendidas
        .where('user_id')
        .equals(identidadAnterior)
        .toArray()
      for (const asociacion of asociaciones) {
        await db.asociaciones_aprendidas.delete(asociacion.id)
        await purgarPendientes('asociacion_aprendida', asociacion.id)
      }
    },
  )
}
