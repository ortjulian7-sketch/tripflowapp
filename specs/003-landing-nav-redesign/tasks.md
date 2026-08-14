---

description: "Task list for Bienvenida inicial y navegación alineada al Figma Make"
---

# Tasks: Bienvenida inicial y navegación alineada al Figma Make

**Input**: Design documents from `/specs/003-landing-nav-redesign/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Parcial, con el mismo alcance acotado que define `plan.md` (sección Testing): no se
introduce ninguna función pura de negocio nueva (la selección de categorías del onboarding es
estado de UI, no lógica a testear de forma aislada), así que no hay tareas Vitest nuevas. Sí se
**extiende** la prueba de humo Playwright existente (`tests/e2e/camino-dorado.spec.ts`) para pasar
por `/bienvenida` y tocar categorías explícitamente en ambos caminos dorados. El resto de los
criterios de aceptación se valida manualmente con `quickstart.md` (Principio IV).

**Organization**: Las tareas están agrupadas por historia de usuario para permitir
implementación y validación independientes de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3, US4, US5)
- Cada tarea incluye la ruta exacta del archivo

## Path Conventions

Mismo proyecto único (SPA/PWA) ya existente de `001-tripflow-v0`/`002-guest-mode-sync` (`src/`,
`tests/` en la raíz del repositorio). Esta feature no agrega ninguna dependencia, tabla ni
servicio nuevo (`plan.md` § Technical Context) — no hay fase de Setup, se empieza directo en
Foundational.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: El cambio de tipo que hace posible todo lo demás — `userId` pasa de `string` a
`string | null` en `IdentityProvider`, porque ahora puede no existir ninguna identidad todavía
(`research.md` §1, `contracts/entrada-gate-contract.md`). Se agrupan acá también los tres
consumidores existentes que no reciben ningún cambio de contenido propio en esta feature
(`GastoFormPage`, `CategoriasPage`, `BuscarPage`): solo necesitan tolerar el tipo nuevo para que
el proyecto siga compilando.

**⚠️ CRITICAL**: Ninguna historia de usuario puede darse por completa hasta que este cambio de
tipo esté propagado; sin él, `IdentityProvider` no puede distinguir "todavía no hay identidad" de
"ya hay una", que es la base de `FR-001` a `FR-005`.

- [X] T001 Agregar `peekActiveIdentity(): string | null` en `src/features/identity/activeIdentity.ts` — lee `localStorage['tripflow_active_identity']`, nunca escribe (a diferencia de `getOrCreateActiveIdentity`, que sigue existiendo tal cual para el único caller permitido de `establecerInvitado`)
- [X] T002 Refactorizar `src/features/identity/IdentityProvider.tsx` según `contracts/entrada-gate-contract.md`: `IdentityContextValue` pasa a `{ userId: string | null; isGuest: boolean; loading: boolean; establecerInvitado: () => string }`; `userId = session?.user.id ?? peekActiveIdentity()`; `establecerInvitado()` es la única función que llama a `getOrCreateActiveIdentity()` en toda la app (depende de T001)
- [X] T003 [P] Ajustar `src/app/expenses/GastoFormPage.tsx` para asumir `userId` no nulo (`userId!`) en `useSelectedTrip`, `useCategories`, `useLearnedAssociations` y `registrarCorreccion` — la pantalla queda anidada bajo `Bootstrap`/`EntradaGate`, que garantizan una identidad ya establecida antes de montar (depende de T002)
- [X] T004 [P] Ajustar `src/app/categories/CategoriasPage.tsx` para asumir `userId` no nulo (`userId!`) en `useCategories` y `crearCategoria` (depende de T002)
- [X] T005 [P] Ajustar `src/app/search/BuscarPage.tsx` para asumir `userId` no nulo (`userId!`) en `useSelectedTrip` y `useCategories` (depende de T002)

**Checkpoint**: Base lista — las historias de usuario pueden comenzar.

---

## Phase 3: User Story 1 - Elegir cómo entrar la primera vez que abro Tripflow (Priority: P1) 🎯 MVP

**Goal**: Una persona sin ninguna identidad en el dispositivo ve, antes que cualquier otra
pantalla, una bienvenida con tres opciones igual de visibles (Iniciar sesión, Registrarse,
Continuar como invitado), y cada opción lleva al flujo correcto sin pasos de más.

**Independent Test**: Instalar la app sin ninguna cuenta ni uso previo, abrirla, y verificar que
la primera pantalla visible ofrece exactamente esas tres opciones antes que cualquier otra
(`quickstart.md`, Escenario 1).

### Implementation for User Story 1

- [X] T006 [US1] Crear `src/app/bienvenida/BienvenidaPage.tsx`: tres `Button variant="secondary" size="large"` con el mismo peso visual (`research.md` §8) — "Iniciar sesión" navega a `/login`, "Registrarse" navega a `/registro`, "Continuar como invitado" llama a `establecerInvitado()` de `useIdentity()` y navega a `/onboarding/categorias` (`replace: true`); mismo contenedor/spacing que `LoginPage`/`RegistroPage` (`FR-001`, `FR-003`, `FR-004`) (depende de T002)
- [X] T007 [US1] En `src/app/routes.tsx`: crear el componente `EntradaGate` según la tabla de decisión de `contracts/entrada-gate-contract.md` (`loading` → `<Cargando />`; `session` → `<Outlet />`; `userId` string → `<Outlet />`; `userId` null → `<Navigate to="/bienvenida" replace />`) envolviendo el grupo `<Route element={<Bootstrap />}>` ya existente; agregar `<Route path="/bienvenida" element={<BienvenidaPage />} />` dentro del grupo `<Route element={<RedirectIfAuth />}>` ya existente, junto a `/login` y `/registro` (depende de T002, T006)
- [X] T008 [P] [US1] En `src/app/auth/LoginPage.tsx`: tolerar `identidadAnterior` nulo — `const cantidadViajes = identidadAnterior ? await contarViajesLocales(identidadAnterior) : 0` (`contracts/entrada-gate-contract.md`), sin más cambios de lógica (depende de T002)
- [X] T009 [P] [US1] En `src/app/auth/RegistroPage.tsx`: tolerar `identidadAnterior` nulo con la misma regla que T008 (`const cantidadViajes = identidadAnterior ? await contarViajesLocales(identidadAnterior) : 0`), sin tocar todavía `asegurarCategorias` ni la navegación post-registro (eso es Phase 5/US3) (depende de T002)

**Checkpoint**: US1 completamente funcional y verificable de forma independiente (`quickstart.md`,
Escenario 1 y 7). Nota: el defecto de categorías preseleccionadas (`FR-012`) sigue presente hasta
Phase 5 (US3) — no bloquea este checkpoint, que solo exige que la bienvenida aparezca y que cada
opción lleve al flujo correcto.

---

## Phase 4: User Story 2 - Usar Tripflow con la navegación y el contenido de la nueva referencia visual (Priority: P1)

**Goal**: La navegación principal muestra cuatro destinos (Resumen, Registrar, Nuevo viaje,
Cuenta) en el mismo patrón responsivo ya existente, el panel principal presenta su contenido en
el orden de `FR-007`, la búsqueda queda accesible desde un ícono en el panel principal, y Cuenta
enlaza a la gestión de categorías.

**Independent Test**: Con una identidad ya usando la app, recorrer la navegación principal (móvil
y escritorio) verificando los cuatro destinos y su orden; comparar el panel principal contra el
orden de `FR-007`; confirmar que "Registrar gasto" y "Nuevo viaje" son alcanzables como destinos
directos, sin cambios en sus formularios (`quickstart.md`, Escenarios 3 y 4).

### Implementation for User Story 2

- [X] T010 [P] [US2] En `src/app/AppShell.tsx`: actualizar `NAV_ITEMS` a los cuatro destinos — Resumen (`/`, icon `home`, `end: true`), Registrar (`/gastos/nuevo`, icon `plus`), Nuevo viaje (`/viajes/nuevo`, icon `map`), Cuenta (`/cuenta`, icon `user`) — quitando "Buscar" del nav (se mueve al panel principal en T011) (`FR-006`)
- [X] T011 [P] [US2] En `src/app/dashboard/DashboardPage.tsx`: reordenar el contenido según `FR-007` — `BudgetSummary` (gastado + % → barra de progreso → disponible → días) pasa a ser el primer bloque sustantivo; la identidad del viaje (`TripSwitcher` + nombre/destino/fechas) pasa a un encabezado compacto que enmarca sin anteceder visualmente el monto (`research.md` §7); agregar un `IconButton icon="search" variant="secondary"` (mismo patrón que los botones de `TripSwitcher`) que navegue a `/buscar` (`FR-008`); asumir `userId` no nulo (`userId!`) en `useSelectedTrip`/`useCategories` (depende de T002)
- [X] T012 [P] [US2] En `src/app/routes.tsx`: mover `<Route path="/viajes/nuevo" element={<NuevoViajePage />} />` del grupo directo bajo `Bootstrap` al grupo anidado `<Route element={<AppShell />}>`, junto a `/gastos/nuevo` y el resto de las rutas con navegación visible (`research.md` §4)
- [X] T013 [P] [US2] En `src/app/trips/NuevoViajePage.tsx`: reemplazar el wrapper raíz standalone (`min-h-screen flex flex-col items-center justify-center`) por el mismo patrón de contenedor que ya usan `CuentaPage`/`CategoriasPage` dentro de `AppShell` (`mx-auto w-full max-w-sm flex flex-col gap-6 py-6`) para convivir con el `<main>` de `AppShell` tras T012; asumir `userId` no nulo (`userId!`) en `crearViaje` (depende de T012)
- [X] T014 [P] [US2] En `src/app/account/CuentaPage.tsx`: agregar un `ListItem` que enlace a `/categorias` en la rama con sesión iniciada, además de "Cerrar sesión" y "Eliminar cuenta" ya existentes (`FR-009`); asumir `userId` no nulo (`userId!`) en `handleCerrarSesion` (depende de T002)

**Checkpoint**: US1 + US2 completamente funcionales y verificables de forma independiente
(`quickstart.md`, Escenarios 3 y 4).

---

## Phase 5: User Story 3 - Elegir deliberadamente mis categorías al empezar como invitado (Priority: P2)

**Goal**: La pantalla de selección de categorías del onboarding arranca sin nada marcado, cada
categoría responde al toque individualmente, y "Continuar" avanza sin importar cuántas estén
activas.

**Independent Test**: Llegar a la pantalla de selección de categorías del onboarding y verificar
que cada categoría arranca deseleccionada, responde al toque, se activa/desactiva
individualmente, y que "Continuar" funciona sin restricción de cantidad (`quickstart.md`,
Escenario 2).

### Implementation for User Story 3

- [X] T015 [US3] Refactorizar `src/features/categories/seed.ts` según `contracts/onboarding-categorias-contract.md`: reemplazar `CATEGORIAS_INICIALES`/`seedCategoriasIniciales` por `CATEGORIAS_CANDIDATAS` (las 7 no protegidas, mismo `nombre`/`emoji` de hoy), `OTRO` (`{ nombre: 'Otro', emoji: '🗂️' }`, protegida) y `guardarSeleccionInicial(userId: string, nombresSeleccionados: Set<string>): Promise<void>` — persiste (vía `writeAndQueue`) una fila por cada candidata seleccionada más siempre una fila para `OTRO`
- [X] T016 [US3] Reescribir `src/app/onboarding/CategoriasOnboardingPage.tsx`: catálogo candidato en memoria (`CATEGORIAS_CANDIDATAS`, sin leer Dexie), estado local `useState<Set<string>>` con default vacío (`FR-012`), cada `Chip` interactivo (`onClick` alterna membresía en el set, quitar `selected` fijo/`tabIndex={-1}`/`cursor-default`), `OTRO` nunca aparece en la grilla, botón "Continuar" siempre habilitado (`FR-013`) que llama `guardarSeleccionInicial(userId!, seleccion)` y navega a `/viajes/nuevo` (`replace: true`) recién después de que la persistencia resuelve (depende de T015, T002)
- [X] T017 [US3] En `src/app/routes.tsx`: actualizar `Bootstrap` según `contracts/onboarding-categorias-contract.md` — quitar el `useEffect` de siembra y el import de `seedCategoriasIniciales`; `necesitaOnboarding = categorias.length === 0 && (isGuest || Boolean(location.state?.cuentaNueva))`; redirigir a `/onboarding/categorias` con `state={{ cuentaNueva: !isGuest }}` cuando corresponda, sin esperar ningún `pull` en ese caso (depende de T015, T016)
- [X] T018 [US3] En `src/app/auth/RegistroPage.tsx`: eliminar `asegurarCategorias` y su import de `seedCategoriasIniciales`; los cuatro caminos de éxito (`signUp` directo, `signUp` + incluir con 0 viajes, confirmar "Incluir", confirmar "Descartar") navegan a `/onboarding/categorias` con `{ replace: true, state: { cuentaNueva: true } }` (`contracts/onboarding-categorias-contract.md`, `research.md` §3) (depende de T015, T009)
- [X] T019 [US3] Extender `tests/e2e/camino-dorado.spec.ts`: ambos caminos dorados (con cuenta y sin cuenta) pasan primero por `/bienvenida` (clic en "Registrarse" o "Continuar como invitado" según corresponda) y tocan 2-3 categorías explícitamente antes de "Continuar", reemplazando el assert directo del heading "Tus categorías" tras `page.goto('/registro')`/`page.goto('/')` (depende de T007, T016, T018)

**Checkpoint**: US1 + US2 + US3 completamente funcionales y verificables de forma independiente
(`quickstart.md`, Escenarios 1 a 4).

---

## Phase 6: User Story 4 - Gestionar mis categorías propias y cerrar sesión desde la Cuenta rediseñada (Priority: P2)

**Goal**: Crear una categoría propia y cerrar sesión siguen siendo alcanzables y funcionando
igual que antes, ahora desde la Cuenta rediseñada en US2. Ambas capacidades ya están
implementadas (`categoryRepository.ts`, `CuentaPage.handleCerrarSesion`); esta historia no agrega
código nuevo, solo confirma que el rediseño no las escondió ni las rompió.

**Independent Test**: Desde Cuenta, navegar a la gestión de categorías y crear una categoría
nueva, verificando que queda disponible para clasificar gastos; por separado, con sesión
iniciada, cerrar sesión desde Cuenta y verificar que los datos siguen disponibles localmente en
modo invitado (`quickstart.md`, Escenario 4).

### Implementation for User Story 4

- [X] T020 [US4] Validar de punta a punta el Escenario 4 de `quickstart.md`: desde Cuenta (enlace agregado en T014), crear una categoría nueva y verificar que aparece disponible al registrar un gasto en menos de 30 segundos (`SC-006`, `FR-011`); por separado, cerrar sesión en 2 toques o menos desde Cuenta (`SC-005`) y confirmar que los datos del viaje siguen visibles en modo invitado (`FR-010`) — sin código nuevo, dado que `crearCategoria` y `handleCerrarSesion` ya implementan esto (depende de T014)

**Checkpoint**: Las cuatro primeras historias de usuario funcionan de forma independiente.

---

## Phase 7: User Story 5 - Reconocer la marca Tripflow en la bienvenida y en la navegación (Priority: P2)

**Goal**: El logo de Tripflow (ícono + wordmark) aparece en la bienvenida y de forma visible en
la navegación principal, tanto en escritorio como en móvil (hoy ausente en móvil).

**Independent Test**: Abrir la app sin identidad previa y verificar que el logo aparece en la
bienvenida; por separado, verificar que el logo aparece en la navegación principal en escritorio
y en móvil (`quickstart.md`, Escenario 5).

### Implementation for User Story 5

- [X] T021 [US5] Crear `src/components/Logo.tsx` según `.specify/memory/design-system.md` § Logo (ya documentado): `<img src="/icons/icon.svg" alt="" />` + `<span>` con el wordmark "Tripflow" (`font-brand`, `color-text-brand`) en una sola línea, ícono a la izquierda; prop `size: 'small' | 'large'` (`FR-016` a `FR-018`, `research.md` §6)
- [X] T022 [P] [US5] En `src/app/AppShell.tsx`: reemplazar el texto plano `Tripflow` del sidebar por `<Logo size="small" />`; agregar `<Logo size="small" />` al header móvil (hoy solo `SyncIndicator`, alineado a la derecha — pasa a `justify-between` con el logo a la izquierda) (`FR-017`) (depende de T021)
- [X] T023 [P] [US5] En `src/app/bienvenida/BienvenidaPage.tsx`: agregar `<Logo size="large" />` sobre las tres opciones de entrada (`FR-016`) (depende de T021, T006)

**Checkpoint**: Las cinco historias de usuario funcionan de forma independiente
(`quickstart.md`, Escenario 5).

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final contra los criterios de éxito y los principios de la
constitución.

- [X] T024 [P] Ejecutar de principio a fin los 7 escenarios de validación manual de `specs/003-landing-nav-redesign/quickstart.md`
- [X] T025 [P] Revisar que todo el texto nuevo o modificado (`BienvenidaPage`, `CategoriasOnboardingPage` reescrita, enlace a Categorías en `CuentaPage`) esté en español LATAM (Principio II)
- [X] T026 [P] Auditar que toda la UI nueva o modificada use exclusivamente componentes y tokens ya documentados en `.specify/memory/design-system.md` (Principio VI) — `Logo`, `Chip` ahora interactivo, `IconButton` de búsqueda, `ListItem` de Categorías en Cuenta — sin estilos aislados
- [X] T027 Ejecutar `tsc`/typecheck y el lint del proyecto de punta a punta, confirmando que el cambio de `userId: string` a `string | null` (T002) no dejó ningún consumidor sin ajustar

**Checkpoint**: Feature completa y verificada contra `spec.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: sin dependencias — puede comenzar de inmediato. **BLOQUEA todas las
  historias de usuario** (el cambio de tipo de `userId` afecta a todo consumidor de
  `useIdentity()`).
