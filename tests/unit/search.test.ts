import { describe, expect, it } from 'vitest'
import type { Categoria, Gasto } from '@/lib/db'
import { filtrarPorRangoFechas, filtrarPorTexto } from '@/features/expenses/search'

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

const CATEGORIAS: Categoria[] = [
  {
    id: 'comida',
    user_id: 'user-1',
    nombre: 'Comida',
    emoji: '🍔',
    protegida: false,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'transporte',
    user_id: 'user-1',
    nombre: 'Transporte',
    emoji: '🚗',
    protegida: false,
    created_at: '',
    updated_at: '',
  },
]

describe('filtrarPorTexto', () => {
  it('encuentra coincidencias por descripción', () => {
    const gastos = [gasto({ descripcion: 'Hamburguesa en el centro' }), gasto({ descripcion: 'Taxi al hotel' })]
    const resultado = filtrarPorTexto(gastos, CATEGORIAS, 'hamburguesa')
    expect(resultado).toHaveLength(1)
    expect(resultado[0].descripcion).toBe('Hamburguesa en el centro')
  })

  it('encuentra coincidencias por nombre de categoría', () => {
    const gastos = [
      gasto({ descripcion: 'Almuerzo', categoria_id: 'comida' }),
      gasto({ descripcion: 'Uber', categoria_id: 'transporte' }),
    ]
    const resultado = filtrarPorTexto(gastos, CATEGORIAS, 'transporte')
    expect(resultado).toHaveLength(1)
    expect(resultado[0].descripcion).toBe('Uber')
  })

  it('sin texto de búsqueda devuelve todos los gastos', () => {
    const gastos = [gasto({}), gasto({})]
    expect(filtrarPorTexto(gastos, CATEGORIAS, '')).toHaveLength(2)
  })

  it('sin coincidencias devuelve una lista vacía', () => {
    const gastos = [gasto({ descripcion: 'Almuerzo' })]
    expect(filtrarPorTexto(gastos, CATEGORIAS, 'zzz')).toEqual([])
  })
})

describe('filtrarPorRangoFechas', () => {
  const gastos = [
    gasto({ fecha: '2026-08-01' }),
    gasto({ fecha: '2026-08-05' }),
    gasto({ fecha: '2026-08-10' }),
  ]

  it('los límites del rango son inclusivos', () => {
    const resultado = filtrarPorRangoFechas(gastos, '2026-08-01', '2026-08-05')
    expect(resultado.map((g) => g.fecha)).toEqual(['2026-08-01', '2026-08-05'])
  })

  it('sin límites devuelve todos los gastos', () => {
    expect(filtrarPorRangoFechas(gastos, null, null)).toHaveLength(3)
  })

  it('un rango sin gastos dentro devuelve una lista vacía', () => {
    expect(filtrarPorRangoFechas(gastos, '2026-09-01', '2026-09-30')).toEqual([])
  })
})
