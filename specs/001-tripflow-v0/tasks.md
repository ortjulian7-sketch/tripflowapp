---
description: "Task list for Tripflow v0 — Control de presupuesto de viaje"
---

# Tasks: Tripflow v0 — Control de presupuesto de viaje

**Input**: Design documents from `/specs/001-tripflow-v0/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Sí, con alcance acotado. `plan.md` (sección Testing) y `research.md` §13 definen
explícitamente la estrategia: **Vitest** para la lógica pura de cálculo (dinero, fechas, salud
del presupuesto, desglose, categorización) y **una sola prueba de humo Playwright** del camino
dorado P1. El resto de los criterios de aceptación se valida manualmente con `quickstart.md`
(Principio IV). No se generan tests para lo que no está en esa estrategia.

**Organization**: Las tareas están agrupadas por historia de usuario para permitir
implementación y validación independientes de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, …)
- Cada tarea incluye la ruta exacta del archivo

## Path Conventions

Proyecto único de frontend (SPA/PWA) en la raíz del repositorio, según "Project Structure" de
`plan.md`: `src/`, `public/`, `supabase/`, `tests/`. No existe backend propio — la carpeta
`supabase/` contiene el esquema SQL y la única función server-side.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar el proyecto y su tooling. Sin esto no se puede ejecutar nada.

- [X] T001 Inicializar proyecto Vite + React 18 + TypeScript 5 en la raíz del repositorio: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`
- [X] T002 [P] Configurar Tailwind CSS y su pipeline de PostCSS en `tailwind.config.ts`, `postcss.config.js` y `src/styles/index.css`
- [X] T003 [P] Configurar ESLint + Prettier para TypeScript/React en `eslint.config.js` y `.prettierrc`
- [X] T004 [P] Configurar Vitest con entorno jsdom en `vitest.config.ts` y `tests/setup.ts`
- [X] T005 [P] Configurar Playwright (un solo proyecto, navegador Chromium) en `playwright.config.ts`
- [X] T006 [P] Instalar y configurar `vite-plugin-pwa` con el manifest de la app instalable en `vite.config.ts` y `public/manifest.webmanifest`
- [X] T007 [P] Definir variables de entorno públicas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en `.env.example` y su lectura tipada en `src/lib/env.ts` — nunca la clave de rol de servicio (Principio V)
- [X] T008 [P] Actualizar `.gitignore` para excluir `node_modules/`, `dist/`, `.env.local`, `playwright-report/` y `test-results/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Sistema de diseño, utilidades de dominio, capa de datos offline-first, autenticación
y navegación. Todas las historias de usuario dependen de esto.

**⚠️ CRITICAL**: Ninguna historia de usuario puede comenzar hasta completar esta fase.

**Nota sobre el tamaño de esta fase**: es más grande que en un proyecto típico porque el producto
es offline-first (`plan.md`): la escritura local con cola de cambios debe existir **desde la
primera escritura** de US1, o habría que reescribir después cada camino de guardado.

### Sistema de diseño (primero, según `plan.md`)

- [X] T009 Documentar las variantes `Success` y `Error` de Progress Bar en `.specify/memory/design-system.md`, reutilizando los tokens ya existentes `color-status-success-strong` y `color-status-error-strong` (extensión prevista por el Principio VI; requisito previo del indicador de salud)
- [X] T010 Generar `src/styles/tokens.css` con todos los tokens semánticos de `.specify/memory/design-system.md` como variables CSS, con soporte Light/Dark vía `prefers-color-scheme`
- [X] T011 Exponer los tokens de `src/styles/tokens.css` como escala de Tailwind en `tailwind.config.ts`, de modo que no exista ningún valor de color/espaciado hardcodeado en componentes

### Componentes del catálogo (mapeo 1:1 con `design-system.md`)

- [X] T012 [P] Implementar Icon (sistema de iconos) en `src/components/Icon.tsx`
- [X] T013 [P] Implementar Button (Style: Primary/Secondary/Danger, Size, estado Loading) en `src/components/Button.tsx`
- [X] T014 [P] Implementar Input (Type: Text/Number/Select, Show Label, estado de error) en `src/components/Input.tsx`
- [X] T015 [P] Implementar Chip (Default/Selected) en `src/components/Chip.tsx`
- [X] T016 [P] Implementar Card (Style: Subtle) en `src/components/Card.tsx`
- [X] T017 [P] Implementar List Item en `src/components/ListItem.tsx`, documentando en `.specify/memory/design-system.md` los estados interactivos (Pressed/tappable) inferidos para su uso en filas accionables (T070, T076), ya que el catálogo actual solo describe su anatomía base sin esa documentación formal
- [X] T018 [P] Implementar Progress Bar (Style: Warning/Brand/Success/Error, altura fija 4px, `Fill` topado al 100% sin desbordar) en `src/components/ProgressBar.tsx`
- [X] T019 [P] Implementar Nav Item (Layout: Horizontal/Vertical) en `src/components/NavItem.tsx`
- [X] T020 [P] Implementar Icon Button (Style: Primary/Secondary, Size: Large) en `src/components/IconButton.tsx`

### Utilidades puras de dominio

- [X] T021 [P] Implementar aritmética de dinero en enteros de unidad mínima (parseo desde input, suma, porcentaje, formateo con `Intl.NumberFormat` por moneda) en `src/lib/money.ts`
- [X] T022 [P] Implementar utilidades de fecha calendario sobre `Date` normalizado a medianoche local (días totales, días transcurridos, días restantes inclusive, clave de agrupación por día) en `src/lib/dates.ts`
- [X] T023 [P] Definir el catálogo acotado de monedas LATAM + USD + EUR (código ISO 4217, símbolo, dígitos decimales) en `src/lib/currencies.ts`
- [X] T024 [P] Escribir pruebas unitarias de dinero (exactitud de suma y porcentaje, sin error de redondeo — SC-008) en `tests/unit/money.test.ts`
- [X] T025 [P] Escribir pruebas unitarias de fechas (viaje no comenzado, en curso, último día, terminado, sin división por cero) en `tests/unit/dates.test.ts`

### Capa de datos offline-first

- [X] T026 Definir el esquema local de Dexie/IndexedDB con las tablas `viajes`, `gastos`, `categorias`, `asociaciones_aprendidas` y `cambios_pendientes` según `data-model.md`, con índices por `trip_id`, `fecha` y `categoria_id`, en `src/lib/db.ts`
- [X] T027 Crear el cliente de Supabase (auth + Postgres) leyendo la configuración de `src/lib/env.ts` en `src/lib/supabase.ts`
- [X] T028 Escribir la migración SQL con las 4 tablas, constraints (`presupuesto_total > 0`, `monto > 0`, `descripcion <> ''`, `UNIQUE (user_id, nombre)`, `UNIQUE (user_id, termino)`), cascadas (`gastos` ON DELETE CASCADE desde `viajes`; `asociaciones_aprendidas` ON DELETE CASCADE desde `categorias`; `gastos.categoria_id` ON DELETE RESTRICT) y políticas RLS `auth.uid() = user_id` de `contracts/data-schema.md` en `supabase/migrations/0001_schema.sql`
- [X] T029 Implementar el helper de escritura local transaccional que guarda en IndexedDB y encola el cambio en `cambios_pendientes` (`entidad`, `entidad_id`, `operacion`) en una sola transacción, según `contracts/sync-contract.md` §Empuje, en `src/features/sync/queue.ts`

### Autenticación y navegación

- [X] T030 Implementar el proveedor de sesión de Supabase (sesión persistida, estado de carga, `signUp`/`signIn`/`signOut`) en `src/features/auth/AuthProvider.tsx`
- [X] T031 Definir las rutas de React Router y el guard de rutas privadas (FR-001: sin sesión no hay acceso) en `src/app/routes.tsx`
- [X] T032 Implementar el marco de la aplicación con navegación responsiva — Nav Item Horizontal en escritorio, Vertical en móvil (FR-004) — en `src/app/AppShell.tsx`

**Checkpoint**: Base lista — las historias de usuario pueden comenzar.

---

## Phase 3: User Story 1 - Crear mi primer viaje con presupuesto (Priority: P1) 🎯 MVP

**Goal**: Una persona nueva se registra, confirma sus categorías y crea su primer viaje con
presupuesto y moneda, quedando con un viaje activo listo para recibir gastos.

**Independent Test**: Abrir la app como usuario nuevo y llegar a ver el viaje creado con su
presupuesto en pantalla, sin registrar ningún gasto (quickstart.md, Escenario 1).

### Implementation for User Story 1

- [X] T033 [US1] Implementar el seed de las 8 categorías generales por cuenta nueva (Alojamiento, Comida, Transporte, Actividades, Compras, Salud, Telecom, Otro con `protegida = true`) en `src/features/categories/seed.ts`
- [X] T034 [P] [US1] Construir la pantalla de registro con correo y contraseña, sin pantallas de valor previas (FR-002), en `src/app/auth/RegistroPage.tsx`
- [X] T035 [P] [US1] Construir la pantalla de inicio de sesión en `src/app/auth/LoginPage.tsx`
- [X] T036 [US1] Construir el onboarding de categorías con grid de Chips todas en estado Selected y botón "Continuar" que avanza sin cambios (FR-003) en `src/app/onboarding/CategoriasOnboardingPage.tsx`
- [X] T037 [US1] Implementar la creación de viaje con validación de presupuesto > 0 y moneda del catálogo, escribiendo vía `src/features/sync/queue.ts`, en `src/features/trips/tripRepository.ts`
- [X] T038 [US1] Construir el formulario de nuevo viaje (nombre, destino, fecha de salida, fecha de regreso opcional, presupuesto, moneda) con mensajes de error en español y bloqueo de guardado si el presupuesto es 0 o vacío (FR-005 a FR-008) en `src/app/trips/NuevoViajePage.tsx`
- [X] T039 [US1] Implementar la selección del viaje mostrado por defecto (el viaje cuyo rango contiene hoy; si no hay, el último creado) como consulta reactiva de Dexie en `src/features/trips/useActiveTrip.ts`
- [X] T040 [US1] Construir el panel "viaje activo" del resumen con Card — Style: Subtle mostrando nombre, destino, fechas, presupuesto y moneda del viaje seleccionado en `src/app/dashboard/DashboardPage.tsx`
- [X] T041 [US1] Encadenar el flujo registro → categorías → nuevo viaje → resumen sin pantallas intermedias (FR-002) en `src/app/routes.tsx`

**Checkpoint**: US1 completamente funcional y verificable de forma independiente.

---

## Phase 4: User Story 2 - Registrar un gasto en segundos (Priority: P1)

**Goal**: Con un viaje activo, registrar un gasto (descripción, monto, categoría, fecha) y verlo
aparecer inmediatamente en el listado del viaje.

**Independent Test**: Con un viaje ya creado, registrar un gasto y verlo aparecer en el listado
del día correspondiente (quickstart.md, Escenario 2).

### Implementation for User Story 2

- [X] T042 [US2] Implementar la creación de gasto con validaciones (`monto > 0`, `descripcion` no vacía, `categoria_id` existente, moneda heredada del viaje sin preguntarla — FR-016) escribiendo vía `src/features/sync/queue.ts`, en `src/features/expenses/expenseRepository.ts`
- [X] T043 [US2] Construir la pantalla de gasto — Input Number (monto), Input Text (descripción), grid de Chips de categoría, Input Select (fecha precargada con hoy — FR-015), Button Primary Large "Guardar" y Button Secondary "Cancelar" — como pantalla única reutilizable para crear y editar (FR-018) en `src/app/expenses/GastoFormPage.tsx`
- [X] T044 [US2] Agregar el botón flotante de nuevo gasto (Icon Button — Style: Primary, Size: Large) al resumen en `src/app/dashboard/DashboardPage.tsx`
- [X] T045 [US2] Implementar la consulta reactiva de gastos del viaje seleccionado, aislada por `trip_id` (FR-012), en `src/features/expenses/useExpenses.ts`
- [X] T046 [US2] Construir el listado de gastos del viaje con List Item (descripción, categoría, monto, hora de registro) en `src/app/dashboard/ExpenseList.tsx`

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Ver cuánto llevo gastado y cuánto me queda (Priority: P1)

**Goal**: Al abrir la app, ver sin hacer nada más: total gastado, porcentaje del presupuesto,
monto disponible y días restantes.

**Independent Test**: Con un viaje y gastos cargados, abrir el resumen y verificar que los
cuatro números coincidan exactamente con los gastos registrados (quickstart.md, Escenario 3).

### Implementation for User Story 3

- [X] T047 [P] [US3] Implementar el cálculo puro de totales (gastado, disponible, porcentaje consumido) sobre enteros de unidad mínima en `src/features/budget-health/totals.ts`
- [X] T048 [P] [US3] Escribir pruebas unitarias de totales con los casos exactos de la spec (presupuesto 45.000 y gastos 18.750 → 42% y 26.250 disponible; 1.000.000 con 800.000 → 80%) y verificación de SC-008 en `tests/unit/totals.test.ts`
- [X] T049 [US3] Construir el bloque de resumen con monto gastado, porcentaje, disponible y Progress Bar — Style: Warning en `src/app/dashboard/BudgetSummary.tsx`
- [X] T050 [US3] Mostrar días restantes sobre días totales con Progress Bar — Style: Brand, únicamente cuando el viaje tiene fecha de regreso, y omitirlos en viajes abiertos (FR-032, FR-037) en `src/app/dashboard/BudgetSummary.tsx`
- [X] T051 [US3] Presentar el presupuesto excedido de forma inequívoca cuando el disponible sea cero o menor, con tratamiento `color-status-error` y texto explicativo en lugar de un número negativo suelto (FR-038) en `src/app/dashboard/BudgetSummary.tsx`

**Checkpoint**: El ciclo mínimo utilizable (US1 + US2 + US3) está completo — MVP entregable.

---

## Phase 6: User Story 4 - Saber si voy a sostener mi presupuesto (Priority: P2)

**Goal**: De un vistazo, saber cuánto se puede gastar por día de aquí en adelante y si ese
margen creció o se redujo respecto al planeado.

**Independent Test**: Con un viaje con fechas y gastos, verificar que el mensaje de salud y el
presupuesto diario restante cambien de forma coherente al agregar gastos (quickstart.md,
Escenario 4).

### Implementation for User Story 4

- [X] T052 [P] [US4] Implementar el cálculo puro de salud del presupuesto — diario planeado (presupuesto ÷ días totales), diario restante (disponible ÷ días restantes) y los cuatro estados canónicos con el umbral del 70% (FR-033 a FR-035) — en `src/features/budget-health/health.ts`
- [X] T053 [P] [US4] Escribir pruebas unitarias de salud del presupuesto cubriendo los cuatro estados, el caso de la spec (45.000/10 días/3 transcurridos/18.750 gastados → 3.750 vs 4.500 planeados = "Ojo con el ritmo"), viaje no comenzado, viaje abierto, último día y viaje terminado sin división por cero, en `tests/unit/health.test.ts`
- [X] T054 [US4] Construir el mensaje de salud en lenguaje natural con el monto disponible por día, usando `color-status-success` / `color-status-warning` / `color-status-error` y Progress Bar Success/Error, con los dos estados intermedios distinguidos por texto y no por color (FR-035, FR-036) en `src/app/dashboard/HealthMessage.tsx`
- [X] T055 [US4] Implementar los tres casos especiales de FR-037: viaje abierto (omitir días restantes, diario y salud), viaje aún no comenzado (mostrar solo el diario planeado, sin estado de salud) y viaje terminado (mostrar el resultado final gastado vs. presupuesto, reutilizando el tratamiento visual "Vas bien"/"Te pasaste del presupuesto" de FR-035/FR-038 en vez de una proyección de ritmo) en `src/app/dashboard/HealthMessage.tsx`

**Checkpoint**: US1–US4 funcionan de forma independiente.

---

## Phase 7: User Story 5 - Ver en qué se me está yendo la plata (Priority: P2)

**Goal**: Entender la composición del gasto por categoría y repasar los gastos de cada día.

**Independent Test**: Con gastos en varias categorías y en distintos días, verificar que el
desglose y el listado agrupado reflejen exactamente lo registrado (quickstart.md, Escenario 5).

### Implementation for User Story 5

- [X] T056 [P] [US5] Implementar el cálculo puro de acumulado por categoría ordenado de mayor a menor y la agrupación de gastos por día con subtotal (FR-040, FR-041) en `src/features/expenses/breakdown.ts`
- [X] T057 [P] [US5] Escribir pruebas unitarias de desglose y agrupación (orden descendente, subtotales por día, categorías sin gastos excluidas) en `tests/unit/breakdown.test.ts`
- [X] T058 [US5] Construir el desglose comparativo por categoría con Progress Bar y monto acumulado por cada una en `src/app/dashboard/CategoryBreakdown.tsx`
- [X] T059 [US5] Actualizar el listado de gastos para agruparlo por día con encabezado de fecha y subtotal diario en `src/app/dashboard/ExpenseList.tsx`
- [X] T060 [US5] Construir el estado vacío que invita a registrar el primer gasto con Card — Style: Subtle (FR-044) en `src/app/dashboard/EmptyExpenses.tsx`

**Checkpoint**: US1–US5 funcionan de forma independiente.

---

## Phase 8: User Story 6 - Que la categoría se complete sola (Priority: P2)

**Goal**: Al escribir la descripción del gasto, la categoría correcta queda preseleccionada sola,
resuelta en el dispositivo y sin conexión.

**Independent Test**: Escribir distintas descripciones en el formulario de gasto y verificar que
la categoría preseleccionada cambie de forma coherente, sin guardar nada (quickstart.md,
Escenario 6).

### Implementation for User Story 6

- [X] T061 [P] [US6] Construir el diccionario base de palabras clave en español LATAM para las 8 categorías generales (vocabulario habitual de viaje) en `src/features/categorization/dictionary.ts`
- [X] T062 [P] [US6] Implementar la normalización de texto (minúsculas, sin tildes, tokenización por palabras) en `src/features/categorization/normalize.ts`
- [X] T063 [US6] Implementar la resolución de categoría con el orden de precedencia asociaciones aprendidas → diccionario base → "Otro" (FR-021, FR-023) en `src/features/categorization/suggest.ts`
- [X] T064 [US6] Implementar el registro de la corrección como asociación aprendida con upsert por (`user_id`, `termino`), donde la corrección más reciente prevalece (FR-022, Edge Cases), escribiendo vía `src/features/sync/queue.ts`, en `src/features/categorization/learn.ts`
- [X] T065 [P] [US6] Escribir pruebas unitarias de categorización ("compré una hamburguesa" → Comida; descripción no interpretable → Otro; asociación aprendida gana sobre el diccionario; corrección más reciente gana) en `tests/unit/categorization.test.ts`
- [X] T066 [US6] Integrar la preselección automática en el formulario de gasto y marcar `categoria_elegida_manualmente` al tocar una categoría, deteniendo desde ahí toda actualización automática (FR-024) en `src/app/expenses/GastoFormPage.tsx`

**Checkpoint**: US1–US6 funcionan de forma independiente.

---

## Phase 9: User Story 7 - Corregir o borrar un gasto (Priority: P3)

**Goal**: Editar un gasto en la misma pantalla con la que se registra, precargada, y eliminarlo
con confirmación explícita.

**Independent Test**: Editar un gasto existente y verificar que los totales se actualicen;
eliminar otro y verificar que desaparezca del listado y de los totales (quickstart.md,
Escenario 7).

### Implementation for User Story 7

- [X] T067 [US7] Implementar la actualización y la eliminación permanente de un gasto, encolando los cambios vía `src/features/sync/queue.ts`, en `src/features/expenses/expenseRepository.ts`
- [X] T068 [US7] Construir el diálogo de confirmación destructiva reutilizable con Button — Style: Danger y texto de advertencia en `color-status-error` en `src/components/ConfirmDialog.tsx`
- [X] T069 [US7] Habilitar el modo edición del formulario de gasto precargando monto, descripción, categoría y fecha guardados, tratando la categoría guardada como elección manual para que editar la descripción no la reemplace (FR-018, FR-024) en `src/app/expenses/GastoFormPage.tsx`
- [X] T070 [US7] Conectar la eliminación de gasto desde el listado con `src/components/ConfirmDialog.tsx`, advirtiendo que la acción es permanente (FR-019) en `src/app/dashboard/ExpenseList.tsx`

**Checkpoint**: US1–US7 funcionan de forma independiente.

---

## Phase 10: User Story 8 - Buscar y filtrar mis gastos (Priority: P3)

**Goal**: Encontrar un gasto puntual por texto o acotar el listado a un rango de fechas.

**Independent Test**: Con varios gastos cargados, buscar por texto y acotar por rango de fechas,
verificando que los resultados correspondan.

### Implementation for User Story 8

- [X] T071 [US8] Implementar el filtrado puro de gastos por texto (coincidencia contra descripción y nombre de categoría, texto normalizado) y por rango de fechas (FR-042, FR-043) en `src/features/expenses/search.ts`
- [X] T072 [P] [US8] Escribir pruebas unitarias de búsqueda y filtro (coincidencia por descripción, por categoría, límites inclusivos del rango de fechas, sin coincidencias) en `tests/unit/search.test.ts`
- [X] T073 [US8] Construir la pantalla de búsqueda con Input — Type: Text, Show Label: false e icono Search, dos Input — Type: Select para el rango de fechas, y List Item para los resultados, en `src/app/search/BuscarPage.tsx`
- [X] T074 [US8] Agregar el estado vacío de "sin resultados" con Card — Style: Subtle y la acción de limpiar la búsqueda/filtro para volver al listado completo (FR-044) en `src/app/search/BuscarPage.tsx`

**Checkpoint**: US1–US8 funcionan de forma independiente.

---

## Phase 11: User Story 9 - Ajustar mis categorías (Priority: P3)

**Goal**: Crear una categoría propia, renombrar una existente o eliminar una que no se usa.

**Independent Test**: Crear una categoría nueva, verificar que aparezca al registrar un gasto, e
intentar eliminar una categoría que ya tiene gastos asociados.

### Implementation for User Story 9

- [X] T075 [US9] Implementar crear, renombrar y eliminar categorías con las reglas de bloqueo (rechazar si `protegida = true`, rechazar si existe al menos un gasto asociado, nombre único por usuario) y la eliminación en cascada de sus asociaciones aprendidas, encolando los cambios vía `src/features/sync/queue.ts`, en `src/features/categories/categoryRepository.ts`
- [X] T076 [US9] Construir la pantalla de gestión de categorías con List Item (emoji + nombre), Input — Type: Text para crear/renombrar y Icon Button — Style: Secondary (Trash) para eliminar, en `src/app/categories/CategoriasPage.tsx`
- [X] T077 [US9] Mostrar el mensaje explicativo del bloqueo cuando la categoría está en uso o es "Otro", y confirmar la eliminación con `src/components/ConfirmDialog.tsx` (FR-028) en `src/app/categories/CategoriasPage.tsx`

**Checkpoint**: US1–US9 funcionan de forma independiente.

---

## Phase 12: User Story 10 - Consultar y depurar mis viajes anteriores (Priority: P3)

**Goal**: Alternar entre el viaje actual y los anteriores, editarlos, y eliminar un viaje que ya
no interesa conservar.

**Independent Test**: Con dos o más viajes creados, alternar entre ellos y verificar que cada uno
muestre exclusivamente sus propios gastos y presupuesto (quickstart.md, Escenario 10).

### Implementation for User Story 10

- [X] T078 [US10] Implementar el listado de viajes del usuario y la persistencia local del viaje seleccionado en `src/features/trips/useTrips.ts`
- [X] T079 [US10] Construir el selector de viaje en el resumen, garantizando que todos los números y gastos correspondan exclusivamente al viaje elegido (FR-013, FR-012) en `src/app/dashboard/TripSwitcher.tsx`
- [X] T080 [US10] Construir la edición de viaje (nombre, destino, fechas y presupuesto editables; moneda deshabilitada e inmutable con explicación) que recalcula todas las métricas al guardar (FR-009, FR-010, FR-011) en `src/app/trips/EditarViajePage.tsx`
- [X] T081 [US10] Implementar la eliminación de viaje con borrado en cascada de todos sus gastos y sin afectar las categorías de la cuenta (FR-054), encolando los cambios vía `src/features/sync/queue.ts`, en `src/features/trips/tripRepository.ts`
- [X] T082 [US10] Conectar la eliminación con una confirmación que indique cuántos gastos se van a perder y advierta que es permanente, y tras completarla reseleccionar el viaje por defecto o mostrar el estado vacío que invita a crear un viaje (FR-053, Edge Cases) en `src/app/dashboard/TripSwitcher.tsx`

**Checkpoint**: Las 10 historias de usuario funcionan de forma independiente.

---

## Phase 13: Requisitos transversales — sincronización, offline y privacidad

**Purpose**: Requisitos funcionales que no pertenecen a una sola historia de usuario y aplican a
todas: FR-045 a FR-049 (conectividad) y FR-055/FR-056 (privacidad). Se validan con los Escenarios
8 y 10 de `quickstart.md`.

- [X] T083 Implementar el empuje de la cola de cambios pendientes hacia Supabase (`insert`/`update`/`delete` por tabla, eliminación de la fila de la cola solo tras éxito, permanencia en la cola ante fallo — FR-049) en `src/features/sync/push.ts`
- [X] T084 Implementar la extracción desde Supabase con reconciliación por comparación de listas completas (lo ausente en el servidor se elimina localmente) y resolución de conflictos por `updated_at` más reciente, según `contracts/sync-contract.md`, en `src/features/sync/pull.ts`
- [X] T085 Implementar los disparadores automáticos de sincronización (evento `online` del navegador y apertura de la app con conexión), sin ninguna acción de la persona (FR-047), en `src/features/sync/useSync.ts`
- [X] T086 Construir el indicador visible con los tres estados "Todo sincronizado" / "Cambios pendientes" / "Sincronizando", derivados del tamaño de la cola y del intento en curso (FR-048), en `src/features/sync/SyncIndicator.tsx`
- [X] T087 Configurar el service worker para precachear la interfaz y permitir abrir la app sin conexión (FR-045), verificando que el resumen se recalcula offline (FR-046), en `vite.config.ts`
- [X] T088 Implementar la Edge Function `delete-account` que verifica el JWT de la sesión, borra gastos/viajes/asociaciones/categorías de ese `user_id` y finalmente el usuario de `auth.users` con el cliente de rol de servicio, respondiendo 200/401/500 según `contracts/delete-account-function.md`, en `supabase/functions/delete-account/index.ts`
- [X] T089 Construir la pantalla de cuenta con eliminación de cuenta: confirmación explícita de acción permanente e irreversible, invocación de la función, y limpieza completa de IndexedDB más cierre de sesión tras el éxito (FR-055, FR-056) en `src/app/account/CuentaPage.tsx`

**Checkpoint**: La app funciona igual con y sin conexión, y la persona puede borrar su cuenta.

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final del producto completo contra los criterios de éxito y los
principios de la constitución.

- [X] T090 [P] Escribir la prueba de humo del camino dorado P1 (crear cuenta → crear viaje → registrar gasto → ver resumen con los números correctos) en `tests/e2e/camino-dorado.spec.ts`
- [X] T091 [P] Verificar que las mismas tareas se completan y muestran información idéntica en móvil y escritorio (SC-005) revisando el layout responsivo en `src/app/AppShell.tsx`
- [X] T092 [P] Revisar que todo el contenido visible (etiquetas, mensajes de error, estados vacíos, confirmaciones) esté en español LATAM (Principio II) recorriendo `src/app/` y `src/components/`
- [X] T093 Auditar que ningún componente use valores de color, espaciado o tipografía fuera de los tokens semánticos (Principio VI) revisando `src/components/` contra `.specify/memory/design-system.md`
- [X] T094 [P] Documentar la instalación, las variables de entorno y el despliegue en Vercel (sin ningún secreto en el repositorio — Principio V) en `README.md`
- [ ] T095 Ejecutar de principio a fin los 10 escenarios de validación manual descritos en `specs/001-tripflow-v0/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — puede comenzar de inmediato.
- **Foundational (Phase 2)**: depende de Setup. **BLOQUEA todas las historias de usuario.**
- **User Stories (Phase 3–12)**: todas dependen de Foundational. Después pueden avanzar en
  paralelo (si hay equipo) o secuencialmente en orden de prioridad (P1 → P2 → P3).
