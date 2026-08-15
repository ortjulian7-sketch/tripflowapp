---

description: "Task list for Introducción explicativa antes de elegir categorías"
---

# Tasks: Introducción explicativa antes de elegir categorías

**Input**: Design documents from `/specs/005-onboarding-intro/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Alcance acotado, igual que define `plan.md` (sección Testing): no se introduce ninguna
función pura de negocio nueva (el paso actual de la introducción es estado de UI, igual que la
selección de categorías en `003-landing-nav-redesign`), así que no hay tareas Vitest nuevas. Sí se
**extiende** la prueba de humo Playwright existente (`tests/e2e/camino-dorado.spec.ts`) para pasar
por la introducción — recorriéndola entera en un camino dorado y saltándola en el otro — antes de
llegar a categorías. El resto de los criterios de aceptación se valida manualmente con
`quickstart.md` (Principio IV).

**Organization**: Las tareas están agrupadas por historia de usuario para permitir implementación
y validación independientes de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3)
- Cada tarea incluye la ruta exacta del archivo

## Path Conventions

Mismo proyecto único (SPA/PWA) ya existente (`src/`, `tests/`, `public/` en la raíz del
repositorio). Esta feature no agrega ninguna dependencia, tabla ni servicio nuevo (`plan.md` §
Technical Context) — no hay fase de Setup, se empieza directo en Foundational. Los 4 assets SVG
(`public/icons/onboarding-*.svg`) y las secciones "Onboarding Illustration"/"Step Indicator" de
`.specify/memory/design-system.md` ya existen (generados durante `/speckit-plan`) — ninguna tarea
de esta lista los recrea.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: El único bloque compartido que necesita la introducción antes de poder construirse:
el indicador de 4 puntos que documenta `.specify/memory/design-system.md` § Step Indicator.

**⚠️ CRITICAL**: Ninguna historia de usuario puede darse por completa hasta que este componente
exista — `IntroOnboardingPage` (US1) lo usa desde su primera versión.

- [X] T001 [P] Crear `src/components/StepIndicator.tsx` per `.specify/memory/design-system.md` §
      Step Indicator: props `total: number` (cantidad de pasos) y `activo: number` (índice
      0-based); renderiza una fila de `total` puntos — el punto en el índice `activo` es una
      píldora de 20×6px (`bg-icon-brand`, `rounded-full`), el resto son círculos de 6×6px
      (`bg-surface-selected`, `rounded-full`); no interactivo, sin `onClick` (ver Don'ts del
      catálogo)

**Checkpoint**: Base lista — las historias de usuario pueden comenzar.

---

## Phase 3: User Story 1 - Ver una introducción antes de elegir categorías (Priority: P1) 🎯 MVP

**Goal**: Una persona que completa el registro o elige "Continuar como invitado" ve una
introducción de 4 pasos antes de la selección de categorías, y al recorrerla entera llega a
`CategoriasOnboardingPage` ya existente, sin cambios en su comportamiento actual.

**Independent Test**: Completar el registro (o elegir invitado), recorrer los 4 pasos de la
introducción con "Empezar"/"Siguiente", y verificar que el paso 4 lleva a la selección de
categorías (`quickstart.md` Escenarios 1 y 3).

### Implementation for User Story 1

- [X] T002 [US1] Crear `src/app/onboarding/IntroOnboardingPage.tsx`: constante local `PASOS:
      PasoOnboardingIntro[]` con los 4 pasos de `research.md` §1 (`ilustracion`, `titulo`,
      `subtitulo`, `ctaLabel`) — paso 1 con el título traducido al español LATAM (Principio II; el
      Figma trae "Plan less. Travel more." en inglés, p. ej. "Planea menos. Viaja más."), pasos 2
      a 4 tal cual el Figma (ya en español); estado `useState<number>(0)` para el paso actual;
      `useLocation()` para leer `location.state?.cuentaNueva`; renderiza `StepIndicator`
      (`total={4}` `activo={paso}`), la ilustración del paso actual como `<img>` 140×140 inline
      (sin componente `OnboardingIllustration` separado — Principio I, ver nota en `plan.md`),
      título (Catamaran SemiBold 34px) y subtítulo (`color-text-secondary`), y el CTA (`Button
      variant="primary" size="large"`) con el label de `ctaLabel`: en los pasos 0-2 hace
      `setPaso(paso + 1)`; en el paso 3 navega con `navigate('/onboarding/categorias', { replace:
      true, state: { cuentaNueva: locationState?.cuentaNueva } })`
      (`contracts/onboarding-intro-gate-contract.md`); todavía sin botón "Saltar" (lo agrega T008,
      US2) (depende de T001)
- [X] T003 [US1] En `src/app/routes.tsx`: importar `IntroOnboardingPage`; agregar `<Route
      path="/onboarding/intro" element={<IntroOnboardingPage />} />` dentro del grupo `<Route
      element={<Bootstrap />}>`, antes de `/onboarding/categorias`; actualizar `Bootstrap()` según
      `contracts/onboarding-intro-gate-contract.md`: la condición que evita el rebote crece a
      `location.pathname === '/onboarding/intro' || location.pathname === '/onboarding/categorias'`,
      y el destino por defecto del `<Navigate>` pasa de `/onboarding/categorias` a
      `/onboarding/intro` (mismo `state={{ cuentaNueva: !isGuest }}`) (depende de T002)
- [X] T004 [P] [US1] En `src/app/bienvenida/BienvenidaPage.tsx`: `handleContinuarComoInvitado`
      navega a `/onboarding/intro` en vez de `/onboarding/categorias` (línea 13), mismo `{
      replace: true }` (depende de T003)
- [X] T005 [P] [US1] En `src/app/auth/LoginPage.tsx`: `handleContinuarComoInvitado` navega a
      `/onboarding/intro` en vez de `/onboarding/categorias` (línea 90), mismo `{ replace: true }`
      (depende de T003)
- [X] T006 [P] [US1] En `src/app/auth/RegistroPage.tsx`: los 5 `navigate('/onboarding/categorias',
      ...)` existentes (líneas 54 y 62 dentro de `handleSubmit`, línea 75 en `confirmarIncluir` y
      línea 83 en `confirmarDescartar` — los 3 con `state: { cuentaNueva: true }` — más la línea
      88 en `handleContinuarComoInvitado`, sin `cuentaNueva`) pasan a navegar a
      `/onboarding/intro`, preservando cada `state` tal cual
      (`contracts/onboarding-intro-gate-contract.md`) (depende de T003)
- [X] T007 [US1] Extender `tests/e2e/camino-dorado.spec.ts` (primer test, "camino dorado:
      bienvenida → crear cuenta…"): tras "Crear cuenta" (línea 24), antes del assert del heading
      "Tus categorías" (línea 27), recorrer los 4 pasos de la introducción — clic en "Empezar",
      dos clics en "Siguiente", clic en "Seleccionar mis categorías" — (`quickstart.md` Escenario
      3) (depende de T002, T003, T006)

**Checkpoint**: US1 completamente funcional y verificable de forma independiente (`quickstart.md`
Escenarios 1 y 3). Nota: el botón "Saltar" (`FR-003`) llega recién en Phase 4 (US2) — no bloquea
este checkpoint, que solo exige que la introducción exista y termine en categorías.

---

## Phase 4: User Story 2 - Saltar la introducción rápido (Priority: P1)

**Goal**: Desde cualquiera de los 4 pasos de la introducción, la persona puede saltarla y llegar
directo a la selección de categorías.

**Independent Test**: Desde cualquier paso de la introducción, tocar "Saltar" y verificar que se
llega directo a categorías sin recorrer el resto del contenido (`quickstart.md` Escenario 2).

### Implementation for User Story 2

- [X] T008 [US2] En `src/app/onboarding/IntroOnboardingPage.tsx`: agregar el botón "Saltar" (texto
      plano `color-text-secondary`, esquina superior derecha, mismo patrón de link que
      `LoginPage`/`RegistroPage`/`DashboardPage` — `plan.md` § UI Components), visible en los
      pasos 0-2 y oculto en el paso 3 (`contracts/onboarding-intro-gate-contract.md`); `onClick`
      navega igual que el CTA del paso 3: `navigate('/onboarding/categorias', { replace: true,
      state: { cuentaNueva: locationState?.cuentaNueva } })` (depende de T002)
- [X] T009 [US2] Extender `tests/e2e/camino-dorado.spec.ts` (segundo test, "camino dorado sin
      cuenta…"): tras "Continuar como invitado" (línea 75), antes del assert del heading "Tus
      categorías" (línea 78), tocar "Saltar" en el paso 1 de la introducción en vez de recorrerla
      (`quickstart.md` Escenario 2) (depende de T004, T008)

**Checkpoint**: US1 + US2 completamente funcionales y verificables de forma independiente
(`quickstart.md` Escenarios 1 a 3).

---

## Phase 5: User Story 3 - Entender las capacidades clave de la app (Priority: P2)

**Goal**: El contenido de la introducción explica, en lenguaje simple, qué es Tripflow (control
de presupuesto de viaje) y sus 3 capacidades clave: registrar gastos, ver el presupuesto
disponible, y categorizar.

**Independent Test**: Recorrer la introducción completa y verificar que menciona explícitamente
las tres capacidades (`quickstart.md` Escenario 1).

### Implementation for User Story 3

- [X] T010 [US3] Validar que el contenido de los 4 pasos en `src/app/onboarding/IntroOnboardingPage.tsx`
      (T002) cubre explícitamente las 3 capacidades de `FR-002` — registrar gastos (subtítulo paso
      4), ver presupuesto disponible (subtítulo paso 1), categorizar (título/subtítulo paso 2) — y
      que el título del paso 1 quedó en español LATAM (Principio II); sin código nuevo, checklist
      manual siguiendo `research.md` §1 y `quickstart.md` Escenario 1 paso 2 (depende de T002)

**Checkpoint**: Las tres historias de usuario funcionan de forma independiente (`quickstart.md`
Escenarios 1 a 3).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final contra los criterios de éxito y los principios de la
constitución.

- [X] T011 [P] Ejecutar de punta a punta los 5 escenarios de `specs/005-onboarding-intro/quickstart.md`
      (Principio IV), incluyendo el Escenario 4 (mostrarse una sola vez / interrupción a mitad) y
      el Escenario 5 (sin conexión, `FR-008`)
- [X] T012 [P] Revisar que todo el texto nuevo de `IntroOnboardingPage.tsx` esté en español LATAM
      (Principio II), confirmando en particular la traducción del título del paso 1 (T002, T010)
- [X] T013 [P] Auditar que `StepIndicator` y la ilustración inline de `IntroOnboardingPage.tsx`
      usen exclusivamente tokens ya documentados en `.specify/memory/design-system.md` § Onboarding
      Illustration / § Step Indicator (Principio VI), y que `Button` se reutilice sin ninguna
      modificación (`research.md` §4)
- [X] T014 Ejecutar `tsc`/typecheck y el lint del proyecto de punta a punta, confirmando que
      `routes.tsx` (T003) y los 5 call sites actualizados de `RegistroPage.tsx` (T006) compilan
      sin errores de tipos

**Checkpoint**: Feature completa y verificada contra `spec.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: sin dependencias — puede comenzar de inmediato. **BLOQUEA todas las
  historias de usuario** (`IntroOnboardingPage` necesita `StepIndicator` desde su primera
  versión).
