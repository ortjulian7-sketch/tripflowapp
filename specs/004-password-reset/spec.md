# Feature Specification: Recuperar contraseña olvidada

**Feature Branch**: `004-password-reset`

**Created**: 2026-08-13

**Status**: Draft

**Input**: "Un usuario registrado (con cuenta, no invitado) que olvidó su contraseña necesita poder
recuperar el acceso a su cuenta desde la pantalla de Iniciar sesión. Hoy no existe ningún camino
para esto: LoginPage.tsx no tiene un enlace '¿Olvidaste tu contraseña?', y AuthProvider.tsx solo
expone signUp/signIn/signOut (no hay ninguna llamada a resetPasswordForEmail de Supabase ni
pantalla para pedir el reset por correo o para establecer una contraseña nueva). Se necesita un
flujo completo: desde Login, un enlace a 'olvidé mi contraseña'; una pantalla para ingresar el
correo y disparar el email de recuperación vía Supabase Auth; y una pantalla para que la persona,
al volver desde el enlace del correo, establezca su nueva contraseña. Debe integrarse con la
navegación y el sistema de diseño ya existentes (mismo estilo visual que LoginPage/RegistroPage), y
funcionar tanto para cuentas que fueron creadas directamente como para cuentas vinculadas desde modo
invitado."

## Contexto

Hoy, una persona con cuenta (creada en `002-guest-mode-sync` directamente en `RegistroPage` o
vinculando datos de invitado) que olvida su contraseña queda sin ningún camino para recuperar el
acceso: `LoginPage.tsx` no ofrece ningún enlace de recuperación, y `AuthProvider.tsx` no expone
ninguna llamada al flujo de reset de Supabase Auth. Esta especificación agrega ese camino completo
—solicitar el correo de recuperación y establecer una contraseña nueva desde el enlace recibido—
sin modificar el comportamiento ya implementado de `signUp`/`signIn`/`signOut`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Solicitar el correo de recuperación desde Login (Priority: P1)

Una persona con cuenta que no recuerda su contraseña, estando en la pantalla de Iniciar sesión,
toca un enlace para recuperarla, ingresa su correo y el sistema le envía un email con un enlace de
recuperación.

**Why this priority**: Sin esto no existe ningún punto de entrada al flujo — es el primer paso
obligatorio y el pedido explícito de la especificación.

**Independent Test**: Desde `/login`, tocar "¿Olvidaste tu contraseña?", ingresar el correo de una
cuenta existente y confirmar que el sistema muestra un mensaje de confirmación de envío.

**Acceptance Scenarios**:

1. **Given** la pantalla de Iniciar sesión, **When** la persona mira sus opciones, **Then**
   encuentra un enlace "¿Olvidaste tu contraseña?" visible junto a las opciones ya existentes
   (Crear cuenta, Continuar como invitado).
2. **Given** la pantalla de recuperación, **When** ingresa el correo de una cuenta existente y
   confirma, **Then** el sistema dispara un correo con un enlace de recuperación y muestra un
   mensaje de confirmación de envío.
3. **Given** la pantalla de recuperación, **When** ingresa un correo que no corresponde a ninguna
   cuenta y confirma, **Then** el sistema muestra el mismo mensaje de confirmación que en el
   escenario anterior, sin revelar si ese correo tiene o no una cuenta asociada.

---

### User Story 2 - Establecer una contraseña nueva desde el enlace recibido (Priority: P1)

Una persona que solicitó la recuperación abre el enlace de su correo, ingresa una contraseña nueva
y vuelve a tener acceso a su cuenta con esa contraseña.

**Why this priority**: Es el segundo paso obligatorio: sin esto, el correo de recuperación no sirve
de nada y el flujo queda incompleto.

**Independent Test**: Abrir un enlace de recuperación válido, ingresar y confirmar una contraseña
nueva, y verificar que la persona puede iniciar sesión con ella inmediatamente después.

