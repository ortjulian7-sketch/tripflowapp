# Research: Uso sin cuenta obligatoria (modo invitado con sincronización opcional)

`001-tripflow-v0` ya está implementado. Esta investigación parte de leer esa implementación
(no de decidir stack desde cero) para encontrar el cambio más simple que satisface la nueva
spec sin reconstruir lo que ya funciona (Principio I).

## 0. Lo que ya existe y se reutiliza sin cambios

- **Escritura única**: toda creación/edición/eliminación pasa por `writeAndQueue()`
  (`src/features/sync/queue.ts`), que guarda en IndexedDB y encola un `cambio_pendiente` en la
  misma transacción — con o sin sesión, esta función no sabe ni le importa si hay cuenta.
- **Orden push-antes-de-pull**: `useSync()` (`src/features/sync/useSync.ts`) nunca hace pull
  mientras queden cambios pendientes de empujar. Esta garantía, ya construida para FR-049 de
  `001-tripflow-v0`, es exactamente lo que se necesita para que fusionar datos de invitado hacia
  una cuenta sea seguro (ver §3).
- **RLS de Supabase** (`contracts/data-schema.md` de `001-tripflow-v0`): exige
  `auth.uid() = user_id` en cada tabla. Un registro de invitado, cuyo `user_id` es un id local,
  nunca puede empujarse exitosamente a Supabase mientras no se reasigne a un `user_id` real —
  esto es una red de seguridad gratuita, no algo que haya que construir.
- **`newId()`** (`src/lib/id.ts`): ya genera UUID v4 vía `crypto.randomUUID()`; se reutiliza tal
  cual para generar el id local de invitado.
- **`ConfirmDialog`** (`src/components/ConfirmDialog.tsx`): ya resuelve confirmaciones de dos
  botones con descripción; se extiende (no se reemplaza) para la confirmación de vinculación.

## 1. Cómo modelar "sin cuenta" dado que hoy todo exige `user_id`

- **Decision**: no crear un concepto separado de "invitado" en el esquema de datos. En cambio,
  generalizar lo que ya existe: cada dispositivo tiene una **identidad activa** (un uuid), que es
  el `session.user.id` de Supabase Auth cuando hay sesión, o un uuid generado localmente y
  guardado en `localStorage` cuando no la hay. Todo el código que hoy lee `session.user.id` pasa
  a leer esta identidad activa a través de un único punto (ver §2). Los registros en Dexie no
  cambian de forma: `user_id` sigue siendo un string uuid, solo que ahora puede ser un id local
  en vez de un id de Supabase Auth.
- **Rationale**: evita introducir una segunda dimensión ("¿es de un invitado o de una cuenta?")
  en cada tabla y en cada consulta. El código de `tripRepository`, `categoryRepository`,
  `useTrips`, `useActiveTrip`, `useCategories`, `useLearnedAssociations`, etc. no necesita saber
  si el `userId` que recibe es de invitado o de cuenta — sigue funcionando exactamente igual
  (Principio I).
- **Alternatives considered**: agregar una tabla/columna `es_invitado` o una entidad "Sesión
  local" separada del "Usuario" (rechazado: duplica el concepto de identidad que ya existe,
  y cada consulta tendría que empezar a filtrar por dos columnas en vez de una); usar `null`
  como `user_id` para invitados (rechazado: `user_id` es la clave de partición en cada índice de
  Dexie — usar `null` rompería `where('user_id').equals(...)` en todos los repositorios).

## 2. Un único punto de acceso a la identidad activa

- **Decision**: nuevo feature `src/features/identity/` con:
  - `activeIdentity.ts`: `getOrCreateActiveIdentity()` — lee `localStorage['tripflow_active_identity']`; si no existe, genera uno con `newId()` y lo guarda. `setActiveIdentity(id)` — lo sobrescribe (se usa al vincular una cuenta y al cerrar sesión, ver §4).
  - `IdentityProvider.tsx`: envuelve a `AuthProvider` y expone `{ userId, isGuest, loading }`, donde `userId = session?.user.id ?? getOrCreateActiveIdentity()` e `isGuest = !session`.
  - Todas las pantallas que hoy hacen `const { session } = useAuth(); const userId = session.user.id` pasan a hacer `const { userId } = useIdentity()`. Es un cambio mecánico, no estructural: `tripRepository.crearViaje({ userId, ... })` y el resto de los repositorios no cambian de firma.
