# Contrato: Introducción en el gate de onboarding

**Feature**: `005-onboarding-intro` | Ver `research.md` §5-7, `data-model.md`

Este contrato fija el comportamiento exacto de `Bootstrap()` (`src/app/routes.tsx`) y de
`IntroOnboardingPage` una vez insertada la introducción. Cualquier tarea que los implemente o los
testee debe cumplir esta tabla de decisión sin excepciones.

## `Bootstrap()` — contrato de ruteo (reemplaza el destino por defecto)

| `necesitaOnboarding` | `location.pathname` actual | Resultado |
|---|---|---|
| `false` | cualquiera | `<Outlet />` (comportamiento ya existente, sin cambios) |
| `true` | `/onboarding/intro` | `<Outlet />` (deja avanzar la introducción) |
| `true` | `/onboarding/categorias` | `<Outlet />` (deja avanzar la selección — llegada desde la introducción o recarga directa) |
| `true` | cualquier otro | `<Navigate to="/onboarding/intro" replace state={{ cuentaNueva: !isGuest }} />` |

Único cambio respecto al contrato de `003-landing-nav-redesign` (`entrada-gate-contract.md`): el
destino por defecto pasa de `/onboarding/categorias` a `/onboarding/intro`, y la lista de rutas que
no rebotan crece de una (`/onboarding/categorias`) a dos.

## Puntos de entrada — contrato de navegación hacia el onboarding

Todo call site que hoy navega a `/onboarding/categorias` para arrancar el onboarding pasa a navegar
a `/onboarding/intro`, preservando el mismo `state`:

| Origen | Antes | Después |
|---|---|---|
| `BienvenidaPage.handleContinuarComoInvitado` | `navigate('/onboarding/categorias', { replace: true })` | `navigate('/onboarding/intro', { replace: true })` |
| `LoginPage.handleContinuarComoInvitado` | `navigate('/onboarding/categorias', { replace: true })` | `navigate('/onboarding/intro', { replace: true })` |
| `RegistroPage.handleContinuarComoInvitado` | `navigate('/onboarding/categorias', { replace: true })` | `navigate('/onboarding/intro', { replace: true })` |
| `RegistroPage.handleSubmit` (cuenta nueva, sin datos locales que vincular) | `navigate('/onboarding/categorias', { replace: true, state: { cuentaNueva: true } })` | `navigate('/onboarding/intro', { replace: true, state: { cuentaNueva: true } })` |
| `RegistroPage.confirmarIncluir` | ídem | ídem con `/onboarding/intro` |
| `RegistroPage.confirmarDescartar` | ídem | ídem con `/onboarding/intro` |

`LoginPage` (inicio de sesión, no registro) **no** se modifica: nunca navegó a onboarding y sigue
sin hacerlo — una cuenta existente con `categorias.length === 0` solo espera el `pull` (`Cargando`),
sin `cuentaNueva` en su `state`.

## `IntroOnboardingPage` — contrato de salida

| Acción de la persona | `location.state?.cuentaNueva` recibido | Navegación resultante |
|---|---|---|
| Toca "Saltar" (pasos 1-3) | `undefined` (invitado) | `navigate('/onboarding/categorias', { replace: true, state: { cuentaNueva: undefined } })` |
| Toca "Saltar" (pasos 1-3) | `true` (cuenta nueva) | `navigate('/onboarding/categorias', { replace: true, state: { cuentaNueva: true } })` |
| Toca el CTA en pasos 1-3 ("Empezar"/"Siguiente") | — | `setPaso(paso + 1)`, sin navegar (misma pantalla, siguiente paso interno) |
| Toca el CTA en el paso 4 ("Seleccionar mis categorías") | igual que "Saltar" | mismo `navigate` que "Saltar", con el mismo `state` reenviado |

Regla fija: **cualquier** salida de `IntroOnboardingPage` (saltar o terminar) reenvía el
`cuentaNueva` recibido tal cual — nunca lo inventa, nunca lo descarta silenciosamente. Ver
`research.md` §5 para por qué perderlo rompe el gate.

## Casos fuera de este contrato

- El contenido de cada paso (ilustración/título/subtítulo/CTA) no es parte de este contrato de
  ruteo — ver `research.md` §1 y `data-model.md`.
- `CategoriasOnboardingPage` no cambia su lógica de selección (`003-landing-nav-redesign` ya la
  corrigió) — este contrato solo cubre cómo se llega a ella.
