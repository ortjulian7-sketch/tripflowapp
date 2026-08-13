# Contract: Función `delete-account`

Única pieza de lógica server-side de todo Tripflow v0. Implementa FR-055/FR-056. Vive como una
Supabase Edge Function, invocada por el SDK de cliente (`supabase.functions.invoke`), nunca
llamada directo por HTTP público sin sesión.

## Por qué existe (justificación de la única infraestructura de servidor de v0)

Borrar los datos de una cuenta puede hacerse desde el cliente respetando RLS. Pero borrar el
propio usuario de autenticación (para que el login deje de existir, tal como exige FR-056)
requiere el rol de servicio de Supabase, una clave que jamás puede vivir en código de cliente
(Principio V). Esta función es el único lugar del sistema donde esa clave existe, guardada como
secreto del proyecto de Supabase — nunca en este repositorio.

## Request

- **Invocación**: `supabase.functions.invoke('delete-account')`, autenticado con la sesión de
  la persona (el JWT identifica de forma inequívoca qué cuenta se borra; la función nunca acepta
  un `user_id` como parámetro, para que nadie pueda borrar la cuenta de otra persona).
- **Body**: vacío. La confirmación explícita ("esta acción es permanente e irreversible") ya
  ocurrió en la interfaz antes de invocar la función (FR-055).

## Comportamiento

1. Verifica el JWT de la sesión y extrae el `user_id`.
2. Borra, en este orden, todo lo que pertenece a ese `user_id`: Gastos (vía cascada de Viajes),
   Viajes, Asociaciones aprendidas, Categorías.
3. Borra el usuario de `auth.users` con el cliente de rol de servicio.
4. Responde éxito.

## Response

- **200**: cuenta y todos sus datos eliminados de forma permanente.
- **401**: sin sesión válida — no se borra nada.
- **500**: error durante el borrado — no se borra el usuario de auth si el borrado de datos
  falló antes (para no dejar una cuenta sin datos pero sin poder volver a intentarlo con datos
  huérfanos).

## Después de la respuesta exitosa

El cliente limpia inmediatamente todo IndexedDB local y cierra la sesión — no queda ningún dato
de la cuenta en el dispositivo (consistente con FR-056: "tanto en el dispositivo como en la
copia sincronizada").
