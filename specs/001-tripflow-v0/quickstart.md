# Quickstart: Validar Tripflow v0

Guía para comprobar, usando solo la app (Principio IV: verificable por una persona no
técnica), que cada historia de usuario de `spec.md` funciona. No incluye código de
implementación — para el esquema de datos ver `data-model.md` y `contracts/`.

## Prerrequisitos

1. Proyecto de Supabase creado, con las tablas de `contracts/data-schema.md` y la función
   `contracts/delete-account-function.md` desplegadas.
2. Variables de entorno de la app apuntando a ese proyecto (URL + clave anónima — nunca la
   clave de rol de servicio, que solo vive dentro de la función).
3. App corriendo (`npm run dev` en local, o la URL desplegada en Vercel).
4. Un dispositivo o navegador en modo móvil (DevTools) y otro en modo escritorio, para verificar
   SC-005.

## Escenario 1 — Crear mi primer viaje (US1, P1)

1. Abrir la app sin cuenta previa → registrarse con correo y contraseña.
2. **Verificar**: se llega directo a la pantalla de categorías, sin pantallas de presentación
   (FR-002).
3. Confirmar la pantalla de categorías sin cambiar nada → **verificar** que avanza a crear el
   primer viaje.
4. Completar nombre, destino, fecha de salida, presupuesto y moneda; dejar fecha de regreso
   vacía → guardar.
5. **Verificar**: el viaje se crea y queda marcado como viaje abierto (FR-006).
6. Intentar crear otro viaje con presupuesto en 0 → **verificar** que el sistema lo impide y
   explica que debe ser mayor a cero (FR-007).

## Escenario 2 — Registrar un gasto en segundos (US2, P1)

1. Con el viaje activo, abrir "nuevo gasto".
2. **Verificar**: la fecha viene precargada con hoy (FR-015).
3. Ingresar descripción y monto, confirmar categoría y fecha, guardar.
4. **Verificar**: el gasto aparece en el listado del día correspondiente, y el resumen (total
   gastado, disponible) se actualiza de inmediato (FR-020).
5. Intentar guardar sin monto → **verificar** que el sistema lo impide e indica el dato
   faltante.

## Escenario 3 — Ver cuánto llevo gastado (US3, P1)

1. Con un viaje con presupuesto $45.000 y gastos por $18.750, abrir el resumen.
2. **Verificar** exactamente: "$18.750" gastado, "42%" del presupuesto, "$26.250" disponible
   (Acceptance Scenario 1 de US3).
3. Repetir con un viaje sin fecha de regreso → **verificar** que no se muestran días restantes,
   pero sí gastado/porcentaje/disponible (FR-037).

## Escenario 4 — Saber si voy a sostener mi presupuesto (US4, P2)

1. Viaje de 10 días, presupuesto $45.000, 3 días transcurridos, $18.750 gastados.
2. **Verificar**: presupuesto diario restante $3.750 (7 días restantes), frente a $4.500
   planeados, con estado "Ojo con el ritmo" (entre 70% y 100% del plan).
3. Bajar el margen por debajo del 70% del plan (agregar más gastos) → **verificar** que el
   estado cambia a "Vas acelerado", con el mismo tratamiento visual de advertencia que el
   estado anterior pero texto distinto (FR-035).
4. Hacer que el disponible llegue a 0 o menos → **verificar** estado "Te pasaste del
   presupuesto" con tratamiento de error inequívoco (FR-038).

## Escenario 5 — Desglose y listado por día (US5, P2)

1. Registrar gastos en al menos 3 categorías distintas y en 2 días distintos.
2. Abrir el resumen → **verificar** el desglose por categoría ordenado de mayor a menor
   (FR-040), y el listado agrupado por día con subtotal (FR-041).
3. Abrir un viaje recién creado sin gastos → **verificar** el estado vacío que invita a
   registrar el primer gasto (FR-044).

## Escenario 6 — Categoría automática (US6, P2)

1. En "nuevo gasto", escribir "compré una hamburguesa" → **verificar** que "Comida" queda
   preseleccionada (FR-021).
2. Tocar otra categoría manualmente, seguir editando la descripción → **verificar** que la
   selección manual se respeta y no se sobreescribe (FR-024).
3. Escribir una descripción sin relación reconocible → **verificar** que queda "Otro"
   preseleccionada y se puede guardar igual (FR-023).

## Escenario 7 — Corregir o borrar un gasto (US7, P3)

1. Abrir un gasto existente para editarlo → **verificar** que es la misma pantalla que crear,
   con los mismos campos ya cargados (FR-018).
2. Cambiar solo la descripción → **verificar** que la categoría guardada no cambia sola
   (FR-024).
3. Eliminar un gasto → **verificar** que pide confirmación explícita, advierte que es
   permanente, y que el gasto desaparece de listado y totales (FR-019).

## Escenario 8 — Offline (FR-045 a FR-049)

1. Desconectar la red del dispositivo (modo avión o DevTools offline).
2. Crear un viaje y registrar un gasto → **verificar** que ambas operaciones funcionan igual
   que en línea, incluyendo el resumen recalculado (FR-046).
3. Cerrar y volver a abrir la app todavía sin conexión → **verificar** que los datos siguen ahí
   (FR-049).
4. Reconectar la red → **verificar** que aparece el indicador de sincronización y luego el de
   "todo sincronizado", sin ninguna acción de la persona (FR-047, FR-048).
5. Revisar el mismo viaje desde otro dispositivo/navegador con la misma cuenta → **verificar**
   que el gasto registrado offline ya aparece.

## Escenario 9 — Ambos dispositivos (SC-005)

1. Realizar el Escenario 1 completo en un navegador en modo escritorio.
2. Repetir la lectura del resumen en modo móvil (mismo usuario) → **verificar** que los números
   mostrados son idénticos en ambos.

## Escenario 10 — Eliminar un viaje y eliminar la cuenta (FR-052 a FR-056)

1. Con al menos un viaje con gastos, elegir eliminarlo → **verificar** que se advierte cuántos
   gastos se perderán y que la acción es permanente (FR-053).
2. Confirmar → **verificar** que el viaje y sus gastos desaparecen y las categorías de la
   cuenta siguen intactas (FR-054).
3. Ir a eliminar la cuenta → **verificar** la advertencia explícita de que es permanente e
   irreversible (FR-055).
4. Confirmar → **verificar** que ya no se puede iniciar sesión con esa cuenta, y que no queda
   ningún dato local ni remoto asociado (FR-056).

## Fuera de esta guía

Los criterios SC-003 (precisión de categorización), SC-004 (legibilidad en <2 segundos) y
SC-009 (retención al día 3) requieren pruebas de usabilidad con personas reales, no se
verifican en este quickstart funcional (ver `checklists/requirements.md`).
