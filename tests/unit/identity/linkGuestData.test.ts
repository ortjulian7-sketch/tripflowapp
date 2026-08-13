import { describe, expect, it } from 'vitest'
import type { Categoria } from '@/lib/db'
import { calcularMapeoCategorias } from '@/features/identity/linkGuestData'

function categoria(nombre: string, id = nombre.toLowerCase()): Categoria {
  return {
    id,
    user_id: 'invitado-1',
    nombre,
    emoji: '📦',
    protegida: nombre === 'Otro',
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-01T00:00:00.000Z',
  }
}

describe('calcularMapeoCategorias', () => {
  it('remapea una categoría local cuyo nombre coincide con una remota, sin crear duplicado', () => {
    const locales = [categoria('Comida')]
    const remotas = new Map([['comida', 'remoto-comida']])

    const { remapeadas, nuevas } = calcularMapeoCategorias(locales, remotas)

    expect(remapeadas.get('comida')).toBe('remoto-comida')
    expect(nuevas).toHaveLength(0)
  })

  it('la coincidencia ignora mayúsculas y tildes (mismo criterio que normalizarTexto)', () => {
    const locales = [categoria('Alimentación', 'alimentacion')]
    const remotas = new Map([['alimentacion', 'remoto-alimentacion']])

    const { remapeadas } = calcularMapeoCategorias(locales, remotas)

    expect(remapeadas.get('alimentacion')).toBe('remoto-alimentacion')
  })

  it('una categoría sin coincidencia se reasigna como nueva, sin remapear', () => {
    const locales = [categoria('Mascotas')]
    const remotas = new Map([['comida', 'remoto-comida']])

    const { remapeadas, nuevas } = calcularMapeoCategorias(locales, remotas)

    expect(remapeadas.size).toBe(0)
    expect(nuevas).toEqual([categoria('Mascotas')])
  })

  it('con categorías remotas vacías (cuenta recién registrada) todas quedan como nuevas', () => {
    const locales = [categoria('Comida'), categoria('Transporte')]

    const { remapeadas, nuevas } = calcularMapeoCategorias(locales, new Map())

    expect(remapeadas.size).toBe(0)
    expect(nuevas).toHaveLength(2)
  })

  it('procesa un conjunto mixto: algunas remapean, otras son nuevas', () => {
    const locales = [categoria('Comida'), categoria('Mascotas'), categoria('Transporte')]
    const remotas = new Map([
      ['comida', 'remoto-comida'],
      ['transporte', 'remoto-transporte'],
    ])

    const { remapeadas, nuevas } = calcularMapeoCategorias(locales, remotas)

    expect(remapeadas.get('comida')).toBe('remoto-comida')
    expect(remapeadas.get('transporte')).toBe('remoto-transporte')
    expect(nuevas.map((c) => c.id)).toEqual(['mascotas'])
  })
})