- **Transversales (Phase 13)**: depende de Foundational (T029, la cola de cambios). Puede
  ejecutarse en paralelo a las historias P2/P3, porque no modifica los mismos archivos.
- **Polish (Phase 14)**: depende de que estén completas todas las historias deseadas.

### User Story Dependencies

- **US1 (P1)**: solo depende de Foundational. Sin dependencias con otras historias.
- **US2 (P1)**: solo depende de Foundational. Para probarla hace falta un viaje, que puede
  crearse por US1 o sembrarse manualmente.
- **US3 (P1)**: solo depende de Foundational. Para probarla hacen falta gastos, que pueden
  crearse por US2 o sembrarse manualmente.
- **US4 (P2)**: independiente; comparte el módulo `features/budget-health/` con US3 pero en
  archivos distintos (`health.ts` vs `totals.ts`).
- **US5 (P2)**: independiente; T059 evoluciona el listado creado en US2 (T046).
- **US6 (P2)**: independiente; T066 evoluciona el formulario creado en US2 (T043).
- **US7 (P3)**: independiente; T069 evoluciona el formulario creado en US2 (T043).
- **US8 (P3)**: totalmente independiente (pantalla propia).
- **US9 (P3)**: independiente; usa el `ConfirmDialog` creado en US7 (T068).
- **US10 (P3)**: independiente; usa el `ConfirmDialog` creado en US7 (T068).

