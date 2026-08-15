import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
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
import { EmptyTrips } from './EmptyTrips'
import { ExpenseList } from './ExpenseList'
import { HealthMessage } from './HealthMessage'
import { SearchSpotlight } from './SearchSpotlight'
import { TripSwitcher } from './TripSwitcher'

export function DashboardPage() {
  const { userId } = useIdentity()
  const navigate = useNavigate()
  const { viaje, trips, selectTrip } = useSelectedTrip(userId!)
  const categorias = useCategories(userId!)
  const gastos = useExpenses(viaje?.id)
  const [buscando, setBuscando] = useState(false)

  if (viaje === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <EmptyTrips />
      </div>
    )
  }

  const currency = getCurrency(viaje.moneda)
  const fechaSalida = formatDateShort(parseDateOnly(viaje.fecha_salida))
  const fechaRegreso = viaje.fecha_regreso ? formatDateShort(parseDateOnly(viaje.fecha_regreso)) : null

  return (
    <div className="flex flex-col">
      {/* Cabecera de la pantalla: identidad del viaje + acciones rápidas de
          búsqueda y registro (Figma node 204:1457 / 205:1932). En escritorio
          las acciones viven acá; en móvil quedan flotando sobre el contenido. */}
      <div className="-mx-4 flex items-center justify-between gap-3 border-b border-black/[0.06] px-4 pb-4 md:sticky md:-mx-8 md:top-0 md:z-10 md:bg-surface-background/[0.92] md:px-8 md:backdrop-blur dark:border-white/[0.06]">
        <TripSwitcher
          viaje={viaje}
          trips={trips ?? [viaje]}
          onSelect={selectTrip}
          onDeleted={() => selectTrip(null)}
        />
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={() => setBuscando(true)}
            className="flex h-10 w-72 shrink-0 items-center gap-2 rounded-input bg-surface-elevated px-3 text-left text-sm text-text-placeholder shadow-sm transition-colors hover:text-text-secondary lg:w-96"
          >
            <Icon name="search" size={18} className="shrink-0 text-icon-secondary" />
            Buscar gastos, categorías...
          </button>
          <Button icon="plus" onClick={() => navigate('/gastos/nuevo')}>
            Registrar gasto
          </Button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[660px] flex-col gap-8 pb-28 pt-8 md:pb-8">
        <BudgetSummary
          viaje={viaje}
          currency={currency}
          montosGastos={gastos?.map((gasto) => gasto.monto) ?? []}
        />

        <div className="flex items-center justify-between gap-2 text-xs text-text-secondary">
          <span className="truncate">
            {fechaSalida} {fechaRegreso ? `– ${fechaRegreso}` : '– viaje abierto'} · Presupuesto:{' '}
            {formatMoney(viaje.presupuesto_total, currency)}
          </span>
          <button
            type="button"
            onClick={() => navigate(`/viajes/${viaje.id}/editar`)}
            className="shrink-0 font-semibold text-text-brand transition-opacity hover:opacity-80"
          >
            Editar viaje
          </button>
        </div>

        <HealthMessage
          viaje={viaje}
          montosGastos={gastos?.map((gasto) => gasto.monto) ?? []}
          currency={currency}
        />

        {gastos && gastos.length > 0 && (
          <CategoryBreakdown gastos={gastos} categorias={categorias ?? []} currency={currency} />
        )}

        <div>
          <h2 className="mb-2 text-xs font-semibold text-text-secondary">Gastos</h2>
          {gastos && gastos.length > 0 ? (
            <ExpenseList gastos={gastos} categorias={categorias ?? []} currency={currency} />
          ) : (
            <EmptyExpenses />
          )}
        </div>
      </div>

      {/* Acciones flotantes de móvil (Figma node 205:1898 / 205:1902): en
          escritorio ya viven en la cabecera de arriba. */}
      <IconButton
        icon="search"
        label="Buscar gastos"
        variant="secondary"
        className="fixed bottom-24 left-4 md:hidden"
        onClick={() => setBuscando(true)}
      />
      <IconButton
        icon="plus"
        label="Registrar gasto"
        size="large"
        className="fixed bottom-20 right-4 md:hidden"
        onClick={() => navigate('/gastos/nuevo')}
      />

      <SearchSpotlight
        open={buscando}
        onClose={() => setBuscando(false)}
        gastos={gastos ?? []}
        categorias={categorias ?? []}
        currency={currency}
      />
    </div>
  )
}
