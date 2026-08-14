# Implementation Plan: Introducción explicativa antes de elegir categorías

**Branch**: `005-onboarding-intro` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-onboarding-intro/spec.md`

## Summary

Hoy, apenas alguien continúa como invitado o termina de registrarse, cae directo en la selección de
categorías sin ningún contexto sobre qué es Tripflow. Esta feature inserta una introducción de 4
pasos (diseño provisto en Figma por el usuario) entre ese punto de entrada y la selección de
categorías ya existente, saltable en cualquier momento, y que se muestra una única vez por
identidad reutilizando el mismo gate de onboarding que ya existe (`categorias.length === 0`). La
única desviación respecto al Figma es deliberada: el CTA del último paso dice "Seleccionar mis
categorías" (no "Crear mi primer viaje" como en el diseño) porque el flujo real termina en
categorías, no en crear un viaje — instrucción explícita del usuario al pedir este plan. El diseño
técnico completo está en `research.md`.

## Technical Context

**Language/Version**: TypeScript 5.x sobre React 18 — sin cambios respecto a `001-tripflow-v0` /
`002-guest-mode-sync` / `003-landing-nav-redesign`.

**Primary Dependencies**: ninguna dependencia nueva. Se reutilizan React Router y Tailwind
exactamente como están; esta feature no toca Dexie ni Supabase.

**Storage**: sin cambios de esquema ni de `localStorage`. No se persiste el paso actual de la
introducción ni ningún flag de "introducción vista" — se deriva del mismo conteo de categorías que
ya usa `Bootstrap()` (`research.md` §7, `data-model.md`).

**Testing**: Vitest sin funciones puras nuevas de negocio (el paso actual es estado de UI, igual
que la selección de categorías). Se extiende la prueba de humo Playwright existente
(`tests/e2e/camino-dorado.spec.ts`) para pasar por los 4 pasos de la introducción (o saltarla) antes
de llegar a categorías, en ambos caminos dorados (con y sin cuenta). El resto se valida manualmente
vía `quickstart.md`.

**Target Platform**: Web responsiva / PWA — sin cambios.

**Project Type**: Aplicación web de un solo frontend + backend administrado (Supabase) — sin
cambios.

**Performance Goals**: sin cambios respecto a features previas. La introducción no agrega ninguna
llamada de red — los 4 pasos y sus assets son 100% locales (`FR-008`).

**Constraints**: la introducción DEBE funcionar 100% offline (`FR-008`); ninguna pantalla nueva
puede introducir estilos fuera de `.specify/memory/design-system.md` (Principio VI); no debe
alterar la lógica de selección de `CategoriasOnboardingPage` ya corregida en
`003-landing-nav-redesign` (`FR-004`).

**Scale/Scope**: 1 pantalla nueva (`IntroOnboardingPage`, 4 pasos en una sola ruta), 1 cambio de
gate (`Bootstrap()`), 6 call sites de navegación actualizados (`research.md` §6), 4 assets SVG
nuevos, 2 componentes nuevos documentados en el catálogo (Onboarding Illustration, Step Indicator)
— sin cambios de alcance más allá de lo definido en `spec.md`.

**UI Components**: pantalla nueva, mapeada a `.specify/memory/design-system.md` (Principio VI):

| Elemento | Componentes reutilizados |
|---|---|
| Botón "Saltar" (esquina superior) | Texto plano `color-text-secondary`, mismo patrón de link ya usado en `LoginPage`/`RegistroPage`/`DashboardPage` ("Editar viaje") — no amerita un componente nuevo |
| Ilustración central (4 assets) | **Onboarding Illustration** (nuevo, ver abajo) |
| Título / subtítulo | `Heading/H1`-equivalente (Catamaran SemiBold 34px, tal como especifica el Figma de esta pantalla) + `Body` (`color-text-secondary`) |
| Indicador de 4 puntos | **Step Indicator** (nuevo, ver abajo) |
| CTA principal | `Button` — Style: Primary, Size: Large (sin modificar el componente — ver `research.md` §4 sobre la sombra) |

No se agrega ningún ícono nuevo al inventario de `Icon` (las ilustraciones no son íconos de línea,
ver nota de extensión). Dos componentes genuinamente nuevos, ya documentados en
`.specify/memory/design-system.md` antes de referenciarse acá: **Onboarding Illustration** y **Step
Indicator**.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Nota |
|---|---|---|
| I. Simplicidad ante todo | ✅ Cumple | Una sola pantalla con estado local de 4 pasos, no 4 rutas (`research.md` §2); la ilustración compuesta del paso 2 se resuelve como un único asset en vez de 5 archivos + posicionamiento absoluto (`research.md` §3); no se modifica `Button` por una diferencia de sombra menor en un solo Figma (`research.md` §4). |
| II. Idioma y mercado | ✅ Cumple | Los 4 pasos están en español LATAM (el título del paso 1, "Plan less. Travel more.", es el único texto en inglés del Figma provisto — ver nota abajo). |
| III. Cero alcance fantasma | ✅ Cumple | Cada paso y cada botón responde a un FR de `spec.md`; la única desviación del Figma (CTA final → "Seleccionar mis categorías") está explícitamente pedida por el usuario y documentada en `research.md` §1, no es una libertad tomada sin respaldo. |
| IV. Verificable por persona no técnica | ✅ Cumple | `quickstart.md` traduce las 3 historias de usuario y los edge cases en pasos manuales dentro de la app. |
| V. Datos del usuario con respeto | ✅ Cumple | No se solicita ningún dato nuevo; la introducción es contenido estático, sin llamada de red. |
| VI. Sistema de diseño como fuente de verdad | ✅ Cumple | Reutiliza `Button` sin modificarlo; los dos elementos genuinamente nuevos (Onboarding Illustration, Step Indicator) se documentaron en el catálogo antes de usarse acá. |

**Nota — Principio II vs. el Figma provisto**: el título del paso 1 ("Plan less. Travel more.")
viene en inglés en el archivo de Figma que compartió el usuario; los otros 3 títulos y los 4
subtítulos ya están en español. Dado que el Principio II exige español LATAM sin excepción y el
usuario no pidió explícitamente mantener ese texto en inglés (solo pidió "implementar el diseño"),
este plan asume que es un texto de placeholder del Figma y **debe traducirse** al implementar (p.
ej. "Planeá menos. Viajá más." o equivalente) — ver `research.md` §1 y quedará confirmado como tarea
explícita en `/speckit-tasks`.

*Re-evaluación tras Phase 1 (Design & Contracts): ver al final de este documento.*

## Project Structure

### Documentation (this feature)

```text
specs/005-onboarding-intro/
├── plan.md                                  # Este archivo (/speckit-plan)
├── research.md                              # Fase 0 (/speckit-plan)
├── data-model.md                            # Fase 1 (/speckit-plan)
├── quickstart.md                            # Fase 1 (/speckit-plan)
├── contracts/
│   └── onboarding-intro-gate-contract.md    # Fase 1 — ruteo del gate + propagación de cuentaNueva
└── tasks.md                                 # Fase 2 (/speckit-tasks — no generado acá)
```

`specs/003-landing-nav-redesign/contracts/entrada-gate-contract.md` sigue vigente sin cambios y se
referencia, no se duplica — `IdentityProvider`/`EntradaGate` no cambian; solo `Bootstrap()` (dentro
de ese mismo `routes.tsx`) gana un destino adicional.

### Source Code (repository root)

Proyecto único ya existente (ver `specs/001-tripflow-v0/plan.md` § Project Structure) — esta
feature no reestructura el árbol, solo agrega/modifica los siguientes archivos:

```text
src/
├── app/
│   ├── routes.tsx                       # Bootstrap: destino por defecto → /onboarding/intro;
│   │                                     #   nueva <Route path="/onboarding/intro">
│   ├── onboarding/
│   │   ├── IntroOnboardingPage.tsx      # NUEVO — 4 pasos, Step Indicator, Saltar/CTA
│   │   └── CategoriasOnboardingPage.tsx # sin cambios de lógica (solo de cómo se llega a ella)
│   ├── bienvenida/
│   │   └── BienvenidaPage.tsx           # handleContinuarComoInvitado → navega a /onboarding/intro
│   └── auth/
│       ├── LoginPage.tsx                # handleContinuarComoInvitado → /onboarding/intro
│       └── RegistroPage.tsx             # los 3 navigate(...cuentaNueva:true) → /onboarding/intro
├── components/
│   ├── StepIndicator.tsx                # NUEVO — puntos de progreso reutilizable
│   └── OnboardingIllustration.tsx       # NUEVO — wrapper <img> de 140×140 (opcional, ver nota)
└── features/
    └── (sin cambios — no hay lógica de negocio nueva)

