# Data Model: Uso sin cuenta obligatoria (modo invitado con sincronización opcional)

Este documento extiende `specs/001-tripflow-v0/data-model.md`, no lo reemplaza. Viaje, Gasto,
Categoría y Asociación aprendida mantienen exactamente los mismos campos y reglas ya
documentados ahí. Lo único que cambia es de dónde puede venir el valor de `user_id` y se agrega
una entidad técnica nueva, puramente local, para sostenerlo.

## Identidad activa (nueva, técnica, no se sincroniza)

No es una entidad de negocio ni se expone como tal a la persona usuaria — sostiene FR-001 a
FR-016 de esta spec. Vive en `localStorage` del dispositivo, no en Dexie ni en Supabase.

| Campo | Tipo | Regla |
|---|---|---|
| `tripflow_active_identity` | uuid (string) | Generado con `crypto.randomUUID()` la primera vez que se usa el dispositivo sin sesión. Se sobrescribe con `session.user.id` en cada `signUp`/`signIn` exitoso (tras completarse la vinculación, ver `contracts/guest-link-contract.md`), y se vuelve a "congelar" en el último valor de `session.user.id` al cerrar sesión. |

**Regla central**: en todo momento, `userId` = `session.user.id` si hay sesión activa, o el
valor guardado en `tripflow_active_identity` si no la hay. Este `userId` es el mismo valor que
hoy se guarda en el campo `user_id` de Viaje, Categoría y Asociación aprendida — no se introduce
ningún campo ni tabla nueva en Dexie ni en Supabase para distinguir "invitado" de "cuenta". La
distinción vive enteramente en si hay o no una `session` de Supabase Auth en ese momento.

## Usuario (extiende la definición de `001-tripflow-v0`)

| Campo | Tipo | Regla |
|---|---|---|
| `id` | uuid | = `session.user.id` de Supabase Auth **mientras existe cuenta**; mientras la persona usa la app sin cuenta (o tras cerrar sesión sin volver a iniciarla), no existe fila de Usuario en ningún lado — el `id` que aparece en `user_id` de sus registros es la identidad activa local, sin contraparte en Supabase. |

**Dos estados, mismo tipo de dato**:

- **Invitado**: `userId` = identidad activa local. Sus Viajes, Gastos, Categorías y Asociaciones
  aprendidas existen solo en IndexedDB; nunca se agregan a la cola de sincronización de forma
  que lleguen a Supabase (`useSync` permanece deshabilitado mientras no hay sesión — ver
  `research.md` §2).
- **Con cuenta**: `userId` = `session.user.id`. Sus registros se sincronizan según
  `specs/001-tripflow-v0/contracts/sync-contract.md`, sin cambios.

**Transición invitado → con cuenta**: no crea registros nuevos con datos duplicados — reasigna
`user_id` en los registros existentes (Viaje, Categoría, Asociación aprendida) de la identidad
activa anterior hacia `session.user.id`, con la deduplicación de Categorías por nombre descrita
en `contracts/guest-link-contract.md`. Los Gastos no tienen `user_id` propio (se identifican por
`trip_id`), así que se mueven automáticamente junto con su Viaje.

**Transición con cuenta → invitado (cerrar sesión)**: no reasigna nada. Los registros
permanecen con `user_id` = el `session.user.id` que tenían; la identidad activa local se fija en
ese mismo valor para que las escrituras siguientes (offline, sin cuenta) usen el mismo `user_id`
y por lo tanto se sigan viendo como el mismo conjunto de datos.

## Viaje, Gasto, Categoría, Asociación aprendida

Sin cambios de estructura respecto a `001-tripflow-v0`. La única diferencia de comportamiento:
mientras `userId` sea una identidad activa local (sin sesión), estos registros nunca se
encuentran en `cambios_pendientes` en un estado que el motor de sync intente empujar contra
Supabase — no porque `writeAndQueue` cambie, sino porque `useSync(habilitado)` solo se activa
con `habilitado = !!session` (sin cambios respecto a `001-tripflow-v0`; el comportamiento nuevo
es simplemente que ahora `writeAndQueue` también se invoca sin sesión, y su cola se queda
acumulada hasta que exista una).

## Diagrama de relaciones (extendido)

```text
Identidad activa (local) ──es el mismo valor que──▶ Usuario.id (con cuenta) o
                                                       Usuario.id "huérfano" (invitado)

Usuario 1──N Viaje 1──N Gasto N──1 Categoría 1──N Usuario
Usuario 1──N Categoría
Usuario 1──N Asociación aprendida N──1 Categoría
```

La única diferencia con el diagrama de `001-tripflow-v0` es la fila superior: la identidad ya no
asume siempre un Usuario autenticado en Supabase.
