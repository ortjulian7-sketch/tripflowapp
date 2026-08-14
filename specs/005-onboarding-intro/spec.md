# Feature Specification: Introducción explicativa antes de elegir categorías

**Feature Branch**: `005-onboarding-intro`

**Created**: 2026-08-13

**Status**: Draft

**Input**: "Hoy, apenas una persona termina de registrarse o de elegir 'continuar como invitado', cae
directo en CategoriasOnboardingPage.tsx: una única pantalla de selección de categorías, sin ninguna
introducción previa que explique qué es Tripflow o cómo se usa. No existe ningún onboarding
explicativo en el código ni en ningún spec anterior (001-tripflow-v0 y 002-guest-mode-sync solo
mencionan 'elegir categorías, crea su primer viaje'). Se necesita agregar, antes de la selección de
categorías, un onboarding breve que explique de forma simple qué es la app (control de presupuesto
de viaje) y cómo funciona (registrar gastos, ver el presupuesto disponible, categorizar), terminando
en la pantalla de selección de categorías que ya existe hoy (sin cambiar su lógica de selección, ya
corregida en 003-landing-nav-redesign). Debe aplicar tanto para quienes se registran con cuenta
nueva como para quienes continúan como invitados, reusando el sistema de diseño y los patrones
visuales ya establecidos, y debe poder omitirse/saltarse rápido para quienes ya conocen la app o no
quieren leerlo."

## Contexto

Hoy el encadenado registro/invitado → categorías → primer viaje (definido en `002-guest-mode-sync`
y con la lógica de selección corregida en `003-landing-nav-redesign`) no incluye ningún paso que
explique qué es Tripflow o para qué sirve: una persona nueva llega directo a elegir categorías sin
ningún contexto sobre la app. Esta especificación agrega un paso explicativo breve entre el punto de
entrada (registro o invitado) y la selección de categorías ya existente, sin modificar el
comportamiento de esta última.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver una introducción antes de elegir categorías (Priority: P1)

Una persona que acaba de completar su registro o elegir "Continuar como invitado" ve una breve
introducción que le explica qué es Tripflow y cómo se usa, antes de llegar a la pantalla de
selección de categorías.

**Why this priority**: Es el pedido explícito de la especificación — hoy no existe ningún paso
explicativo, y sin este no hay nada que implementar.

**Independent Test**: Completar el registro (o elegir invitado) y verificar que aparece la
introducción antes de `CategoriasOnboardingPage`, y que al terminarla se llega a la selección de
categorías tal como funciona hoy.

**Acceptance Scenarios**:

1. **Given** una persona que completa el registro exitosamente, **When** termina ese paso, **Then**
   ve la introducción antes de llegar a la selección de categorías.
2. **Given** una persona que elige "Continuar como invitado", **When** lo hace, **Then** ve la misma
   introducción antes de llegar a la selección de categorías.
3. **Given** la introducción visible, **When** la persona la recorre hasta el final, **Then** llega
   a la pantalla de selección de categorías ya existente, sin cambios en su comportamiento actual.

---

### User Story 2 - Saltar la introducción rápido (Priority: P1)

Una persona que ya conoce la app, o que no quiere leer la introducción, la salta y llega directo a
la selección de categorías.

**Why this priority**: Pedido explícito de la especificación — sin una salida rápida, la
introducción se vuelve una fricción obligatoria para quienes no la necesitan, en lugar de una ayuda
opcional.

**Independent Test**: Desde cualquier paso de la introducción, tocar la opción de saltar y verificar
que se llega directo a la selección de categorías sin necesidad de recorrer el resto del contenido.

**Acceptance Scenarios**:

1. **Given** la introducción visible en cualquiera de sus pasos, **When** la persona toca la opción
   de saltar, **Then** llega directo a la pantalla de selección de categorías.

---

### User Story 3 - Entender las capacidades clave de la app (Priority: P2)

Una persona que recorre la introducción entiende, en lenguaje simple, que Tripflow sirve para
controlar el presupuesto de un viaje, y cómo se usa día a día: registrar gastos, ver cuánto
presupuesto queda disponible, y clasificar cada gasto por categoría.

**Why this priority**: Define el contenido mínimo que la introducción debe cubrir para cumplir su
propósito — es secundaria frente a que el paso exista y se pueda saltar (Historias 1 y 2), pero sin
este contenido específico la introducción no cumple su objetivo real.

**Independent Test**: Recorrer la introducción completa y verificar que menciona explícitamente las
tres capacidades: registrar gastos, ver presupuesto disponible, y categorizar.

**Acceptance Scenarios**:

1. **Given** la introducción, **When** la persona la recorre completa, **Then** encuentra contenido
   que explica qué es la app (control de presupuesto de viaje) y sus tres capacidades clave:
   registrar gastos, ver el presupuesto disponible, y categorizar gastos.

---

### Edge Cases

