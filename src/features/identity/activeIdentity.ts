import { newId } from '@/lib/id'

const STORAGE_KEY = 'tripflow_active_identity'

/** Identidad local del dispositivo (data-model.md § Identidad activa): se crea una sola vez y persiste entre sesiones sin cuenta. */
export function getOrCreateActiveIdentity(): string {
  const existente = localStorage.getItem(STORAGE_KEY)
  if (existente) return existente

  const nueva = newId()
  localStorage.setItem(STORAGE_KEY, nueva)
  return nueva
}

export function setActiveIdentity(id: string): void {
  localStorage.setItem(STORAGE_KEY, id)
}

/** Lee la identidad de invitado sin crearla (contracts/entrada-gate-contract.md): nunca escribe `localStorage`. */
export function peekActiveIdentity(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}
