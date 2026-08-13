import { describe, expect, it } from 'vitest'
import type { Gasto } from '@/lib/db'
import { acumuladoPorCategoria, agruparPorDia } from '@/features/expenses/breakdown'

function gasto(overrides: Partial<Gasto>): Gasto {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    trip_id: 'viaje-1',
    categoria_id: 'comida',
    monto: 1000,
    descripcion: 'gasto',
    fecha: '2026-08-01',
    momento_registro: '2026-08-01T10:00:00.000Z',
    categoria_elegida_manualmente: true,
    created_at: '2026-08-01T10:00:00.000Z',
    updated_at: '2026-08-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('acumuladoPorCategoria', () => {
  it('ordena de mayor a menor', () => {
    const gastos = [
      gasto({ categoria_id: 'comida', monto: 3000 }),
      gasto({ categoria_id: 'transporte', monto: 8000 }),
      gasto({ categoria_id: 'comida', monto: 2000 }),
    ]
    const acumulado = acumuladoPorCategoria(gastos)
    expect(acumulado).toEqual([
      { categoriaId: 'transporte', total: 8000 },
      { categoriaId: 'comida', total: 5000 },
    ])
  })

  it('excluye categorías sin gastos (no aparecen en el resultado)', () => {
    const gastos = [gasto({ categoria_id: 'comida', monto: 1000 })]
    const acumulado = acumuladoPorCategoria(gastos)
    expect(acumulado.find((item) => item.categoriaId === 'transporte')).toBeUndefined()
  })

  it('devuelve una lista vacía sin gastos', () => {
    expect(acumuladoPorCategoria([])).toEqual([])
  })
})

describe('agruparPorDia', () => {
  it('agrupa por fecha y calcula el subtotal de cada día', () => {
    const gastos = [
      gasto({ fecha: '2026-08-01', monto: 1000 }),
      gasto({ fecha: '2026-08-01', monto: 500 }),
      gasto({ fecha: '2026-08-02', monto: 2000 }),
    ]
    const grupos = agruparPorDia(gastos)
    expect(grupos).toHaveLength(2)
    const dia1 = grupos.find((g) => g.fecha === '2026-08-01')
    expect(dia1?.subtotal).toBe(1500)
    expect(dia1?.gastos).toHaveLength(2)
  })

  it('ordena los días del más reciente al más antiguo', () => {
    const gastos = [gasto({ fecha: '2026-08-01' }), gasto({ fecha: '2026-08-03' }), gasto({ fecha: '2026-08-02' })]
    const grupos = agruparPorDia(gastos)
    expect(grupos.map((g) => g.fecha)).toEqual(['2026-08-03', '2026-08-02', '2026-08-01'])
  })
})
