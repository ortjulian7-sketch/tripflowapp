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

/** Inserta "." cada tres dígitos desde la derecha (p. ej. "150000" → "150.000"). */
export function groupThousands(integerDigits: string): string {
  return integerDigits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Formatea un monto crudo con coma decimal ("150000,5") para lectura mientras
 * se tipea ("150.000,5") — el punto queda reservado para la agrupación de
 * miles (input del `AmountInput`, evita la ambigüedad "100000" vs "100.000").
 */
export function formatAmountForInput(rawWithComma: string): string {
  const [integerPart, fractionPart] = rawWithComma.split(',')
  const grouped = groupThousands(integerPart ?? '')
  return fractionPart !== undefined ? `${grouped},${fractionPart}` : grouped
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
 *
 * Todo el sistema muestra montos como enteros — nunca centavos — sin importar
 * los `decimalDigits` de la moneda (que siguen existiendo para el ingreso de
 * datos, no para la visualización).
 */
export function formatMoney(minorUnits: number, currency: Currency): string {
  // 'es-AR' agrupa por miles de forma consistente (incluso 4 dígitos) con el
  // separador de punto/coma estándar en español LATAM (a diferencia del
  // locale genérico 'es', que no agrupa números de 4 dígitos).
  const amount = new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: 0,
  }).format(toMajorUnits(minorUnits, currency.decimalDigits))
  return `${currency.symbol}${amount}`
}

/**
 * Monto compacto para etiquetas de espacio reducido (mini-chart de
 * categorías): siempre entero, la parte numérica nunca supera 3 dígitos — a
 * partir de 1000 se abrevia en miles/millones (redondeado, sin decimales).
 */
export function formatCompactAmount(minorUnits: number, currency: Currency): string {
  const major = toMajorUnits(minorUnits, currency.decimalDigits)
  const abs = Math.abs(major)

  if (abs < 1000) {
    const amount = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(major)
    return `${currency.symbol}${amount}`
  }

  const suffix = abs < 1_000_000 ? 'K' : 'M'
  const escala = suffix === 'K' ? 1_000 : 1_000_000
  return `${currency.symbol}${Math.round(major / escala)}${suffix}`
}
