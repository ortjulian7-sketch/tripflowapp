# Feature Specification: Tripflow v0 — Control de presupuesto de viaje

**Feature Branch**: `001-tripflow-v0`

**Created**: 2026-08-13

**Status**: Draft

**Input**: Especificación de negocio "Tripflow v0" provista por el usuario, más el diseño de pantallas principales en Figma (`node-id=25-152`: 3 pantallas mobile y 3 desktop).

## Contexto

Tripflow permite a una persona controlar el presupuesto de un viaje. El valor central **no es
"registrar gastos"**, sino **saber en cada momento si va a poder sostener su presupuesto hasta
el final del viaje, y decidir a tiempo si necesita ajustar**.

**Usuario primario**: viajero individual o en pareja consciente de su presupuesto
("budget-conscious leisure traveler"), 1 a 3 viajes internacionales o multi-país al año, foco
LATAM.

**Fuera del público objetivo en v0**: grupos grandes de amigos (dolor de reconciliación de
deudas, ya resuelto por otros), viajeros de negocio (dolor de reembolso/compliance), familias
(evidencia insuficiente).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear mi primer viaje con presupuesto (Priority: P1)

Una persona que va a viajar abre Tripflow por primera vez, crea su cuenta, elige qué categorías
de gasto quiere usar y define su viaje: nombre, destino, fecha de salida, fecha de regreso
(opcional) y presupuesto total con su moneda. Al terminar, tiene un viaje activo listo para
recibir gastos.

**Why this priority**: Sin un viaje con presupuesto y moneda definidos no existe nada contra
qué medir. Es el cimiento de todo el producto.

**Independent Test**: Se puede probar completo abriendo la app como usuario nuevo y llegando a
ver el viaje creado con su presupuesto en pantalla, sin registrar ningún gasto todavía.

**Acceptance Scenarios**:

1. **Given** una persona sin cuenta, **When** completa el registro, **Then** llega a la
   selección de categorías sin pasar por pantallas de presentación ni carruseles de valor.
2. **Given** la pantalla de selección de categorías, **When** la persona la acepta sin cambiar
   nada, **Then** queda con el set completo de categorías generales activo y avanza a crear su
   primer viaje.
3. **Given** el formulario de nuevo viaje, **When** la persona ingresa nombre, destino, fecha de
   salida, presupuesto total y moneda, y confirma, **Then** el viaje queda creado y se muestra
   como viaje activo.
4. **Given** el formulario de nuevo viaje, **When** la persona no ingresa fecha de regreso,
   **Then** el viaje se crea igual y queda marcado como viaje abierto.
5. **Given** el formulario de nuevo viaje, **When** la persona intenta confirmar con el
   presupuesto vacío o en cero, **Then** el sistema impide crear el viaje y explica que el
   presupuesto es obligatorio y debe ser mayor a cero.

---

### User Story 2 - Registrar un gasto en segundos (Priority: P1)

Durante el viaje, la persona acaba de pagar algo y quiere dejarlo registrado de inmediato: entra
a registrar gasto, escribe qué compró, pone el monto, confirma la categoría y la fecha, y guarda.

**Why this priority**: Es la acción más frecuente de la app. Si registrar un gasto cuesta
trabajo, el usuario deja de hacerlo y todo el resto del producto pierde sentido.

**Independent Test**: Con un viaje ya creado, se puede registrar un gasto y verlo aparecer en el
listado del viaje, sin depender de ninguna otra funcionalidad.

**Acceptance Scenarios**:

1. **Given** un viaje activo, **When** la persona ingresa descripción, monto, categoría y fecha
   y guarda, **Then** el gasto queda registrado en ese viaje y aparece en el listado del día
   correspondiente.
2. **Given** el formulario de gasto, **When** la persona lo abre, **Then** la fecha viene
   precargada con el día de hoy.
3. **Given** el formulario de gasto, **When** la persona intenta guardar sin monto o sin
   descripción, **Then** el sistema impide guardar e indica qué dato falta.
4. **Given** un gasto guardado, **When** la persona vuelve al resumen, **Then** el total gastado
   y el disponible reflejan el nuevo gasto inmediatamente.
5. **Given** un viaje con moneda MXN, **When** la persona registra un gasto, **Then** el monto se
   registra en MXN sin pedirle elegir moneda.

