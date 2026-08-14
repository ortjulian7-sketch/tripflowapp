/** Minúsculas, sin tildes/diacríticos, sin puntuación — comparación de texto estable. */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokenizar(texto: string): string[] {
  const normalizado = normalizarTexto(texto)
  return normalizado === '' ? [] : normalizado.split(' ')
}

/** Variantes de singular/plural ("cervezas" → "cerveza") para no duplicar cada palabra clave en el diccionario. */
export function variantesPlural(palabra: string): string[] {
  const variantes = [palabra]
  if (palabra.length > 4 && palabra.endsWith('es')) variantes.push(palabra.slice(0, -2))
  if (palabra.length > 3 && palabra.endsWith('s')) variantes.push(palabra.slice(0, -1))
  return variantes
}