> Las evoluciones marcadas arriba (T059, T066, T069) son ampliaciones de un archivo existente,
> no dependencias funcionales: cada historia sigue siendo verificable por sí sola.

### Within Each User Story

- Cálculo puro y repositorio antes que pantalla.
- Pruebas unitarias en paralelo con el cálculo puro que verifican.
- Historia completa antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- **Phase 1**: T002–T008 en paralelo tras T001 (7 tareas simultáneas).
- **Phase 2**: T012–T020 (9 componentes del catálogo) en paralelo tras T011; T021–T025
  (utilidades puras y sus pruebas) en paralelo entre sí y con los componentes — hasta 14 tareas
  simultáneas.
- **Phase 3**: T034 y T035 (registro e inicio de sesión) en paralelo.
- **Phase 5/6/7/8**: cálculo puro y su prueba unitaria en paralelo (T047+T048, T052+T053,
  T056+T057, T071+T072).
- **Phase 8**: T061 y T062 en paralelo; T065 en paralelo con la integración.
- **Phase 14**: T090, T091, T092 y T094 en paralelo.
- Con equipo: tras Foundational, las 10 historias pueden repartirse simultáneamente.

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Tras T011 (tokens mapeados en Tailwind), los 9 componentes del catálogo en paralelo:
Task: "Implementar Icon en src/components/Icon.tsx"
Task: "Implementar Button en src/components/Button.tsx"
Task: "Implementar Input en src/components/Input.tsx"
Task: "Implementar Chip en src/components/Chip.tsx"
Task: "Implementar Card en src/components/Card.tsx"
Task: "Implementar List Item en src/components/ListItem.tsx"
Task: "Implementar Progress Bar en src/components/ProgressBar.tsx"
Task: "Implementar Nav Item en src/components/NavItem.tsx"
Task: "Implementar Icon Button en src/components/IconButton.tsx"

