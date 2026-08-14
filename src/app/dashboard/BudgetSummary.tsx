import { ProgressBar } from '@/components/ProgressBar'
import type { Currency } from '@/lib/currencies'
import { parseDateOnly, remainingDays, totalDays } from '@/lib/dates'
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

  const salida = parseDateOnly(viaje.fecha_salida)
  const fechaRegreso = viaje.fecha_regreso ? parseDateOnly(viaje.fecha_regreso) : null
  const diasTotales = fechaRegreso ? totalDays(salida, fechaRegreso) : null
  const diasRestantes = fechaRegreso ? remainingDays(salida, fechaRegreso) : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[52px] font-semibold leading-[52px] tracking-[-1.04px] text-text-primary">
          {formatMoney(gastado, currency)}{' '}
          <span className="text-sm font-normal text-text-secondary">{currency.code}</span>
        </p>
        <p className="pt-1.5 text-[15px] text-text-secondary">
          {porcentajeConsumido}% del presupuesto gastado
        </p>
      </div>

      <ProgressBar percent={porcentajeConsumido} variant={excedido ? 'error' : 'warning'} />

      <div className="flex gap-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Disponible</span>
          <span
            className={`text-lg font-semibold ${excedido ? 'text-status-error' : 'text-status-warning-strong'}`}
          >
            {formatMoney(disponible, currency)}
          </span>
        </div>

        {/* Días restantes solo cuando el viaje tiene fecha de regreso (FR-032, FR-037) */}
        {diasTotales !== null && diasRestantes !== null && (
          <>
            <div className="w-px shrink-0 bg-black/[0.06] dark:bg-white/[0.06]" />
            <div className="flex flex-col gap-1">
              <span className="text-xs text-text-secondary">Días restantes</span>
              <span className="text-lg font-semibold text-text-primary">
                {diasRestantes} <span className="text-sm font-normal text-text-secondary">de {diasTotales}</span>
              </span>
            </div>
          </>
        )}
      </div>

      {excedido && (
        <p className="rounded-input bg-status-error-subtle px-3 py-2 text-sm font-semibold text-status-error">
          Te pasaste del presupuesto por {formatMoney(Math.abs(disponible), currency)}.
        </p>
      )}
    </div>
  )
}
