---

description: "Task list for Uso sin cuenta obligatoria (modo invitado con sincronización opcional)"
---

# Tasks: Uso sin cuenta obligatoria (modo invitado con sincronización opcional)

**Input**: Design documents from `/specs/002-guest-mode-sync/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Sí, con el mismo alcance acotado que definen `plan.md` (sección Testing) y `research.md`
§7: **Vitest** para la función pura de deduplicación/reasignación de categorías al vincular
(la única lógica nueva donde un bug sería costoso y silencioso) y una **extensión** de la prueba
de humo Playwright existente para cubrir el nuevo camino dorado sin cuenta. El resto de los
criterios de aceptación se valida manualmente con `quickstart.md` (Principio IV).

**Organization**: Las tareas están agrupadas por historia de usuario para permitir
implementación y validación independientes de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3, US4)
- Cada tarea incluye la ruta exacta del archivo

## Path Conventions

Mismo proyecto único (SPA/PWA) ya existente de `001-tripflow-v0` (`src/`, `tests/` en la raíz del
repositorio). Esta feature no crea carpetas de alto nivel nuevas ni requiere Setup: no se agrega
ninguna dependencia, tabla ni servicio (`plan.md` § Technical Context). Por eso no hay una fase de
Setup — se empieza directo en Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: El único concepto genuinamente nuevo — la identidad activa (`session.user.id` con
sesión, o un uuid local sin ella) — concentrado en un solo módulo, según `research.md` §1–§2. Toda
historia de usuario depende de esto.

**⚠️ CRITICAL**: Ninguna historia de usuario puede comenzar hasta completar esta fase.

- [X] T001 Implementar `getOrCreateActiveIdentity()` (lee `localStorage['tripflow_active_identity']`; si no existe, genera uno con `newId()` de `src/lib/id.ts` y lo guarda) y `setActiveIdentity(id)` en `src/features/identity/activeIdentity.ts`
- [X] T002 Implementar `IdentityProvider` que envuelve a `AuthProvider` y expone `{ userId, isGuest, loading }` (`userId = session?.user.id ?? getOrCreateActiveIdentity()`, `isGuest = !session`, `loading` heredado de `useAuth()`) junto con el hook `useIdentity()`, en `src/features/identity/IdentityProvider.tsx` (depende de T001)
- [X] T003 Insertar `IdentityProvider` en el árbol de proveedores de `src/App.tsx`, entre `AuthProvider` y `SyncProvider` (depende de T002)

**Checkpoint**: Base lista — las historias de usuario pueden comenzar.

---

## Phase 3: User Story 1 - Empezar a usar Tripflow sin crear cuenta (Priority: P1) 🎯 MVP

**Goal**: Una persona nueva abre la app y, sin registrarse ni iniciar sesión, llega directo a
elegir categorías, crea su primer viaje y usa el resto de la funcionalidad de
`001-tripflow-v0` exactamente igual que con cuenta.

**Independent Test**: Instalar la app sin ninguna cuenta previa y llegar hasta un viaje creado con
gastos registrados, sin ver en ningún momento una pantalla de registro o inicio de sesión
obligatoria (`quickstart.md`, Escenario 1).

### Implementation for User Story 1

- [X] T004 [US1] Reemplazar el guard `RequireAuth` de `src/app/routes.tsx` por un componente de arranque que use `useIdentity()`: siembra categorías (`seedCategoriasIniciales`) la primera vez que la identidad activa no tiene ninguna, y redirige a `/onboarding/categorias` mientras el conteo siga en cero — así las rutas de onboarding, nuevo viaje y el `AppShell` quedan accesibles con o sin sesión (FR-001, FR-002, FR-003) (depende de T002, T003)
- [X] T005 [P] [US1] Actualizar `src/app/onboarding/CategoriasOnboardingPage.tsx` para leer `userId` desde `useIdentity()` en vez de `useAuth()`
- [X] T006 [P] [US1] Actualizar `src/app/trips/NuevoViajePage.tsx` para leer `userId` desde `useIdentity()` en vez de `useAuth()`
- [X] T007 [P] [US1] Actualizar `src/app/dashboard/DashboardPage.tsx` para leer `userId` desde `useIdentity()` en vez de `useAuth()`
- [X] T008 [P] [US1] Actualizar `src/app/expenses/GastoFormPage.tsx` para leer `userId` desde `useIdentity()` en vez de `useAuth()` (incluye el uso en `registrarCorreccion`)
- [X] T009 [P] [US1] Actualizar `src/app/search/BuscarPage.tsx` para leer `userId` desde `useIdentity()` en vez de `useAuth()`
- [X] T010 [P] [US1] Actualizar `src/app/categories/CategoriasPage.tsx` para leer `userId` desde `useIdentity()` en vez de `useAuth()`
- [X] T011 [US1] Quitar la llamada directa a `seedCategoriasIniciales` de `src/app/auth/RegistroPage.tsx`, ya que la siembra ahora ocurre una sola vez en el arranque (T004) y evita sembrar dos veces para la misma persona (depende de T004)
- [X] T012 [US1] Extender `tests/e2e/camino-dorado.spec.ts` con el camino dorado sin cuenta: abrir la app → categorías → crear viaje → registrar gasto, sin visitar `/registro` ni `/login` (depende de T004–T011)

**Checkpoint**: US1 completamente funcional y verificable de forma independiente (`quickstart.md`, Escenario 1).

---

## Phase 4: User Story 2 - Crear una cuenta para respaldar y acceder desde otro dispositivo (Priority: P1)

**Goal**: En cualquier momento, una persona que usa Tripflow sin cuenta se registra o inicia
sesión, ve cuántos viajes locales tiene y decide incluirlos o descartarlos, sin perder ni
duplicar nada.

**Independent Test**: Crear viajes y gastos como invitado, registrar una cuenta y verificar que
esa misma información aparece al iniciar sesión con esa cuenta en un segundo dispositivo (o
instalación simulada) (`quickstart.md`, Escenarios 3, 4, 5).

### Implementation for User Story 2

- [X] T013 [P] [US2] Agregar la prop opcional `tone?: 'danger' | 'neutral'` a `src/components/ConfirmDialog.tsx` (default `'danger'`, preserva los 3 usos actuales sin cambios; `'neutral'` usa `text-text-secondary` en la descripción y `Button variant="primary"` en la acción de confirmar) según `research.md` §6
- [X] T014 [US2] Implementar la función pura de deduplicación/reasignación de categorías en `src/features/identity/linkGuestData.ts`: dado un conjunto de categorías locales bajo la identidad anterior y un mapa `nombreRemoto → idRemoto` (nombres comparados con `normalizarTexto` de `src/features/categorization/normalize.ts`), devuelve qué categorías locales se remapean a un id remoto existente y cuáles se reasignan como nuevas (FR-012)
- [X] T015 [US2] Implementar en `src/features/identity/linkGuestData.ts` el conteo de viajes locales bajo una identidad, el camino "Incluir" (peek de categorías remotas vía `supabase.from('categorias').select('id, nombre')`, reasignación de `user_id` en viajes/categorías/asociaciones aprendidas y sus gastos según el mapeo de T014, encolado como `crear` en `cambios_pendientes` sin duplicar entradas ya pendientes) y el camino "Descartar" (borrado directo en Dexie de viajes/gastos/categorías/asociaciones bajo la identidad anterior y purga de sus entradas en `cambios_pendientes`), según `contracts/guest-link-contract.md` (FR-008 a FR-011) (depende de T014)
- [X] T016 [P] [US2] Escribir pruebas unitarias de la función de deduplicación/reasignación (categoría con nombre coincidente se remapea sin crear duplicado; categoría sin coincidencia se reasigna y queda para encolar) en `tests/unit/identity/linkGuestData.test.ts` (depende de T014)
- [X] T017 [US2] Actualizar `src/app/auth/RegistroPage.tsx`: bloquear el envío con "Este paso requiere conexión a internet." cuando `!navigator.onLine` (FR-007); tras un `signUp` exitoso, comparar la identidad activa anterior contra el nuevo `session.user.id`, mostrar `ConfirmDialog` (`tone="neutral"`) con la cantidad de viajes locales cuando sea mayor a cero, y ejecutar el camino "Incluir"/"Descartar" de `linkGuestData.ts` (o actualizar la identidad activa directamente si no hay nada que fusionar) antes de navegar (depende de T013, T015)
- [X] T018 [US2] Actualizar `src/app/auth/LoginPage.tsx` con el mismo bloqueo por falta de conexión y el mismo paso de vinculación posterior a un `signIn` exitoso que T017 (depende de T013, T015)
- [X] T019 [US2] Construir el estado invitado de `src/app/account/CuentaPage.tsx`: cuando `isGuest` (desde `useIdentity()`), mostrar una Card — Style: Subtle con una explicación breve y un Button — Style: Primary "Crear cuenta o iniciar sesión" que enlaza a `/registro`, en vez de asumir siempre una sesión activa (FR-004, FR-006) (depende de T002, T003)

**Checkpoint**: US1 + US2 completan el ciclo "empezar gratis, respaldar cuando quiera" y son verificables de forma independiente (`quickstart.md`, Escenarios 3, 4, 5, 7).

---

## Phase 5: User Story 3 - Seguir usando mis datos después de cerrar sesión (Priority: P2)

**Goal**: Al cerrar sesión, la persona sigue viendo y editando su información sincronizada, ahora
en modo invitado en ese dispositivo.

**Independent Test**: Con una cuenta con datos sincronizados, cerrar sesión y verificar que los
viajes y gastos siguen visibles y editables sin conexión a esa cuenta; volver a iniciar sesión y
verificar que lo editado se re-sincroniza (`quickstart.md`, Escenario 6).

### Implementation for User Story 3

- [X] T020 [US3] Agregar un botón "Cerrar sesión" (Button — Style: Secondary) al estado con sesión de `src/app/account/CuentaPage.tsx`; antes de invocar `signOut()`, llamar a `setActiveIdentity(userId)` (`src/features/identity/activeIdentity.ts`) para que el dispositivo quede congelado en esa identidad y siga usándose como invitado después de cerrar sesión (FR-015) (depende de T019, T001)

**Checkpoint**: Cerrar sesión ya no implica perder acceso a los datos del dispositivo (`quickstart.md`, Escenario 6).

---

## Phase 6: User Story 4 - Encontrar dónde crear una cuenta cuando me interesa (Priority: P3)

**Goal**: Una persona invitada encuentra fácilmente dónde crear cuenta, sin que la app la haya
interrumpido antes para pedírselo. Es un refinamiento de descubribilidad sobre US2, no
funcionalidad nueva (`spec.md`).

**Independent Test**: Como invitado, sin ninguna indicación previa, buscar dónde crear una cuenta
y verificar que existe un único lugar fijo y consistente para hacerlo (`quickstart.md`,
Escenario 2).

### Implementation for User Story 4

- [X] T021 [US4] Validar de punta a punta el Escenario 2 de `quickstart.md`: como invitado, usar la app con normalidad (crear un segundo gasto, revisar el resumen) confirmando que no aparece ningún aviso emergente ni interrupción (FR-005), y verificar que el acceso "Crear cuenta o iniciar sesión" de `src/app/account/CuentaPage.tsx` (T019) es el único lugar fijo donde encontrarlo (FR-004) (depende de T019)

**Checkpoint**: Las 4 historias de usuario funcionan de forma independiente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final contra los criterios de éxito y los principios de la
constitución.

- [X] T022 [P] Ejecutar de principio a fin los 7 escenarios de validación manual de `specs/002-guest-mode-sync/quickstart.md`
- [X] T023 [P] Revisar que todo el texto nuevo o modificado (confirmación de vinculación, Cuenta invitado, botón "Cerrar sesión", mensaje sin conexión) esté en español LATAM (Principio II) en `src/app/account/CuentaPage.tsx`, `src/app/auth/RegistroPage.tsx`, `src/app/auth/LoginPage.tsx` y `src/components/ConfirmDialog.tsx`
- [X] T024 [P] Auditar que la extensión `tone="neutral"` de `src/components/ConfirmDialog.tsx` y la Card del estado invitado de `src/app/account/CuentaPage.tsx` usen exclusivamente tokens y componentes ya documentados en `.specify/memory/design-system.md` (Principio VI), sin estilos aislados

**Checkpoint**: Feature completa y verificada contra `spec.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: sin dependencias — puede comenzar de inmediato. **BLOQUEA todas las historias de usuario.**
- **User Stories (Phase 3–6)**: todas dependen de Foundational. Después pueden avanzar en
  paralelo (si hay equipo) o secuencialmente en orden de prioridad (P1 → P1 → P2 → P3).
