# Quickstart: Validar la bienvenida y la navegación rediseñada

Guía para comprobar, usando solo la app (Principio IV), que cada historia de usuario de `spec.md`
funciona. Complementa (no reemplaza) `specs/001-tripflow-v0/quickstart.md` y
`specs/002-guest-mode-sync/quickstart.md`: todos los escenarios de esas guías deben seguir pasando,
ahora empezando por la bienvenida donde corresponda.

## Prerrequisitos

Los mismos de `specs/002-guest-mode-sync/quickstart.md`:

- Poder limpiar el almacenamiento local del navegador (DevTools → Application → Clear storage, o
  una ventana de incógnito nueva) para simular "dispositivo nuevo" entre escenarios.
- Al menos una cuenta de prueba ya existente en Supabase.
- Probar tanto en un viewport de escritorio (sidebar) como uno móvil (bottom bar) para los
  escenarios de navegación y logo.

## Escenario 1 — Ver la bienvenida en un dispositivo nuevo (US1, P1)

1. Abrir la app en un dispositivo/navegador limpio (sin sesión ni datos locales previos).
2. **Verificar**: lo primero que se ve, antes que cualquier otra pantalla, es la bienvenida con el
   logo de Tripflow y exactamente tres opciones: "Iniciar sesión", "Registrarse", "Continuar como
   invitado" (FR-001, SC-001, FR-016).
3. Cerrar la pestaña sin tocar ninguna opción y volver a abrir la app → **verificar** que la
   bienvenida vuelve a aparecer (FR-005).
4. Tocar "Continuar como invitado" → **verificar** que se llega a la selección de categorías del
   onboarding, sin ninguna pantalla intermedia (FR-003).
5. Cerrar la app y volver a abrirla → **verificar** que la bienvenida **no** vuelve a aparecer;
   se entra directo al estado actual de la app (FR-002, SC-002).

## Escenario 2 — Elegir categorías deliberadamente en el onboarding (US3, P2)

1. En un dispositivo/navegador limpio, desde la bienvenida, tocar "Continuar como invitado".
2. **Verificar**: en la pantalla de categorías, ninguna aparece seleccionada (FR-012, SC-004).
3. Tocar 3 categorías cualquiera → **verificar** que cada una pasa a verse seleccionada al tocarla.
   Tocar una de esas 3 de nuevo → **verificar** que se deselecciona.
4. Con 2 categorías seleccionadas, tocar "Continuar" → **verificar** que avanza sin ningún bloqueo
   ni mensaje de error (FR-013).
5. Crear un viaje y registrar un gasto → **verificar** que, al elegir categoría para el gasto, solo
   aparecen disponibles las 2 categorías elegidas más "Otro" — ninguna de las categorías no
   seleccionadas aparece (FR-014).
6. Repetir el flujo completo desde un dispositivo limpio, pero tocando "Continuar" sin seleccionar
   ninguna categoría → **verificar** que igual avanza, y que al registrar un gasto la única
   categoría disponible es "Otro" (edge case "Cero categorías seleccionadas").

## Escenario 3 — Navegar con los cuatro destinos rediseñados (US2, P1)

1. Con una identidad ya usando la app (invitado o cuenta), mirar la navegación principal en
   escritorio (sidebar) y en móvil (bottom bar).
2. **Verificar**: hay exactamente cuatro destinos, en este orden: Resumen, Registrar, Nuevo viaje,
   Cuenta (FR-006).
3. Tocar "Registrar" → **verificar** que lleva directo al formulario de registrar gasto ya
   existente, con la navegación visible alrededor.
4. Tocar "Nuevo viaje" → **verificar** que lleva al formulario de crear viaje, con la navegación
   visible alrededor (a diferencia del paso de onboarding, que no la muestra).
5. Volver a "Resumen" → **verificar** el orden de contenido: monto total gastado como cifra
   principal, porcentaje del presupuesto, barra de progreso, presupuesto disponible y días
   restantes, mensaje de estado, desglose por categoría, gastos recientes agrupados por fecha
   (FR-007, SC-003).
6. Tocar el ícono de búsqueda del panel principal → **verificar** que lleva a la búsqueda y filtro
   de gastos ya existente (FR-008).

## Escenario 4 — Cuenta: iniciar/cerrar sesión y categorías desde la navegación rediseñada (US2, US4, P1/P2)

1. Como invitado, ir a "Cuenta" → **verificar** que se ve la opción de iniciar sesión o
   registrarse.
2. Iniciar sesión con una cuenta de prueba → en "Cuenta", **verificar** que ahora se ve un enlace a
   la gestión de categorías, además de "Cerrar sesión" y "Eliminar cuenta" (FR-009).
3. Tocar ese enlace → crear una categoría nueva con un nombre propio → **verificar** que queda
   creada (FR-011).
4. Registrar un gasto → **verificar** que la categoría recién creada aparece disponible para
   elegir, en menos de 30 segundos desde que se creó (SC-006).
5. Volver a "Cuenta" → tocar "Cerrar sesión" → **verificar** que la sesión se cierra en 2 toques o
   menos desde "Cuenta" (SC-005) y que los datos siguen visibles localmente en modo invitado
   (FR-010).

## Escenario 5 — Logo de marca visible en bienvenida y navegación (US5, P2)

1. En un dispositivo limpio, abrir la app → **verificar** que la bienvenida muestra el logo de
   Tripflow (ícono + wordmark) junto a las tres opciones (FR-016).
2. Con la app en uso, en viewport de escritorio → **verificar** que el logo aparece visible en el
   sidebar (FR-017).
3. Cambiar a viewport móvil → **verificar** que el logo aparece visible de forma consistente en la
   navegación principal (hoy ausente en esa vista) (FR-017, SC-007).

## Escenario 6 — Identidad previa a esta funcionalidad no ve la bienvenida retroactivamente

1. En un dispositivo que ya tenía uso previo (viajes/gastos creados antes de esta funcionalidad, o
   simular con una identidad de invitado/sesión ya establecida), abrir la app.
2. **Verificar**: se entra directo al estado actual (resumen o categorías, según corresponda), sin
   ver la bienvenida en ningún momento (edge case "Identidad previa a esta funcionalidad").

## Escenario 7 — Bienvenida sin conexión

1. Con la conexión desactivada, abrir la app en un dispositivo limpio → **verificar** que la
   bienvenida se ve igual.
2. Tocar "Continuar como invitado" → **verificar** que funciona igual que con conexión (edge case
   "Bienvenida sin conexión").
3. Tocar "Iniciar sesión" o "Registrarse" e intentar completarlo → **verificar** que se muestra el
   mismo aviso de "requiere conexión" ya definido en `002-guest-mode-sync`, sin bloquear la opción
   de invitado.
