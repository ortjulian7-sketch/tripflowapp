export type Theme = 'light' | 'dark'

/** Debe coincidir con la clave leída por el script inline de index.html. */
export const THEME_STORAGE_KEY = 'tripflow_theme'

function esTemaValido(valor: string | null): valor is Theme {
  return valor === 'light' || valor === 'dark'
}

export function leerTemaAlmacenado(): Theme | null {
  const almacenado = localStorage.getItem(THEME_STORAGE_KEY)
  return esTemaValido(almacenado) ? almacenado : null
}

function preferenciaDelSistema(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Igual que el script inline de index.html: preferencia guardada o, a falta de una, la del sistema. */
export function resolverTemaInicial(): Theme {
  return leerTemaAlmacenado() ?? preferenciaDelSistema()
}

export function aplicarTema(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}
