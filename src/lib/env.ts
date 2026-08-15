function requireEnv(key: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${key}. Copia .env.example a .env.local y complétalo.`,
    )
  }
  return value
}

export const env = {
  supabaseUrl: requireEnv('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
  supabaseAnonKey: requireEnv(
    'VITE_SUPABASE_ANON_KEY',
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  ),
}
