/** UUID v4 — mismo formato que `gen_random_uuid()` de Postgres, para que el id generado en el dispositivo coincida con el que persiste Supabase al sincronizar. */
export function newId(): string {
  return crypto.randomUUID()
}