- **User Stories (Phase 3–7)**: todas dependen de Foundational. Después avanzan en orden de
  prioridad (P1 → P1 → P2 → P2 → P2); US3, US4 y US5 además tienen dependencias de código
  puntuales con US1/US2 (ver abajo).
- **Polish (Phase 8)**: depende de que estén completas las historias que se quieran validar.

### User Story Dependencies

- **US1 (P1)**: depende solo de Foundational. Sin dependencias de código con otras historias.
- **US2 (P1)**: depende solo de Foundational. Es code-independiente de US1 (ningún archivo de T010–T014
  importa `BienvenidaPage` ni `EntradaGate`), aunque para recorrer su Independent Test de punta a
  punta conviene tener US1 lista (para llegar a la app con una identidad).
- **US3 (P2)**: depende de Foundational. Comparte causa raíz con US1 (`research.md` §2) pero es
  code-independiente de sus archivos — sin embargo, T018 edita el mismo archivo que T009 (US1,
  `RegistroPage.tsx`) y T019 (el test e2e) necesita que T007 (US1, ruta `/bienvenida`) ya exista
  para poder pasar por ella.
- **US4 (P2)**: sin código propio — depende de que T014 (US2, enlace a Categorías en Cuenta) esté
  listo; es un refinamiento de verificación, no funcionalidad nueva (igual que US4 en
  `002-guest-mode-sync`).
