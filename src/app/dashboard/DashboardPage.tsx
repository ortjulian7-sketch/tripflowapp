import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { IconButton } from '@/components/IconButton'
import { formatDateShort, parseDateOnly } from '@/lib/dates'
import { getCurrency } from '@/lib/currencies'
import { formatMoney } from '@/lib/money'
import { useIdentity } from '@/features/identity/IdentityProvider'
import { useSelectedTrip } from '@/features/trips/useSelectedTrip'
import { useCategories } from '@/features/categories/useCategories'
import { useExpenses } from '@/features/expenses/useExpenses'
import { BudgetSummary } from './BudgetSummary'
import { CategoryBreakdown } from './CategoryBreakdown'
import { EmptyExpenses } from './EmptyExpenses'
import { ExpenseList } from './ExpenseList'
import { HealthMessage } from './HealthMessage'
import { TripSwitcher } from './TripSwitcher'

export function DashboardPage() {
  const { userId } = useIdentity()
  const navigate = useNavigate()
  const { viaje, trips, selectTrip } = useSelectedTrip(userId)
  const categorias = useCategories(userId)
  const gastos = useExpenses(viaje?.id)

  if (viaje === undefined) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-text-secondary">Todavía no creaste ningún viaje.</p>
        <Button onClick={() => navigate('/viajes/nuevo')}>Crear mi primer viaje</Button>
      </div>
    )
  }

  const currency = getCurrency(viaje.moneda)
  const fechaSalida = formatDateShort(parseDateOnly(viaje.fecha_salida))
  const fechaRegreso = viaje.fecha_regreso ? formatDateShort(parseDateOnly(viaje.fecha_regreso)) : null

  return (
    <div className="flex flex-col gap-6">
      <TripSwitcher
        viaje={viaje}
        trips={trips ?? [viaje]}
        onSelect={selectTrip}
        onDeleted={() => selectTrip(null)}
      />

      <Card variant="subtle">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{viaje.nombre}</h1>
            <p className="text-sm text-text-secondary">{viaje.destino}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/viajes/${viaje.id}/editar`)}
            className="text-sm font-semibold text-text-brand"
          >
            Editar
          </button>
        </div>
        <p className="text-sm text-text-secondary">
          {fechaSalida} {fechaRegreso ? `– ${fechaRegreso}` : '– viaje abierto'}
        </p>
        <p className="text-lg font-semibold text-text-brand">
          Presupuesto: {formatMoney(viaje.presupuesto_total, currency)}
        </p>
      </Card>

      <BudgetSummary
        viaje={viaje}
        currency={currency}
        montosGastos={gastos?.map((gasto) => gasto.monto) ?? []}
      />

      <HealthMessage viaje={viaje} montosGastos={gastos?.map((gasto) => gasto.monto) ?? []} currency={currency} />

      {gastos && gastos.length > 0 && (
        <CategoryBreakdown gastos={gastos} categorias={categorias ?? []} currency={currency} />
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-text-secondary">Gastos</h2>
        {gastos && gastos.length > 0 ? (
          <ExpenseList gastos={gastos} categorias={categorias ?? []} currency={currency} />
        ) : (
          <EmptyExpenses />
        )}
      </div>

      <IconButton
        icon="plus"
        label="Nuevo gasto"
        size="large"
        className="fixed bottom-24 right-6 md:bottom-8"
        onClick={() => navigate('/gastos/nuevo')}
      />
    </div>
  )
}
