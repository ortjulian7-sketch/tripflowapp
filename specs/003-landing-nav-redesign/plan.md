# Implementation Plan: Bienvenida inicial y navegación alineada al Figma Make

**Branch**: `003-landing-nav-redesign` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-landing-nav-redesign/spec.md`

## Summary

Hoy la app entra directo a la selección de categorías (o al dashboard) sin ningún momento de
elección, y esa misma pantalla de categorías tiene un defecto real: llega con las 8 categorías ya
sembradas y marcadas, sin responder al toque. Esta feature agrega una única pantalla de bienvenida
(Iniciar sesión / Registrarse / Continuar como invitado) que se muestra solo cuando el dispositivo
no tiene ninguna identidad establecida todavía, rediseña la navegación principal a cuatro destinos
(Resumen, Registrar, Nuevo viaje, Cuenta) y el orden de contenido del panel principal según la
referencia de Figma Make, corrige el defecto de selección de categorías invirtiendo cuándo se
siembran (recién al confirmar la elección, no antes), y agrega el logo de marca a la bienvenida y a
la navegación móvil (hoy ausente). La causa raíz común de la bienvenida y del defecto de onboarding
es la misma: `IdentityProvider` crea una identidad de invitado como efecto secundario de montarse,
sin que medie ninguna decisión explícita de la persona (`research.md` §1). El diseño técnico
completo está en `research.md`.

## Technical Context

**Language/Version**: TypeScript 5.x sobre React 18 — sin cambios respecto a `001-tripflow-v0` /
`002-guest-mode-sync`.

**Primary Dependencies**: ninguna dependencia nueva. Se reutilizan React Router, Dexie.js,
`@supabase/supabase-js` y Tailwind exactamente como están.

**Storage**: IndexedDB (Dexie) y Postgres (Supabase) sin cambios de esquema. No se agrega ninguna
tabla, columna ni valor nuevo de `localStorage` — el estado de "bienvenida resuelta" se deriva de
la identidad activa existente (`session` o `tripflow_active_identity`), no se persiste aparte
(`research.md` §1).

**Testing**: Vitest para el resto de la lógica pura sin cambios; ninguna función pura nueva de
negocio se introduce (la selección de onboarding es estado de UI). Se extiende la prueba de humo
Playwright existente (`tests/e2e/camino-dorado.spec.ts`) para pasar por `/bienvenida` y tocar
categorías explícitamente en ambos caminos dorados (con y sin cuenta). El resto se valida
manualmente vía `quickstart.md`.

**Target Platform**: Web responsiva / PWA — sin cambios.

**Project Type**: Aplicación web de un solo frontend + backend administrado (Supabase) — sin
cambios.

**Performance Goals**: sin cambios respecto a `001-tripflow-v0`/`002-guest-mode-sync`
(lectura/escritura local <100ms). La bienvenida no agrega ninguna llamada de red: "Continuar como
invitado" es 100% local; "Iniciar sesión"/"Registrarse" solo navegan a pantallas que ya requerían
red para completarse.

**Constraints**: la bienvenida y "Continuar como invitado" deben funcionar 100% offline (hereda
FR-003, FR-045 a FR-049 de `001-tripflow-v0`); ninguna pantalla nueva o ajustada puede introducir
estilos fuera de `.specify/memory/design-system.md` (Principio VI).

**Scale/Scope**: 1 pantalla nueva (Bienvenida), 1 componente nuevo (`Logo`), navegación
rediseñada (4 destinos en vez de 3), 1 pantalla reescrita (selección de categorías del onboarding),
2 pantallas con ajustes de contenido/layout (panel principal, Cuenta) — sin cambios de alcance más
allá de lo definido en `spec.md`.

**UI Components**: pantallas nuevas o modificadas, mapeadas a `.specify/memory/design-system.md`
(Principio VI):

| Pantalla / elemento | Componentes reutilizados |
|---|---|
| Bienvenida (nueva) | `Logo` (nuevo, ver abajo); `Button` — Style: Secondary, Size: Large ×3 (`research.md` §8) |
| Navegación (sidebar + bottom bar) | `Nav Item` ×4 (Layout Horizontal/Vertical según ya existe); `Logo` en sidebar (reemplaza texto plano) y en header móvil (nuevo ahí) |
| Panel principal (Resumen) | `Progress Bar` — Style: Warning/Brand (sin cambios de componente, solo de orden); `Icon Button` — Style: Secondary (ícono `search`, nuevo entry point) |
| Selección de categorías (onboarding) | `Chip` — State: Default/Selected, ahora interactivo (`aria-pressed` ya soportado por el componente, solo se activa `onClick`) |
| Cuenta | `List Item` (nuevo enlace a Categorías, ambas ramas invitado/con sesión) |
| Logo (nuevo componente) | Compone `public/icons/icon.svg` (`<img>`) + texto `font-brand`/`color-text-brand` (Catamaran) — documentado en `design-system.md` como extensión (`FR-018`, `research.md` §6) |

No se agrega ningún ícono nuevo al inventario de `Icon` (`home`, `plus`, `map`, `search`, `user` ya
cubren los 4 destinos de nav + búsqueda). El único componente genuinamente nuevo es `Logo`, que se
documenta en `.specify/memory/design-system.md` como parte de esta feature (`FR-018`) antes de
usarse.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Nota |
|---|---|---|
| I. Simplicidad ante todo | ✅ Cumple | La bienvenida se deriva de la identidad activa ya existente, sin bandera ni tabla nueva (`research.md` §1); el defecto de onboarding se corrige invirtiendo el orden de una siembra que ya existía, no agregando un mecanismo paralelo (`research.md` §2). |
| II. Idioma y mercado | ✅ Cumple | Bienvenida, nav y todo texto nuevo en español LATAM, sin excepción. |
| III. Cero alcance fantasma | ✅ Cumple | Cada elemento de la bienvenida y del rediseño de nav responde a un FR de `spec.md`; la jerarquía de botones de la bienvenida se resuelve sin inventar una prioridad entre opciones que la spec no pidió (`research.md` §8). |
| IV. Verificable por persona no técnica | ✅ Cumple | `quickstart.md` traduce las 5 historias de usuario y los edge cases de mayor riesgo en pasos manuales dentro de la app. |
| V. Datos del usuario con respeto | ✅ Cumple | No se solicita ningún dato nuevo de la persona; "Continuar como invitado" no envía nada a la red. |
| VI. Sistema de diseño como fuente de verdad | ✅ Cumple | Toda la UI nueva reutiliza componentes ya catalogados (`Button`, `Chip`, `Nav Item`, `List Item`, `Icon Button`); el único componente nuevo (`Logo`) se documenta en el catálogo antes de usarse (`FR-018`), reutilizando tokens/assets ya existentes sin introducir paleta ni tipografía nueva. |

*Re-evaluación tras Phase 1 (Design & Contracts): ver al final de este documento.*

## Project Structure

### Documentation (this feature)

```text
specs/003-landing-nav-redesign/
├── plan.md                                  # Este archivo (/speckit-plan)
├── research.md                              # Fase 0 (/speckit-plan)
├── data-model.md                            # Fase 1 (/speckit-plan)
├── quickstart.md                            # Fase 1 (/speckit-plan)
├── contracts/
│   ├── entrada-gate-contract.md             # Fase 1 — resolución de identidad + gate de ruteo
│   └── onboarding-categorias-contract.md    # Fase 1 — selección y persistencia de categorías iniciales
└── tasks.md                                 # Fase 2 (/speckit-tasks — no generado acá)
```

`specs/001-tripflow-v0/contracts/*` y `specs/002-guest-mode-sync/contracts/guest-link-contract.md`
siguen vigentes sin cambios y se referencian, no se duplican — `linkGuestData.ts` no cambia su
lógica interna, solo cómo `LoginPage`/`RegistroPage` lo invocan cuando `identidadAnterior` es
`null` (`research.md` §1, `contracts/entrada-gate-contract.md`).

### Source Code (repository root)

Proyecto único ya existente (`tripflow/`, ver `specs/001-tripflow-v0/plan.md` § Project
Structure) — esta feature no reestructura el árbol, solo agrega/modifica los siguientes archivos:

```text
src/
├── features/
│   └── identity/
│       ├── activeIdentity.ts        # + peekActiveIdentity() (lee sin crear)
│       └── IdentityProvider.tsx     # userId pasa a string | null; + establecerInvitado()
├── app/
│   ├── routes.tsx                   # + EntradaGate (redirige a /bienvenida sin identidad);
│   │                                 #   Bootstrap deja de sembrar categorías; /viajes/nuevo
│   │                                 #   se mueve dentro del grupo AppShell
│   ├── bienvenida/                  # NUEVO
│   │   └── BienvenidaPage.tsx       # Iniciar sesión / Registrarse / Continuar como invitado
│   ├── auth/
│   │   ├── LoginPage.tsx            # identidadAnterior tolera null (0 viajes locales)
│   │   └── RegistroPage.tsx         # quita el pre-seed (asegurarCategorias); navega con
│   │                                 #   state: { cuentaNueva: true }
│   ├── onboarding/
│   │   └── CategoriasOnboardingPage.tsx  # reescrita: selección local interactiva, default
│   │                                       #   vacía, persiste recién al confirmar (FR-012 a FR-014)
│   ├── account/
│   │   └── CuentaPage.tsx           # + enlace a /categorias (ambas ramas), FR-009
│   ├── dashboard/
│   │   └── DashboardPage.tsx        # reordenado según FR-007; + ícono de búsqueda (FR-008)
│   ├── trips/
│   │   └── NuevoViajePage.tsx       # wrapper de layout ajustado para convivir con AppShell
│   └── AppShell.tsx                 # NAV_ITEMS → 4 destinos; + <Logo /> en sidebar y header móvil
├── components/
│   └── Logo.tsx                     # NUEVO — ícono + wordmark (FR-016 a FR-018)
└── features/
    └── categories/
        └── seed.ts                  # refactor: catálogo candidato + guardarSeleccionInicial()
                                       #   (reemplaza seedCategoriasIniciales, ya sin otros usos)

tests/
└── e2e/
    └── camino-dorado.spec.ts        # ambos caminos dorados pasan por /bienvenida y tocan
                                       #   categorías explícitamente antes de "Continuar"

.specify/memory/
└── design-system.md                 # + sección "Logo" (FR-018)
```

**Structure Decision**: mismo proyecto único (SPA/PWA) de `001-tripflow-v0`/`002-guest-mode-sync`,
sin nuevos servicios ni carpetas de alto nivel. Se agrega una sola pantalla nueva
(`src/app/bienvenida/`) y un componente nuevo (`src/components/Logo.tsx`); el resto son
modificaciones puntuales a archivos ya existentes, concentradas en dos causas raíz identificadas en
`research.md`: (1) cuándo se establece la identidad activa (`identity/`, `routes.tsx`,
`auth/`, `bienvenida/`), y (2) cuándo se siembran las categorías por defecto (`onboarding/`,
`categories/seed.ts`, `routes.tsx`, `auth/RegistroPage.tsx`).

## Complexity Tracking

*Sin violaciones que justificar.* El único cambio de tipo (`userId: string` → `string | null` en
`IdentityProvider`) no es complejidad evitable: es la única forma de representar "todavía no hay
identidad" sin un side effect oculto ni una bandera redundante (`research.md` §1) — el compilador
de TypeScript, no una convención, es lo que garantiza que ningún componente use un `userId` antes
de que el gate de ruteo confirme que existe.

## Re-evaluación de la Constitution Check (post Fase 1)

Tras generar `research.md`, `data-model.md`, `contracts/entrada-gate-contract.md`,
`contracts/onboarding-categorias-contract.md`, `quickstart.md` y la sección "Logo" de
`.specify/memory/design-system.md`, se revisó de nuevo cada principio:

| Principio | Estado tras diseño |
|---|---|
| I. Simplicidad ante todo | ✅ Se mantiene: ambos defectos de raíz (bienvenida y selección de categorías) se resuelven invirtiendo *cuándo* ocurre algo que ya existía (creación de identidad, siembra de categorías), no agregando un mecanismo paralelo. El "Estado de bienvenida" quedó confirmado como valor derivado, sin tabla ni bandera nueva (`data-model.md`). |
| II. Idioma y mercado | ✅ Se mantiene: sin cambios de diseño que lo afecten; `quickstart.md` y los contratos están en español LATAM igual que el resto de la app. |
| III. Cero alcance fantasma | ✅ Se mantiene: los contratos declaran explícitamente sus límites — `entrada-gate-contract.md` no toca la lógica de vinculación de `002-guest-mode-sync`, solo cómo se invoca con identidad nula; `onboarding-categorias-contract.md` no toca `crearCategoria` ni `sugerirCategoria`, solo el momento de la siembra inicial. La jerarquía de botones de la bienvenida se resolvió sin inventar una opción "más importante" que la spec no pidió (`research.md` §8). |
| IV. Verificable por persona no técnica | ✅ Se mantiene: los 7 escenarios de `quickstart.md` cubren las 5 historias de usuario y los edge cases de mayor riesgo (identidad previa, sin conexión, cero categorías) con pasos manuales verificables en la app. |
| V. Datos del usuario con respeto | ✅ Se mantiene: "Continuar como invitado" sigue siendo 100% local; no se agregó ningún dato nuevo solicitado a la persona. |
| VI. Sistema de diseño como fuente de verdad | ✅ Se mantiene, y queda documentado: el único componente nuevo (`Logo`) se agregó primero al catálogo (`.specify/memory/design-system.md` § Logo) antes de referenciarse desde este plan, reutilizando únicamente tokens y assets ya existentes (`Brand/Display`, `color-text-brand`, `public/icons/icon.svg`) — cumple el proceso que el propio catálogo describe en "Cómo se usa en el flujo SDD". |

No quedan violaciones sin justificar. El plan está listo para `/speckit-tasks`.
