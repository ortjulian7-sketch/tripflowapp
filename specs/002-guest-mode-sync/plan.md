# Implementation Plan: Uso sin cuenta obligatoria (modo invitado con sincronización opcional)

**Branch**: `002-guest-mode-sync` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-guest-mode-sync/spec.md`

## Summary

Hoy `001-tripflow-v0` exige cuenta desde el primer uso: el router bloquea toda la app detrás de
`RequireAuth` y cada pantalla lee `session.user.id` directo de Supabase Auth. Esta feature quita
ese bloqueo sin construir una arquitectura paralela: generaliza el concepto de "quién es el
dueño de este dato" a una **identidad activa** que es el `user_id` de la cuenta cuando hay
sesión, o un uuid generado en el dispositivo cuando no la hay. Todo el resto de la app (Dexie,
`writeAndQueue`, el motor de sincronización, los repositorios de Viaje/Categoría/Gasto) sigue
funcionando sin cambios porque nunca necesitó saber si ese `user_id` viene de una cuenta o no. Lo
único genuinamente nuevo es la rutina que, al registrarse o iniciar sesión, decide qué hacer con
los datos que ya existían bajo la identidad anterior (fusionarlos o descartarlos, con
confirmación explícita — ver `contracts/guest-link-contract.md`).

## Technical Context

**Language/Version**: TypeScript 5.x sobre React 18 — sin cambios respecto a `001-tripflow-v0`.

**Primary Dependencies**: ninguna dependencia nueva. Se reutilizan React Router, Dexie.js,
`@supabase/supabase-js`, `vite-plugin-pwa` y Tailwind exactamente como están.

**Storage**: IndexedDB (Dexie) y Postgres (Supabase) sin cambios de esquema. Se agrega un único
valor nuevo en `localStorage` del dispositivo (`tripflow_active_identity`, ver `data-model.md`) —
no es una tabla ni requiere migración.

**Testing**: Vitest para la función pura de deduplicación/reasignación de categorías al vincular
(nueva, ver `contracts/guest-link-contract.md`) + extensión de la prueba de humo Playwright
existente para cubrir el nuevo camino dorado sin cuenta. El resto se valida manualmente vía
`quickstart.md`, mismo criterio que `001-tripflow-v0`.

**Target Platform**: Web responsiva / PWA — sin cambios.

**Project Type**: Aplicación web de un solo frontend + backend administrado (Supabase) — sin
cambios.

**Performance Goals**: sin cambios respecto a `001-tripflow-v0` (lectura/escritura local <100ms).
La rutina de vinculación agrega un único `select` de red (peek de categorías remotas) antes de
navegar a la app tras registrarse/iniciar sesión — aceptable porque ese paso ya requiere red
(FR-007) y ya implica una espera de red para `signUp`/`signIn`.

**Constraints**: el uso sin cuenta debe funcionar 100% offline, igual que hoy funciona el uso con
cuenta (FR-003, hereda FR-045 a FR-049 de `001-tripflow-v0`); vincular una cuenta sigue
requiriendo conexión (FR-007, ya era así para registro/login en `001-tripflow-v0`); ningún dato
de invitado puede llegar a Supabase sin pasar por una vinculación confirmada explícitamente
(Principio V) — garantizado estructuralmente por RLS (`auth.uid() = user_id`), no solo por
convención de la UI.

**Scale/Scope**: sin cambios respecto a `001-tripflow-v0`.

**UI Components**: pantallas nuevas o modificadas, mapeadas a `.specify/memory/design-system.md`
(Principio VI):

| Pantalla / elemento | Componentes reutilizados |
|---|---|
| Cuenta (invitado) | Card — Style: Subtle (explicación breve); Button — Style: Primary ("Crear cuenta o iniciar sesión") |
| Cuenta (con sesión) | Button — Style: Secondary ("Cerrar sesión") agregado junto al bloque ya existente de eliminar cuenta |
| Confirmación de vinculación | `ConfirmDialog` existente, extendido con `tone="neutral"` (texto `text-text-secondary`, botón de confirmar `Style: Primary` en vez de `Danger` — ver `research.md` §6); reutiliza el mismo patrón de overlay que ya usan las confirmaciones de borrado |
| Router / arranque | Sin componente visual propio — redirige a la pantalla de Onboarding de categorías ya existente cuando corresponde |

No se agrega ningún componente nuevo al catálogo de `design-system.md`: `ConfirmDialog` no forma
parte de ese catálogo (es una composición interna de `Button`), así que extender su prop `tone`
es un cambio de implementación, no una extensión del sistema de diseño.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Nota |
|---|---|---|
| I. Simplicidad ante todo | ✅ Cumple | No se agrega ninguna dependencia, tabla, endpoint ni motor de sincronización nuevo. El único mecanismo nuevo (identidad activa) generaliza uno que ya existía (`session.user.id` como clave de partición) en vez de duplicarlo — ver `research.md` §1–§2. |
| II. Idioma y mercado | ✅ Cumple | Toda la interfaz nueva (confirmación de vinculación, acceso a cuenta para invitados) en español LATAM, sin excepción. |
| III. Cero alcance fantasma | ✅ Cumple | Cada pieza del diseño técnico responde a un FR de `spec.md`; no se agrega OAuth social, recuperación de contraseña nueva ni fusión entre dos cuentas (explícitamente fuera de alcance de `spec.md`). |
| IV. Verificable por persona no técnica | ✅ Cumple | `quickstart.md` traduce las 4 historias de usuario y los edge cases de mayor riesgo (dispositivo compartido, categorías duplicadas) en pasos manuales dentro de la app. |
| V. Datos del usuario con respeto | ✅ Cumple | Ningún dato de invitado se asocia a una cuenta sin confirmación explícita (`contracts/guest-link-contract.md`); reforzado estructuralmente por RLS, no solo por la UI. No se solicita ningún dato nuevo de la persona. |
| VI. Sistema de diseño como fuente de verdad | ✅ Cumple | Toda la UI nueva reutiliza componentes ya cotalogados (`Button`, `Card`) o composiciones internas ya existentes (`ConfirmDialog`), sin soluciones visuales aisladas. |

*Re-evaluación tras Phase 1 (Design & Contracts): ver al final de este documento.*

## Project Structure

### Documentation (this feature)

```text
specs/002-guest-mode-sync/
├── plan.md                          # Este archivo (/speckit-plan)
├── research.md                      # Fase 0 (/speckit-plan)
├── data-model.md                    # Fase 1 (/speckit-plan)
├── quickstart.md                    # Fase 1 (/speckit-plan)
├── contracts/
│   └── guest-link-contract.md       # Fase 1 — único contrato nuevo
└── tasks.md                         # Fase 2 (/speckit-tasks — no generado acá)
```

`specs/001-tripflow-v0/contracts/data-schema.md` y `.../sync-contract.md` siguen vigentes sin
cambios y se referencian, no se duplican.

### Source Code (repository root)

Proyecto único ya existente (`tripflow/`, ver `specs/001-tripflow-v0/plan.md` § Project
Structure) — esta feature no reestructura el árbol, solo agrega/modifica los siguientes
archivos:

```text
src/
├── features/
│   ├── identity/                    # NUEVO
│   │   ├── activeIdentity.ts        # get/set de tripflow_active_identity (localStorage)
│   │   ├── IdentityProvider.tsx     # envuelve AuthProvider; expone { userId, isGuest, loading }
│   │   └── linkGuestData.ts         # rutina de vinculación (contracts/guest-link-contract.md)
│   ├── auth/
│   │   └── AuthProvider.tsx         # sin cambios de forma; sigue siendo la fuente de `session`
│   ├── categories/
│   │   └── seed.ts                  # sin cambios de forma; se invoca desde un lugar nuevo (bootstrap), no desde RegistroPage
│   └── sync/                        # sin cambios: writeAndQueue/push/pull/useSync se reutilizan tal cual
├── app/
│   ├── routes.tsx                   # se quita el gate RequireAuth de las rutas principales; se agrega el bootstrap de onboarding
│   ├── auth/
│   │   ├── RegistroPage.tsx         # quita la llamada directa a seedCategoriasIniciales; agrega el paso de vinculación
│   │   └── LoginPage.tsx            # agrega el paso de vinculación
│   └── account/
│       └── CuentaPage.tsx           # UI condicional invitado/con cuenta; agrega botón "Cerrar sesión"
├── components/
│   └── ConfirmDialog.tsx            # agrega prop opcional `tone` (default 'danger', compatible con los 3 usos actuales)
└── lib/
    └── id.ts                        # sin cambios; se reutiliza newId() para el id de invitado

