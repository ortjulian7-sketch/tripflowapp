/**
 * Catálogo acotado de monedas (LATAM + USD + EUR) según plan.md — no es una
 * lista exhaustiva de ISO 4217, solo las monedas relevantes para viajes desde
 * o dentro de LATAM.
 */

export interface Currency {
  code: string
  name: string
  symbol: string
  decimalDigits: number
}

export const CURRENCIES: Currency[] = [
  { code: 'ARS', name: 'Peso argentino', symbol: '$', decimalDigits: 2 },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs', decimalDigits: 2 },
  { code: 'BRL', name: 'Real brasileño', symbol: 'R$', decimalDigits: 2 },
  { code: 'CLP', name: 'Peso chileno', symbol: '$', decimalDigits: 0 },
  { code: 'COP', name: 'Peso colombiano', symbol: '$', decimalDigits: 2 },
  { code: 'CRC', name: 'Colón costarricense', symbol: '₡', decimalDigits: 2 },
  { code: 'DOP', name: 'Peso dominicano', symbol: 'RD$', decimalDigits: 2 },
  { code: 'GTQ', name: 'Quetzal guatemalteco', symbol: 'Q', decimalDigits: 2 },
  { code: 'HNL', name: 'Lempira hondureño', symbol: 'L', decimalDigits: 2 },
  { code: 'MXN', name: 'Peso mexicano', symbol: '$', decimalDigits: 2 },
  { code: 'NIO', name: 'Córdoba nicaragüense', symbol: 'C$', decimalDigits: 2 },
  { code: 'PAB', name: 'Balboa panameño', symbol: 'B/.', decimalDigits: 2 },
  { code: 'PEN', name: 'Sol peruano', symbol: 'S/', decimalDigits: 2 },
  { code: 'PYG', name: 'Guaraní paraguayo', symbol: '₲', decimalDigits: 0 },
  { code: 'UYU', name: 'Peso uruguayo', symbol: '$U', decimalDigits: 2 },
  { code: 'VES', name: 'Bolívar venezolano', symbol: 'Bs.S', decimalDigits: 2 },
  { code: 'USD', name: 'Dólar estadounidense', symbol: 'US$', decimalDigits: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimalDigits: 2 },
]

const BY_CODE = new Map(CURRENCIES.map((currency) => [currency.code, currency]))

export function getCurrency(code: string): Currency {
  const currency = BY_CODE.get(code)
  if (!currency) {
    throw new Error(`Moneda desconocida: ${code}`)
  }
  return currency
}
