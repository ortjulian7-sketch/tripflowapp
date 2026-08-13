import type { Categoria, Gasto } from '@/lib/db'
import { normalizarTexto } from '@/features/categorization/normalize'

/** Coincidencia por descripción o por nombre de categoría, texto normalizado (FR-042). */
export function filtrarPorTexto(gastos: Gasto[], categorias: Categoria[], texto: string): Gasto[] {
  const termino = normalizarTexto(texto)
  if (!termino) return gastos

  const categoriaPorId = new Map(categorias.map((categoria) => [categoria.id, categoria]))
  return gastos.filter((gasto) => {
    const descripcion = normalizarTexto(gasto.descripcion)
    const nombreCategoria = normalizarTexto(categoriaPorId.get(gasto.categoria_id)?.nombre ?? '')
    return descripcion.includes(termino) || nombreCategoria.includes(termino)
  })
}

/** Rango de fechas con límites inclusivos en ambas puntas (FR-043). */
export function filtrarPorRangoFechas(
  gastos: Gasto[],
  desde: string | null,
  hasta: string | null,
): Gasto[] {
  return gastos.filter((gasto) => {
    if (desde && gasto.fecha < desde) return false
    if (hasta && gasto.fecha > hasta) return false
    return true
  })
}
