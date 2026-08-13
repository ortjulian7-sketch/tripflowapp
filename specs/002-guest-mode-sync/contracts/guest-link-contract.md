# Contract: Vinculación de datos locales a una cuenta

Define cómo se cumplen `FR-008` a `FR-012` y `FR-016` sin duplicar datos, sin perder datos y sin
que el mecanismo de reconciliación existente (`specs/001-tripflow-v0/contracts/sync-contract.md`
§ Extracción) borre por error datos locales recién vinculados. No introduce tablas ni endpoints
nuevos: opera enteramente sobre las tablas ya definidas en
`specs/001-tripflow-v0/contracts/data-schema.md`, reutilizando `writeAndQueue` /
`cambios_pendientes` / `useSync` tal como existen hoy.

## Cuándo se dispara

Inmediatamente después de que `signUp` o `signIn` (`src/features/auth/AuthProvider.tsx`)
terminan con éxito, y antes de navegar a la app. Se compara la identidad activa guardada en
`localStorage` (`tripflow_active_identity`, ver `data-model.md`) contra `session.user.id`:

- Si son iguales, no hay nada que vincular (poco común: solo pasaría si el `localStorage` ya
  apuntaba a esta misma cuenta desde antes). Se navega directo a la app.
- Si son distintas, se cuentan los Viajes locales cuyo `user_id` = identidad activa anterior.
  - **Cero viajes**: no hay nada que confirmar (edge case "registrar cuenta nueva sin haber
    usado antes la app como invitado", o "no había datos pendientes tras un cierre de sesión").
    Se actualiza la identidad activa a `session.user.id` directamente y se navega a la app.
  - **Uno o más viajes**: se muestra la confirmación de `FR-008`/`FR-009` (ver
    `research.md` §6) con ese número. La persona elige **Incluir** o **Descartar**.

## Camino "Descartar" (`FR-011`)

1. Para cada Viaje local bajo la identidad anterior: borrar sus Gastos y luego el Viaje,
   directamente de Dexie (no vía `writeAndQueue` — estos registros nunca salieron del
   dispositivo, no hay nada que empujar como eliminación).
2. Borrar las Categorías locales bajo esa identidad y las Asociaciones aprendidas locales bajo
   esa identidad, de la misma forma.
3. Purgar de `cambios_pendientes` cualquier entrada cuyo `entidad_id` corresponda a alguno de los
   registros borrados en los pasos 1–2 (quedaron encoladas cuando esos registros se crearon como
   invitado; ya no hay nada que empujar por ellas).
4. Actualizar la identidad activa a `session.user.id`.
5. Navegar a la app. El pull normal de `useSync` trae lo que la cuenta ya tenía, si algo.

## Camino "Incluir" (`FR-010`)

1. **Peek de categorías remotas**: `supabase.from('categorias').select('id, nombre')` (RLS ya lo
   limita a la cuenta que acaba de autenticarse). Vacío si es una cuenta recién registrada.
   Construir `nombreRemoto → idRemoto` comparando nombres normalizados (mismo criterio de
   normalización que `categorization/dictionary.ts` usa para términos: minúsculas, sin tildes).
2. **Por cada Categoría local** bajo la identidad anterior:
   - Si su nombre normalizado coincide con una entrada del mapa: no se reasigna ni se encola.
     Se actualiza cada Gasto y Asociación aprendida local que referenciaba su `categoria_id`
     para que apunte al `idRemoto` correspondiente. La fila de Categoría local duplicada se
     borra de Dexie (igual que en el paso 1–2 del camino "Descartar": nunca salió del
     dispositivo).
   - Si no coincide: se actualiza su `user_id` a `session.user.id` (vía `db.categorias.put`,
     conservando el mismo `id`) y se agrega una entrada `crear` a `cambios_pendientes` para esa
     categoría (si no tenía ya una entrada `crear` pendiente de cuando se creó como invitado; si
     la tenía, no hace falta duplicarla).
3. **Por cada Viaje local** bajo la identidad anterior: actualizar su `user_id` a
   `session.user.id` y asegurar una entrada `crear` en `cambios_pendientes` (misma lógica de no
   duplicar si ya existía una).
4. **Por cada Gasto** de esos Viajes: si su `categoria_id` fue remapeado en el paso 2, actualizar
   el registro; asegurar una entrada `crear` en `cambios_pendientes` (los Gastos no tienen
   `user_id` propio, así que no necesitan reasignación de propietario, solo quedar encolados
   para subir junto con su Viaje).
5. **Por cada Asociación aprendida** local bajo la identidad anterior: actualizar su `user_id` a
   `session.user.id` (y su `categoria_id` si fue remapeado en el paso 2); asegurar una entrada
   `crear` en `cambios_pendientes`.
6. Actualizar la identidad activa a `session.user.id`.
7. Navegar a la app. `useSync` ya está habilitado (hay sesión) y hace lo suyo: empuja primero
   toda la cola (incluye lo recién encolado en los pasos 2–5), y **solo después de que la cola
   queda vacía** hace el pull que trae el resto de lo que la cuenta ya tenía en el servidor —
   la misma garantía de orden que `specs/001-tripflow-v0/contracts/sync-contract.md` ya define
   para FR-049, reutilizada aquí sin cambios. Este orden es lo que evita que la reconciliación
   por listas del pull (que borra localmente lo ausente en el servidor) llegue a ejecutarse
   antes de que los datos recién vinculados ya estén confirmados en el servidor.

## Garantías que se apoyan en la constitución

- **Principio V (datos con respeto)**: en un dispositivo compartido, nunca se asocian datos a
  una cuenta sin que la persona vea cuántos viajes hay y decida explícitamente — no existe
  ningún camino que reasigne `user_id` sin pasar por este contrato.
- **Principio I (simplicidad)**: no se agrega ninguna tabla, endpoint ni motor de sincronización
  nuevo; el único código nuevo es la reasignación local descrita arriba, que corre una sola vez
  por cada evento de vinculación.

## Qué NO hace este contrato

- No fusiona dos cuentas registradas entre sí (fuera de alcance de `spec.md`).
- No resuelve el caso en que el mismo Viaje o Gasto (mismo `id`) exista con contenido distinto en
  ambos lados — ese caso excepcional sigue la misma regla de "gana el `updated_at` más reciente"
  descrita en `specs/001-tripflow-v0/contracts/sync-contract.md` y en las Assumptions de
  `spec.md`, sin necesidad de lógica adicional aquí.
