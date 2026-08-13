import type { AsociacionAprendida, Categoria } from '@/lib/db'
import { DICCIONARIO_BASE } from './dictionary'
import { normalizarTexto, tokenizar } from './normalize'

function buscarPorNombre(categorias: Categoria[], nombre: string): Categoria | null {
  return categorias.find((categoria) => categoria.nombre === nombre) ?? null
}

/**
 * Precedencia (FR-021, FR-023): asociaciones aprendidas → diccionario base →
 * "Otro". Todo resuelto en el dispositivo, sin conexión ni servicio externo.
 */
export function sugerirCategoria(
  descripcion: string,
  categorias: Categoria[],
  asociaciones: AsociacionAprendida[],
): Categoria | null {
  const otro = buscarPorNombre(categorias, 'Otro')
  const termino = normalizarTexto(descripcion)
  if (!termino) return otro

  const asociacion = asociaciones.find((item) => item.termino === termino)
  if (asociacion) {
    const categoria = categorias.find((item) => item.id === asociacion.categoria_id)
    if (categoria) return categoria
  }

  const tokens = tokenizar(descripcion)
  for (const [nombreCategoria, palabrasClave] of Object.entries(DICCIONARIO_BASE)) {
    if (tokens.some((token) => palabrasClave.includes(token))) {
      const categoria = buscarPorNombre(categorias, nombreCategoria)
      if (categoria) return categoria
    }
  }

  return otro
}