- **User Stories (Phase 3-5)**: todas dependen de Foundational. Después avanzan en orden de
  prioridad (P1 → P1 → P2); US2 depende del archivo creado en US1 (mismo componente,
  `IntroOnboardingPage.tsx`), y US3 es una validación de contenido sobre lo ya construido en US1,
  sin código propio.
- **Polish (Phase 6)**: depende de que estén completas las tres historias.

### User Story Dependencies

- **User Story 1 (P1)**: puede empezar después de Foundational (Phase 2). Sin dependencia de otra
  historia.
- **User Story 2 (P1)**: puede empezar después de Foundational, pero sus tareas modifican el
  archivo que crea US1 (`IntroOnboardingPage.tsx`) — en la práctica se implementa después de T002.
- **User Story 3 (P2)**: depende de que el contenido de US1 (T002) ya exista — es una validación,
  no agrega código.

### Parallel Opportunities

- T001 (Foundational) no tiene dependencias — puede arrancar de inmediato.
- Dentro de US1: T004, T005 y T006 tocan archivos distintos (`BienvenidaPage.tsx`,
  `LoginPage.tsx`, `RegistroPage.tsx`) y pueden ejecutarse en paralelo una vez completado T003.
- Toda la Phase 6 (T011-T013) puede ejecutarse en paralelo entre sí; T014 depende de que el resto
  del código (T001-T010) ya esté escrito.