---

### User Story 3 - Ver cuánto llevo gastado y cuánto me queda (Priority: P1)

La persona abre la app y en la primera pantalla ve, sin hacer nada más: cuánto lleva gastado en
el viaje, qué porcentaje representa de su presupuesto, cuánto tiene disponible y cuántos días le
quedan.

**Why this priority**: Es la razón por la que la persona abre la app. Junto con US1 y US2
completa el ciclo mínimo utilizable.

**Independent Test**: Con un viaje y algunos gastos cargados, se abre el resumen y se verifica
que los cuatro números coincidan con los gastos registrados.

**Acceptance Scenarios**:

1. **Given** un viaje con presupuesto $45.000 y gastos por $18.750, **When** la persona abre el
   resumen, **Then** ve "$18.750" como total gastado, "42% del presupuesto gastado" y "$26.250"
   como disponible.
2. **Given** un viaje con presupuesto $1.000.000 y gastos por $800.000, **When** la persona abre
   el resumen, **Then** el porcentaje mostrado es 80%.
3. **Given** un viaje con fecha de regreso definida, **When** la persona abre el resumen,
   **Then** ve los días restantes sobre el total de días del viaje.
4. **Given** un viaje abierto (sin fecha de regreso), **When** la persona abre el resumen,
   **Then** no se muestran días restantes, y sí se muestran gastado, porcentaje y disponible.
5. **Given** un viaje cuyos gastos superan el presupuesto, **When** la persona abre el resumen,
   **Then** el exceso se comunica de forma inequívoca y el disponible se presenta como monto
   excedido, no como un número negativo suelto sin explicación.

---

### User Story 4 - Saber si voy a sostener mi presupuesto (Priority: P2)

La persona quiere saber, de un vistazo, si el ritmo al que viene gastando le alcanza para llegar
al final del viaje. La app le dice cuánto puede gastar por día de aquí en adelante y si ese
margen creció o se redujo respecto a lo que tenía planeado.

**Why this priority**: Es el diferenciador del producto frente a un simple registrador de gastos.
Sin esto, Tripflow es una libreta de gastos más.

**Independent Test**: Con un viaje con fechas y gastos cargados, se verifica que el mensaje de
salud y el presupuesto diario restante cambien de forma coherente al agregar gastos.

**Acceptance Scenarios**:

1. **Given** un viaje de 10 días con presupuesto $45.000, 3 días transcurridos y $18.750
   gastados, **When** la persona abre el resumen, **Then** ve que puede gastar $3.750 por día en
   los 7 días restantes, y que ese margen es menor al que tenía planeado ($4.500 por día).
2. **Given** un viaje donde el margen diario restante es igual o mayor al planeado inicialmente,
   **When** la persona abre el resumen, **Then** el mensaje de salud es positivo.
3. **Given** un viaje donde el margen diario restante cayó por debajo del 70% del planeado,
   **When** la persona abre el resumen, **Then** el mensaje de salud advierte que va acelerada.
4. **Given** un viaje que aún no comenzó, **When** la persona abre el resumen, **Then** se le
   muestra cuánto puede gastar por día según el plan original, sin evaluar ritmo real.
5. **Given** un viaje abierto (sin fecha de regreso), **When** la persona abre el resumen,
   **Then** no se muestra alerta de ritmo ni presupuesto diario, porque no hay horizonte contra
   el cual calcularlos.
6. **Given** un viaje ya terminado, **When** la persona lo consulta, **Then** ve el resultado
   final del viaje en lugar de una proyección de ritmo.

---

### User Story 5 - Ver en qué se me está yendo la plata (Priority: P2)

La persona quiere entender la composición de su gasto: qué categorías se están llevando su
presupuesto, y repasar los gastos de cada día.

**Why this priority**: Es lo que convierte el dato en decisión. Sin el desglose, la persona sabe
que va mal pero no qué recortar.

**Independent Test**: Con gastos en varias categorías y en distintos días, se verifica que el
desglose por categoría y el listado agrupado por día reflejen exactamente lo registrado.

**Acceptance Scenarios**:

1. **Given** gastos en varias categorías, **When** la persona abre el resumen, **Then** ve un
   desglose comparativo por categoría con el monto acumulado de cada una.