**Acceptance Scenarios**:

1. **Given** un enlace de recuperación válido y no vencido, **When** la persona lo abre, **Then**
   llega a una pantalla para ingresar y confirmar una contraseña nueva.
2. **Given** esa pantalla, **When** ingresa una contraseña nueva que cumple el requisito mínimo y
   confirma, **Then** la contraseña de la cuenta queda actualizada y puede iniciar sesión con ella.
3. **Given** un enlace vencido o ya utilizado, **When** la persona lo abre, **Then** el sistema
   muestra un mensaje claro explicando que el enlace ya no es válido y la invita a solicitar uno
   nuevo.

---

### User Story 3 - Recuperar la contraseña de una cuenta vinculada desde invitado (Priority: P2)

Una persona que empezó como invitada, vinculó sus datos a una cuenta nueva, y más adelante olvida
esa contraseña, puede recuperarla exactamente igual que cualquier otra cuenta.

**Why this priority**: Confirma que el flujo no distingue cómo se originó la cuenta — es una
verificación de que no queda ningún camino de creación de cuenta sin cobertura, pero no bloquea el
flujo principal (Historias 1 y 2) si no se prueba explícitamente.

**Independent Test**: Crear una cuenta vinculando datos de invitado (`002-guest-mode-sync`), cerrar
sesión, y completar el flujo de recuperación con el correo de esa cuenta.

**Acceptance Scenarios**:

1. **Given** una cuenta creada mediante vinculación de datos de invitado, **When** la persona
   solicita recuperar su contraseña con el correo de esa cuenta, **Then** el flujo funciona
   exactamente igual que para una cuenta creada directamente en Registrarse.

---

### Edge Cases

