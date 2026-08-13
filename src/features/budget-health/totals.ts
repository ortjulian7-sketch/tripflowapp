import { percentage, sum } from '@/lib/money'

export interface Totales {
  gastado: number
  disponible: number
  porcentajeConsumido: number
}

/** Cálculo puro sobre enteros de unidad mínima — nunca decimales (SC-008). */
export function calcularTotales(presupuestoTotal: number, montosGastos: number[]): Totales {
  const gastado = sum(montosGastos)
  const disponible = presupuestoTotal - gastado
  const porcentajeConsumido = percentage(gastado, presupuestoTotal)
  return { gastado, disponible, porcentajeConsumido }
}