2. **Given** el desglose por categoría, **When** la persona lo mira, **Then** las categorías
   aparecen ordenadas de mayor a menor gasto.
3. **Given** gastos registrados en distintos días, **When** la persona mira el listado, **Then**
   los gastos aparecen agrupados por día con el subtotal gastado en cada día.
4. **Given** un viaje sin ningún gasto, **When** la persona abre el resumen, **Then** ve un
   estado vacío que la invita a registrar su primer gasto, no una pantalla en blanco.

---

### User Story 6 - Que la categoría se complete sola (Priority: P2)

Al escribir la descripción del gasto ("compré una hamburguesa"), la app preselecciona sola la
categoría que corresponde ("Comida"), y la persona solo tiene que confirmar o cambiarla.

**Why this priority**: Es lo que hace que registrar un gasto se sienta instantáneo. Reduce de 4
decisiones a 3 la acción más repetida del producto.

**Independent Test**: Se escriben distintas descripciones en el formulario de gasto y se verifica
que la categoría preseleccionada cambie de forma coherente, sin guardar nada.

**Acceptance Scenarios**:

1. **Given** el formulario de gasto, **When** la persona escribe "compré una hamburguesa",
   **Then** la categoría "Comida" queda preseleccionada automáticamente.
2. **Given** una categoría preseleccionada automáticamente, **When** la persona toca otra
   categoría, **Then** la selección cambia a la que eligió y se respeta al guardar.
3. **Given** una descripción de la que no se puede deducir ninguna categoría, **When** la persona
   termina de escribirla, **Then** queda preseleccionada la categoría "Otro" y puede guardar sin
   bloqueos.
4. **Given** una descripción escrita, **When** la persona la modifica sustancialmente y aún no ha
   elegido categoría manualmente, **Then** la preselección se actualiza.
5. **Given** que la persona ya eligió una categoría manualmente, **When** sigue editando la
   descripción, **Then** la app respeta su elección y no la sobreescribe.

---

### User Story 7 - Corregir o borrar un gasto (Priority: P3)

La persona se equivocó en un monto, una categoría o una fecha, y necesita corregirlo. O registró
algo que no correspondía y quiere eliminarlo. Corregir un gasto se siente idéntico a registrarlo:
la misma pantalla, los mismos campos y en el mismo orden, ya cargados con lo que había guardado.

**Why this priority**: Los errores de tipeo son inevitables en una acción rápida y frecuente. Un
dato que no se puede corregir destruye la confianza en todos los números del resumen.

**Independent Test**: Se edita un gasto existente y se verifica que los totales del resumen se
actualicen; se elimina otro y se verifica que desaparezca del listado y de los totales.

**Acceptance Scenarios**:

1. **Given** un gasto en el listado, **When** la persona lo abre para editarlo, **Then** ve la
   misma pantalla que usa para registrar un gasto nuevo, con los mismos campos, en el mismo orden
   y con los mismos comportamientos.
2. **Given** la pantalla de edición de un gasto, **When** se abre, **Then** monto, descripción,
   categoría y fecha vienen cargados con los valores guardados de ese gasto, en lugar de vacíos o
   con sus valores por defecto.
3. **Given** la pantalla de edición de un gasto, **When** la persona modifica la descripción,
   **Then** la categoría ya guardada se mantiene y no es reemplazada por una sugerencia
   automática.
4. **Given** un gasto editado, **When** se guarda el cambio, **Then** el total gastado, el
   disponible, el porcentaje y el desglose por categoría se recalculan de inmediato.
5. **Given** un gasto que la persona quiere eliminar, **When** confirma la eliminación, **Then**
   el gasto desaparece del listado y deja de contar en todos los totales.
6. **Given** la acción de eliminar un gasto, **When** la persona la inicia, **Then** el sistema
   pide confirmación y advierte que la eliminación es permanente.

---

### User Story 8 - Buscar y filtrar mis gastos (Priority: P3)

La persona quiere encontrar un gasto puntual ("¿cuánto pagué en el hostal?") o revisar solo lo
gastado en un rango de fechas.

**Why this priority**: Gana relevancia a medida que el viaje acumula gastos; en los primeros días
el listado agrupado por día ya alcanza.

