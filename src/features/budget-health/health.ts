export type EstadoSalud = 'vas_bien' | 'ojo_con_el_ritmo' | 'vas_acelerado' | 'te_pasaste_del_presupuesto'

export interface SaludPresupuesto {
  diarioPlaneado: number
  /** null cuando no hay días restantes sobre los cuales repartir el disponible (último día, o ya excedido). */
  diarioRestante: number | null
  estado: EstadoSalud
}

/** Debajo del 70% del ritmo planeado es "Vas acelerado" (FR-033 a FR-035). */
const UMBRAL_RITMO = 0.7

interface CalcularSaludParams {
  presupuestoTotal: number
  disponible: number
  diasTotales: number
  diasRestantes: number
}

/**
 * Cálculo puro de salud del presupuesto. Solo tiene sentido para un viaje
 * cerrado (con fecha de regreso) ya comenzado — decidir si corresponde
 * llamarlo es responsabilidad de quien lo consume (HealthMessage.tsx, según
 * FR-037: viajes abiertos, no comenzados o terminados no usan este cálculo).
 */
export function calcularSalud({
  presupuestoTotal,
  disponible,
  diasTotales,
  diasRestantes,
}: CalcularSaludParams): SaludPresupuesto {
  const diarioPlaneado = diasTotales > 0 ? presupuestoTotal / diasTotales : 0

  if (disponible <= 0) {
    return { diarioPlaneado, diarioRestante: null, estado: 'te_pasaste_del_presupuesto' }
  }

  if (diasRestantes <= 0) {
    // Último día: no quedan días para repartir el disponible, pero como no
    // se excedió el presupuesto, el resultado es positivo — sin división por cero.
    return { diarioPlaneado, diarioRestante: null, estado: 'vas_bien' }
  }

  const diarioRestante = disponible / diasRestantes
  const ratio = diarioPlaneado > 0 ? diarioRestante / diarioPlaneado : 1

  let estado: EstadoSalud
  if (ratio >= 1) estado = 'vas_bien'
  else if (ratio >= UMBRAL_RITMO) estado = 'ojo_con_el_ritmo'
  else estado = 'vas_acelerado'

  return { diarioPlaneado, diarioRestante, estado }
}
