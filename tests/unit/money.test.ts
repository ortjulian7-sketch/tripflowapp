import { describe, expect, it } from 'vitest'
import { getCurrency } from '@/lib/currencies'
import { formatCompactAmount, formatMoney, parseAmountInput, percentage, sum } from '@/lib/money'

describe('sum', () => {
  it('suma montos enteros sin error de redondeo (SC-008)', () => {
    const amounts = [1075, 2050, 15625]
    expect(sum(amounts)).toBe(18750)
  })

  it('devuelve 0 para una lista vacía', () => {
    expect(sum([])).toBe(0)
  })
})

describe('percentage', () => {
  it('calcula el caso exacto de la spec: 18.750 sobre 45.000 → 42%', () => {
    expect(percentage(18750, 45000)).toBe(42)
  })

  it('calcula el caso exacto de la spec: 800.000 sobre 1.000.000 → 80%', () => {
    expect(percentage(800000, 1000000)).toBe(80)
  })

  it('devuelve 0 cuando el total es 0 (sin división por cero)', () => {
    expect(percentage(100, 0)).toBe(0)
  })
})

describe('parseAmountInput', () => {
  it('convierte un monto con punto decimal a unidad mínima', () => {
    expect(parseAmountInput('150.50', 2)).toBe(15050)
  })

  it('convierte un monto con coma decimal a unidad mínima', () => {
    expect(parseAmountInput('150,50', 2)).toBe(15050)
  })

  it('no admite decimales para monedas de 0 dígitos (p. ej. CLP)', () => {
    expect(parseAmountInput('45000', 0)).toBe(45000)
  })

  it('rechaza montos en 0 o negativos', () => {
    expect(parseAmountInput('0', 2)).toBeNull()
    expect(parseAmountInput('-10', 2)).toBeNull()
  })

  it('rechaza texto vacío o no numérico', () => {
    expect(parseAmountInput('', 2)).toBeNull()
    expect(parseAmountInput('abc', 2)).toBeNull()
  })
})

describe('formatMoney', () => {
  it('formatea con el símbolo del catálogo, nunca hardcodeado, siempre como entero', () => {
    expect(formatMoney(4500000, getCurrency('MXN'))).toBe('$45.000')
  })

  it('formatea monedas sin decimales sin mostrar centavos', () => {
    expect(formatMoney(45000, getCurrency('CLP'))).toBe('$45.000')
  })

  it('usa el símbolo distintivo de cada moneda', () => {
    expect(formatMoney(100000, getCurrency('USD'))).toBe('US$1.000')
    expect(formatMoney(100000, getCurrency('BRL'))).toBe('R$1.000')
  })

  it('redondea al entero más cercano, nunca muestra decimales', () => {
    expect(formatMoney(187550, getCurrency('MXN'))).toBe('$1.876')
  })
})

describe('formatCompactAmount', () => {
  it('no abrevia por debajo de 1000 — siempre entero', () => {
    expect(formatCompactAmount(95000, getCurrency('MXN'))).toBe('$950')
  })

  it('abrevia en miles (K) a partir de 1000, redondeado sin decimales', () => {
    expect(formatCompactAmount(1875000, getCurrency('MXN'))).toBe('$19K')
  })

  it('abrevia en millones (M) a partir de 1.000.000', () => {
    expect(formatCompactAmount(150000000, getCurrency('MXN'))).toBe('$2M')
  })

  it('en monedas sin decimales (p. ej. CLP), funciona igual por debajo de 1000', () => {
    expect(formatCompactAmount(500, getCurrency('CLP'))).toBe('$500')
  })

  it('en monedas sin decimales, abrevia igual en miles', () => {
    expect(formatCompactAmount(45000, getCurrency('CLP'))).toBe('$45K')
  })
})