**Independent Test**: Con varios gastos cargados, se busca por texto y se acota por rango de
fechas, verificando que los resultados correspondan.

**Acceptance Scenarios**:

1. **Given** varios gastos registrados, **When** la persona busca un texto, **Then** ve los
   gastos cuya descripción o categoría coincide.
2. **Given** un rango de fechas seleccionado, **When** se aplica, **Then** el listado muestra
   solo los gastos dentro de ese rango.
3. **Given** una búsqueda sin coincidencias, **When** se ejecuta, **Then** se muestra un estado
   vacío explicando que no hubo resultados.
4. **Given** una búsqueda o filtro activo, **When** la persona lo limpia, **Then** vuelve al
   listado completo del viaje.

---

### User Story 9 - Ajustar mis categorías (Priority: P3)

La persona quiere agregar una categoría propia ("Propinas"), renombrar una existente o eliminar
una que no usa.

**Why this priority**: Las 8 categorías generales cubren la mayoría de los casos; la
personalización es un refinamiento, no un bloqueante.

**Independent Test**: Se crea una categoría nueva, se verifica que aparezca disponible al
registrar un gasto, y se intenta eliminar una categoría que ya tiene gastos asociados.

**Acceptance Scenarios**:

1. **Given** la gestión de categorías, **When** la persona crea una categoría con nombre y
   emoji, **Then** queda disponible para seleccionar al registrar gastos.
2. **Given** una categoría sin gastos asociados, **When** la persona la elimina, **Then**
   desaparece de la lista de categorías disponibles.
3. **Given** una categoría con al menos un gasto asociado, **When** la persona intenta
   eliminarla, **Then** el sistema lo impide y le explica que está en uso.
4. **Given** una categoría renombrada, **When** se guarda el cambio, **Then** los gastos ya
   registrados con esa categoría muestran el nombre nuevo.

---

### User Story 10 - Consultar mis viajes anteriores (Priority: P3)

La persona terminó un viaje y meses después crea otro. Quiere poder alternar entre su viaje
actual y los anteriores para consultar cómo le fue.

**Why this priority**: Solo aplica a partir del segundo viaje, que para el perfil objetivo (1 a 3
viajes al año) ocurre meses después del primero.

**Independent Test**: Con dos o más viajes creados, se alterna entre ellos y se verifica que cada
uno muestre exclusivamente sus propios gastos y presupuesto.

**Acceptance Scenarios**:

1. **Given** varios viajes creados, **When** la persona abre el selector de viaje, **Then** ve su
   viaje actual y los anteriores.
2. **Given** un viaje seleccionado, **When** se muestra el resumen, **Then** todos los números y
   gastos corresponden exclusivamente a ese viaje.
3. **Given** un viaje seleccionado, **When** la persona registra un gasto, **Then** el gasto se
   asocia a ese viaje y no a ningún otro.

---

### Edge Cases

- **Viaje abierto (sin fecha de regreso)**: no hay días restantes ni presupuesto diario que
  calcular. El resumen muestra gastado, porcentaje y disponible, y omite días restantes y la
  alerta de ritmo por completo.
- **Viaje que aún no comenzó**: no hay días transcurridos, por lo tanto no hay ritmo real que
  evaluar. Se muestra el presupuesto diario planeado.
- **Último día del viaje**: el presupuesto diario restante equivale a todo el disponible.
- **Viaje ya terminado**: no quedan días restantes; se presenta el resultado final del viaje en
  lugar de una proyección de ritmo. Evitar cualquier división por cero.
- **Presupuesto excedido**: el disponible llega a cero o menos. La condición de exceso debe ser
  inequívoca en pantalla, no un número negativo sin contexto.
- **Cambio de fecha de regreso con el viaje en curso**: está permitido, y recalcula
  inmediatamente días restantes, presupuesto diario restante y el estado de salud.
- **Cierre de un viaje abierto**: la persona puede agregar la fecha de regreso más adelante; a
  partir de ese momento aparecen días restantes y alerta de ritmo.
- **Eliminar un gasto**: es permanente y no se puede recuperar.
- **Eliminar una categoría en uso**: se impide y se explica el motivo.
- **Gasto con fecha fuera del rango del viaje**: se permite registrarlo; el viaje es el
  contenedor del gasto, no la fecha.
