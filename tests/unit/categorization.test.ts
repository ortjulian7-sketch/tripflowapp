import { describe, expect, it } from 'vitest'
import type { AsociacionAprendida, Categoria } from '@/lib/db'
import { normalizarTexto, tokenizar } from '@/features/categorization/normalize'
import { sugerirCategoria } from '@/features/categorization/suggest'

function categoria(nombre: string, id = nombre.toLowerCase()): Categoria {
  return {
    id,
    user_id: 'user-1',
    nombre,
    emoji: '📦',
    protegida: nombre === 'Otro',
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-01T00:00:00.000Z',
  }
}

const CATEGORIAS: Categoria[] = [
  categoria('Alojamiento'),
  categoria('Comida'),
  categoria('Transporte'),
  categoria('Actividades'),
  categoria('Compras'),
  categoria('Salud'),
  categoria('Telecom'),
  categoria('Otro'),
]

const CATEGORIAS_CON_LICOR: Categoria[] = [...CATEGORIAS, categoria('Licor')]

function asociacion(termino: string, categoriaId: string): AsociacionAprendida {
  return {
    id: crypto.randomUUID(),
    user_id: 'user-1',
    termino,
    categoria_id: categoriaId,
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-01T00:00:00.000Z',
  }
}

describe('normalizarTexto / tokenizar', () => {
  it('quita mayúsculas, tildes y puntuación', () => {
    expect(normalizarTexto('¡Compré un Café!')).toBe('compre un cafe')
  })

  it('tokeniza por palabras', () => {
    expect(tokenizar('Compré una Hamburguesa')).toEqual(['compre', 'una', 'hamburguesa'])
  })

  it('devuelve una lista vacía para texto vacío', () => {
    expect(tokenizar('   ')).toEqual([])
  })
})

describe('sugerirCategoria', () => {
  it('"compré una hamburguesa" sugiere Comida', () => {
    const sugerida = sugerirCategoria('compré una hamburguesa', CATEGORIAS, [])
    expect(sugerida?.nombre).toBe('Comida')
  })

  it('una descripción no interpretable sugiere Otro', () => {
    const sugerida = sugerirCategoria('xyz asdf qwerty', CATEGORIAS, [])
    expect(sugerida?.nombre).toBe('Otro')
  })

  it('una descripción vacía sugiere Otro', () => {
    const sugerida = sugerirCategoria('', CATEGORIAS, [])
    expect(sugerida?.nombre).toBe('Otro')
  })

  it('una asociación aprendida gana sobre el diccionario base', () => {
    // "pizza" normalmente sugiere Comida por diccionario, pero el usuario ya
    // corrigió este término exacto hacia Compras.
    const asociaciones = [asociacion('pizza vintage', 'compras')]
    const sugerida = sugerirCategoria('pizza vintage', CATEGORIAS, asociaciones)
    expect(sugerida?.nombre).toBe('Compras')
  })

  it('la corrección más reciente prevalece (upsert, no duplicado)', () => {
    // learn.ts hace upsert por (user_id, termino): en cualquier momento solo
    // existe una asociación por término, así que la más reciente es la única.
    const asociaciones = [asociacion('entrada museo', 'salud')]
    const sugerida = sugerirCategoria('entrada museo', CATEGORIAS, asociaciones)
    expect(sugerida?.nombre).toBe('Salud')
  })

  it('"me compre una arepa" sugiere Comida', () => {
    const sugerida = sugerirCategoria('me compre una arepa', CATEGORIAS, [])
    expect(sugerida?.nombre).toBe('Comida')
  })

  it('"me compre una cerveza" sugiere Licor cuando la cuenta ya la tiene creada', () => {
    const sugerida = sugerirCategoria('me compre una cerveza', CATEGORIAS_CON_LICOR, [])
    expect(sugerida?.nombre).toBe('Licor')
  })

  it('"me compre unas cervezas" (plural) también sugiere Licor', () => {
    const sugerida = sugerirCategoria('me compre unas cervezas', CATEGORIAS_CON_LICOR, [])
    expect(sugerida?.nombre).toBe('Licor')
  })

  it('sin categoría "Licor" creada, "cerveza" cae de vuelta a Comida', () => {
    const sugerida = sugerirCategoria('me compre una cerveza', CATEGORIAS, [])
    expect(sugerida?.nombre).toBe('Comida')
  })
})
