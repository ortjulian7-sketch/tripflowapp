import { ProgressBar } from '@/components/ProgressBar'
import type { Categoria, Gasto } from '@/lib/db'
import type { Currency } from '@/lib/currencies'
import { formatMoney, sum } from '@/lib/money'
import { acumuladoPorCategoria } from '@/features/expenses/breakdown'

interface CategoryBreakdownProps {
  gastos: Gasto[]
  categorias: Categoria[]
  currency: Currency
}

export function CategoryBreakdown({ gastos, categorias, currency }: CategoryBreakdownProps) {
  const acumulados = acumuladoPorCategoria(gastos)
  if (acumulados.length === 0) return null

  const totalGastado = sum(gastos.map((gasto) => gasto.monto))
  const categoriaPorId = new Map(categorias.map((categoria) => [categoria.id, categoria]))

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-text-secondary">Por categoría</h2>
      {acumulados.map(({ categoriaId, total }) => {
        const categoria = categoriaPorId.get(categoriaId)
        const percent = totalGastado > 0 ? (total / totalGastado) * 100 : 0
        return (
          <div key={categoriaId} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-primary">
                {categoria?.emoji ?? '🗂️'} {categoria?.nombre ?? 'Otro'}
              </span>
              <span className="font-semibold text-text-primary">
                {formatMoney(total, currency)}
              </span>
            </div>
            <ProgressBar percent={percent} variant="brand" />
          </div>
        )
      })}
    </div>
  )
}