- **Descripción no interpretable**: nunca bloquea el guardado; la categoría cae en "Otro".
- **Moneda de un viaje**: no se puede cambiar una vez creado el viaje.

## Requirements *(mandatory)*

### Functional Requirements

**Cuenta y arranque**

- **FR-001**: El sistema DEBE requerir una cuenta de usuario para acceder a la aplicación.
- **FR-002**: El sistema DEBE llevar a la persona desde el registro hasta la creación de su primer
  viaje sin interponer pantallas de presentación, carruseles ni contenido de valor previo.
- **FR-003**: El sistema DEBE presentar, una sola vez tras el registro, una pantalla donde la
  persona confirme qué categorías generales desea usar, con todas preseleccionadas y con la
  posibilidad de continuar sin modificar nada.
- **FR-004**: El sistema DEBE mostrar la información del usuario de forma consistente en teléfono
  y computador, permitiendo completar las mismas tareas en ambos.

**Viajes**

- **FR-005**: Los usuarios DEBEN poder crear un viaje indicando nombre, destino, fecha de salida,
  presupuesto total y moneda.
- **FR-006**: El sistema DEBE tratar la fecha de regreso como opcional; un viaje sin fecha de
  regreso es un viaje abierto.
- **FR-007**: El sistema DEBE exigir un presupuesto total mayor a cero para crear un viaje.
- **FR-008**: Los usuarios DEBEN poder elegir la moneda del viaje al crearlo.
- **FR-009**: El sistema NO DEBE permitir modificar la moneda de un viaje después de creado.
- **FR-010**: Los usuarios DEBEN poder modificar nombre, destino, fechas y presupuesto de un viaje
  existente.
- **FR-011**: El sistema DEBE recalcular todas las métricas del viaje inmediatamente después de
  cualquier cambio en sus fechas o su presupuesto.
- **FR-012**: El sistema DEBE mantener los gastos y el presupuesto de cada viaje completamente
  aislados de los demás viajes.
- **FR-013**: Los usuarios DEBEN poder alternar entre su viaje actual y sus viajes anteriores
  desde el resumen.

**Gastos**

- **FR-014**: Los usuarios DEBEN poder registrar un gasto indicando monto, descripción, categoría
  y fecha, y ningún otro dato obligatorio.
- **FR-015**: El sistema DEBE precargar la fecha del gasto con el día actual.
- **FR-016**: El sistema DEBE registrar todos los gastos de un viaje en la moneda de ese viaje,
  sin solicitar la moneda en cada gasto.
- **FR-017**: Los usuarios DEBEN poder editar monto, descripción, categoría y fecha de un gasto ya
  registrado.
- **FR-018**: El sistema DEBE presentar la edición de un gasto con la misma apariencia, los mismos
  campos, el mismo orden y los mismos comportamientos que el registro de un gasto nuevo. La única
  diferencia DEBE ser que los campos llegan cargados con los valores ya guardados del gasto, en
  lugar de vacíos o con sus valores por defecto.
- **FR-019**: Los usuarios DEBEN poder eliminar un gasto, con confirmación previa que advierta que
  la acción es permanente.
- **FR-020**: El sistema DEBE actualizar total gastado, disponible, porcentaje consumido, desglose
  por categoría y estado de salud inmediatamente después de crear, editar o eliminar un gasto.

**Categorización automática**

- **FR-021**: El sistema DEBE proponer y preseleccionar una categoría a partir del texto de la
  descripción del gasto.
- **FR-022**: Los usuarios DEBEN poder cambiar la categoría preseleccionada antes de guardar.
- **FR-023**: El sistema DEBE preseleccionar la categoría "Otro" cuando no logre deducir una
  categoría de la descripción, de modo que guardar nunca quede bloqueado.
- **FR-024**: El sistema DEBE dejar de actualizar la preselección automática una vez que la
  persona eligió una categoría manualmente para ese gasto. Al editar un gasto ya registrado, su
  categoría guardada DEBE tratarse como una elección manual, de modo que modificar la descripción
  no la reemplace.

**Categorías**

- **FR-025**: El sistema DEBE proveer un conjunto de categorías generales predefinidas.
- **FR-026**: Las categorías DEBEN pertenecer a la cuenta del usuario y estar disponibles en todos
  sus viajes.