- **US5 (P2)**: depende de Foundational y de T006 (US1, `BienvenidaPage.tsx` debe existir antes de
  agregarle el logo en T023).

> Nota: `routes.tsx` se edita en tres fases distintas (T007 en US1 agrega `EntradaGate`; T012 en
> US2 mueve `/viajes/nuevo`; T017 en US3 cambia la lógica de `Bootstrap`) — son ediciones
> secuenciales a bloques distintos del mismo archivo, sin conflicto funcional entre ellas.
> `RegistroPage.tsx` se edita en dos fases (T009 en US1, el guard de `identidadAnterior`; T018 en
> US3, quitar la siembra y agregar `cuentaNueva`) por la misma razón.

### Within Each User Story

- Componente nuevo antes que su integración (T006 antes de T007 y T023; T021 antes de T022 y
  T023).
- Refactor de datos antes que la pantalla que lo consume (T015 antes de T016; T015+T016 antes de
  T017).
- Historia completa antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- **Phase 2 (Foundational)**: T003, T004 y T005 en paralelo tras T002 (tres archivos sin cambios
  de contenido propio en esta feature).
- **Phase 3 (US1)**: T008 y T009 en paralelo (archivos distintos, ambos solo dependen de T002).
- **Phase 4 (US2)**: T010–T014 en paralelo entre sí (cinco archivos distintos, cada uno solo
  depende de Foundational o de otra tarea de la misma fase que no comparte archivo).