- **Sin conexión**: solicitar el correo de recuperación o confirmar la contraseña nueva sin
  conexión muestra el mismo aviso ya definido en `002-guest-mode-sync` ("Este paso requiere
  conexión a internet"), sin bloquear el resto de la app.
- **Cuenta invitada**: la recuperación no aplica a identidades invitadas (no tienen correo ni
  contraseña asociados) — el enlace solo se ofrece desde Login, nunca desde un flujo de invitado.
- **Solicitudes repetidas**: pedir el enlace más de una vez invalida los enlaces anteriores; solo el
  más reciente permite establecer la contraseña nueva.
- **Enlace abierto en otro dispositivo o navegador**: funciona igual sin importar dónde se abra, ya
  que no depende de ningún estado local del dispositivo que originó la solicitud.

## Requirements *(mandatory)*

### Functional Requirements

**Solicitud de recuperación**

- **FR-001**: La pantalla de Iniciar sesión DEBE mostrar un enlace "¿Olvidaste tu contraseña?"
  visible junto a las opciones ya existentes (Crear cuenta, Continuar como invitado).
- **FR-002**: El sistema DEBE ofrecer una pantalla donde la persona ingresa su correo para solicitar
  la recuperación.
- **FR-003**: Al confirmar un correo en esa pantalla, el sistema DEBE disparar un correo de
  recuperación de contraseña hacia esa dirección.
- **FR-004**: El sistema DEBE mostrar el mismo mensaje de confirmación de envío sin importar si el
  correo ingresado corresponde a una cuenta existente o no, para no revelar qué correos están
  registrados.

**Establecer contraseña nueva**

- **FR-005**: El sistema DEBE ofrecer una pantalla donde la persona, tras abrir el enlace recibido
  por correo, ingresa y confirma una contraseña nueva.
- **FR-006**: La contraseña nueva DEBE cumplir el mismo requisito mínimo ya exigido en Registrarse
  (mínimo 6 caracteres).
- **FR-007**: Al confirmar una contraseña nueva válida con un enlace vigente, el sistema DEBE
  actualizar la contraseña de la cuenta y permitir iniciar sesión con ella de inmediato.
- **FR-008**: Si el enlace está vencido o ya fue utilizado, el sistema DEBE mostrar un mensaje claro
  y ofrecer un camino para volver a solicitar uno nuevo.

**Alcance e integración**

- **FR-009**: El flujo DEBE funcionar de manera idéntica para cuentas creadas directamente en
  Registrarse y para cuentas vinculadas desde modo invitado, sin distinción entre ambos orígenes.
- **FR-010**: Solicitar el correo de recuperación o confirmar la contraseña nueva DEBE requerir
  conexión a internet, mostrando el mismo aviso ya usado en Login/Registro cuando no la hay.
- **FR-011**: Las pantallas nuevas de esta funcionalidad DEBEN construirse con los componentes,
  tokens y patrones de `.specify/memory/design-system.md`, con la misma jerarquía visual que
  `LoginPage`/`RegistroPage` (Principio VI de la constitución).
- **FR-012**: Esta funcionalidad NO DEBE modificar el comportamiento ya implementado de
  `signUp`, `signIn` ni `signOut`.

### Key Entities

- **Solicitud de recuperación**: correo ingresado por la persona para iniciar el flujo. No persiste
  como dato propio de la app — el envío del correo y la vigencia del enlace los administra el
  proveedor de autenticación ya en uso.
- **Usuario**: misma entidad definida en `001-tripflow-v0`, sin cambios de atributos — la
  recuperación solo actualiza su credencial de acceso, nunca sus datos de viajes/gastos/categorías.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona que olvidó su contraseña logra solicitar el correo de recuperación desde
  Login en 2 toques o menos más el ingreso del correo.
- **SC-002**: El 100% de los enlaces de recuperación válidos y no vencidos permiten establecer una
  contraseña nueva y acceder con ella en el primer intento.
- **SC-003**: 0 casos en los que el mensaje de confirmación de envío revele si un correo ingresado
  corresponde o no a una cuenta existente.
- **SC-004**: Una persona que abre un enlace vencido entiende qué pasó y cómo solicitar uno nuevo
  sin necesitar contactar soporte, verificable con el mensaje mostrado en pantalla.

## Assumptions

- **Proveedor de autenticación**: se sigue usando Supabase Auth (ya en uso para
  `signUp`/`signIn`/`signOut`), aprovechando su flujo estándar de recuperación por correo en lugar
  de construir uno propio.
- **Vigencia del enlace**: se usa el tiempo de expiración por defecto que ofrece Supabase Auth para
  los enlaces de recuperación, sin configurar un valor personalizado salvo que se decida lo
  contrario en la fase de planificación.
- **Plantilla del correo**: se usa la plantilla de recuperación de contraseña que Supabase Auth ya
  administra; el diseño visual del correo en sí queda fuera del alcance de esta especificación (solo
  se especifica el contenido de las pantallas dentro de la app).
- **Requisito de contraseña**: se reutiliza el mismo mínimo de 6 caracteres ya exigido en
  Registrarse, sin agregar reglas de complejidad adicionales.

## Dependencies

- **`001-tripflow-v0`**: define la entidad Usuario y el uso de Supabase como backend de
  autenticación.
- **`002-guest-mode-sync`**: define que las cuentas pueden crearse directamente o vincularse desde
  modo invitado — ambos orígenes deben poder recuperar contraseña por igual (Historia 3).
- **Sistema de diseño** (`.specify/memory/design-system.md`): fuente de verdad visual para las
  pantallas nuevas de esta funcionalidad.

## Out of Scope

- Recuperación de acceso para identidades invitadas: no tienen correo ni contraseña asociados: su
  "acceso" es simplemente seguir usando el mismo dispositivo.
- Autenticación multifactor, preguntas de seguridad, u otros métodos de verificación adicionales.
- Cambiar la contraseña estando ya con sesión iniciada: es un caso distinto (gestión de cuenta con
  sesión activa) que no forma parte de esta especificación, que cubre solo el caso de haberla
  olvidado.