- **FR-027**: Los usuarios DEBEN poder crear, renombrar y eliminar categorías.
- **FR-028**: El sistema NO DEBE permitir eliminar una categoría que tenga al menos un gasto
  asociado, y DEBE explicar el motivo del bloqueo.

**Resumen y salud del presupuesto**

- **FR-029**: El sistema DEBE mostrar el total gastado del viaje, en monto y como porcentaje del
  presupuesto.
- **FR-030**: El sistema DEBE mostrar el monto disponible del viaje.
- **FR-031**: El sistema DEBE mostrar un indicador visual de progreso del consumo del presupuesto.
- **FR-032**: El sistema DEBE mostrar los días restantes del viaje sobre el total de días, cuando
  el viaje tenga fecha de regreso.
- **FR-033**: El sistema DEBE calcular el presupuesto diario restante como el monto disponible
  dividido por los días restantes del viaje, recalculándolo cada día.
- **FR-034**: El sistema DEBE comparar el presupuesto diario restante contra el presupuesto diario
  planeado (presupuesto total dividido por los días totales del viaje) para determinar el estado
  de salud del viaje.
- **FR-035**: El sistema DEBE distinguir cuatro estados de salud: margen igual o mayor al planeado;
  margen entre el 70% y el 100% del planeado; margen por debajo del 70% del planeado; y
  presupuesto excedido.
- **FR-036**: El sistema DEBE comunicar el estado de salud con un mensaje en lenguaje natural que
  incluya el monto que la persona puede gastar por día de aquí en adelante.
- **FR-037**: El sistema DEBE omitir días restantes, presupuesto diario y estado de salud en
  viajes abiertos, mostrando igualmente gastado, porcentaje y disponible.
- **FR-038**: El sistema DEBE comunicar el exceso de presupuesto de forma inequívoca cuando el
  disponible sea cero o menor.
- **FR-039**: El sistema DEBE presentar el estado del presupuesto de forma tal que una persona
  pueda interpretarlo en no más de dos segundos.

**Análisis y consulta**

- **FR-040**: El sistema DEBE mostrar un desglose comparativo del gasto acumulado por categoría,
  ordenado de mayor a menor.
- **FR-041**: El sistema DEBE mostrar el listado de gastos del viaje agrupado por día, con el
  subtotal de cada día.
- **FR-042**: Los usuarios DEBEN poder buscar gastos por texto, coincidiendo contra descripción y
  categoría.
- **FR-043**: Los usuarios DEBEN poder filtrar los gastos del viaje por rango de fechas.
- **FR-044**: El sistema DEBE mostrar estados vacíos explicativos cuando un viaje no tenga gastos
  o cuando una búsqueda no arroje resultados.

### Key Entities

- **Usuario**: la persona dueña de la cuenta. Contiene sus viajes y su set de categorías.
- **Viaje**: contenedor de un presupuesto y sus gastos. Atributos: nombre, destino, fecha de
  salida, fecha de regreso (opcional), presupuesto total, moneda (inmutable tras la creación).
  Un viaje pertenece a un usuario y no comparte datos con otros viajes.
- **Gasto**: un desembolso registrado. Atributos: monto, descripción, categoría, fecha y momento
  de registro. Pertenece a exactamente un viaje y a exactamente una categoría.
- **Categoría**: etiqueta de clasificación del gasto. Atributos: nombre y emoji representativo.
  Pertenece al usuario y se comparte entre todos sus viajes. No puede eliminarse si tiene gastos
  asociados.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona nueva completa el registro y crea su primer viaje en menos de 2 minutos
  desde que abre la aplicación por primera vez.
- **SC-002**: Registrar un gasto toma menos de 20 segundos y no exige más de 4 datos.
- **SC-003**: En al menos 8 de cada 10 gastos cuya descripción menciona algo reconocible, la
  categoría preseleccionada automáticamente es la que la persona habría elegido por su cuenta.
- **SC-004**: Al menos 9 de cada 10 personas identifican correctamente si van bien o mal de
  presupuesto en menos de 2 segundos mirando el resumen, sin recibir explicación previa.
- **SC-005**: Las mismas tareas (crear viaje, registrar gasto, consultar resumen) se completan con
  éxito tanto en teléfono como en computador, y la información mostrada es idéntica en ambos.