tests/
├── unit/
│   └── identity/                    # NUEVO: dedupe/reasignación de categorías al vincular
└── e2e/
    └── (golden path existente extendido para cubrir el camino sin cuenta)
```

**Structure Decision**: mismo proyecto único (SPA/PWA) de `001-tripflow-v0`, sin nuevos
servicios ni carpetas de alto nivel. Se agrega un solo feature (`src/features/identity/`) y se
modifican los puntos de entrada (router, páginas de auth, página de cuenta) para leer la
identidad desde ese feature en vez de leer `session.user.id` directo — cambio mecánico repetido
en un puñado de archivos, no una reestructuración.

## Complexity Tracking

*Sin violaciones que justificar.* La única pieza de lógica no trivial —la deduplicación de
categorías al vincular (`contracts/guest-link-contract.md`)— es complejidad inherente al
requisito FR-012 de `spec.md`, no una elección de diseño evitable: sin ella, vincular una cuenta
con categorías del mismo nombre crearía duplicados, violando esa misma spec.

## Re-evaluación de la Constitution Check (post Fase 1)

Tras generar `research.md`, `data-model.md`, `contracts/guest-link-contract.md` y
`quickstart.md`, se revisó de nuevo cada principio:

| Principio | Estado tras diseño |
|---|---|
| I. Simplicidad ante todo | ✅ Se mantiene: el diseño final no introduce ningún mecanismo de sincronización nuevo — la rutina de vinculación reutiliza `writeAndQueue`/`cambios_pendientes`/`useSync` tal como existen, apoyándose en la garantía de orden push-antes-de-pull que `001-tripflow-v0` ya construyó para otro propósito (FR-049). |
| II. Idioma y mercado | ✅ Se mantiene: sin cambios de diseño que lo afecten. |
| III. Cero alcance fantasma | ✅ Se mantiene: `contracts/guest-link-contract.md` declara explícitamente qué NO hace (no fusiona cuentas entre sí, no resuelve conflictos campo a campo) para no crecer más allá de lo que `spec.md` pide. |
| IV. Verificable por persona no técnica | ✅ Se mantiene: los 7 escenarios de `quickstart.md` cubren las 4 historias de usuario y los edge cases de mayor riesgo con pasos manuales verificables en la app. |
| V. Datos del usuario con respeto | ✅ Se mantiene, y queda más robusto que en el diseño inicial: la confirmación de vinculación es estructuralmente obligatoria (RLS impide que datos de invitado lleguen a Supabase sin haber sido reasignados primero), no solo una convención de UI que un bug podría saltarse. |
| VI. Sistema de diseño como fuente de verdad | ✅ Se mantiene: ninguna pantalla nueva introduce estilos fuera de los tokens ya documentados. |

No quedan violaciones sin justificar. El plan está listo para `/speckit-tasks`.
