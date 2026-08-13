# Feature Specification: Uso sin cuenta obligatoria (modo invitado con sincronización opcional)

**Feature Branch**: `002-guest-mode-sync`

**Created**: 2026-08-13

**Status**: Draft

**Input**: "Revisando la app, me doy cuenta que el usuario debe tener la posibilidad de poder usarla sin
iniciar sesion, el iniciar sesion o registro debe ser opcional al uso, evidentemente si inicia
sesion o se registra toda su informacion queda almacenada con sus credenciales para que cuando lo
desee pueda acceder desde otro dispositivo."

## Contexto

`001-tripflow-v0` exige una cuenta desde el primer uso (`FR-001`): sin registrarse, la persona no
puede crear un viaje ni registrar un gasto. Esta especificación elimina esa exigencia: la cuenta
pasa de ser un requisito de entrada a ser una mejora opcional. Toda la funcionalidad de Tripflow
(crear viajes, registrar y consultar gastos, ver el resumen y la salud del presupuesto, gestionar
categorías) debe estar disponible desde el primer uso sin pedir registro ni inicio de sesión,
apoyándose en el almacenamiento local que `001-tripflow-v0` ya exige para el modo offline-first
(`FR-045` a `FR-049`).

Crear una cuenta o iniciar sesión sigue existiendo, pero se convierte en un paso voluntario que la
persona elige cuando quiere una cosa concreta: que su información deje de vivir solo en ese
dispositivo y quede accesible también desde otro. Esta especificación reemplaza `FR-001` de
`001-tripflow-v0` y ajusta las secciones relacionadas con cuenta y arranque; el resto de
`001-tripflow-v0` (viajes, gastos, categorización automática, salud del presupuesto,
offline-first) se mantiene sin cambios y aplica igual a una persona con cuenta o sin ella.

## Clarifications

### Session 2026-08-13

- Q: Al iniciar sesión en una cuenta existente que ya tiene viajes propios guardados en la nube,
  mientras el dispositivo tiene datos de invitado sin guardar todavía, ¿qué debe pasar con esos
  datos locales? → A: Se fusionan: los datos locales del invitado se agregan a los que ya tenía la
  cuenta (unión); nada se pierde de ningún lado.
- Q: Cuando una persona con cuenta cierra sesión en un dispositivo, ¿qué debe pasar con los datos
  que quedan guardados en ese dispositivo? → A: Quedan disponibles localmente en modo invitado: la
  persona sigue usándolos y editándolos sin conexión a esa cuenta, y si vuelve a iniciar sesión se
  re-sincronizan (con la misma regla de fusión).
- Q: Dado que los datos de un invitado solo existen en ese dispositivo, ¿qué tan insistente debe
  ser la app para invitarlo a crear una cuenta? → A: Acceso fijo y discreto en configuración/perfil,
  sin avisos emergentes ni interrupciones del uso normal.
- Q: Si un dispositivo es compartido (una persona usó la app como invitada y luego otra distinta
  inicia sesión con su propia cuenta en ese mismo dispositivo), ¿los datos de invitado deben
  fusionarse automáticamente y en silencio, o debe mostrarse una confirmación puntual? → A: Mostrar
  una confirmación puntual dentro del propio flujo de registro o inicio de sesión, indicando cuántos
  viajes locales hay en el dispositivo y dejando incluirlos (fusionar) o descartarlos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Empezar a usar Tripflow sin crear cuenta (Priority: P1)

Una persona abre Tripflow por primera vez y, sin registrarse ni iniciar sesión, llega directo a
elegir sus categorías y crear su primer viaje. Desde ahí puede registrar gastos, ver su resumen y
usar la aplicación exactamente igual que si tuviera cuenta.

**Why this priority**: Es el corazón de esta especificación. Si todavía existe una pantalla de
cuenta obligatoria en el camino, la funcionalidad no está resuelta.

**Independent Test**: Se puede probar completo instalando la app sin ninguna cuenta previa,
llegando hasta un viaje creado con gastos registrados, sin haber visto en ningún momento una
pantalla de registro o inicio de sesión obligatoria.

**Acceptance Scenarios**:

1. **Given** una persona sin cuenta abre la app por primera vez, **When** avanza desde la
   apertura, **Then** llega directo a la selección de categorías y luego a la creación de su
   primer viaje, sin ninguna pantalla de cuenta en el medio.