- **Phase 7 (US5)**: T022 y T023 en paralelo tras T021.
- **Phase 8**: T024, T025 y T026 en paralelo; T027 al final.
- Con equipo: tras Foundational, US1 y US2 pueden repartirse simultáneamente (no comparten
  archivos hasta T018/T019, que son posteriores).

---

## Parallel Example: Foundational

```bash
# Tras T002 (IdentityProvider refactorizado), los tres ajustes de compilación en paralelo:
Task: "Ajustar GastoFormPage.tsx a userId no nulo"
Task: "Ajustar CategoriasPage.tsx a userId no nulo"
Task: "Ajustar BuscarPage.tsx a userId no nulo"
```

## Parallel Example: User Story 2

```bash
# Cinco archivos distintos, todos solo dependientes de Foundational:
Task: "Actualizar NAV_ITEMS a 4 destinos en AppShell.tsx"
Task: "Reordenar contenido y agregar búsqueda en DashboardPage.tsx"
Task: "Mover /viajes/nuevo al grupo AppShell en routes.tsx"
Task: "Ajustar layout de NuevoViajePage.tsx para AppShell"
Task: "Agregar enlace a Categorías en CuentaPage.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

La propia spec marca US1 y US2 como el rediseño completo de entrada y navegación (ambas P1); sin
US2, la bienvenida de US1 llevaría a una navegación todavía desalineada con la referencia.

1. Phase 2: Foundational (T001–T005) — **crítico, bloquea todo**
2. Phase 3: US1 (T006–T009)
3. Phase 4: US2 (T010–T014)
4. **DETENERSE Y VALIDAR**: Escenarios 1, 3, 4, 6 y 7 de `quickstart.md`
5. Desplegar/demostrar

### Incremental Delivery

1. Foundational → base lista
2. + US1, US2 → **MVP** → validar Escenarios 1, 3, 4, 6, 7 → desplegar
3. + US3 → validar Escenario 2 → desplegar
4. + US4 → validar Escenario 4 (parte de categorías/cerrar sesión) → desplegar
5. + US5 → validar Escenario 5 → desplegar
6. + Phase 8 (Polish) → validar `quickstart.md` completo

Cada incremento agrega valor sin romper los anteriores.

### Parallel Team Strategy

Con dos personas desarrollando:

1. El equipo completo hace Foundational (T001–T005, es secuencial y chico).
2. Terminada la base:
   - Persona A: US1 (T006–T009) → US3 (T015–T019, depende de T007/T009 de US1)
   - Persona B: US2 (T010–T014) → US4 (T020, depende de T014) → US5 (T021–T023, depende de T006
     de US1)
3. Las historias se integran de forma independiente; los puntos de contacto son `routes.tsx`
   (T007/T012/T017) y `RegistroPage.tsx` (T009/T018), ediciones secuenciales sin conflicto
   funcional.

---

## Notes

- Tareas [P] = archivos distintos, sin dependencias pendientes.
- La etiqueta [Story] mapea cada tarea a su historia para trazabilidad.
- No se agrega ninguna tabla, columna ni endpoint nuevo: el "Estado de bienvenida" es un valor
  derivado de `session`/`peekActiveIdentity()`, nunca persistido aparte (`data-model.md`).
- El componente `Logo` (T021) ya está documentado en `.specify/memory/design-system.md` § Logo
  desde la fase de planificación (Principio VI: documentar antes de usar) — T021 solo lo
  implementa en código.
- Toda escritura de categorías sigue pasando por `writeAndQueue` (`src/features/sync/queue.ts`)
  sin cambios; `guardarSeleccionInicial` (T015) lo reutiliza tal cual, igual que
  `seedCategoriasIniciales` antes.
- Todo el contenido visible va en español LATAM (Principio II).
- Hacer commit tras cada tarea o grupo lógico; detenerse en cada checkpoint para validar la
  historia de forma independiente.
