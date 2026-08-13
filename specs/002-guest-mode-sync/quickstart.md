# Quickstart: Validar uso sin cuenta obligatoria

Guía para comprobar, usando solo la app (Principio IV), que cada historia de usuario de
`spec.md` funciona. Complementa (no reemplaza) `specs/001-tripflow-v0/quickstart.md`: todos los
escenarios de esa guía deben seguir pasando igual, ahora también sin cuenta salvo donde se indica
lo contrario.

## Prerrequisitos

Los mismos de `specs/001-tripflow-v0/quickstart.md`, más:

- Poder limpiar el almacenamiento local del navegador (DevTools → Application → Clear storage,
  o una ventana de incógnito nueva) para simular "dispositivo nuevo" entre escenarios.
- Dos cuentas de prueba ya existentes en Supabase (con datos propios) para el Escenario 3.

## Escenario 1 — Usar la app sin crear cuenta (US1, P1)

1. Abrir la app en un dispositivo/navegador limpio (sin sesión ni datos locales previos).
2. **Verificar**: se llega directo a la selección de categorías, sin ver ninguna pantalla de
   registro o inicio de sesión (FR-002).
3. Confirmar categorías sin cambiar nada → crear un viaje con nombre, destino, fecha de salida,
   presupuesto y moneda.
4. **Verificar**: el viaje se crea y se puede registrar un gasto, ver el resumen actualizado y
   editar/eliminar ese gasto — mismo comportamiento que con cuenta (FR-001, FR-003).
5. Cerrar la pestaña/app y volver a abrirla → **verificar** que el viaje y el gasto siguen ahí,
   sin haber iniciado sesión en ningún momento.

## Escenario 2 — Encontrar dónde crear una cuenta (US4, P3)

1. Como invitado (Escenario 1), usar la app con normalidad durante varias acciones (crear un
   segundo gasto, revisar el resumen).
2. **Verificar**: en ningún momento aparece un aviso emergente ni una interrupción pidiendo crear
   cuenta (FR-005).
3. Ir a "Cuenta" → **verificar** que ahí, de forma permanente, está la opción de crear cuenta o
   iniciar sesión (FR-004).

## Escenario 3 — Vincular mis datos de invitado a una cuenta nueva (US2, P1)

1. Como invitado con al menos un viaje y un gasto ya creados (Escenario 1), ir a "Cuenta" →
   "Crear cuenta".
2. Completar el registro con un correo nuevo.
3. **Verificar**: antes de terminar, aparece la confirmación indicando cuántos viajes hay
   guardados en el dispositivo, con las opciones "Incluir" y "Descartar" (FR-008).
4. Elegir "Incluir" → **verificar** que, tras completar el registro, el viaje y el gasto creados
   como invitado siguen ahí, ahora bajo la cuenta nueva.
5. Iniciar sesión con esa misma cuenta desde otro navegador/dispositivo (o ventana de incógnito)
   → **verificar** que aparecen exactamente el mismo viaje y gasto (SC-002, SC-003).

## Escenario 4 — Vincular datos de invitado a una cuenta que ya tenía viajes propios (US2, P1)

1. En un dispositivo/navegador limpio, usar la app como invitado y crear un viaje distinto al de
   cualquier cuenta existente.
2. Ir a "Cuenta" → "Iniciar sesión" → entrar con una cuenta de prueba que ya tiene sus propios
   viajes en Supabase.
3. **Verificar**: aparece la confirmación indicando cuántos viajes hay en el dispositivo, antes
   de completar el inicio de sesión (FR-009).
4. Elegir "Incluir" → **verificar** que, al terminar, se ven **ambos** conjuntos de viajes: los
   que ya tenía la cuenta y el creado como invitado — ninguno reemplaza al otro (FR-010).
5. Repetir el mismo flujo desde cero (otro dispositivo/navegador limpio, un viaje nuevo como
   invitado) pero eligiendo "Descartar" en el paso 3 → **verificar** que, al terminar, solo se ve
   lo que la cuenta ya tenía — el viaje creado como invitado no aparece (FR-011).

## Escenario 5 — Categorías con el mismo nombre no se duplican (edge case)

1. Como invitado, antes de vincular cuenta, verificar que existe una categoría "Comida" (viene
   por defecto).
2. Iniciar sesión con una cuenta que también tenga una categoría "Comida" y elegir "Incluir" en
   la confirmación.
3. **Verificar**: tras vincular, solo aparece **una** categoría "Comida" en la lista de
   categorías — no dos — y los gastos que estaban categorizados como "Comida" en el dispositivo
   siguen viéndose correctamente clasificados (FR-012).

## Escenario 6 — Seguir usando mis datos después de cerrar sesión (US3, P2)

1. Con una cuenta con al menos un viaje sincronizado, ir a "Cuenta" → "Cerrar sesión".
2. **Verificar**: tras cerrar sesión, el viaje sigue visible y se puede seguir registrando
   gastos con normalidad, sin volver a iniciar sesión (FR-015).
3. Registrar un gasto nuevo en este estado (sin sesión) → volver a iniciar sesión con la misma
   cuenta.
4. **Verificar**: aparece la misma confirmación del Escenario 3/4 (esta vez con 1 viaje) y, al
   elegir "Incluir", el gasto agregado tras cerrar sesión queda reflejado en la cuenta (FR-016).

## Escenario 7 — Sin conexión al intentar crear cuenta (edge case)

1. Como invitado, desconectar la red (modo avión o DevTools offline).
2. Ir a "Cuenta" → intentar registrarse o iniciar sesión.
3. **Verificar**: el sistema explica que ese paso requiere conexión, y se puede seguir usando la
   app con normalidad sin cuenta mientras tanto (FR-007).

## Fuera de esta guía

SC-004 (encontrar el acceso a cuenta en menos de 15 segundos) requiere una prueba de usabilidad
con personas reales, no se verifica en este quickstart funcional — igual que SC-003/SC-004/SC-009
de `001-tripflow-v0`.