- **Rationale**: concentra el único concepto nuevo (identidad opcionalmente local) en un solo
  módulo pequeño, en vez de esparcir `session?.user.id ?? guestId` por cada pantalla.
- **Alternatives considered**: agregar `userId`/`isGuest` directamente a `AuthProvider`
  (rechazado por poco: mezclaría "sesión remota de Supabase" con "identidad activa del
  dispositivo", que son conceptos distintos aunque relacionados — separarlos en dos módulos
  pequeños es más simple de razonar y de testear en aislamiento).

## 3. Vincular datos locales a una cuenta (registro o inicio de sesión)

- **Decision**: al completar `signUp` o `signIn` con éxito, si existen Viajes locales bajo la
  identidad activa previa (guest o cuenta anterior tras un cierre de sesión) y esa identidad es
  distinta a la nueva `session.user.id`, se dispara la rutina de vinculación:
  1. **Peek de categorías remotas**: un único `select` a `categorias` en Supabase (ya filtrado
     por RLS a la cuenta autenticada) para construir un mapa nombre→id. Vacío si es un registro
     nuevo.
  2. **Categorías**: para cada categoría local bajo la identidad anterior, si su nombre coincide
     con una categoría remota existente, se remapea `categoria_id` en los Gastos y Asociaciones
     aprendidas locales que apuntaban a ella hacia el id remoto, y la categoría local duplicada
     se descarta (sin encolar). Si no coincide, se reasigna su `user_id` a la nueva cuenta y se
     encola como `crear`.
  3. **Viajes y Asociaciones aprendidas**: se reasigna su `user_id` a la nueva cuenta y se
     encolan como `crear` (los Gastos no tienen `user_id` propio — viajan con su Viaje vía
     `trip_id`, que no cambia).
  4. Se actualiza la identidad activa a `session.user.id`.
  5. El motor de sincronización existente (`useSync`, ya habilitado por haber sesión) hace el
     resto: empuja primero los `crear` recién encolados (push-antes-de-pull, ya garantizado hoy)
     y solo después trae del servidor lo que la cuenta ya tenía. Así nunca hay una ventana donde
     el pull pueda "reconciliar como huérfano" un dato local recién vinculado.
- **Rationale**: reutiliza el motor de sync tal cual existe; el único código nuevo es la
  reasignación local (puramente de datos en Dexie, sin red salvo el peek de categorías) y el
  encolado. No se construye un mecanismo de sincronización paralelo.
- **Alternatives considered**: pedirle a Supabase que haga la fusión con una función de base de
  datos (rechazado: movería lógica de negocio al servidor sin necesidad — el volumen de datos por
  cuenta es pequeño y el cliente ya tiene todo lo que necesita, según Scale/Scope de
  `001-tripflow-v0`); reconciliar por comparación de listas igual que hace `pull.ts` hoy
  (rechazado: esa reconciliación borra localmente lo que el servidor no tiene, que es
  precisamente lo opuesto de lo que se necesita al vincular datos de invitado — de ahí que el
  orden push-antes-de-pull sea imprescindible en vez de opcional).

## 4. Cerrar sesión sin perder el acceso a los datos (US3)

- **Decision**: `signOut()` dejar de ser la única acción del botón — se agrega un paso previo que
  llama a `setActiveIdentity(session.user.id)` (fija la identidad activa en el valor que ya tenía,
  "congelándolo" como identidad local) antes de cerrar la sesión de Supabase. No se borra ningún
  dato de Dexie. A partir de ahí el dispositivo queda en el mismo estado que un invitado, salvo
  que su identidad activa no es aleatoria sino la de la cuenta con la que se venía usando.
- **Rationale**: es el mismo mecanismo de "identidad activa" de §2/§3 aplicado al revés — no
  hace falta ninguna lógica nueva de "modo solo lectura" ni de limpieza; los datos simplemente
  quedan bajo una identidad que ya no tiene sesión activa, exactamente como cualquier invitado.
- **Alternatives considered**: `db.delete()` al cerrar sesión (rechazado: es lo que ya hace
  `CuentaPage` hoy para *borrar la cuenta*, un caso completamente distinto; reutilizarlo para un
  cierre de sesión normal violaría US3 directamente); modo "solo lectura" tras cerrar sesión
  (rechazado por la clarificación ya resuelta en `spec.md`: se eligió modo invitado editable, no
  solo lectura).