2. **Given** una persona sin cuenta, **When** crea un viaje y registra gastos, **Then** toda la
   información se guarda en el dispositivo y está disponible de inmediato, con el mismo
   comportamiento que describe `001-tripflow-v0` para un viaje con cuenta.
3. **Given** una persona sin cuenta con viajes y gastos ya creados, **When** cierra la app y la
   vuelve a abrir, **Then** encuentra sus viajes y gastos intactos, sin haber iniciado sesión en
   ningún momento.
4. **Given** una persona sin cuenta, **When** usa cualquier funcionalidad de `001-tripflow-v0`
   (categorización automática, edición y eliminación de gastos, eliminación de un viaje, búsqueda y
   filtro, gestión de categorías), **Then** la funcionalidad se comporta exactamente igual que para
   una persona con cuenta.

---

### User Story 2 - Crear una cuenta para respaldar y acceder desde otro dispositivo (Priority: P1)

En cualquier momento, una persona que ya usa Tripflow sin cuenta decide registrarse (o iniciar
sesión si ya tenía una cuenta de antes) para que su información quede respaldada y disponible
también en otro dispositivo.

**Why this priority**: Es la otra mitad de la funcionalidad: sin esto, crear una cuenta no tendría
ningún efecto útil. Junto con la Historia 1 completa el ciclo "empezar gratis, respaldar cuando
quiera".

**Independent Test**: Se crean viajes y gastos como invitado, se registra una cuenta, y se
verifica que esa misma información aparece al iniciar sesión con esa cuenta en un segundo
dispositivo (o una segunda instalación simulada).

**Acceptance Scenarios**:

1. **Given** una persona usando la app sin cuenta con viajes y gastos ya creados, **When** se
   registra con una cuenta nueva, **Then** el sistema le muestra cuántos viajes tiene guardados en
   el dispositivo y, si elige incluirlos, todos sus viajes, gastos, categorías y asociaciones
   aprendidas quedan asociados a esa cuenta y respaldados.
2. **Given** una cuenta con información respaldada, **When** la persona inicia sesión con esa
   cuenta en otro dispositivo, **Then** ve exactamente los mismos viajes, gastos y categorías que
   en el dispositivo original.
3. **Given** el acceso para crear cuenta o iniciar sesión, **When** la persona lo abre y decide no
   completarlo, **Then** vuelve a usar la app con total normalidad como invitado, sin perder nada y
   sin ninguna funcionalidad restringida.
4. **Given** una persona con datos de invitado en el dispositivo, **When** inicia sesión en una
   cuenta existente que ya tenía sus propios viajes guardados de antes, **Then** el sistema le
   muestra cuántos viajes tiene guardados en el dispositivo antes de completar el inicio de
   sesión, y si elige incluirlos, el resultado combina ambos conjuntos: los viajes que ya tenía la
   cuenta y los que tenía como invitado quedan todos disponibles, sin que ninguno se pierda.
5. **Given** una persona con datos de invitado en el dispositivo, **When** inicia sesión en una
   cuenta existente y elige NO incluir los datos locales, **Then** esos datos de invitado se
   descartan del dispositivo y solo queda disponible la información que ya tenía la cuenta.
6. **Given** el formulario de registro o inicio de sesión, **When** el dispositivo no tiene
   conexión a internet, **Then** el sistema explica que ese paso requiere conexión y la persona
   puede seguir usando la app sin cuenta mientras tanto.

---

### User Story 3 - Seguir usando mis datos después de cerrar sesión (Priority: P2)

Una persona con cuenta cierra sesión en un dispositivo (por ejemplo, para prestarlo o por
privacidad) y, aun así, puede seguir viendo y usando la información que ya tenía sincronizada, como
si en ese momento pasara a ser invitada en ese dispositivo.

**Why this priority**: Evita que cerrar sesión se sienta como perder acceso a su propio trabajo. Es
importante pero secundario frente a poder empezar sin cuenta (Historia 1) y poder respaldarla
(Historia 2).

**Independent Test**: Con una cuenta con datos sincronizados, se cierra sesión y se verifica que
los viajes y gastos siguen visibles y editables sin conexión a esa cuenta; luego se vuelve a
iniciar sesión y se verifica que lo editado se re-sincroniza.

**Acceptance Scenarios**:

1. **Given** una cuenta con viajes y gastos sincronizados en un dispositivo, **When** la persona
   cierra sesión, **Then** esa información sigue disponible en el dispositivo, ahora en modo
   invitado.
2. **Given** un dispositivo en modo invitado tras haber cerrado sesión, **When** la persona sigue
   registrando o editando gastos, **Then** esos cambios se guardan localmente igual que para
   cualquier invitado.