public/
└── icons/
    ├── onboarding-plan.svg              # NUEVO — paso 1
    ├── onboarding-categories.svg        # NUEVO — paso 2 (compuesto a mano, research.md §3)
    ├── onboarding-insights.svg          # NUEVO — paso 3
    └── onboarding-ready.svg             # NUEVO — paso 4

tests/
└── e2e/
    └── camino-dorado.spec.ts            # ambos caminos dorados pasan por los 4 pasos (o los
                                          #   saltan) antes de llegar a categorías

.specify/memory/
└── design-system.md                     # + secciones "Onboarding Illustration" y "Step Indicator"
                                          #   (ya agregadas como parte de este plan)
```

**Nota — `OnboardingIllustration.tsx`**: dado que es solo un `<img>` de tamaño fijo (140×140) sin
lógica ni variantes, `/speckit-tasks` puede decidir inlinearlo directo en `IntroOnboardingPage`
en vez de extraer un componente de un solo uso — no es una decisión que este plan deba forzar
(Principio I).

**Structure Decision**: mismo proyecto único (SPA/PWA) ya existente, sin nuevos servicios ni
carpetas de alto nivel. Se agrega una sola pantalla nueva (`IntroOnboardingPage.tsx`) y, como
mucho, dos componentes chicos y reutilizables (`StepIndicator`, y opcionalmente
`OnboardingIllustration`); el resto son modificaciones puntuales de una línea (cambiar el destino
de un `navigate(...)`) en 5 archivos ya existentes, más el ajuste del gate central en `routes.tsx`
(`research.md` §5-6).

## Complexity Tracking

*Sin violaciones que justificar.* No se agrega ninguna dependencia, tabla, servicio ni capa nueva —
el cambio de mayor riesgo (propagar `cuentaNueva` a través de un `navigate()` adicional) es un
detalle de implementación acotado y ya resuelto en `research.md` §5 y
`contracts/onboarding-intro-gate-contract.md`, no una complejidad estructural nueva.

## Re-evaluación de la Constitution Check (post Fase 1)

Tras generar `research.md`, `data-model.md`, `contracts/onboarding-intro-gate-contract.md`,
`quickstart.md` y las secciones "Onboarding Illustration"/"Step Indicator" de
`.specify/memory/design-system.md`, se revisó de nuevo cada principio:

| Principio | Estado tras diseño |
|---|---|
| I. Simplicidad ante todo | ✅ Se mantiene: la ilustración del paso 2 quedó resuelta como un único SVG estático (no 5 assets); la propagación de `cuentaNueva` quedó acotada a una regla fija y explícita en el contrato, sin mecanismo paralelo de estado. |
| II. Idioma y mercado | ⚠️ Requiere acción en `/speckit-tasks`: el título del paso 1 debe traducirse del inglés del Figma al implementar (ver nota en Constitution Check inicial) — no es una violación del plan, es una tarea explícita pendiente. |
| III. Cero alcance fantasma | ✅ Se mantiene: `contracts/onboarding-intro-gate-contract.md` fija exactamente qué call sites cambian y cuáles no (`LoginPage` explícitamente fuera de alcance); ningún FR nuevo se inventó fuera de `spec.md`. |
| IV. Verificable por persona no técnica | ✅ Se mantiene: los 5 escenarios de `quickstart.md` cubren las 3 historias de usuario, el edge case de interrupción a mitad, y la propagación de `cuentaNueva` con un paso verificable en la app ("sin quedarse atascado en un spinner"). |
| V. Datos del usuario con respeto | ✅ Se mantiene: sin cambios. |
| VI. Sistema de diseño como fuente de verdad | ✅ Se mantiene: Onboarding Illustration y Step Indicator quedaron documentados en el catálogo (con su nota de extensión) antes de referenciarse desde este plan, siguiendo el mismo proceso que `Logo` en `003-landing-nav-redesign`. |

Queda una acción pendiente sin resolver por este plan (traducir el título del paso 1), documentada
explícitamente para que `/speckit-tasks` la capture como tarea — no bloquea el resto del diseño. El
plan está listo para `/speckit-tasks`.
