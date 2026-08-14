import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ListItem } from '@/components/ListItem'
import type { Categoria, Gasto } from '@/lib/db'
import type { Currency } from '@/lib/currencies'
import { formatDayLabel, parseDateOnly } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import { agruparPorDia } from '@/features/expenses/breakdown'
import { eliminarGasto } from '@/features/expenses/expenseRepository'

const FORMATO_HORA = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' })

interface ExpenseListProps {
  gastos: Gasto[]
  categorias: Categoria[]
  currency: Currency
}

/** Listado agrupado por día, con encabezado de fecha y subtotal diario (FR-041). */
export function ExpenseList({ gastos, categorias, currency }: ExpenseListProps) {
  const navigate = useNavigate()
  const categoriaPorId = new Map(categorias.map((categoria) => [categoria.id, categoria]))
  const grupos = agruparPorDia(gastos)

  const [gastoAEliminar, setGastoAEliminar] = useState<Gasto | null>(null)
  const [eliminando, setEliminando] = useState(false)

  async function confirmarEliminacion() {
    if (!gastoAEliminar) return
    setEliminando(true)
    try {
      await eliminarGasto(gastoAEliminar.id)
      setGastoAEliminar(null)
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="flex flex-col">
      {grupos.map((grupo) => (
        <div
          key={grupo.fecha}
          className="flex flex-col divide-y divide-black/[0.06] dark:divide-white/[0.06]"
        >
          <div className="flex items-baseline justify-between pb-2 pt-4">
            <span className="text-xs font-semibold text-text-secondary">
              {formatDayLabel(parseDateOnly(grupo.fecha))}
            </span>
            <span className="text-xs text-text-secondary">
              {formatMoney(grupo.subtotal, currency)}
            </span>
          </div>
          {grupo.gastos.map((gasto) => {
            const categoria = categoriaPorId.get(gasto.categoria_id)
            return (
              <ListItem
                key={gasto.id}
                emoji={categoria?.emoji ?? '🗂️'}
                title={gasto.descripcion}
                subtitle={`${categoria?.nombre ?? 'Otro'} · ${FORMATO_HORA.format(new Date(gasto.momento_registro))}`}
                amount={formatMoney(gasto.monto, currency)}
                onClick={() => navigate(`/gastos/${gasto.id}/editar`)}
                trailingIcon="trash"
                trailingIconLabel="Eliminar gasto"
                onTrailingClick={() => setGastoAEliminar(gasto)}
              />
            )
          })}
        </div>
      ))}

      <ConfirmDialog
        open={gastoAEliminar !== null}
        title="Eliminar gasto"
        description={`Esta acción es permanente: se va a borrar "${gastoAEliminar?.descripcion}" y no se puede deshacer.`}
        onCancel={() => setGastoAEliminar(null)}
        onConfirm={confirmarEliminacion}
        loading={eliminando}
      />
    </div>
  )
}