3. **Given** un dispositivo en modo invitado tras un cierre de sesión previo, **When** la persona
   vuelve a iniciar sesión (en la misma cuenta o en otra), **Then** se aplica la misma regla de
   fusión de la Historia 2: nada de lo hecho tras el cierre de sesión se pierde.

---

### User Story 4 - Encontrar dónde crear una cuenta cuando me interesa (Priority: P3)

Una persona que viene usando Tripflow como invitada decide, por su cuenta, que quiere respaldar su
información. Encuentra fácilmente dónde hacerlo, sin que la app se lo haya interrumpido antes para
pedírselo.

**Why this priority**: Es un refinamiento de descubribilidad sobre la Historia 2, no una
funcionalidad nueva independiente.

**Independent Test**: Como invitado, sin ninguna indicación previa, se busca dónde crear una cuenta
y se verifica que existe un único lugar fijo y consistente para hacerlo (por ejemplo,
configuración o perfil).

**Acceptance Scenarios**:

1. **Given** una persona usando la app como invitada, **When** navega a configuración o perfil,
   **Then** encuentra ahí, de forma permanente, la opción de crear cuenta o iniciar sesión.
2. **Given** una persona usando la app como invitada, **When** usa la app con normalidad (crea
   viajes, registra gastos, consulta su resumen), **Then** no recibe ningún aviso emergente ni
   interrupción pidiéndole que cree una cuenta.

---

### Edge Cases

- **Desinstalar la app sin haber creado cuenta**: toda la información del invitado se pierde de
  forma permanente junto con la app; no hay ninguna copia de respaldo posible sin cuenta.
- **Dos dispositivos usados como invitado por la misma persona, luego ambos vinculados a la misma
  cuenta**: en cada vinculación se muestra la confirmación de la Historia 2 y, si la persona elige
  incluir los datos, el resultado combina lo creado como invitado en ambos dispositivos más lo que
  ya tenía la cuenta.
- **Dispositivo compartido por dos personas distintas**: si la persona que inicia sesión no
  reconoce los viajes que aparecen listados en la confirmación como propios, puede elegir
  descartarlos; el sistema nunca los asocia a su cuenta sin que ella lo confirme explícitamente.
- **Fusión con nombres de categoría coincidentes**: si el invitado y la cuenta tienen una categoría
  con el mismo nombre, se tratan como la misma categoría tras la fusión, en lugar de crear una
  categoría duplicada.
- **Cerrar sesión sin conexión**: es una operación local y no requiere conexión; los datos
  sincronizados hasta ese momento quedan disponibles en modo invitado en el dispositivo.
- **Volver a iniciar sesión en la misma cuenta desde el mismo dispositivo tras un cierre de
  sesión** (sin haber creado nada nuevo mientras tanto): no hay nada que fusionar; el estado vuelve
  a verse igual que antes de cerrar sesión.
- **Registrar una cuenta nueva sin haber usado antes la app como invitado**: no hay datos locales
  previos que fusionar; la cuenta arranca vacía, igual que describe `001-tripflow-v0`.
- **Intentar crear cuenta o iniciar sesión sin conexión**: el sistema lo impide y explica que
  requiere conexión, sin afectar el uso normal de la app sin cuenta.

## Requirements *(mandatory)*

### Functional Requirements

**Acceso sin cuenta**

- **FR-001**: El sistema DEBE permitir el uso completo de la aplicación (crear viajes; registrar,
  editar y eliminar gastos; consultar el resumen y la salud del presupuesto; gestionar categorías)
  sin exigir una cuenta en ningún momento. Este requisito reemplaza a `FR-001` de
  `001-tripflow-v0`.
- **FR-002**: El sistema NO DEBE mostrar ninguna pantalla de registro o inicio de sesión como paso
  obligatorio. La primera pantalla que ve una persona sin cuenta al abrir la app por primera vez
  DEBE ser la selección de categorías definida en `FR-003` de `001-tripflow-v0`, seguida de la
  creación de su primer viaje.
- **FR-003**: El sistema DEBE guardar localmente en el dispositivo toda la información creada sin
  cuenta (viajes, gastos, categorías, asociaciones aprendidas), disponible entre reinicios de la
  aplicación, con las mismas garantías offline-first definidas en `FR-045` a `FR-049` de
  `001-tripflow-v0`.

**Cuenta opcional**

