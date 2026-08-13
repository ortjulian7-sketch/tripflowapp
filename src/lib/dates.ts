/**
 * Utilidades de fecha calendario. Todo `Date` se normaliza a medianoche local
 * (sin hora) — el dominio solo necesita aritmética de días de calendario, no
 * husos horarios ni recurrencias (research.md §8).
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function today(): Date {
  return atMidnight(new Date())
}

export function parseDateOnly(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toDateOnlyString(date: Date): string {
  const d = atMidnight(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function diffInDays(from: Date, to: Date): number {
  return Math.round((atMidnight(to).getTime() - atMidnight(from).getTime()) / MS_PER_DAY)
}

/** Días totales del viaje, inclusive en ambas puntas (salida y regreso cuentan). */
export function totalDays(fechaSalida: Date, fechaRegreso: Date): number {
  return diffInDays(fechaSalida, fechaRegreso) + 1
}

/**
 * Días transcurridos hasta hoy, inclusive, topados entre 0 (viaje no
 * comenzado) y el total de días del viaje (viaje terminado).
 */
export function elapsedDays(fechaSalida: Date, fechaRegreso: Date, hoy: Date = today()): number {
  const elapsed = diffInDays(fechaSalida, hoy) + 1
  return Math.max(0, Math.min(elapsed, totalDays(fechaSalida, fechaRegreso)))
}

/** Días restantes desde hoy hasta el regreso, inclusive; nunca negativo. */
export function remainingDays(fechaSalida: Date, fechaRegreso: Date, hoy: Date = today()): number {
  return totalDays(fechaSalida, fechaRegreso) - elapsedDays(fechaSalida, fechaRegreso, hoy)
}

export type EstadoViaje = 'no_comenzado' | 'en_curso' | 'terminado'

export function estadoViaje(
  fechaSalida: Date,
  fechaRegreso: Date | null,
  hoy: Date = today(),
): EstadoViaje {
  if (atMidnight(hoy) < atMidnight(fechaSalida)) return 'no_comenzado'
  if (fechaRegreso && atMidnight(hoy) > atMidnight(fechaRegreso)) return 'terminado'
  return 'en_curso'
}

/** Clave de agrupación estable para "gastos por día" (orden lexicográfico = orden cronológico). */
export function dayGroupKey(date: Date): string {
  return toDateOnlyString(date)
}

const FORMATO_FECHA_CORTA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' })

/** Fecha legible en español LATAM (p. ej. "3 sep") para mostrar en la interfaz. */
export function formatDateShort(date: Date): string {
  return FORMATO_FECHA_CORTA.format(date)
}