- **Polish (Phase 7)**: depende de que estén completas las historias que se quieran validar.

### User Story Dependencies

- **US1 (P1)**: solo depende de Foundational. Sin dependencias con otras historias.
- **US2 (P1)**: solo depende de Foundational. Independiente de US1 en el código (T019 solo
  necesita `useIdentity()`), aunque para probar su Independent Test completo conviene tener
  viajes creados como invitado (US1).
- **US3 (P2)**: depende de Foundational y evoluciona el archivo que crea US2 (T019 → T020, mismo
  patrón que "T059 evoluciona T046" en `001-tripflow-v0/tasks.md`) — no depende de la lógica de
  vinculación de US2, solo de que exista el estado con sesión de `CuentaPage.tsx`, que ya existía
  antes de esta feature.
- **US4 (P3)**: sin código propio — es una validación sobre lo construido en US2 (T019), tal como
  lo describe `spec.md` ("refinamiento de descubribilidad ... no una funcionalidad nueva
  independiente").

> Nota: T017 y T018 (RegistroPage/LoginPage) tocan los mismos dos archivos que ya modifica T011
> (US1) — son ediciones secuenciales del mismo archivo, no del mismo bloque de código; no hay
> conflicto funcional entre ellas.

### Within Each User Story

- Función pura antes que rutina con I/O (T014 antes de T015).
- Prueba unitaria en paralelo con la función pura que verifica (T016 junto a T015).
- Historia completa antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- **Phase 3 (US1)**: T005–T010 (seis pantallas que pasan de `useAuth()` a `useIdentity()`) en
  paralelo tras T004 — hasta 6 tareas simultáneas.
- **Phase 4 (US2)**: T013 (ConfirmDialog) en paralelo con T014 (función pura); T016 (test) en
  paralelo con el resto una vez que T014 está lista.
- **Phase 7**: T022, T023 y T024 en paralelo.
- Con equipo: tras Foundational, US1 y US2 pueden repartirse simultáneamente (no comparten
  archivos hasta T019, que solo depende de Foundational).

---

## Parallel Example: User Story 1

```bash
# Tras T004 (arranque con identidad activa), las seis pantallas en paralelo:
Task: "Actualizar CategoriasOnboardingPage.tsx a useIdentity()"
Task: "Actualizar NuevoViajePage.tsx a useIdentity()"
Task: "Actualizar DashboardPage.tsx a useIdentity()"
Task: "Actualizar GastoFormPage.tsx a useIdentity()"
Task: "Actualizar BuscarPage.tsx a useIdentity()"
Task: "Actualizar CategoriasPage.tsx a useIdentity()"
```

## Parallel Example: User Story 2

```bash
# Función pura y componente visual, en paralelo:
Task: "Implementar deduplicación de categorías en src/features/identity/linkGuestData.ts"
Task: "Agregar prop tone a src/components/ConfirmDialog.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

La propia spec marca US1 y US2 como las dos mitades de un mismo ciclo P1 ("empezar gratis,
respaldar cuando quiera") — sin US2, crear una cuenta no tendría ningún efecto útil.

1. Phase 2: Foundational (T001–T003) — **crítico, bloquea todo**
2. Phase 3: US1 (T004–T012)
3. Phase 4: US2 (T013–T019)
4. **DETENERSE Y VALIDAR**: Escenarios 1, 3, 4, 5 y 7 de `quickstart.md`
5. Desplegar/demostrar

Si hace falta un corte todavía más chico para una demo temprana, US1 sola (hasta T012) ya es
verificable de forma independiente.

### Incremental Delivery

1. Foundational → base lista
2. + US1, US2 → **MVP** → validar Escenarios 1, 3, 4, 5, 7 → desplegar
3. + US3 → validar Escenario 6 → desplegar
4. + US4 → validar Escenario 2 → desplegar
5. + Phase 7 (Polish) → validar `quickstart.md` completo

Cada incremento agrega valor sin romper los anteriores.

### Parallel Team Strategy

Con dos personas desarrollando:

1. El equipo completo hace Foundational (T001–T003, es secuencial y chico).
2. Terminada la base:
   - Persona A: US1 (T004–T012)
   - Persona B: US2 (T013–T019) → US3 (T020) → US4 (T021)
3. Las historias se integran de forma independiente; el único punto de contacto es
   `CuentaPage.tsx` (T019 antes que T020).

---

## Notes

- Tareas [P] = archivos distintos, sin dependencias pendientes.
- La etiqueta [Story] mapea cada tarea a su historia para trazabilidad.
- No se agrega ninguna tabla, columna ni endpoint nuevo: `user_id` sigue siendo la única clave de
  partición en Dexie y Supabase, solo que ahora puede ser una identidad local (`research.md` §1).
- Toda escritura de datos sigue pasando por `src/features/sync/queue.ts` sin cambios; la
  vinculación (T015) lo reutiliza tal cual, sin construir un mecanismo de sincronización paralelo.
- El indicador de sincronización (`src/features/sync/SyncIndicator.tsx`, ya construido en
  `001-tripflow-v0`) refleja automáticamente lo encolado por T015 sin necesitar cambios (FR-014).
- Ningún dato de invitado llega a Supabase sin pasar por la confirmación de T017/T018 — reforzado
  estructuralmente por RLS (`auth.uid() = user_id`), no solo por convención de la UI (Principio V).
- Toda la interfaz nueva usa exclusivamente componentes y tokens de
  `.specify/memory/design-system.md` (Principio VI); la única extensión es la prop `tone` de
  T013, ya prevista en `research.md` §6.
- Todo el contenido visible va en español LATAM (Principio II).
- Hacer commit tras cada tarea o grupo lógico; detenerse en cada checkpoint para validar la
  historia de forma independiente.