---

## Parallel Example: User Story 1

```bash
# Una vez completado T003 (ruta + gate en routes.tsx), actualizar los 3 puntos de entrada en paralelo:
Task: "En src/app/bienvenida/BienvenidaPage.tsx: handleContinuarComoInvitado navega a /onboarding/intro"
Task: "En src/app/auth/LoginPage.tsx: handleContinuarComoInvitado navega a /onboarding/intro"
Task: "En src/app/auth/RegistroPage.tsx: los 5 navigate(...) pasan a /onboarding/intro"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Completar Phase 2: Foundational.
2. Completar Phase 3: User Story 1 (la introducción existe y termina en categorías).
3. Completar Phase 4: User Story 2 (saltar funciona) — ambas son P1, así que el MVP real de
   `spec.md` incluye las dos: sin "Saltar" la introducción es fricción obligatoria (`FR-003`).
4. **STOP and VALIDATE**: correr `quickstart.md` Escenarios 1, 2 y 3.
5. Deploy/demo si está listo.

### Incremental Delivery

1. Completar Foundational → base lista.
2. Agregar US1 → introducción visible, termina en categorías → validar independientemente.
3. Agregar US2 → "Saltar" funcional desde cualquier paso → validar independientemente.
4. Agregar US3 → confirmar cobertura de contenido (sin código nuevo) → validar independientemente.
5. Cada historia agrega valor sin romper la anterior.

---

## Notes

- [P] tasks = archivos distintos, sin dependencias pendientes.
- [Story] label mapea cada tarea a su historia de usuario para trazabilidad.
- US3 no agrega código propio: valida contenido ya escrito en T002 (US1) — mismo patrón que US4 en
  `003-landing-nav-redesign/tasks.md`.
- Verificar que el proyecto sigue compilando y que el lint pasa tras cada tarea de Phase 3.
- Detenerse en cada checkpoint para validar la historia de forma independiente.
