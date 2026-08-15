# Feature Specification: Bienvenida inicial y navegación alineada al Figma Make

**Feature Branch**: `003-landing-nav-redesign`

**Created**: 2026-08-13

**Status**: Draft

**Input**: "Vamos a ajustar algo, lo primero que debe poder ver un usuario al abrir la pagina debe ser
iniciar sesion o registrarse, pero tambien con la opcion de 'continuar como invitado'. Aplica estos
diseños que encuentras en este archivo de figma make
(https://www.figma.com/make/uWBXTEFMR1fQbLKzaHzM4Z/Tripflow-Budget-Control-App): debes implementar
misma jerarquia de contenido, misma navegacion, agregando la opcion actual de 'cuenta' donde el
usuario puede iniciar sesion, en caso de no estarlo. Que el usuario pueda cerrar sesion si se
encuentra logeado. Que el usuario pueda crear categorias nuevas a las que vienen por defecto para
todos. Al continuar como invitado, y seleccionar las categorias, hay un error que no permite
seleccionar categorias, ya estan todas seleccionadas, el usuario debe poder escoger deliberamente.
Las pantallas adicionales que no estan en el figma make, crealas de acuerdo a las reglas
establecidas en la constitution del design system."

## Contexto

`002-guest-mode-sync` estableció que la app debe usarse por completo sin cuenta, sin ningún paso de
login/registro obligatorio, entrando directo a la selección de categorías. Esta especificación
agrega un único momento de elección explícita al abrir la app por primera vez —iniciar sesión,
registrarse o continuar como invitado— y rediseña la navegación principal y la jerarquía de
contenido del panel principal, de "Registrar gasto" y de "Nuevo viaje" para que coincidan con la
referencia visual compartida (Figma Make, `Tripflow-Budget-Control-App`), agregando "Cuenta" como
destino de navegación porque esa referencia no lo contempla.

De paso, corrige un defecto real encontrado en la pantalla de selección de categorías del
onboarding (todas las categorías aparecen forzosamente preseleccionadas y no responden al toque) y
confirma que cerrar sesión y crear categorías propias —ya implementadas— queden accesibles y
visibles dentro de la navegación rediseñada.

## Clarifications

### Session 2026-08-13

- Q: La pantalla de bienvenida, ¿reemplaza permanentemente el comportamiento de `002-guest-mode-sync`
  (FR-002, que prohíbe mostrar login/registro como paso obligatorio), o se muestra siempre? → A: Se
  muestra una única vez, solo cuando el dispositivo todavía no tiene ninguna identidad (invitada o
  con cuenta) establecida. Una vez elegida cualquiera de las tres opciones, no vuelve a aparecer.
- Q: ¿Qué rol cumple el archivo de Figma Make respecto al catálogo visual ya existente
  (`.specify/memory/design-system.md`, fuente de verdad por el Principio VI de la constitución)? →
  A: Solo aporta la jerarquía de contenido y la estructura de navegación (qué pantallas existen, en
  qué orden, qué se prioriza en cada una). El sistema visual (colores, tipografía, componentes)
  sigue viniendo de `design-system.md` tal como está documentado.
- Q: Al corregir el defecto de selección de categorías en el onboarding, ¿cuál es el estado inicial
  correcto? → A: Todas las categorías arrancan deseleccionadas; la persona las activa una por una
  deliberadamente, y puede continuar incluso sin seleccionar ninguna.
- Q: Este pedido junta bienvenida, rediseño de navegación, el defecto de onboarding y la
  confirmación de cerrar sesión/categorías propias en el nuevo diseño, ¿va todo en una sola
  especificación? → A: Sí, una sola especificación: el defecto de onboarding y la confirmación de
  esas dos capacidades son parte natural de rediseñar esas mismas pantallas.
- Q: El Figma Make no incluye pantallas de Cuenta, Categorías (gestión) ni Buscar como destino de
  navegación propio —solo Resumen, Registrar gasto y Nuevo viaje—. ¿Dónde quedan esas tres piezas ya
  existentes en la navegación rediseñada? → A (asunción documentada, ver sección Assumptions):
  Cuenta se agrega como cuarto destino de navegación (pedido explícito); Categorías se accede como
  enlace secundario desde Cuenta; Buscar se activa desde el ícono de búsqueda del panel principal,
  igual que en la referencia, sin ser un destino de navegación aparte.
- Q: ¿La categoría protegida "Otro" debe quedar siempre disponible como respaldo automático, o debe
  tratarse igual que las demás categorías y arrancar deseleccionada en la pantalla de selección del
  onboarding? → A: "Otro" no participa de la grilla de selección (no se ofrece como toggle) y siempre
  queda disponible, porque es una categoría protegida por código que no se puede eliminar y sirve de
  respaldo técnico de la sugerencia automática de categorización (`sugerirCategoria` cae en "Otro"
  cuando ninguna palabra clave coincide).
- Q: Para "Registrar gasto" y "Nuevo viaje", ¿el rediseño exige cambiar el orden o contenido de sus
  campos para igualar la referencia visual, o se limita a que ambas queden accesibles como destinos
  directos de la navegación? → A: Alcance solo de navegación: ambas pasan a ser destinos directos de
  la barra de navegación, pero sus formularios internos (campos y orden) quedan igual a como están
  implementados hoy; el orden de contenido de `FR-007` aplica únicamente al panel principal (Resumen).
- Q: Durante esta revisión se detectó que la app no tiene logo ni marca aplicados hoy (el ícono
  `public/icons/icon.svg` solo se usa como favicon/PWA, y el wordmark "Tripflow" solo aparece en el
  sidebar de escritorio) — ¿se suma al alcance de este spec o se trata aparte? → A: Se suma a este
  spec, dado que la bienvenida y la navegación —ambas en rediseño aquí— son exactamente las pantallas
  donde falta. Se agrega como Historia de Usuario 5 (`FR-016` a `FR-018`, `SC-007`), reutilizando el
  ícono y los tokens de marca ya existentes, sin diseñar una identidad visual nueva.
- Q: El enlace a la gestión de categorías en la pantalla Cuenta (`FR-009`), ¿debe verse también para
  personas usando la app como invitadas (sin sesión iniciada), o solo para quienes tienen sesión
  iniciada? → A: También para invitadas: el enlace aparece en ambas ramas de Cuenta (con y sin
  sesión), consistente con `FR-011` ("cualquier persona, con o sin cuenta") y con la paridad
  funcional de invitados ya establecida en `002-guest-mode-sync`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Elegir cómo entrar la primera vez que abro Tripflow (Priority: P1)

Una persona abre Tripflow por primera vez en un dispositivo donde todavía no existe ninguna
identidad (ni invitada ni con cuenta). Antes de llegar a cualquier otra pantalla, ve una bienvenida
con tres opciones igual de visibles: Iniciar sesión, Registrarse, Continuar como invitado.

**Why this priority**: Es el pedido explícito de la especificación: lo primero que debe verse al
abrir la app. Sin esto, no hay elección inicial que ofrecer.

**Independent Test**: Se instala la app sin ninguna cuenta ni uso previo, se abre, y se verifica que
la primera pantalla visible ofrece exactamente esas tres opciones, antes de cualquier otra pantalla.

**Acceptance Scenarios**:

1. **Given** un dispositivo sin ninguna identidad establecida, **When** se abre la app por primera
   vez, **Then** lo primero que se ve es la bienvenida con las opciones Iniciar sesión, Registrarse
   y Continuar como invitado.
2. **Given** la bienvenida visible, **When** la persona elige "Continuar como invitado", **Then**
   sigue el mismo flujo que ya existe para invitados (selección de categorías y luego creación de su
   primer viaje), sin pantallas adicionales de por medio.
3. **Given** la bienvenida visible, **When** la persona elige "Iniciar sesión" o "Registrarse",
   **Then** llega a las pantallas correspondientes ya existentes, y al completarlas exitosamente
   entra a usar la app con su cuenta.
4. **Given** la bienvenida visible, **When** la persona cierra la app sin elegir ninguna opción,
   **Then** la próxima vez que abra la app vuelve a ver la misma bienvenida, porque todavía no eligió
   nada.
5. **Given** una persona que ya eligió una opción en la bienvenida (incluida "invitado") o que ya
   usaba la app antes de esta funcionalidad, **When** vuelve a abrir la app en ese mismo dispositivo,
   **Then** no vuelve a ver la bienvenida: entra directo a la app según su estado (invitada o con
   cuenta).

---

### User Story 2 - Usar Tripflow con la navegación y el contenido de la nueva referencia visual (Priority: P1)

Una persona ya dentro de la app navega usando la misma estructura y jerarquía de contenido que
define la referencia de diseño: un panel principal con el gasto como cifra protagonista, acceso
directo a registrar un gasto y a crear un viaje, más "Cuenta" agregada como cuarto destino porque la
referencia no la incluye.

**Why this priority**: Es el segundo pedido explícito: aplicar la misma jerarquía de contenido y
navegación de la referencia. Junto con la Historia 1, define el rediseño completo.

**Independent Test**: Con una cuenta o identidad ya usando la app, se recorre la navegación
principal (móvil y escritorio) verificando los cuatro destinos y su orden (incluido "Cuenta"
agregado); se compara el panel principal (Resumen) contra la referencia en jerarquía de contenido
(`FR-007`); y se confirma que "Registrar gasto" y "Nuevo viaje" son alcanzables como destinos
directos de esa navegación, sin cambios en el contenido de sus formularios existentes.

**Acceptance Scenarios**:

1. **Given** una persona usando la app, **When** mira la navegación principal, **Then** encuentra
   cuatro destinos: Resumen, Registrar (gasto), Nuevo viaje y Cuenta, con el mismo patrón responsivo
   ya existente (barra inferior en móvil, barra lateral en escritorio).
2. **Given** el panel principal (Resumen), **When** lo abre, **Then** ve el contenido en este orden
   de prioridad: monto total gastado como cifra principal, porcentaje del presupuesto gastado, barra
   de progreso, presupuesto disponible y días restantes, un mensaje de estado, el desglose por
   categoría, y los gastos recientes agrupados por fecha.
3. **Given** el panel principal, **When** toca el ícono de búsqueda, **Then** llega a la
   funcionalidad de búsqueda y filtro de gastos ya existente.
4. **Given** la pantalla Cuenta, **When** la persona no tiene sesión iniciada, **Then** ve la opción
   de iniciar sesión o registrarse (comportamiento ya existente de `002-guest-mode-sync`), además de
   un enlace a la gestión de categorías, igual que en la rama con sesión iniciada.
5. **Given** la pantalla Cuenta, **When** la persona tiene sesión iniciada, **Then** ve un enlace a
   la gestión de categorías, además de las opciones ya existentes (cerrar sesión, eliminar cuenta).

---

### User Story 3 - Elegir deliberadamente mis categorías al empezar como invitado (Priority: P2)

Una persona que llega a la selección de categorías del onboarding (como invitada o con cuenta nueva)
puede tocar cada categoría para activarla o desactivarla, en lugar de encontrarlas todas ya
marcadas sin poder tocarlas.

**Why this priority**: Corrige un defecto real que impide una interacción básica de la pantalla. Es
secundario frente a la bienvenida y la navegación porque no bloquea el resto del uso de la app, pero
sí bloquea esta pantalla puntual.

**Independent Test**: Se llega a la pantalla de selección de categorías del onboarding y se verifica
que cada categoría arranca deseleccionada, responde al toque, se puede activar y desactivar
individualmente, y que "Continuar" funciona sin impedir el avance sin importar cuántas estén
activas.

**Acceptance Scenarios**:

1. **Given** la pantalla de selección de categorías del onboarding, **When** se muestra por primera
   vez, **Then** ninguna categoría aparece seleccionada.
2. **Given** esa pantalla, **When** la persona toca una categoría no seleccionada, **Then** esa
   categoría pasa a estar seleccionada, y si toca una ya seleccionada, **Then** pasa a estar
   deseleccionada.
3. **Given** esa pantalla con cualquier cantidad de categorías seleccionadas (incluyendo cero),
   **When** la persona toca "Continuar", **Then** avanza al siguiente paso sin restricción por
   cantidad de categorías elegidas.
4. **Given** el onboarding ya completado, **When** la persona revisa sus categorías disponibles para
   clasificar gastos, **Then** solo están disponibles las que seleccionó explícitamente en el
   onboarding, más la categoría protegida "Otro" (siempre disponible, no participa de la selección) y
   las que cree después desde Categorías — las demás que dejó sin marcar no quedan disponibles.

---

### User Story 4 - Gestionar mis categorías propias y cerrar sesión desde la Cuenta rediseñada (Priority: P2)

Una persona con o sin cuenta crea categorías propias además de las predeterminadas, y una persona
con sesión iniciada la cierra, ambas acciones alcanzables desde la pantalla Cuenta ya rediseñada
según la Historia 2.

**Why this priority**: Ambas capacidades ya existen funcionalmente; esta historia asegura que sigan
siendo alcanzables y visibles después del rediseño de navegación, sin que el rediseño las esconda o
las rompa.

**Independent Test**: Desde Cuenta, se navega a la gestión de categorías y se crea una categoría
nueva, verificando que queda disponible para clasificar gastos; por separado, con sesión iniciada,
se cierra sesión desde Cuenta y se verifica que los datos siguen disponibles localmente en modo
invitado.

**Acceptance Scenarios**:

1. **Given** la pantalla Cuenta, **When** la persona selecciona el enlace a categorías, **Then**
   llega a una pantalla donde puede crear una categoría nueva además de las predeterminadas.
2. **Given** una categoría recién creada, **When** la persona registra un gasto, **Then** esa
   categoría aparece disponible para clasificarlo igual que las predeterminadas.
3. **Given** una persona con sesión iniciada, **When** toca "Cerrar sesión" en Cuenta, **Then** la
   sesión se cierra y sus datos siguen disponibles localmente en modo invitado, tal como define
   `002-guest-mode-sync` (FR-015).

---

### User Story 5 - Reconocer la marca Tripflow en la bienvenida y en la navegación (Priority: P2)

Una persona ve el logo de Tripflow (ícono + wordmark) como parte de la bienvenida al abrir la app
por primera vez, y lo sigue viendo de forma visible en la navegación principal mientras usa la app,
tanto en escritorio como en móvil.

**Why this priority**: La bienvenida es la primera pantalla que ve cualquier persona y hoy no
transmite ninguna identidad de marca (no hay logo en esa pantalla, y en móvil no hay logo en ninguna
pantalla); sin esto, el rediseño de la bienvenida y la navegación queda incompleto justo en el
momento de mayor impacto de marca. Es secundaria frente a la elección funcional de entrada (Historia
1) y la navegación rediseñada (Historia 2) porque no bloquea ningún flujo, pero completa ambas
pantallas.

**Independent Test**: Se abre la app sin identidad previa y se verifica que el logo de Tripflow
aparece en la bienvenida; por separado, con la app en uso, se verifica que el logo aparece de forma
visible en la navegación principal tanto en la vista de escritorio como en la vista de móvil.

**Acceptance Scenarios**:

1. **Given** un dispositivo sin ninguna identidad establecida, **When** se abre la app por primera
   vez, **Then** la bienvenida muestra el logo de Tripflow (ícono + wordmark) como parte de su
   contenido, antes o junto a las tres opciones de entrada.
2. **Given** una persona usando la app en escritorio, **When** mira la navegación principal, **Then**
   ve el logo de Tripflow visible en el sidebar (comportamiento ya existente hoy).
3. **Given** una persona usando la app en móvil, **When** mira la navegación principal, **Then** ve
   el logo de Tripflow visible de forma consistente (hoy ausente en esa vista).

---

### Edge Cases

- **Bienvenida sin conexión**: elegir "Continuar como invitado" funciona igual sin conexión; elegir
  "Iniciar sesión" o "Registrarse" sin conexión muestra el mismo aviso ya definido en
  `002-guest-mode-sync` (FR-007), sin bloquear la opción de invitado.
- **Identidad previa a esta funcionalidad**: una persona que ya usaba la app (con datos de invitado
  o con sesión) antes de que existiera la bienvenida no la ve retroactivamente al actualizar la app.
- **Cero categorías seleccionadas en onboarding**: la persona puede continuar igual; no tiene
  categorías predeterminadas propias disponibles hasta que cree una desde Cuenta → Categorías, pero
  sigue teniendo "Otro" disponible como respaldo (ver abajo).
- **Categoría "Otro" en el onboarding**: no se ofrece como opción para marcar o desmarcar en la
  grilla de selección; queda disponible siempre, incluso cuando la persona selecciona cero categorías
  predeterminadas, para que la sugerencia automática de categorización y la clasificación manual
  tengan un destino de respaldo.
- **Buscar sin gastos registrados todavía**: el ícono de búsqueda sigue disponible y lleva a la
  pantalla de búsqueda ya existente, que maneja el caso de no tener resultados.
- **Cerrar sesión sin conexión**: sigue funcionando igual que ya define `002-guest-mode-sync`
  (operación local, sin requerir conexión).

## Requirements *(mandatory)*

### Functional Requirements

**Bienvenida inicial**

- **FR-001**: El sistema DEBE mostrar una pantalla de bienvenida con tres opciones igual de visibles
  —Iniciar sesión, Registrarse, Continuar como invitado— como lo primero que ve una persona al abrir
  la app en un dispositivo donde todavía no existe ninguna identidad (invitada ni con cuenta)
  establecida.
- **FR-002**: El sistema NO DEBE volver a mostrar la bienvenida una vez que la persona eligió
  cualquiera de las tres opciones en ese dispositivo, ni a personas que ya tenían una identidad
  establecida antes de esta funcionalidad. Este requisito ajusta el `FR-002` de
  `002-guest-mode-sync`: sigue sin existir ningún paso de login/registro obligatorio para usar la
  app; se agrega únicamente este momento de elección explícita, una sola vez.
- **FR-003**: Elegir "Continuar como invitado" en la bienvenida DEBE llevar exactamente al mismo
  flujo que ya existe para invitados (selección de categorías, luego creación del primer viaje), sin
  pasos adicionales respecto a lo definido en `002-guest-mode-sync`.
- **FR-004**: Elegir "Iniciar sesión" o "Registrarse" en la bienvenida DEBE llevar a las pantallas ya
  existentes para esas acciones.
- **FR-005**: Si la persona no completa ninguna opción de la bienvenida, el sistema DEBE volver a
  mostrarla la próxima vez que abra la app en ese dispositivo.

**Navegación y jerarquía de contenido**

- **FR-006**: El sistema DEBE organizar la navegación principal en cuatro destinos: Resumen,
  Registrar (gasto), Nuevo viaje y Cuenta, manteniendo el mismo patrón responsivo ya existente (barra
  inferior en móvil, barra lateral en escritorio) y agregando Cuenta como el único destino no
  contemplado por la referencia de diseño.
- **FR-007**: El panel principal (Resumen) DEBE presentar su contenido en este orden de prioridad:
  monto total gastado como cifra principal, porcentaje del presupuesto gastado, barra de progreso,
  presupuesto disponible y días restantes, un mensaje de estado sobre la salud del presupuesto, el
  desglose por categoría, y los gastos recientes agrupados por fecha.
- **FR-008**: El sistema DEBE ofrecer un acceso a buscar gastos desde un ícono de búsqueda visible en
  el panel principal, que lleve a la funcionalidad de búsqueda y filtro ya existente.
- **FR-009**: La pantalla Cuenta DEBE incluir un enlace a la gestión de categorías (crear, renombrar
  y eliminar), visible tanto para personas con sesión iniciada como para invitadas (sin sesión), dado
  que la referencia de diseño no contempla la gestión de categorías como destino de navegación propio
  y `FR-011` exige que cualquier persona, con o sin cuenta, pueda llegar a ella.

**Cierre de sesión**

- **FR-010**: Una persona con sesión iniciada DEBE poder cerrar sesión desde la pantalla Cuenta
  rediseñada, conservando sus datos localmente en modo invitado tal como define
  `002-guest-mode-sync` (FR-015).

**Categorías personalizadas**

- **FR-011**: Cualquier persona, con o sin cuenta, DEBE poder crear categorías propias además de las
  categorías predeterminadas, desde la gestión de categorías accesible según `FR-009`.

**Selección de categorías en onboarding**

- **FR-012**: En la selección de categorías del onboarding, cada categoría predeterminada excepto
  "Otro" DEBE mostrarse deseleccionada por defecto y DEBE responder al toque, permitiendo activarla o
  desactivarla individualmente. La categoría protegida "Otro" NO DEBE ofrecerse como opción para
  marcar o desmarcar en esa pantalla: permanece siempre disponible, porque es el respaldo técnico de
  la sugerencia automática de categorización y no puede eliminarse.
- **FR-013**: La persona DEBE poder continuar al siguiente paso del onboarding sin importar cuántas
  categorías haya seleccionado, incluyendo cero.
- **FR-014**: Al confirmar la selección del onboarding, las categorías predeterminadas que la persona
  no seleccionó NO DEBEN quedar disponibles para clasificar gastos. Quedan disponibles: las
  categorías predeterminadas seleccionadas explícitamente, la categoría protegida "Otro" (siempre
  disponible por `FR-012`), y las que la persona cree después desde la gestión de categorías.

**Pantallas adicionales**

- **FR-015**: Toda pantalla que esta funcionalidad introduzca o ajuste y que no esté cubierta por la
  referencia de diseño (bienvenida, Cuenta, gestión de categorías, selección de categorías del
  onboarding, Iniciar sesión, Registrarse, Buscar) DEBE construirse con los componentes, tokens y
  patrones de `.specify/memory/design-system.md`, sin crear soluciones visuales aisladas (Principio
  VI de la constitución).

**Marca**

- **FR-016**: El sistema DEBE mostrar el logo de Tripflow (ícono + wordmark) en la pantalla de
  bienvenida, como parte de su contenido, antes o junto a las tres opciones de entrada.
- **FR-017**: El sistema DEBE mostrar el logo de Tripflow de forma visible en la navegación
  principal, tanto en el sidebar de escritorio (comportamiento ya existente) como en la vista de
  móvil (hoy ausente).
- **FR-018**: El logo de Tripflow (ícono + wordmark) DEBE documentarse como componente reutilizable
  en `.specify/memory/design-system.md`, construido con los tokens y assets de marca ya existentes
  (ícono `public/icons/icon.svg`, tipografía `Brand/Display`/Catamaran, `color-text-brand`), sin
  introducir una paleta, tipografía o ícono nuevo (Principio VI de la constitución).

### Key Entities

- **Estado de bienvenida (dispositivo)**: indica si en ese dispositivo la elección inicial de la
  bienvenida ya se resolvió (y con qué opción) o sigue pendiente. Vive únicamente en el dispositivo,
  no es un dato de cuenta ni se sincroniza entre dispositivos.
- **Usuario**, **Viaje**, **Gasto**, **Categoría**: mismas entidades definidas en
  `001-tripflow-v0` y `002-guest-mode-sync`, sin cambios en sus atributos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las personas que abren Tripflow por primera vez en un dispositivo sin
  identidad ven la bienvenida antes que cualquier otra pantalla.
- **SC-002**: 0 casos de una persona que ya resolvió su elección inicial (o que ya usaba la app antes
  de esta funcionalidad) viendo la bienvenida de nuevo en aperturas posteriores.
- **SC-003**: El panel principal (Resumen) coincide con el orden de contenido de la referencia de
  diseño en el 100% de los elementos listados en `FR-007`, verificable comparando la app contra la
  referencia pantalla a pantalla. "Registrar gasto" y "Nuevo viaje" son alcanzables como destinos
  directos de la navegación (`FR-006`), sin cambios en el orden de los campos de sus formularios
  existentes.
- **SC-004**: El 100% de las categorías del onboarding pueden seleccionarse y deseleccionarse
  individualmente tocándolas, verificado tocando cada una al menos una vez.
- **SC-005**: Una persona con sesión iniciada cierra sesión desde Cuenta en 2 toques o menos.
- **SC-006**: Una persona crea una categoría propia desde Cuenta y la ve disponible para clasificar
  un gasto en menos de 30 segundos desde que empieza a crearla.
- **SC-007**: El logo de Tripflow es visible en el 100% de las pantallas de navegación principal
  (escritorio y móvil) y en la bienvenida, verificable recorriendo la app en ambos tamaños de
  pantalla.

## Assumptions

- **Rol de la referencia de diseño**: el Figma Make (`Tripflow-Budget-Control-App`) aporta
  únicamente la jerarquía de contenido y la estructura de navegación de Resumen, Registrar gasto y
  Nuevo viaje. El sistema visual (colores, tipografía, componentes) sigue siendo el ya documentado en
  `.specify/memory/design-system.md`, que es la fuente de verdad visual (Principio VI de la
  constitución). Donde ambos difieran en estilo visual, prevalece `design-system.md`.
- **Ubicación de Cuenta, Categorías y Buscar**: dado que la referencia de diseño no incluye estos
  tres como destinos de navegación propios, se asume: Cuenta se agrega como cuarto destino de
  navegación (pedido explícito de esta spec); la gestión de categorías se accede como enlace
  secundario desde Cuenta (`FR-009`); Buscar se activa desde el ícono de búsqueda del panel principal
  (`FR-008`), sin ser un destino de navegación de primer nivel. Esta es una decisión documentada, no
  una certeza extraída de la referencia — queda abierta a ajuste si no refleja la intención real.
- **Iniciar sesión y Registrarse**: ya existen como pantallas funcionales de `002-guest-mode-sync`;
  esta especificación no cambia su lógica interna, solo agrega la bienvenida como un punto de entrada
  adicional hacia ellas (además del acceso ya existente desde Cuenta).
- **Cerrar sesión y categorías propias**: ambas ya están implementadas funcionalmente; esta
  especificación no introduce lógica nueva para ellas, solo asegura que sigan siendo alcanzables
  dentro de la navegación rediseñada (`FR-009`, `FR-010`, `FR-011`).
- **Sin migración retroactiva de datos**: las personas que ya usaban la app antes de esta
  funcionalidad conservan su identidad y datos tal cual, sin ver la bienvenida ni perder nada.
- **Ubicación del logo en móvil**: el sidebar de escritorio ya muestra el wordmark de Tripflow; la
  vista de móvil no tiene hoy un lugar fijo para el logo. Se asume que se agrega en un punto visible
  y consistente de la navegación principal en móvil (p. ej. el encabezado superior ya existente,
  donde hoy solo vive el indicador de sincronización), sin que sea necesariamente parte de la barra
  inferior de destinos. Decisión abierta a ajuste en la fase de planificación.

## Dependencies

- **`001-tripflow-v0`**: viajes, gastos, categorización automática, salud del presupuesto,
  offline-first — sin cambios.
- **`002-guest-mode-sync`**: uso sin cuenta, cuenta opcional, vinculación de datos de invitado,
  sincronización multi-dispositivo, cierre de sesión — sin cambios funcionales; esta especificación
  ajusta su `FR-002` agregando el paso único de bienvenida descrito en `FR-001` a `FR-005`.
- **Sistema de diseño** (`.specify/memory/design-system.md`): fuente de verdad visual para toda
  pantalla nueva o ajustada por esta especificación (Principio VI de la constitución).
- **Referencia de diseño Figma Make**
  (`https://www.figma.com/make/uWBXTEFMR1fQbLKzaHzM4Z/Tripflow-Budget-Control-App`): fuente de
  jerarquía de contenido y navegación para Resumen, Registrar gasto y Nuevo viaje (ver Assumptions).

## Out of Scope

- Reemplazar el sistema visual documentado en `design-system.md` (colores, tipografía, componentes)
  por la paleta o tipografía específica usada en el archivo de Figma Make.
- Nuevos métodos de autenticación: se mantiene correo y contraseña, definido en `001-tripflow-v0`.
- Diferenciar el contenido de la bienvenida según tipo de persona: todas ven las mismas tres
  opciones.
- Cambios a la lógica de vinculación o fusión de datos de invitado hacia una cuenta: sigue vigente
  tal como la define `002-guest-mode-sync`, sin modificaciones.
- Redefinir el orden o los campos de los formularios de "Registrar gasto" y "Nuevo viaje": se
  agregan como destinos directos de navegación (`FR-006`), sin cambios en su contenido interno
  existente.
- Diseñar un logo o identidad visual nueva: se reutiliza el ícono (`public/icons/icon.svg`) y los
  tokens de marca ya existentes en `design-system.md` (`FR-016` a `FR-018`), sin crear un ícono,
  paleta o tipografía de marca nuevos.
