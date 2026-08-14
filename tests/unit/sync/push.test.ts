import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { db, type AsociacionAprendida, type Categoria, type Gasto } from '@/lib/db'

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

import { supabase } from '@/lib/supabase'
import { empujarCambiosPendientes } from '@/features/sync/push'

/** Doble mínimo de un query builder de Supabase: encadenable y awaitable. */
function chain(resultado: { data?: unknown; error?: unknown }) {
  const builder: Record<string, unknown> = {
    then: (resolve: (valor: typeof resultado) => unknown) => resolve(resultado),
  }
  for (const metodo of ['select', 'eq', 'neq', 'delete']) {
    builder[metodo] = vi.fn(() => builder)
  }
  builder.maybeSingle = vi.fn(async () => resultado)
  builder.upsert = vi.fn(async () => resultado)
  return builder
}

const duplicada: Categoria = {
  id: 'dup-1',
  user_id: 'u1',
  nombre: 'Comida',
  emoji: '🍔',
  protegida: false,
  created_at: '2026-08-01T00:00:00.000Z',
  updated_at: '2026-08-01T00:00:00.000Z',
}

const gasto: Gasto = {
  id: 'gasto-1',
  trip_id: 'viaje-1',
  categoria_id: 'dup-1',
  monto: 1000,
  descripcion: 'Almuerzo',
  fecha: '2026-08-01',
  momento_registro: '2026-08-01T12:00:00.000Z',
  categoria_elegida_manualmente: true,
  created_at: '2026-08-01T00:00:00.000Z',
  updated_at: '2026-08-01T00:00:00.000Z',
}

const asociacion: AsociacionAprendida = {
  id: 'asoc-1',
  user_id: 'u1',
  termino: 'almuerzo',
  categoria_id: 'dup-1',
  created_at: '2026-08-01T00:00:00.000Z',
  updated_at: '2026-08-01T00:00:00.000Z',
}

async function sembrarPendienteDeCategoria() {
  await db.categorias.add(duplicada)
  await db.gastos.add(gasto)
  await db.asociaciones_aprendidas.add(asociacion)
  await db.cambios_pendientes.add({
    entidad: 'categoria',
    entidad_id: 'dup-1',
    operacion: 'crear',
    intentado_at: null,
  })
}

describe('empujarCambiosPendientes: conflicto de nombre en categorías', () => {
  beforeEach(async () => {
    await db.categorias.clear()
    await db.gastos.clear()
    await db.asociaciones_aprendidas.clear()
    await db.cambios_pendientes.clear()
  })

  afterEach(() => {
    vi.mocked(supabase.from).mockReset()
  })

  it('cuando el push choca con unique(user_id, nombre), remapea a la categoría ganadora y limpia el pendiente', async () => {
    await sembrarPendienteDeCategoria()

    vi.mocked(supabase.from)
      .mockImplementationOnce(
        () => chain({ data: null, error: { code: '23505', message: 'duplicate key' } }) as never,
      )
      .mockImplementationOnce(() => chain({ data: { id: 'ganador-1' }, error: null }) as never)

    await empujarCambiosPendientes()

    expect(await db.categorias.get('dup-1')).toBeUndefined()
    expect((await db.gastos.get('gasto-1'))?.categoria_id).toBe('ganador-1')
    expect((await db.asociaciones_aprendidas.get('asoc-1'))?.categoria_id).toBe('ganador-1')
    expect(await db.cambios_pendientes.count()).toBe(0)
  })

  it('si todavía no hay una categoría ganadora visible, deja el cambio pendiente para reintentar', async () => {
    await sembrarPendienteDeCategoria()

    vi.mocked(supabase.from)
      .mockImplementationOnce(
        () => chain({ data: null, error: { code: '23505', message: 'duplicate key' } }) as never,
      )
      .mockImplementationOnce(() => chain({ data: null, error: null }) as never)

    await empujarCambiosPendientes()

    expect(await db.categorias.get('dup-1')).toEqual(duplicada)
    expect((await db.gastos.get('gasto-1'))?.categoria_id).toBe('dup-1')
    expect(await db.cambios_pendientes.count()).toBe(1)
  })
})
