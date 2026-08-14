# Quickstart: Validar la introducción explicativa del onboarding

Guía para comprobar, usando solo la app (Principio IV), que cada historia de usuario de `spec.md`
funciona. Complementa (no reemplaza) `specs/002-guest-mode-sync/quickstart.md` y
`specs/003-landing-nav-redesign/quickstart.md`: todos los escenarios de esas guías deben seguir
pasando, ahora con el paso de introducción intercalado antes de la selección de categorías.

## Prerrequisitos

- Poder limpiar el almacenamiento local del navegador (DevTools → Application → Clear storage, o
  una ventana de incógnito nueva) para simular "dispositivo nuevo" entre escenarios.
- Al menos una cuenta de prueba ya existente en Supabase (para el Escenario 3).

## Escenario 1 — Ver la introducción al continuar como invitado (US1, US3 — P1/P2)

1. En un dispositivo/navegador limpio, abrir la app → llega a la bienvenida.
2. Tocar "Continuar como invitado" → **verificar**: aparece el paso 1 de la introducción ("Plan
   less. Travel more.") **antes** de la selección de categorías, con el indicador de pasos
   mostrando 1 de 4 activo y el botón "Empezar" (FR-001, FR-002).
3. Tocar "Empezar" → **verificar**: avanza al paso 2 ("Ve exactamente dónde va tu dinero."),
   indicador en 2 de 4, botón "Siguiente".
4. Tocar "Siguiente" dos veces más → **verificar**: paso 3 ("Insights que importan.") y paso 4
   ("Listo para tu próxima aventura."), indicador avanzando en cada uno.
5. En el paso 4, **verificar**: no hay botón "Saltar" visible, y el botón principal dice
   **"Seleccionar mis categorías"** (no "Crear mi primer viaje").
6. Tocar "Seleccionar mis categorías" → **verificar**: llega a la pantalla de selección de
   categorías ya existente (`CategoriasOnboardingPage`), con las categorías deseleccionadas por
   defecto tal como ya garantiza `003-landing-nav-redesign` (FR-004).

## Escenario 2 — Saltar la introducción desde cualquier paso (US2 — P1)

1. En un dispositivo/navegador limpio, continuar como invitado hasta llegar al paso 1 de la
   introducción.
2. Tocar "Saltar" (arriba a la derecha) → **verificar**: llega directo a la selección de categorías,
   sin pasar por los pasos 2-4 (FR-003, SC-002).
3. Repetir desde un dispositivo limpio, pero saltando desde el paso 2 o el paso 3 en vez del 1 →
   **verificar** el mismo resultado: llega directo a categorías sin importar desde qué paso saltó.

## Escenario 3 — Mismo comportamiento al registrarse con cuenta nueva (US1 — P1)

1. En un dispositivo/navegador limpio, ir a "Registrarse" y crear una cuenta nueva con un correo
   que no exista todavía.
2. **Verificar**: tras el registro exitoso, aparece la introducción (paso 1 de 4) antes de la
   selección de categorías — mismo contenido que en el Escenario 1 (FR-005).
3. Completar la introducción entera (o saltarla) → **verificar**: llega a la selección de
   categorías **sin quedarse atascado en un spinner de "Cargando…"** (esto confirma que el estado
   `cuentaNueva` se propaga correctamente a través de la introducción — ver `research.md` §5 /
   `contracts/onboarding-intro-gate-contract.md`).

## Escenario 4 — La introducción se muestra una sola vez (US1 — P1, SC-004)

1. Completar el Escenario 1 o el Escenario 2 hasta confirmar la selección de categorías (tocar
   "Continuar" en `CategoriasOnboardingPage`, con o sin categorías marcadas).
2. Cerrar la pestaña y volver a abrir la app en el mismo dispositivo → **verificar**: entra directo
   al Dashboard (o a "Nuevo viaje" si todavía no tiene ninguno), **sin** volver a mostrar la
   introducción ni la selección de categorías.
3. Repetir cerrando la app **a mitad de la introducción** (antes de llegar a categorías) → volver a
   abrirla → **verificar**: la introducción vuelve a empezar desde el paso 1 (no se guardó en qué
   paso se había quedado — comportamiento esperado, ver `spec.md` § Edge Cases).

## Escenario 5 — Sin conexión (FR-008)

1. Con la app ya cargada, desconectar la red (DevTools → Network → Offline).
2. En un dispositivo/navegador limpio (identidad de invitado ya establecida antes de desconectar),
   navegar hasta la introducción → **verificar**: los 4 pasos se ven y se navegan con normalidad
   (ilustraciones, textos, "Siguiente"/"Saltar"), sin ningún error ni pantalla en blanco.