- **Introducción interrumpida a mitad**: si la persona cierra la app durante la introducción, antes
  de llegar a la selección de categorías, al volver a abrirla el sistema todavía no tiene ninguna
  categoría guardada para esa identidad, así que vuelve a mostrar la introducción desde el inicio
  (no se guarda en qué paso se había quedado).
- **Cuenta preexistente esperando sincronización**: una cuenta que inicia sesión y todavía está
  esperando el `pull` de sus categorías remotas (conteo en cero sin ser onboarding real, ya definido
  en `003-landing-nav-redesign`) NO ve la introducción — sigue mostrando el estado de carga ya
  definido, sin cambios.
- **Sin conexión**: la introducción DEBE funcionar igual sin conexión, ya que su contenido es
  completamente local y no depende de ningún dato remoto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE mostrar una introducción breve inmediatamente después de que la
  persona complete el registro o elija "Continuar como invitado", antes de llegar a la pantalla de
  selección de categorías.
- **FR-002**: La introducción DEBE explicar, en lenguaje simple, qué es la app (control de
  presupuesto de viaje) y sus tres capacidades clave: registrar gastos, ver el presupuesto
  disponible, y categorizar gastos.
- **FR-003**: La persona DEBE poder saltar la introducción desde cualquiera de sus pasos y llegar
  directo a la selección de categorías.
- **FR-004**: Al terminar la introducción —ya sea recorriéndola completa o saltándola— el sistema
  DEBE llevar a la pantalla de selección de categorías ya existente (`CategoriasOnboardingPage`),
  sin alterar su lógica de selección actual (`003-landing-nav-redesign`).
- **FR-005**: La introducción DEBE aplicar tanto para cuentas nuevas creadas en Registrarse como
  para identidades de invitado, con el mismo contenido en ambos casos.
- **FR-006**: La introducción NO DEBE volver a mostrarse una vez que la persona ya completó la
  selección de categorías, reutilizando el mismo criterio que hoy decide si corresponde onboarding
  (categorías en cero para esa identidad).
- **FR-007**: La introducción DEBE construirse con los componentes, tokens y patrones de
  `.specify/memory/design-system.md`, sin crear soluciones visuales aisladas (Principio VI de la
  constitución).
- **FR-008**: La introducción DEBE funcionar sin conexión a internet.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las personas que completan el registro o eligen invitado ven la
  introducción antes de llegar a la selección de categorías.
- **SC-002**: Una persona puede saltar la introducción y llegar a la selección de categorías en 1
  toque, desde cualquier paso en el que se encuentre.
- **SC-003**: Una persona puede recorrer la introducción completa (sin saltarla) en menos de 30
  segundos.
- **SC-004**: 0 casos de personas que ya completaron la selección de categorías volviendo a ver la
  introducción en aperturas posteriores de la app.

## Assumptions

- **Cantidad de pasos**: se asume una introducción corta (2 a 4 pantallas o un carrusel breve),
  priorizando que se recorra en menos de 30 segundos (`SC-003`); el número exacto de pasos y su
  contenido visual detallado se define en la fase de planificación.
- **Progreso no persistido**: si la persona cierra la app a mitad de la introducción, al reabrirla
  vuelve a empezar desde el inicio — no se guarda en qué paso se había quedado, igual que hoy no se
  guarda ningún progreso parcial del onboarding.
- **Mismo contenido para cuenta nueva e invitado**: no se diferencia el contenido de la introducción
  según cómo llegó la persona, consistente con el alcance ya definido para la bienvenida en
  `003-landing-nav-redesign`.
- **Reutiliza el gate de onboarding existente**: la condición para mostrar la introducción es la
  misma que ya decide cuándo mostrar la selección de categorías (`necesitaOnboarding` en
  `Bootstrap()`), sin agregar un estado de "introducción vista" independiente.

## Dependencies

- **`001-tripflow-v0`**: define el propósito central de la app (control de presupuesto de viaje) que
  la introducción debe comunicar.
- **`002-guest-mode-sync`**: define el encadenado registro/invitado → categorías → primer viaje,
  sobre el que esta especificación inserta un paso adicional.
- **`003-landing-nav-redesign`**: corrigió la lógica de selección de categorías (deseleccionada por
  defecto) que esta especificación no modifica, y definió el gate `necesitaOnboarding` que esta
  especificación reutiliza.
- **Sistema de diseño** (`.specify/memory/design-system.md`): fuente de verdad visual para las
  pantallas nuevas.

## Out of Scope

- Cambiar la lógica o el contenido de la pantalla de selección de categorías ya existente.
- Un tutorial interactivo dentro de la app ya en uso (tooltips o recorridos guiados sobre pantallas
  reales) — esta especificación cubre solo el paso explicativo previo a categorías.
- Volver a ofrecer la introducción bajo demanda (por ejemplo, desde Cuenta) para quienes ya la
  vieron — queda fuera de alcance, evaluable como mejora futura.
