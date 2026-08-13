import { ProgressBar } from '@/components/ProgressBar'
import type { Viaje } from '@/lib/db'
import type { Currency } from '@/lib/currencies'
import { estadoViaje, parseDateOnly, remainingDays, totalDays } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import { calcularSalud, type EstadoSalud } from '@/features/budget-health/health'
import { calcularTotales } from '@/features/budget-health/totals'

const MENSAJES: Record<EstadoSalud, (monto: string) => string> = {
  vas_bien: (monto) => `Vas bien: te alcanzan ${monto} por día para sostener el presupuesto.`,
  ojo_con_el_ritmo: (monto) => `Ojo con el ritmo: te quedan ${monto} por día si querés sostenerlo.`,
  vas_acelerado: (monto) => `Vas acelerado: solo te quedan ${monto} por día — bajá el ritmo.`,
  te_pasaste_del_presupuesto: () => 'Te pasaste del presupuesto de este viaje.',
}

const VARIANTE_BARRA: Record<EstadoSalud, 'success' | 'warning' | 'error'> = {
  vas_bien: 'success',
  ojo_con_el_ritmo: 'warning',
  vas_acelerado: 'warning',
  te_pasaste_del_presupuesto: 'error',
}

// Los dos estados intermedios comparten color — se distinguen por texto, no por color (FR-036).
const COLOR_TEXTO: Record<EstadoSalud, string> = {
  vas_bien: 'text-status-success',
  ojo_con_el_ritmo: 'text-status-warning',
  vas_acelerado: 'text-status-warning',
  te_pasaste_del_presupuesto: 'text-status-error',
}

interface HealthMessageProps {
  viaje: Viaje
  montosGastos: number[]
  currency: Currency
}

/**
 * Decide entre los tres casos especiales de FR-037 (viaje abierto, no
 * comenzado, terminado) y el mensaje de salud canónico (viaje cerrado en
 * curso), reutilizando siempre el mismo cálculo puro de health.ts.
 */
export function HealthMessage({ viaje, montosGastos, currency }: HealthMessageProps) {
  if (!viaje.fecha_regreso) {
    // Viaje abierto: sin fecha de regreso no hay días restantes que proyectar (FR-037).
    return null
  }

  const salida = parseDateOnly(viaje.fecha_salida)
  const regreso = parseDateOnly(viaje.fecha_regreso)
  const estado = estadoViaje(salida, regreso)
  const diasTotales = totalDays(salida, regreso)
  const diarioPlaneado = diasTotales > 0 ? viaje.presupuesto_total / diasTotales : 0
  const { disponible } = calcularTotales(viaje.presupuesto_total, montosGastos)

  if (estado === 'no_comenzado') {
    return (
      <p className="text-sm text-text-secondary">
        Planeás gastar {formatMoney(Math.round(diarioPlaneado), currency)} por día.
      </p>
    )
  }

  if (estado === 'terminado') {
    const estadoFinal: EstadoSalud = disponible <= 0 ? 'te_pasaste_del_presupuesto' : 'vas_bien'
    const mensaje =
      estadoFinal === 'te_pasaste_del_presupuesto'
        ? `Te pasaste del presupuesto por ${formatMoney(Math.abs(disponible), currency)}.`
        : 'Terminaste el viaje gastando dentro del presupuesto.'
    return <p className={`text-sm font-semibold ${COLOR_TEXTO[estadoFinal]}`}>{mensaje}</p>
  }

  const salud = calcularSalud({
    presupuestoTotal: viaje.presupuesto_total,
    disponible,
    diasTotales,
    diasRestantes: remainingDays(salida, regreso),
  })

  const monto = formatMoney(Math.round(salud.diarioRestante ?? salud.diarioPlaneado), currency)
  const ratio =
    salud.diarioRestante !== null && salud.diarioPlaneado > 0
      ? (salud.diarioRestante / salud.diarioPlaneado) * 100
      : salud.estado === 'te_pasaste_del_presupuesto'
        ? 0
        : 100

  return (
    <div className="flex flex-col gap-1.5">
      <p className={`text-sm font-semibold ${COLOR_TEXTO[salud.estado]}`}>
        {MENSAJES[salud.estado](monto)}
      </p>
      <ProgressBar percent={ratio} variant={VARIANTE_BARRA[salud.estado]} />
    </div>
  )
}
