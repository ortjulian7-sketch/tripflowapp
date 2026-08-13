import type { Currency } from './currencies'

/**
 * Aritmética de dinero en enteros de unidad mínima de la moneda (p. ej. centavos).
 * Nunca se opera con decimales de punto flotante — SC-008 exige que los totales
 * cuadren exactamente en el 100% de los casos.
 */

export function toMajorUnits(minorUnits: number, decimalDigits: number): number {
  return minorUnits / 10 ** decimalDigits
}

/** Convierte lo que la persona tipeó (p. ej. "150,50" o "150.50") a unidad mínima. */
export function parseAmountInput(raw: string, decimalDigits: number): number | null {
  const normalized = raw.trim().replace(',', '.')
  if (normalized === '') return null
  const value = Number(normalized)
  if (!Number.isFinite(value) || value <= 0) return null
  return Math.round(value * 10 ** decimalDigits)
}

/** Vuelve a un string editable en un campo de formulario (sin símbolo, para precargar al editar). */
export function toEditableAmountString(minorUnits: number, decimalDigits: number): string {
  return toMajorUnits(minorUnits, decimalDigits).toFixed(decimalDigits)
}

export function sum(amounts: number[]): number {
  return amounts.reduce((total, amount) => total + amount, 0)
}

/** Porcentaje de `part` sobre `total`, redondeado al entero más cercano. */
export function percentage(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part * 100) / total)
}

/**
 * El símbolo viene siempre del catálogo de `currencies.ts` (`Currency.symbol`),
 * nunca hardcodeado — Input/Design System Do's & Don'ts.
 */
export function formatMoney(minorUnits: number, currency: Currency): string {
  // 'es-AR' agrupa por miles de forma consistente (incluso 4 dígitos) con el
  // separador de punto/coma estándar en español LATAM (a diferencia del
  // locale genérico 'es', que no agrupa números de 4 dígitos).
  const amount = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: currency.decimalDigits,
    maximumFractionDigits: currency.decimalDigits,
  }).format(toMajorUnits(minorUnits, currency.decimalDigits))
  return `${currency.symbol}${amount}`
}
