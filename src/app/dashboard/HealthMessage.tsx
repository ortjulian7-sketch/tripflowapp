import { Icon } from '@/components/Icon'
import type { Viaje } from '@/lib/db'
import type { Currency } from '@/lib/currencies'
import { estadoViaje, parseDateOnly, remainingDays, totalDays } from '@/lib/dates'
import { formatMoney } from '@/lib/money'
import { calcularSalud, type EstadoSalud } from '@/features/budget-health/health'
import { calcularTotales } from '@/features/budget-health/totals'

const TITULOS: Record<EstadoSalud, string> = {
  vas_bien: 'Vas bien por ahora',
  ojo_con_el_ritmo: 'Ojo con el ritmo',
  vas_acelerado: 'Vas acelerado',
  te_pasaste_del_presupuesto: 'Te pasaste del presupuesto',
}

const MENSAJES: Record<EstadoSalud, (monto: string) => string> = {
  vas_bien: (monto) => `Te alcanzan ${monto} por día para sostener el presupuesto.`,
  ojo_con_el_ritmo: (monto) => `Te quedan ${monto} por día si querés sostenerlo.`,
  vas_acelerado: (monto) => `Solo te quedan ${monto} por día — bajá el ritmo.`,
  te_pasaste_del_presupuesto: () => 'Ajustá el resto del viaje para compensarlo.',
}

// Los dos estados intermedios comparten tono — se distinguen por texto, no por color (FR-036).
type Tono = 'brand' | 'warning' | 'error'

const TONO_SALUD: Record<EstadoSalud, Tono> = {
  vas_bien: 'brand',
  ojo_con_el_ritmo: 'warning',
  vas_acelerado: 'warning',
  te_pasaste_del_presupuesto: 'error',
}

const TITLE_CLASSES: Record<Tono, string> = {
  brand: 'text-text-brand',
  warning: 'text-status-warning-strong',
  error: 'text-status-error',
}

const ICON_CLASSES: Record<Tono, string> = {
  brand: 'text-icon-brand',
  warning: 'text-status-warning-strong',
  error: 'text-status-error',
}

interface HealthMessageProps {
  viaje: Viaje
  montosGastos: number[]
  currency: Currency
}

/**
 * Callout "AIInsight" (Figma node 204:1525): ícono sparkle + título corto +
 * detalle, siempre sobre superficie tintada — mismo contenedor para los tres
 * casos especiales de FR-037 (viaje abierto, no comenzado, terminado) y el
 * mensaje de salud canónico (viaje en curso).
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

  // Antes de salir, sin gastos registrados todavía, no hay nada que evaluar:
  // se muestra el plan (FR-037). Pero si ya hay gastos anticipados (vuelos,
  // reservas), el disponible ya cambió y amerita el mismo tratamiento de
  // ritmo que un viaje en curso — si no, esta tarjeta queda "congelada" en el
  // plan mientras el resto del resumen (gastado, disponible) sí se actualiza.
  if (estado === 'no_comenzado' && disponible >= viaje.presupuesto_total) {
    return (
      <InsightCard
        tono="brand"
        title="Antes de salir"
        body={`Planeás gastar ${formatMoney(Math.round(diarioPlaneado), currency)} por día.`}
      />
    )
  }

  if (estado === 'terminado') {
    const excedido = disponible <= 0
    return (
      <InsightCard
        tono={excedido ? 'error' : 'brand'}
        title={excedido ? 'Te pasaste del presupuesto' : 'Viaje terminado'}
        body={
          excedido
            ? `Fue por ${formatMoney(Math.abs(disponible), currency)}.`
            : 'Terminaste el viaje gastando dentro del presupuesto.'
        }
      />
    )
  }

  const salud = calcularSalud({
    presupuestoTotal: viaje.presupuesto_total,
    disponible,
    diasTotales,
    diasRestantes: remainingDays(salida, regreso),
  })

  const monto = formatMoney(Math.round(salud.diarioRestante ?? salud.diarioPlaneado), currency)

  return (
    <InsightCard
      tono={TONO_SALUD[salud.estado]}
      title={TITULOS[salud.estado]}
      body={MENSAJES[salud.estado](monto)}
    />
  )
}

function InsightCard({ tono, title, body }: { tono: Tono; title: string; body: string }) {
  return (
    <div className="flex gap-2.5 rounded-card border border-[rgba(5,0,254,0.09)] bg-surface-secondary p-card-padding dark:border-[rgba(165,168,255,0.09)]">
      <Icon name="sparkle" size={14} className={`mt-0.5 shrink-0 ${ICON_CLASSES[tono]}`} />
      <div className="flex flex-col gap-0.5">
        <p className={`font-brand text-[15px] font-semibold ${TITLE_CLASSES[tono]}`}>{title}</p>
        <p className="text-sm text-text-primary">{body}</p>
      </div>
    </div>
  )
}
