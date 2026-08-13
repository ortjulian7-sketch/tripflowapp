import { describe, expect, it } from 'vitest'
import {
  elapsedDays,
  estadoViaje,
  parseDateOnly,
  remainingDays,
  toDateOnlyString,
  totalDays,
} from '@/lib/dates'

const salida = parseDateOnly('2026-08-01')
const regreso = parseDateOnly('2026-08-10')

describe('totalDays', () => {
  it('cuenta ambas puntas inclusive', () => {
    expect(totalDays(salida, regreso)).toBe(10)
  })

  it('un viaje de un solo día cuenta como 1 día, sin división por cero más adelante', () => {
    expect(totalDays(salida, salida)).toBe(1)
  })
})

describe('viaje no comenzado', () => {
  const hoy = parseDateOnly('2026-07-28')

  it('elapsedDays es 0', () => {
    expect(elapsedDays(salida, regreso, hoy)).toBe(0)
  })

  it('remainingDays es el total completo', () => {
    expect(remainingDays(salida, regreso, hoy)).toBe(10)
  })

  it('estadoViaje es no_comenzado', () => {
    expect(estadoViaje(salida, regreso, hoy)).toBe('no_comenzado')
  })
})

describe('viaje en curso', () => {
  const hoy = parseDateOnly('2026-08-05')

  it('elapsedDays cuenta desde la salida hasta hoy, inclusive', () => {
    expect(elapsedDays(salida, regreso, hoy)).toBe(5)
  })

  it('remainingDays es el resto de días hasta el regreso', () => {
    expect(remainingDays(salida, regreso, hoy)).toBe(5)
  })

  it('estadoViaje es en_curso', () => {
    expect(estadoViaje(salida, regreso, hoy)).toBe('en_curso')
  })
})

describe('último día del viaje', () => {
  const hoy = regreso

  it('elapsedDays es igual al total de días', () => {
    expect(elapsedDays(salida, regreso, hoy)).toBe(10)
  })

  it('remainingDays es 0', () => {
    expect(remainingDays(salida, regreso, hoy)).toBe(0)
  })

  it('estadoViaje todavía es en_curso (termina recién al día siguiente)', () => {
    expect(estadoViaje(salida, regreso, hoy)).toBe('en_curso')
  })
})

describe('viaje terminado', () => {
  const hoy = parseDateOnly('2026-08-15')

  it('elapsedDays se topa en el total de días, sin exceder', () => {
    expect(elapsedDays(salida, regreso, hoy)).toBe(10)
  })

  it('remainingDays no baja de 0', () => {
    expect(remainingDays(salida, regreso, hoy)).toBe(0)
  })

  it('estadoViaje es terminado', () => {
    expect(estadoViaje(salida, regreso, hoy)).toBe('terminado')
  })
})

describe('toDateOnlyString / parseDateOnly', () => {
  it('son inversas entre sí', () => {
    expect(toDateOnlyString(parseDateOnly('2026-08-01'))).toBe('2026-08-01')
  })
})
