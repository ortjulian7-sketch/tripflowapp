# Implementation Plan: Recuperar contraseña olvidada

**Branch**: `004-password-reset` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md)

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Agregar el camino completo de recuperación de contraseña que hoy no existe: un enlace "¿Olvidaste tu
contraseña?" en `LoginPage`, una pantalla nueva para pedir el correo de recuperación
(`RecuperarContrasenaPage`) y otra para establecer la contraseña nueva desde el enlace recibido
(`NuevaContrasenaPage`). El enfoque técnico reutiliza el flujo nativo de Supabase Auth
(`resetPasswordForEmail` / `updateUser`) ya envuelto por `AuthProvider.tsx`, sin backend propio ni
tablas nuevas — ver decisiones en [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5.5 sobre React 18.3 (Vite 5.4)

**Primary Dependencies**: `react-router-dom` 6.26 (rutas), `@supabase/supabase-js` 2.45
(`resetPasswordForEmail`, `updateUser`, `onAuthStateChange`), Tailwind 3.4 (estilos vía tokens del
sistema de diseño)

**Storage**: N/A — sin tablas nuevas en Dexie ni en Supabase Postgres (ver [data-model.md](./data-model.md)); Supabase Auth administra la vigencia del enlace internamente

**Testing**: Vitest (unit — sin precedente de unit tests para `LoginPage`/`RegistroPage`, esta feature sigue esa misma convención) + Playwright (e2e — nuevo `tests/e2e/recuperar-contrasena.spec.ts`, mismo patrón que `camino-dorado.spec.ts`/`onboarding-tras-registro.spec.ts`)

**Target Platform**: Web responsive (PWA existente), sin código específico de plataforma nuevo

**Project Type**: Single web app (frontend React + Supabase como backend gestionado, sin servicio propio)

**Performance Goals**: N/A — navegación estándar de SPA, sin ruta caliente ni volumen que justifique un objetivo de performance dedicado

**Constraints**: Debe mostrar el mismo aviso "Este paso requiere conexión a internet" ya usado en Login/Registro cuando no hay red (FR-010); ningún secreto nuevo en código (Principio V) — solo se usa la misma clave anónima ya configurada en `src/lib/supabase.ts`

**Scale/Scope**: 2 pantallas nuevas, 2 métodos nuevos en `AuthProvider`, 2 rutas nuevas, 1 enlace nuevo en `LoginPage`; sin tocar `signUp`/`signIn`/`signOut` (FR-012)

**UI Components** (de `.specify/memory/design-system.md`, todos reutilizados sin crear nada nuevo en el catálogo):

- **Input** — Type: Text (correo, contraseña con `secure`), misma variante que usan `LoginPage`/`RegistroPage`
- **Button** — Primary, Size: Large, misma variante que `LoginPage`/`RegistroPage`
- **Logo** — Size: Large, mismo header que `LoginPage`/`RegistroPage`
- **Toast** (`src/components/Toast.tsx`, ya montado vía `ToastProvider` en `App.tsx`) — variante `success`, para el mensaje de confirmación de envío (FR-002–FR-004) y el de éxito al establecer la contraseña (FR-007)
- **Enlace de texto** — no es un componente propio del catálogo; se reutiliza el patrón inline ya usado en `LoginPage`/`RegistroPage` (`<Link>`/`<button>` con `font-semibold text-text-brand transition-opacity hover:opacity-80`) para "¿Olvidaste tu contraseña?" y para el enlace de vuelta a `/recuperar-contrasena` cuando el enlace venció

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación | Estado |
|---|---|---|
| I. Simplicidad ante todo | Se reutiliza el flujo nativo de Supabase Auth (`resetPasswordForEmail`/`updateUser`) en vez de construir tokens/tablas propias (research.md §1). Sin estado global nuevo: el evento `PASSWORD_RECOVERY` se escucha localmente en `NuevaContrasenaPage`, no se agrega a `AuthContextValue` (data-model.md). | ✅ Pass |
| II. Idioma y mercado | Todo el copy nuevo (enlaces, labels, mensajes de error/éxito) en español LATAM con tuteo, sin voseo — mismo patrón que `LoginPage`/`RegistroPage`. Se verifica en implementación/QA. | ✅ Pass |
| III. Cero alcance fantasma | Implementa exactamente FR-001 a FR-012; el Out of Scope del spec (MFA, preguntas de seguridad, cambio de contraseña con sesión activa) queda explícitamente fuera de este plan. | ✅ Pass |
| IV. Verificable por una persona no técnica | SC-001 a SC-004 ya redactados en el spec como pasos de uso de la app; `quickstart.md` documenta cómo comprobarlos manualmente sin leer código. | ✅ Pass |
| V. Datos del usuario con respeto | Único dato nuevo solicitado es el correo (ya recolectado en Login/Registro) y la contraseña nueva; ningún secreto nuevo en código, se reutiliza la misma clave anónima de Supabase ya configurada. | ✅ Pass |
| VI. Sistema de diseño como fuente de verdad | Únicamente componentes ya catalogados (Input, Button, Logo, Toast) y el patrón de enlace inline ya usado en Login/Registro — sin soluciones visuales aisladas ni componentes nuevos que agregar al catálogo. | ✅ Pass |

Sin violaciones — no aplica la sección Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/004-password-reset/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md         # Phase 1 output (/speckit-plan command)
├── quickstart.md         # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── auth-recovery-contract.md   # Phase 1 output (/speckit-plan command)
├── checklists/
│   └── requirements.md
└── tasks.md              # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── auth/
│       ├── LoginPage.tsx                  # MODIFICAR: agregar enlace "¿Olvidaste tu contraseña?" (FR-001)
│       ├── RegistroPage.tsx                # sin cambios
│       ├── RecuperarContrasenaPage.tsx      # NUEVO: pedir correo (FR-002–FR-004)
│       └── NuevaContrasenaPage.tsx          # NUEVO: establecer contraseña nueva (FR-005–FR-008)
├── features/
│   └── auth/
│       ├── AuthProvider.tsx                # MODIFICAR: agregar resetPassword/updatePassword (sin tocar signUp/signIn/signOut, FR-012)
│       └── authErrors.ts                   # MODIFICAR: extender traducirErrorAuth para errores de resetPasswordForEmail/updateUser
└── app/
    └── routes.tsx                          # MODIFICAR: agregar /recuperar-contrasena (bajo RedirectIfAuth) y /recuperar-contrasena/confirmar (ruta de nivel superior, ver research.md §2)

tests/
└── e2e/
    └── recuperar-contrasena.spec.ts        # NUEVO: cubre User Stories 1 y 2 (mismo patrón que camino-dorado.spec.ts)
```

**Structure Decision**: Single web app existente (`src/app`, `src/features`, `src/components`,
`src/lib`) — esta feature no introduce una capa nueva, solo dos pantallas dentro de
`src/app/auth/` (junto a `LoginPage`/`RegistroPage`) y dos métodos dentro del `AuthProvider`
existente, siguiendo la estructura ya establecida.

## Complexity Tracking

*Sin violaciones de la Constitution Check — sección no aplica.*
