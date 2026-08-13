import { ProgressBar } from '@/components/ProgressBar'
import type { Currency } from '@/lib/currencies'
import { elapsedDays, parseDateOnly, totalDays } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import { calcularTotales } from '@/features/budget-health/totals'
import type { Viaje } from '@/lib/db'

interface BudgetSummaryProps {
  viaje: Viaje
  currency: Currency
  montosGastos: number[]
}

export function BudgetSummary({ viaje, currency, montosGastos }: BudgetSummaryProps) {
  const { gastado, disponible, porcentajeConsumido } = calcularTotales(
    viaje.presupuesto_total,
    montosGastos,
  )
  // Presupuesto excedido de forma inequívoca (FR-038): nunca un número negativo
  // suelto, siempre texto explicativo con tratamiento de error.
  const excedido = disponible <= 0

  const fechaRegreso = viaje.fecha_regreso ? parseDateOnly(viaje.fecha_regreso) : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-text-secondary">Gastado</span>
          <span className="font-semibold text-text-primary">
            {formatMoney(gastado, currency)} · {porcentajeConsumido}%
          </span>
        </div>
        <ProgressBar percent={porcentajeConsumido} variant="warning" />
      </div>

      {excedido ? (
        <p className="rounded-input bg-status-error-subtle px-3 py-2 text-sm font-semibold text-status-error">
          Te pasaste del presupuesto por {formatMoney(Math.abs(disponible), currency)}.
        </p>
      ) : (
        <p className="text-sm text-text-secondary">
          Disponible:{' '}
          <span className="font-semibold text-text-primary">
            {formatMoney(disponible, currency)}
          </span>
        </p>
      )}

      {/* Días restantes solo cuando el viaje tiene fecha de regreso (FR-032, FR-037) */}
      {fechaRegreso &&
        (() => {
          const salida = parseDateOnly(viaje.fecha_salida)
          const total = totalDays(salida, fechaRegreso)
          const transcurridos = elapsedDays(salida, fechaRegreso)
          return (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-text-secondary">Días de viaje</span>
                <span className="text-sm text-text-secondary">
                  {transcurridos} / {total}
                </span>
              </div>
              <ProgressBar percent={(transcurridos / total) * 100} variant="brand" />
            </div>
          )
        })()}
    </div>
  )
}
