import type { Categoria, Gasto } from '@/lib/db'
import type { Currency } from '@/lib/currencies'
import { formatCompactAmount } from '@/lib/money'
import { acumuladoPorCategoria } from '@/features/expenses/breakdown'

interface CategoryBreakdownProps {
  gastos: Gasto[]
  categorias: Categoria[]
  currency: Currency
}

const BAR_HEIGHT_MAX = 110
// Gradiente de marca (Blue 500 → 100) para distinguir el ranking de categorías,
// igual que el mini-chart del Dashboard en Figma (node 204:1539).
const BAR_COLORS = ['#0500fe', '#4247ff', '#7b7fff', '#a5a8ff', '#c8caff']

export function CategoryBreakdown({ gastos, categorias, currency }: CategoryBreakdownProps) {
  const acumulados = acumuladoPorCategoria(gastos)
  if (acumulados.length === 0) return null

  const categoriaPorId = new Map(categorias.map((categoria) => [categoria.id, categoria]))
  const maxTotal = acumulados[0].total

  return (
    <div className="flex items-end gap-2.5 overflow-x-auto pb-1">
      {acumulados.map(({ categoriaId, total }, index) => {
        const categoria = categoriaPorId.get(categoriaId)
        const barHeight = maxTotal > 0 ? Math.max(4, (total / maxTotal) * BAR_HEIGHT_MAX) : 4
        return (
          <div key={categoriaId} className="flex min-w-[62px] flex-1 flex-col items-center gap-[7px]">
            <span className="whitespace-nowrap text-xs font-medium text-text-primary">
              {formatCompactAmount(total, currency)}
            </span>
            <div className="flex h-[110px] w-full items-end overflow-hidden rounded-lg bg-surface-secondary">
              <div
                className="w-full rounded-lg"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: BAR_COLORS[Math.min(index, BAR_COLORS.length - 1)],
                }}
              />
            </div>
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-surface-secondary text-base">
              {categoria?.emoji ?? '🗂️'}
            </span>
          </div>
        )
      })}
    </div>
  )
}
