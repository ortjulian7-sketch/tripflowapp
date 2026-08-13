import { createClient } from '@supabase/supabase-js'
import { env } from './env'

/**
 * Cliente único para auth + Postgres. Solo usa la clave anónima — la clave de
 * rol de servicio nunca vive en código de cliente (Principio V), únicamente
 * como secreto de la Edge Function `delete-account`.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey)