- **SC-006**: En 0 casos un gasto o un presupuesto aparece asociado a un viaje distinto del que
  corresponde.
- **SC-007**: En 0 casos un gasto queda guardado sin categoría.
- **SC-008**: El total gastado, el disponible y el porcentaje mostrados coinciden exactamente con
  la suma de los gastos registrados, en el 100% de las verificaciones.
- **SC-009**: Al menos 7 de cada 10 personas que registran su primer gasto siguen registrando
  gastos al tercer día del viaje.

## Out of Scope

Las siguientes capacidades quedan explícitamente fuera de Tripflow v0:

- Registro de gastos por nota de voz.
- Exportación de gastos en cualquier formato.
- Integración con bancos o tarjetas.
- División de gastos entre personas (split social).
- Captura de fotos de recibos.
- Subcategorías.
- Presupuestos o topes por categoría (el presupuesto es un único total por viaje).
- Registro de gastos en una moneda distinta a la del viaje, y conversión entre monedas.
- Eliminación de viajes.

## Assumptions

- **Cuenta obligatoria**: se decidió requerir cuenta desde el inicio para poder cumplir la
  consistencia entre teléfono y computador. Esto tensiona el requisito original de "sin fricción
  de cuentas": se mitiga manteniendo el registro al mínimo y eliminando toda pantalla de valor
  previa, de modo que el camino hasta el primer viaje sea registro → categorías → viaje.
- **Onboarding de categorías**: se resuelve como una única pantalla con todas las categorías
  generales preseleccionadas y opción de continuar sin cambiar nada, para cumplir la selección de
  categorías sin agregar fricción real.
- **Categorías generales iniciales**: Alojamiento, Comida, Transporte, Actividades, Compras,
  Salud, Telecom y Otro, según el diseño de referencia.
- **"Otro" es permanente**: la categoría "Otro" no puede eliminarse, porque es la garantía de que
  ningún gasto quede sin categoría.
- **Umbral del 70%**: el corte entre "atención" y "vas acelerada" se fija en el 70% del
  presupuesto diario planeado. Es un valor de producto ajustable tras las primeras pruebas con
  usuarios.
- **Días restantes**: se cuentan desde hoy hasta la fecha de regreso inclusive.
- **Hora del gasto**: se registra automáticamente al momento de guardar y se muestra en el
  listado; la persona edita la fecha, no la hora.
- **Gastos fuera del rango de fechas del viaje**: se permiten, porque el viaje es el contenedor
  del gasto. La fecha por defecto sigue siendo hoy.
- **Viaje mostrado por defecto**: el viaje cuyo rango de fechas contiene el día de hoy; si no hay
  ninguno, el último viaje creado.
- **Método de autenticación**: registro estándar con correo y contraseña.
- **Monedas disponibles**: catálogo acotado que cubre las monedas de LATAM más USD y EUR.
- **Idioma**: todo el contenido visible está en español LATAM, conforme al Principio II de la
  constitución del proyecto.

## Dependencies

- **Sistema de diseño**: toda la interfaz se construye con los componentes y tokens documentados
  en `.specify/memory/design-system.md` (Principio VI de la constitución). La vinculación concreta
  entre pantallas y componentes se define en la fase de planificación, no en esta especificación.
- **Diseño de referencia**: [Figma — pantallas principales](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=25-152)
  (3 pantallas mobile, 3 desktop). Cubre resumen, registro de gasto y creación de viaje. La
  edición de un gasto no requiere pantalla nueva: reutiliza la de registro, precargada (FR-018).
  Las pantallas de gestión de categorías, onboarding de categorías, búsqueda con filtro de fechas
  y estados vacíos aún no están diseñadas y se derivan de esta especificación.
- **Corrección detectada en el diseño de referencia**: los números del mockup del resumen no son
  coherentes entre sí (presupuesto $45.000 en 10 días con $18.750 gastados en 3 días implica ir
  por encima del ritmo planeado, mientras el mensaje dice "vas bien / 14% por debajo de tu
  objetivo diario"). Con la regla definida en FR-033 a FR-036, ese mismo caso debe mostrar un
  presupuesto diario restante de $3.750 frente a $4.500 planeados, es decir, estado de atención.