# Simultáneamente, las utilidades puras y sus pruebas:
Task: "Implementar aritmética de dinero en src/lib/money.ts"
Task: "Implementar utilidades de fecha en src/lib/dates.ts"
Task: "Definir catálogo de monedas en src/lib/currencies.ts"
Task: "Pruebas unitarias de dinero en tests/unit/money.test.ts"
Task: "Pruebas unitarias de fechas en tests/unit/dates.test.ts"
```

## Parallel Example: User Story 4

```bash
# Cálculo puro y su prueba, en paralelo:
Task: "Implementar salud del presupuesto en src/features/budget-health/health.ts"
Task: "Pruebas unitarias de salud en tests/unit/health.test.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

El MVP de Tripflow **no es US1 sola**: la propia spec define US1, US2 y US3 las tres como P1 y
describe su conjunto como "el ciclo mínimo utilizable". Un viaje creado sin poder registrar
gastos ni ver el resumen no entrega el valor central del producto ("saber si voy a sostener mi
presupuesto").

1. Phase 1: Setup (T001–T008)
2. Phase 2: Foundational (T009–T032) — **crítico, bloquea todo**
3. Phase 3: US1 (T033–T041)
4. Phase 4: US2 (T042–T046)
5. Phase 5: US3 (T047–T051)
6. **DETENERSE Y VALIDAR**: Escenarios 1, 2 y 3 de `quickstart.md`
7. Desplegar/demostrar

Si hace falta un corte todavía más chico para una demo temprana, US1 sola (hasta T041) ya es
verificable de forma independiente y sirve como primer checkpoint.

### Incremental Delivery

1. Setup + Foundational → base lista
2. + US1, US2, US3 → **MVP** → validar Escenarios 1–3 → desplegar
3. + US4, US5, US6 (P2) → validar Escenarios 4, 5, 6 → desplegar
4. + Phase 13 (sincronización y offline) → validar Escenario 8 → desplegar
5. + US7, US8, US9, US10 (P3) → validar Escenarios 7 y 10 → desplegar
6. + Phase 14 (Polish) → validar `quickstart.md` completo

Cada incremento agrega valor sin romper los anteriores.

### Parallel Team Strategy

Con varias personas desarrollando:

1. El equipo completo hace Setup + Foundational (los 9 componentes del catálogo y las utilidades
   puras se reparten bien).
2. Terminada la base:
   - Persona A: US1 → US4 (viajes y salud del presupuesto)
   - Persona B: US2 → US6 → US7 (gastos y categorización)
   - Persona C: US3 → US5 → US8 (resumen, desglose y búsqueda)
   - Persona D: Phase 13 (sincronización, offline y borrado de cuenta) → US9 → US10
3. Las historias se integran de forma independiente.

---

## Notes

- Tareas [P] = archivos distintos, sin dependencias pendientes.
- La etiqueta [Story] mapea cada tarea a su historia para trazabilidad.
- Toda escritura de datos pasa por `src/features/sync/queue.ts` (T029): guarda en IndexedDB y
  encola el cambio en la misma transacción. Ninguna pantalla escribe directo contra Supabase.
- Todos los montos se manejan como enteros en la unidad mínima de la moneda; nunca decimales.
- Toda la interfaz usa exclusivamente componentes y tokens de `.specify/memory/design-system.md`
  (Principio VI); la única extensión permitida ya está registrada en T009.
- Todo el contenido visible va en español LATAM (Principio II).
- Ningún secreto vive en el repositorio; la clave de rol de servicio solo existe como secreto del
  proyecto de Supabase, usada por T088 (Principio V).
- Hacer commit tras cada tarea o grupo lógico; detenerse en cada checkpoint para validar la
  historia de forma independiente.
