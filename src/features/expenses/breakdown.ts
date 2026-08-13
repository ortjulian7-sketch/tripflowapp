import type { Gasto } from '@/lib/db'
import { sum } from '@/lib/money'

export interface AcumuladoCategoria {
  categoriaId: string
  total: number
}

/** Acumulado por categoría, de mayor a menor (FR-040). Categorías sin gastos no aparecen. */
export function acumuladoPorCategoria(gastos: Gasto[]): AcumuladoCategoria[] {
  const totales = new Map<string, number>()
  for (const gasto of gastos) {
    totales.set(gasto.categoria_id, (totales.get(gasto.categoria_id) ?? 0) + gasto.monto)
  }
  return [...totales.entries()]
    .map(([categoriaId, total]) => ({ categoriaId, total }))
    .sort((a, b) => b.total - a.total)
}

export interface GrupoPorDia {
  fecha: string // YYYY-MM-DD
  gastos: Gasto[]
  subtotal: number
}

/** Gastos agrupados por día con subtotal, del más reciente al más antiguo (FR-041). */
export function agruparPorDia(gastos: Gasto[]): GrupoPorDia[] {
  const grupos = new Map<string, Gasto[]>()
  for (const gasto of gastos) {
    const lista = grupos.get(gasto.fecha) ?? []
    lista.push(gasto)
    grupos.set(gasto.fecha, lista)
  }
  return [...grupos.entries()]
    .map(([fecha, gastosDelDia]) => ({
      fecha,
      gastos: gastosDelDia,
      subtotal: sum(gastosDelDia.map((gasto) => gasto.monto)),
    }))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
}
