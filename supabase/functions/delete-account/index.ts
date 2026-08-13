// Supabase Edge Function (Deno). Única pieza server-side de Tripflow v0 —
// ver contracts/delete-account-function.md para el contrato completo.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Cliente con la sesión de quien llama: solo para validar el JWT y
    // obtener su user_id — nunca acepta un user_id como parámetro, así nadie
    // puede borrar la cuenta de otra persona.
    const clienteSesion = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: userError,
    } = await clienteSesion.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 })
    }

    // Cliente con rol de servicio: única forma de borrar el usuario de
    // auth.users. Esta clave vive solo como secreto de este proyecto de
    // Supabase, nunca en el repositorio (Principio V).
    const clienteAdmin = createClient(supabaseUrl, serviceRoleKey)

    // Orden: viajes (cascada borra gastos), asociaciones aprendidas, categorías.
    const { error: viajesError } = await clienteAdmin.from('viajes').delete().eq('user_id', user.id)
    if (viajesError) throw viajesError

    const { error: asociacionesError } = await clienteAdmin
      .from('asociaciones_aprendidas')
      .delete()
      .eq('user_id', user.id)
    if (asociacionesError) throw asociacionesError

    const { error: categoriasError } = await clienteAdmin
      .from('categorias')
      .delete()
      .eq('user_id', user.id)
    if (categoriasError) throw categoriasError

    const { error: deleteUserError } = await clienteAdmin.auth.admin.deleteUser(user.id)
    if (deleteUserError) throw deleteUserError

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (_error) {
    // No se borra el usuario de auth si el borrado de datos falló antes,
    // para no dejar una cuenta sin datos pero sin poder reintentar (ver contrato).
    return new Response(JSON.stringify({ error: 'No pudimos eliminar la cuenta.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