## 5. Primer arranque sin cuenta (bootstrap del onboarding)

- **Decision**: la semilla de categorías (`seedCategoriasIniciales`, ya existente) se dispara una
  única vez, la primera vez que se detecta una identidad activa sin ninguna categoría local
  (sea invitado nuevo o, en un caso límite, una cuenta que perdió sus categorías) — no en
  `RegistroPage` como hoy. `RegistroPage` deja de llamarla: para cuando alguien llega a
  registrarse, ya pasó por el onboarding como invitado y ya tiene categorías (que la vinculación
  de §3 hereda). El chequeo "¿tengo categorías?" vive en un componente de arranque que envuelve
  las rutas principales y redirige a `/onboarding/categorias` si el conteo es cero.
- **Rationale**: con este cambio hay un solo lugar que siembra categorías (antes había un
  supuesto implícito de que solo pasaba al registrarse); elimina el riesgo de sembrar dos veces
  para la misma persona (una vez como invitado, otra al registrarse) que generaría categorías
  duplicadas antes de que la deduplicación de §3 tuviera oportunidad de correr.
- **Alternatives considered**: mantener la siembra en `RegistroPage` y agregar deduplicación ahí
  también (rechazado: dos caminos que hacen lo mismo es la complejidad que el Principio I pide
  evitar; un solo punto de siembra es estrictamente más simple y cubre ambos casos).

## 6. Confirmación de vinculación (FR-008/FR-009)

- **Decision**: extender `ConfirmDialog` con una prop `tone?: 'danger' | 'neutral'` (default
  `'danger'`, preservando los tres usos actuales sin cambios) que en `'neutral'` usa
  `text-text-secondary` en vez de `text-status-error` y `Button variant="primary"` en vez de
  `"danger"` para la acción de confirmar. Se reutiliza para mostrar "Tenés N viajes guardados en
  este dispositivo. ¿Querés incluirlos en tu cuenta?" con acciones "Incluir" / "Descartar".
- **Rationale**: la fusión es una decisión neutral/positiva, no destructiva — usar el estilo de
  peligro existente comunicaría el mensaje equivocado. Es una extensión menor de un componente ya
  interno (no forma parte del catálogo de `design-system.md`, es una composición de `Button`),
  consistente con el Principio VI ("extender de forma apropiada" en vez de crear algo aislado).
- **Alternatives considered**: un componente de diálogo nuevo solo para este caso (rechazado:
  `ConfirmDialog` ya resuelve el 90% del comportamiento — overlay, dos botones, estado de carga —
  duplicarlo por un cambio de color es la complejidad que el Principio I pide evitar).

## 7. Impacto en pruebas

- **Decision**: extender la prueba de humo E2E existente (Playwright, camino dorado P1) para
  cubrir el nuevo camino dorado: abrir la app sin cuenta → categorías → crear viaje → registrar
  gasto, sin pasar por `/registro` ni `/login`. Agregar pruebas unitarias (Vitest) para la
  función pura de deduplicación/reasignación de §3 (dado un conjunto de categorías locales y un
  mapa de categorías remotas, produce el mapeo correcto de `categoria_id`), siguiendo el mismo
  criterio que `001-tripflow-v0` usó para `budget-health` y `categorization`: automatizar donde
  un error de cálculo sería costoso y silencioso. El resto (confirmación de vinculación, cierre
  de sesión, descubribilidad del acceso a cuenta) se valida manualmente vía `quickstart.md`,
  igual que el resto de `001-tripflow-v0`.
- **Rationale**: la lógica de fusión es la pieza nueva con más riesgo de un bug silencioso
  (perder o duplicar datos de la persona) — es exactamente el tipo de lógica que
  `001-tripflow-v0` ya decidió cubrir con Vitest (dinero, salud del presupuesto). El resto son
  flujos de UI ya cubiertos por el patrón de validación manual del Principio IV.
- **Alternatives considered**: cobertura E2E del flujo de vinculación completo con Supabase real
  (rechazado para v1: requeriría un backend de pruebas contra el que correr Playwright en CI, que
  `001-tripflow-v0` explícitamente no configuró; se puede agregar después si se vuelve el punto
  de fallo más frecuente).
