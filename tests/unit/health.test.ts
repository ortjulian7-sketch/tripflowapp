import { describe, expect, it } from 'vitest'
import { calcularSalud } from '@/features/budget-health/health'

describe('calcularSalud', () => {
  it('caso exacto de la spec: 45.000/10 días/3 transcurridos/18.750 gastados → "Ojo con el ritmo"', () => {
    const salud = calcularSalud({
      presupuestoTotal: 45000,
      disponible: 45000 - 18750,
      diasTotales: 10,
      diasRestantes: 10 - 3,
    })
    expect(salud.diarioPlaneado).toBe(4500)
    expect(salud.diarioRestante).toBe(3750)
    expect(salud.estado).toBe('ojo_con_el_ritmo')
  })

  it('vas_bien cuando el diario restante iguala o supera el planeado', () => {
    const salud = calcularSalud({
      presupuestoTotal: 45000,
      disponible: 45000 - 9000, // gastó menos de lo planeado para 3 días (13.500)
      diasTotales: 10,
      diasRestantes: 7,
    })
    expect(salud.estado).toBe('vas_bien')
  })

  it('vas_acelerado por debajo del 70% del ritmo planeado', () => {
    const salud = calcularSalud({
      presupuestoTotal: 45000,
      disponible: 45000 - 30000,
      diasTotales: 10,
      diasRestantes: 7,
    })
    // diario restante = 15000/7 ≈ 2142.86; planeado = 4500 → ratio ≈ 0.476 (<0.7)
    expect(salud.estado).toBe('vas_acelerado')
  })

  it('te_pasaste_del_presupuesto cuando el disponible es 0 o negativo', () => {
    const salud = calcularSalud({
      presupuestoTotal: 45000,
      disponible: -500,
      diasTotales: 10,
      diasRestantes: 3,
    })
    expect(salud.estado).toBe('te_pasaste_del_presupuesto')
    expect(salud.diarioRestante).toBeNull()
  })

  it('último día del viaje: sin días restantes pero sin exceder, sin división por cero', () => {
    const salud = calcularSalud({
      presupuestoTotal: 45000,
      disponible: 5000,
      diasTotales: 10,
      diasRestantes: 0,
    })
    expect(salud.estado).toBe('vas_bien')
    expect(salud.diarioRestante).toBeNull()
    expect(Number.isFinite(salud.diarioPlaneado)).toBe(true)
  })

  it('viaje recién comenzado (nada gastado, todos los días restantes) da vas_bien', () => {
    const salud = calcularSalud({
      presupuestoTotal: 45000,
      disponible: 45000,
      diasTotales: 10,
      diasRestantes: 10,
    })
    expect(salud.estado).toBe('vas_bien')
    expect(salud.diarioRestante).toBe(salud.diarioPlaneado)
  })
})

// "Viaje abierto" y "viaje terminado" no son casos de este cálculo puro: la
// spec (FR-037) dice explícitamente que esos viajes no usan una proyección de
// ritmo — HealthMessage.tsx decide no llamar a calcularSalud para esos casos,
// así que se validan ahí (y manualmente vía quickstart.md), no acá.
