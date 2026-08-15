---

description: "Task list for Recuperar contraseña olvidada"
---

# Tasks: Recuperar contraseña olvidada

**Input**: Design documents from `/specs/004-password-reset/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Sí, acotado al alcance que define `plan.md` (sección Testing): **Playwright**
extiende `tests/e2e/recuperar-contrasena.spec.ts` con el flujo completo de User Story 1 y con
el caso de enlace vencido de User Story 2 (simulable navegando directo con los parámetros de
error de Supabase en la URL). El camino feliz completo de User Story 2 depende de abrir un
correo real (`quickstart.md` § Prerrequisitos: "no hay mock local para esto") y se valida
manualmente. Sin **Vitest** nuevo: no hay precedente de unit tests para `LoginPage`/`RegistroPage`
y esta feature sigue esa misma convención (`research.md` § Resumen de NEEDS CLARIFICATION,
`plan.md` § Testing).

**Organization**: Las tareas están agrupadas por historia de usuario para permitir
implementación y validación independientes de cada una.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo (archivo distinto, sin dependencias pendientes)
- **[Story]**: A qué historia de usuario pertenece (US1, US2, US3)
- Cada tarea incluye la ruta exacta del archivo

## Path Conventions

Mismo proyecto único (SPA/PWA) ya existente de `001-tripflow-v0` (`src/`, `tests/` en la raíz
del repositorio). Esta feature no agrega ninguna dependencia, tabla ni servicio nuevo (`plan.md`
§ Technical Context) y no tiene ningún concepto compartido que bloquee a todas las historias a la
vez: `resetPassword` (US1) y `updatePassword` (US2) son métodos independientes del mismo
`AuthProvider`, y sus pantallas y rutas no se pisan entre sí. Por eso no hay fases de Setup ni
Foundational — se empieza directo en la Fase 3 (User Story 1).

---

## Phase 3: User Story 1 - Solicitar el correo de recuperación desde Login (Priority: P1) 🎯 MVP

**Goal**: Desde `/login`, un enlace visible lleva a una pantalla nueva donde la persona ingresa
su correo; al confirmar, Supabase Auth dispara el email de recuperación y la app muestra un
toast de confirmación, sin revelar si ese correo tiene o no una cuenta asociada.

**Independent Test**: Desde `/login`, tocar "¿Olvidaste tu contraseña?", ingresar el correo de
una cuenta existente y confirmar que el sistema muestra un mensaje de confirmación de envío
(`quickstart.md` § Validar User Story 1).

### Implementation for User Story 1

- [X] T001 [P] [US1] Agregar `resetPassword: (email: string) => Promise<{ error: string | null }>` a `AuthContextValue` y su implementación en `src/features/auth/AuthProvider.tsx`: llama `supabase.auth.resetPasswordForEmail(email, { redirectTo: \`${window.location.origin}/recuperar-contrasena/confirmar\` })` y traduce el error con `traducirErrorAuth` (contracts/auth-recovery-contract.md § 1); no toca `signUp`/`signIn`/`signOut` (FR-012)
- [X] T002 [P] [US1] Extender `traducirErrorAuth` en `src/features/auth/authErrors.ts` con los casos de error propios de `resetPasswordForEmail` no cubiertos hoy (p. ej. límite de solicitudes repetidas de Supabase) — reutiliza los casos genéricos ya existentes (correo inválido) sin duplicarlos
- [X] T003 [US1] Crear `RecuperarContrasenaPage` en `src/app/auth/RecuperarContrasenaPage.tsx`: formulario de correo con el mismo layout que `LoginPage`/`RegistroPage` (`Logo` size large, `Input` de correo, `Button` primary large), bloqueo con "Este paso requiere conexión a internet." cuando `!navigator.onLine` (FR-010), llamada a `resetPassword` al confirmar y `useToast().showToast(...)` con el mismo mensaje de éxito sin importar el resultado de negocio (FR-002 a FR-004, research.md § 4) (depende de T001)
- [X] T004 [P] [US1] Agregar la ruta `/recuperar-contrasena` → `RecuperarContrasenaPage` dentro del grupo `RedirectIfAuth` (junto a `/login`, `/registro`) en `src/app/routes.tsx` (contracts/auth-recovery-contract.md § 2) (depende de T003)
- [X] T005 [P] [US1] Agregar el enlace "¿Olvidaste tu contraseña?" en `src/app/auth/LoginPage.tsx` hacia `/recuperar-contrasena`, mismo patrón visual que el enlace "Crear cuenta" (`font-semibold text-text-brand transition-opacity hover:opacity-80`) (FR-001) (depende de T003)
- [X] T006 [US1] Crear `tests/e2e/recuperar-contrasena.spec.ts` con el escenario de User Story 1: desde `/login`, tocar el enlace, ingresar un correo y confirmar que aparece el toast de confirmación (FR-004, SC-003) (depende de T004, T005) — **alcance reducido tras un incidente real**: el caso "correo con cuenta asociada" quedó fuera del suite automatizado porque hace que Supabase encole un envío real; correrlo repetidamente contra buzones inventados (`@gmail.com` generados por el test) disparó la detección de bounces de Supabase y una restricción temporal de envío en el proyecto (correo de Supabase recibido 2026-08-15). El suite automatizado solo usa el caso "sin cuenta asociada" (`@example.com`, Supabase no encola nada — comportamiento de anti-enumeración), que es seguro de repetir. El camino con cuenta existente se valida manualmente (`quickstart.md` § Validar User Story 1), como ya estaba previsto para el camino feliz completo de User Story 2.

**Checkpoint**: User Story 1 completamente funcional y verificable de forma independiente
(`quickstart.md` § Validar User Story 1).

---

## Phase 4: User Story 2 - Establecer una contraseña nueva desde el enlace recibido (Priority: P1)

**Goal**: Al abrir el enlace de recuperación, la persona llega a una pantalla que detecta si el
enlace es válido o venció, y si es válido le permite establecer y confirmar una contraseña
nueva; al confirmarla, la cuenta queda actualizada y la persona puede iniciar sesión con ella de
inmediato.

**Independent Test**: Abrir un enlace de recuperación válido, ingresar y confirmar una
contraseña nueva, y verificar que la persona puede iniciar sesión con ella inmediatamente
después (`quickstart.md` § Validar User Story 2).

### Implementation for User Story 2

- [X] T007 [P] [US2] Agregar `updatePassword: (newPassword: string) => Promise<{ error: string | null }>` a `AuthContextValue` y su implementación en `src/features/auth/AuthProvider.tsx`: llama `supabase.auth.updateUser({ password: newPassword })` y traduce el error con `traducirErrorAuth` (contracts/auth-recovery-contract.md § 1); no toca `signUp`/`signIn`/`signOut` (FR-012) — mismo archivo que T001, método distinto, sin conflicto
- [X] T008 [P] [US2] Extender `traducirErrorAuth` en `src/features/auth/authErrors.ts` con los casos de error propios de `updateUser` no cubiertos hoy (p. ej. "la contraseña nueva debe ser distinta de la actual") — el caso de contraseña corta (FR-006) ya está cubierto por el mensaje existente de `signUp` — mismo archivo que T002, casos distintos, sin conflicto
- [X] T009 [US2] Crear `NuevaContrasenaPage` en `src/app/auth/NuevaContrasenaPage.tsx`: al montar, leer `window.location.hash` con `URLSearchParams` — si contiene `error` (p. ej. `error=access_denied&error_code=otp_expired`), mostrar de inmediato el mensaje de enlace vencido/usado con un enlace de vuelta a `/recuperar-contrasena` (FR-008); si no, esperar el evento `PASSWORD_RECOVERY` de `supabase.auth.onAuthStateChange` (con timeout corto de fallback al mismo mensaje de enlace inválido) antes de mostrar el formulario de contraseña nueva y confirmación (mínimo 6 caracteres, FR-006); al confirmar con éxito vía `updatePassword`, llamar `signOut()` y navegar a `/login` con `useToast().showToast(...)` de éxito (FR-005, FR-007, research.md § 2–3) (depende de T007)
- [X] T010 [US2] Agregar la ruta `/recuperar-contrasena/confirmar` → `NuevaContrasenaPage` como ruta de nivel superior en `src/app/routes.tsx`, **fuera** de `RedirectIfAuth` y de `EntradaGate`/`Bootstrap` (contracts/auth-recovery-contract.md § 2, research.md § 2) (depende de T009) — mismo archivo que T004, ruta distinta, sin conflicto
- [X] T011 [US2] Extender `tests/e2e/recuperar-contrasena.spec.ts` con el escenario de enlace vencido/usado de User Story 2: navegar directo a `/recuperar-contrasena/confirmar#error=access_denied&error_code=otp_expired` y confirmar que aparece el mensaje de enlace inválido con el enlace de vuelta a `/recuperar-contrasena`, sin mostrar nunca el formulario de contraseña (FR-008, SC-004) (depende de T006, T010)

**Checkpoint**: User Stories 1 y 2 funcionan de forma independiente y en conjunto forman el
camino completo de recuperación (`quickstart.md` § Validar User Story 2, incluyendo la
validación manual del camino feliz completo con un correo real).

---

## Phase 5: User Story 3 - Recuperar la contraseña de una cuenta vinculada desde invitado (Priority: P2)

**Goal**: Confirmar que el flujo de User Story 1 + User Story 2 funciona exactamente igual para
una cuenta creada vinculando datos de invitado (`002-guest-mode-sync`) que para una creada
directamente en Registrarse — sin código nuevo, es una verificación de que no queda ningún
camino de creación de cuenta sin cobertura (spec.md § Historia 3, "Why this priority").

**Independent Test**: Crear una cuenta vinculando datos de invitado, cerrar sesión, y completar
el flujo de recuperación con el correo de esa cuenta (`quickstart.md` § Validar User Story 3).

### Implementation for User Story 3

- [ ] T012 [US3] Validar manualmente `quickstart.md` § Validar User Story 3: seguir el flujo de `002-guest-mode-sync` para crear una cuenta vinculando datos de invitado, cerrar sesión, y repetir "Validar User Story 1" y "Validar User Story 2" con el correo de esa cuenta — confirmar comportamiento idéntico al de una cuenta creada directamente en Registrarse (FR-009) (depende de T006, T011) — **pendiente**: requiere abrir un correo real, no automatizable por el agente

**Checkpoint**: Las 3 historias de usuario funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificación final contra los criterios de éxito y los principios de la
constitución.

- [ ] T013 [P] Ejecutar de principio a fin todos los escenarios de validación manual de `specs/004-password-reset/quickstart.md`, incluyendo § Validar sin conexión (FR-010) — **pendiente**: requiere un correo real (quickstart.md § Prerrequisitos), no automatizable por el agente
- [X] T014 [P] Revisar que todo el texto nuevo (enlace "¿Olvidaste tu contraseña?", labels, mensajes de error/éxito, mensaje de enlace vencido) esté en español LATAM con tuteo, sin voseo (Principio II) en `src/app/auth/RecuperarContrasenaPage.tsx`, `src/app/auth/NuevaContrasenaPage.tsx`, `src/app/auth/LoginPage.tsx` y `src/features/auth/authErrors.ts`
- [X] T015 [P] Auditar que `RecuperarContrasenaPage.tsx` y `NuevaContrasenaPage.tsx` usen exclusivamente componentes y tokens ya documentados en `.specify/memory/design-system.md` (Input, Button, Logo, Toast, patrón de enlace inline) sin estilos aislados ni componentes nuevos (Principio VI, FR-011)
- [X] T016 [P] Confirmar por diff que `signUp`, `signIn` y `signOut` en `src/features/auth/AuthProvider.tsx` quedaron sin cambios de comportamiento (FR-012)

**Checkpoint**: Feature completa y verificada contra `spec.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Stories (Phase 3–5)**: sin fase Foundational previa — cada historia solo depende de
  código ya existente en el repo (`AuthProvider`, `Input`/`Button`/`Logo`/`Toast`,
  `traducirErrorAuth`, `routes.tsx`). US1 y US2 pueden avanzar en paralelo (si hay equipo) o
  secuencialmente en orden de prioridad; US3 depende de que US1 y US2 estén completas porque es
  una validación sobre ambas.
- **Polish (Phase 6)**: depende de que estén completas las tres historias.

### User Story Dependencies

- **US1 (P1)**: sin dependencias con otras historias — es el punto de entrada del flujo.
- **US2 (P1)**: sin dependencias de código con US1 (`NuevaContrasenaPage` se llega vía el enlace
  del correo, no vía navegación interna desde `RecuperarContrasenaPage`); su Independent Test
  asume un enlace de recuperación válido, que en la práctica requiere haber completado US1 al
  menos una vez.
- **US3 (P2)**: depende de US1 y US2 completas — no agrega código propio, solo repite ambos
  flujos con una cuenta de origen distinto (spec.md: "confirma que el flujo no distingue cómo se
  originó la cuenta").

> Nota: T001/T007 tocan el mismo archivo (`AuthProvider.tsx`) en métodos distintos; T002/T008
> tocan el mismo archivo (`authErrors.ts`) en casos distintos; T004/T010 tocan el mismo archivo
> (`routes.tsx`) en rutas distintas — mismo patrón que "T017 y T018" en
> `002-guest-mode-sync/tasks.md`: ediciones secuenciales del mismo archivo, sin conflicto
> funcional entre ellas.

### Within Each User Story

- Método de `AuthProvider` antes que la pantalla que lo consume (T001 antes de T003; T007 antes
  de T009).
- Extensión de `traducirErrorAuth` en paralelo con el método de `AuthProvider` que la usará
  (T002 junto a T001; T008 junto a T007).
- Pantalla antes que su ruta (T003 antes de T004; T009 antes de T010).
- Ruta y enlace de entrada en paralelo una vez que la pantalla existe (T004 junto a T005).
- Prueba e2e al final de cada historia, extendiendo el mismo archivo (T006, luego T011).
- Historia completa antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- **Phase 3 (US1)**: T001 (AuthProvider.tsx) junto a T002 (authErrors.ts); T004 (routes.tsx)
  junto a T005 (LoginPage.tsx) una vez lista T003.
- **Phase 4 (US2)**: T007 (AuthProvider.tsx) junto a T008 (authErrors.ts).
- **Phase 6**: T013, T014, T015 y T016 en paralelo.
- Con equipo: US1 y US2 pueden repartirse simultáneamente tras leer este documento — no
  comparten pasos bloqueantes entre sí, solo archivos que se editan en líneas distintas.

---

## Parallel Example: User Story 1

```bash
# Método nuevo y traducción de errores, en paralelo:
Task: "Agregar resetPassword a src/features/auth/AuthProvider.tsx"
Task: "Extender traducirErrorAuth en src/features/auth/authErrors.ts para resetPasswordForEmail"

# Tras crear RecuperarContrasenaPage, ruta y enlace de entrada en paralelo:
Task: "Agregar ruta /recuperar-contrasena en src/app/routes.tsx"
Task: "Agregar enlace '¿Olvidaste tu contraseña?' en src/app/auth/LoginPage.tsx"
```

## Parallel Example: User Story 2

```bash
# Método nuevo y traducción de errores, en paralelo:
Task: "Agregar updatePassword a src/features/auth/AuthProvider.tsx"
Task: "Extender traducirErrorAuth en src/features/auth/authErrors.ts para updateUser"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

La propia spec marca US1 y US2 como los dos pasos obligatorios de un mismo flujo P1: sin US2, el
correo que dispara US1 no sirve de nada.

1. Phase 3: US1 (T001–T006)
2. Phase 4: US2 (T007–T011)
3. **DETENERSE Y VALIDAR**: `quickstart.md` § Validar User Story 1 y § Validar User Story 2
   (incluyendo el camino feliz completo con un correo real, y el caso de enlace vencido)
4. Desplegar/demostrar

### Incremental Delivery

1. + US1 → validar § Validar User Story 1 → desplegar/demo
2. + US2 → **MVP completo** → validar § Validar User Story 2 → desplegar
3. + US3 → validar § Validar User Story 3 (sin código nuevo) → desplegar
4. + Phase 6 (Polish) → validar `quickstart.md` completo, incluyendo § Validar sin conexión

Cada incremento agrega valor sin romper los anteriores.

### Parallel Team Strategy

Con dos personas desarrollando:

1. Persona A: US1 (T001–T006)
2. Persona B: US2 (T007–T011) — no depende del código de US1, solo de que exista
   eventualmente un enlace de recuperación real para su propia validación manual
3. Ambas convergen en US3 (T012, validación conjunta) y Phase 6 (Polish)

---

## Notes

- Tareas [P] = archivos distintos, sin dependencias pendientes.
- La etiqueta [Story] mapea cada tarea a su historia para trazabilidad.
- Sin tablas, columnas ni endpoints nuevos: Supabase Auth administra la vigencia e invalidación
  de los enlaces de recuperación internamente (`data-model.md`).
- El evento `PASSWORD_RECOVERY` se escucha localmente dentro de `NuevaContrasenaPage` (T009), sin
  agregarlo a `AuthContextValue` — no hay un segundo consumidor que lo justifique (Principio I,
  data-model.md).
- Toda la interfaz nueva usa exclusivamente componentes y tokens de
  `.specify/memory/design-system.md` (Principio VI): `Input`, `Button`, `Logo`, `Toast` y el
  patrón de enlace inline ya usado en `LoginPage`/`RegistroPage`.
- Todo el contenido visible va en español LATAM con tuteo, sin voseo (Principio II).
- `signUp`, `signIn` y `signOut` quedan sin modificar (FR-012, verificado en T016).
- Hacer commit tras cada tarea o grupo lógico; detenerse en cada checkpoint para validar la
  historia de forma independiente.
</content>