- **FR-004**: El sistema DEBE ofrecer, de forma permanente y en un lugar fijo (configuración o
  perfil), la opción de crear una cuenta o iniciar sesión, disponible en cualquier momento del uso.
- **FR-005**: El sistema NO DEBE mostrar avisos emergentes ni interrupciones del uso normal
  invitando a crear una cuenta; la invitación a crear cuenta se limita al acceso fijo de `FR-004`.
  La confirmación puntual de `FR-008` y `FR-009` no cuenta como una de estas interrupciones, porque
  ocurre dentro del propio flujo de registro o inicio de sesión que la persona ya inició
  deliberadamente, no durante el uso normal de la app.
- **FR-006**: Los usuarios DEBEN poder cerrar o descartar la opción de crear cuenta o iniciar
  sesión y seguir usando la aplicación como invitados, sin ninguna restricción funcional ni pérdida
  de datos.
- **FR-007**: El sistema DEBE requerir conexión a internet para crear una cuenta o iniciar sesión,
  y DEBE permitir seguir usando la aplicación sin cuenta mientras no haya conexión.

**Vinculación de datos de invitado a una cuenta**

- **FR-008**: Cuando una persona que usa la aplicación como invitada, con información ya guardada
  en el dispositivo, crea una cuenta nueva, el sistema DEBE mostrarle, antes de completar el
  registro, cuántos viajes tiene guardados en ese dispositivo y dejarle elegir si quiere incluirlos
  en la cuenta nueva o descartarlos.
- **FR-009**: Cuando una persona que usa la aplicación como invitada, con información ya guardada
  en el dispositivo, inicia sesión en una cuenta ya existente, el sistema DEBE mostrarle, antes de
  completar el inicio de sesión, cuántos viajes tiene guardados en ese dispositivo y dejarle elegir
  si quiere incluirlos (fusionarlos con lo que ya tiene la cuenta) o descartarlos.
- **FR-010**: Si la persona elige incluir los datos locales en `FR-008` o `FR-009`, el sistema DEBE
  fusionarlos con la información ya asociada a la cuenta (si la hubiera): el resultado final DEBE
  incluir todos los viajes, gastos, categorías y asociaciones aprendidas de ambos orígenes, sin
  descartar ninguno.
- **FR-011**: Si la persona elige descartar los datos locales en `FR-008` o `FR-009`, el sistema
  DEBE eliminarlos del dispositivo sin asociarlos a la cuenta, dejando disponible únicamente la
  información que la cuenta ya tenía (vacía, en el caso de una cuenta recién registrada).
- **FR-012**: Al fusionar categorías, el sistema DEBE tratar como una sola categoría a las que
  coincidan por nombre entre el dispositivo invitado y la cuenta, en lugar de crear duplicados.

**Sincronización multi-dispositivo**

- **FR-013**: El sistema DEBE sincronizar viajes, gastos, categorías y asociaciones aprendidas
  entre todos los dispositivos donde la persona inicie sesión con la misma cuenta.
- **FR-014**: El sistema DEBE indicar de forma visible cuándo hay cambios pendientes de
  sincronizar y cuándo la sincronización se completó, incluyendo el momento en que una persona
  invitada crea o vincula una cuenta.

**Cierre de sesión**

- **FR-015**: Al cerrar sesión, el sistema DEBE conservar en el dispositivo, en modo invitado, toda
  la información que estaba sincronizada con la cuenta hasta ese momento, disponible para seguir
  consultándola y editándola sin conexión a esa cuenta.
- **FR-016**: Los cambios hechos en modo invitado después de un cierre de sesión DEBEN pasar por la
  misma confirmación de `FR-008`/`FR-009` la próxima vez que la persona inicie sesión en cualquier
  cuenta desde ese dispositivo, y fusionarse según `FR-010` si la persona elige incluirlos.

### Key Entities

- **Usuario**: la persona que usa la aplicación. Existe siempre, con o sin credenciales asociadas:
  - **Invitado**: identidad local al dispositivo, sin credenciales; sus viajes, gastos y
    categorías existen únicamente en ese dispositivo.
  - **Con cuenta**: identidad asociada a credenciales; sus viajes, gastos y categorías están
    respaldados y accesibles desde cualquier dispositivo donde inicie sesión.
  - Pasar de invitado a con cuenta (por registro o inicio de sesión) reasigna la propiedad de la
    información existente sin recrearla; nunca se pierde información en esa transición.
