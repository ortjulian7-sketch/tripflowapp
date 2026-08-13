import { describe, expect, it } from 'vitest'
import { calcularTotales } from '@/features/budget-health/totals'

describe('calcularTotales', () => {
  it('caso exacto de la spec: presupuesto 45.000, gastos 18.750 → 42% y 26.250 disponible', () => {
    const totales = calcularTotales(45000, [18750])
    expect(totales.gastado).toBe(18750)
    expect(totales.porcentajeConsumido).toBe(42)
    expect(totales.disponible).toBe(26250)
  })

  it('caso exacto de la spec: presupuesto 1.000.000, gastos 800.000 → 80%', () => {
    const totales = calcularTotales(1000000, [800000])
    expect(totales.porcentajeConsumido).toBe(80)
    expect(totales.disponible).toBe(200000)
  })

  it('suma varios gastos parciales sin error de redondeo (SC-008)', () => {
    const montos = [1075, 2050, 15625]
    const totales = calcularTotales(45000, montos)
    expect(totales.gastado).toBe(18750)
    expect(totales.gastado + totales.disponible).toBe(45000)
  })

  it('disponible puede ser 0 o negativo cuando se excede el presupuesto', () => {
    const totales = calcularTotales(10000, [12000])
    expect(totales.disponible).toBe(-2000)
    expect(totales.porcentajeConsumido).toBe(120)
  })

  it('sin gastos, el disponible es el presupuesto completo', () => {
    const totales = calcularTotales(45000, [])
    expect(totales.gastado).toBe(0)
    expect(totales.disponible).toBe(45000)
    expect(totales.porcentajeConsumido).toBe(0)
  })
})