- **Viaje**, **Gasto**, **Categoría**, **Asociación aprendida**: mismas entidades definidas en
  `001-tripflow-v0`, sin cambios en sus atributos. Su propietario es el Usuario, sea invitado o con
  cuenta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona nueva llega a su primer viaje creado sin ver, en ningún momento, una
  pantalla de cuenta, y en menos de 2 minutos desde que abre la aplicación por primera vez.
- **SC-002**: El 100% de los viajes, gastos, categorías y asociaciones aprendidas creados como
  invitado siguen presentes y accesibles después de que esa persona elige incluirlos al crear una
  cuenta o iniciar sesión, sin pérdidas ni duplicados.
- **SC-003**: Una persona con cuenta ve exactamente la misma información (viajes, gastos,
  categorías) al consultarla desde dos dispositivos distintos donde inició sesión con esa cuenta.
- **SC-004**: Al menos 9 de cada 10 personas, al buscar deliberadamente dónde crear una cuenta,
  la encuentran en menos de 15 segundos sin ayuda externa.
- **SC-005**: 0 casos de una persona que pierde acceso a su propia información por cerrar sesión en
  un dispositivo, mientras siga teniendo ese dispositivo a mano.
- **SC-006**: 0 casos en los que crear o vincular una cuenta borre, sobrescriba o asocie
  silenciosamente (sin la confirmación de `FR-008`/`FR-009`) información que la persona ya había
  creado como invitada.

## Out of Scope

Las siguientes capacidades quedan explícitamente fuera de esta especificación:

- Recuperación de contraseña y demás flujos estándar de gestión de credenciales: se asumen
  resueltos con prácticas convencionales, sin detalle adicional en esta spec.
- Fusionar dos cuentas registradas distintas entre sí (esta spec solo cubre fusionar datos de
  invitado hacia una cuenta).
- Uso simultáneo de más de una cuenta activa en el mismo dispositivo, o perfiles múltiples.
- Compartir el contenido de una cuenta entre distintas personas (uso familiar o colaborativo).
- Cambiar el método de autenticación definido en `001-tripflow-v0` (correo y contraseña).

## Assumptions

- **Método de autenticación**: se mantiene el de `001-tripflow-v0` (registro estándar con correo y
  contraseña); esta spec no introduce métodos nuevos.
- **Eliminación de cuenta**: sigue vigente tal como la define `001-tripflow-v0` (`FR-055`,
  `FR-056`); una persona invitada, al no tener cuenta, no tiene nada que eliminar salvo desinstalar
  la aplicación.
- **Un usuario activo por dispositivo**: en todo momento el dispositivo está en un solo estado
  (invitado, o con sesión iniciada en una cuenta), nunca en ambos simultáneamente.
- **Resolución de conflictos al fusionar**: se reutiliza el mismo criterio de `001-tripflow-v0`
  para conflictos de sincronización (prevalece el cambio con la marca de tiempo más reciente) para
  el caso excepcional de que el mismo viaje o gasto exista, con el mismo identificador, tanto en el
  dispositivo invitado como en la cuenta; el caso esperado y frecuente es que la fusión simplemente
  una conjuntos de datos distintos, sin coincidencias.
- **Categorías por defecto duplicadas**: dado que tanto una cuenta nueva como un dispositivo
  invitado nuevo arrancan con el mismo conjunto de categorías generales predefinidas
  (`001-tripflow-v0`), la regla de fusión por nombre de `FR-012` evita que aparezcan duplicadas al
  fusionar.
- **Confirmación de `FR-008`/`FR-009`**: basta con mostrar la cantidad de viajes locales (no hace
  falta el detalle de cada gasto) para que la persona decida si los reconoce como propios; es
  información suficiente para una decisión de incluir o descartar sin agregar fricción excesiva al
  flujo de registro o inicio de sesión.

## Dependencies

- **`001-tripflow-v0`**: esta especificación depende directamente de esa spec y modifica su sección
  "Cuenta y arranque". Reemplaza su `FR-001` (cuenta obligatoria) por el `FR-001` de esta spec (uso
  sin cuenta permitido) y por los requisitos de `FR-002` a `FR-016` de esta spec. El resto de
  `001-tripflow-v0` (viajes, gastos, categorización automática, salud del presupuesto,
  offline-first, eliminación de cuenta) permanece vigente sin cambios y se asume conocido.
- **Sistema de diseño**: toda interfaz nueva que introduzca esta spec (acceso a crear cuenta o
  iniciar sesión desde configuración/perfil) se construye con los componentes y tokens de
  `.specify/memory/design-system.md` (Principio VI de la constitución).
