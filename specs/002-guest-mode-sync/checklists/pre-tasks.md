# Requirements Quality Checklist: Uso sin cuenta obligatoria (modo invitado con sincronización opcional)

**Purpose**: Validar la calidad de `spec.md` y `plan.md` (completitud, claridad, consistencia,
medibilidad, cobertura de escenarios y edge cases) antes de generar `tasks.md` — no valida la
implementación, valida cómo están escritos los requisitos.
**Created**: 2026-08-13
**Reviewed**: 2026-08-13 (post `/speckit-tasks`, pre `/speckit-implement`) — se revisó cada ítem
contra `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/guest-link-contract.md`,
`quickstart.md` y el código actual (`ConfirmDialog.tsx`, `routes.tsx`), no solo `spec.md`/`plan.md`
como en la primera pasada.
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md)

**Note**: Enfoque: la feature completa (las 4 historias de usuario). Profundidad: estándar.
Audiencia: el propio autor, como gate previo a `/speckit-tasks`.

**Resultado de la revisión**: 22/33 resueltos por los artefactos de Fase 0/1 (`research.md`,
`data-model.md`, `contracts/`, `quickstart.md`) que no existían cuando se escribió este checklist,
o por el código ya existente. 11 quedan abiertos como decisiones de alcance aceptadas o gaps de
bajo riesgo — ninguno bloquea `/speckit-implement`; se listan al final bajo "Ítems pendientes"
para decidir si ameritan un cambio en `spec.md` en el futuro.

## Requirement Completeness

- [x] CHK001 - ¿Está definido qué debe ver una persona invitada en aperturas posteriores de la app, una vez que ya pasó por la selección de categorías (para no repetirla)? [Gap, Spec §FR-002]
  **Resuelto**: `research.md` §5 + `tasks.md` T004 — el bootstrap solo redirige a onboarding si el conteo de categorías es cero; en aperturas posteriores va directo a la app.
- [x] CHK002 - ¿Especifica la spec si el arranque como invitado (selección de categorías, primer viaje) debe funcionar completamente sin conexión, igual que el resto del uso sin cuenta? [Completeness, Spec §FR-003]
  **Resuelto**: FR-003 dice explícitamente "con las mismas garantías offline-first definidas en FR-045 a FR-049 de 001-tripflow-v0".
- [x] CHK003 - ¿Está definido si el texto de la confirmación de vinculación (FR-008/FR-009) debe ser el mismo cuando la "identidad anterior" es un invitado que nunca tuvo cuenta versus cuando es una cuenta de la que se cerró sesión (US3)? [Gap, Spec §FR-008, §FR-009, §FR-016]
  **Resuelto por diseño**: `contracts/guest-link-contract.md` usa un único texto basado solo en el conteo de viajes, sin distinguir el origen de la identidad anterior — no hace falta texto distinto.
- [x] CHK004 - ¿Documenta la spec qué información (si alguna) permanece en el dispositivo o en cualquier otro lado después de que la persona elige "Descartar" los datos locales? [Completeness, Spec §FR-011]
  **Resuelto**: `contracts/guest-link-contract.md` § "Camino Descartar" enumera exactamente qué se borra (viajes, gastos, categorías, asociaciones, entradas de `cambios_pendientes`); nada queda pendiente porque nunca salió del dispositivo (RLS).
- [ ] CHK005 - ¿Existe un requisito o supuesto que acote cuánto tiempo o volumen de datos puede acumular una persona invitada antes de que la ausencia de cuenta se considere un riesgo a comunicar? [Gap]
  **Pendiente — aceptado como fuera de alcance**: sin límite definido ni necesario; decisión deliberada de simplicidad (Principio I). Único riesgo documentado: pérdida total al desinstalar (Edge Cases).

## Requirement Clarity

- [x] CHK006 - ¿Es "un lugar fijo (configuración o perfil)" (FR-004) lo bastante específico como para garantizar un único lugar, y no dos lugares distintos entre los que la persona tendría que adivinar? [Clarity, Spec §FR-004]
  **Resuelto**: `plan.md` § UI Components concreta "lugar fijo" como la pantalla "Cuenta" (`CuentaPage.tsx`), un único lugar.
- [x] CHK007 - ¿Delimita la spec con precisión qué cuenta como "aviso emergente o interrupción del uso normal" (FR-005), de modo que un elemento persistente no modal no quede en zona gris? [Clarity, Spec §FR-005]
  **Resuelto**: la propia FR-005 aclara que un elemento persistente no modal en el lugar fijo de FR-004 no cuenta como interrupción, y excluye explícitamente la confirmación de FR-008/009.
- [x] CHK008 - ¿Es inequívoco que "cuántos viajes tiene guardados" (FR-008/FR-009) se refiere solo a la cantidad de Viajes, y no a gastos o categorías, al mostrarse en la confirmación? [Clarity, Spec §FR-008]
  **Resuelto**: FR-008/009 dicen "viajes" explícitamente; Assumptions confirma que no hace falta detalle de gastos.
- [x] CHK009 - ¿Deja claro "antes de completar el registro/inicio de sesión" (FR-008/FR-009) si la confirmación ocurre antes de intentar la operación de red, o después de que esta tiene éxito pero antes de entrar a la app? [Clarity, Spec §FR-008, §FR-009]
  **Resuelto**: `contracts/guest-link-contract.md` § "Cuándo se dispara" — ocurre después de que `signUp`/`signIn` termina con éxito y antes de navegar a la app.
- [ ] CHK010 - ¿Cuantifica la spec "sin agregar fricción excesiva" (Assumptions, sobre la confirmación) con algún criterio verificable, o queda como juicio subjetivo? [Ambiguity, Spec §Assumptions]
  **Pendiente — aceptado, no bloqueante**: es lenguaje de una Assumption (justificación de diseño), no un FR/SC medible; no requiere cuantificación.

## Requirement Consistency

- [x] CHK011 - ¿Son consistentes entre sí los requisitos de confirmación de FR-008 (registro, cuenta vacía) y FR-009 (login, cuenta puede tener datos propios) en cuanto a qué información deben mostrar? [Consistency, Spec §FR-008, §FR-009]
  **Resuelto**: piden exactamente la misma información (conteo de viajes + incluir/descartar).
- [x] CHK012 - ¿Queda resuelta sin ambigüedad la aparente tensión entre FR-005 ("no avisos emergentes") y la confirmación obligatoria de FR-008/FR-009, o un lector podría interpretarlos como contradictorios sin leer la nota aclaratoria de FR-005? [Consistency, Spec §FR-005]
  **Resuelto**: la propia FR-005 resuelve la tensión explícitamente en su segunda oración.
- [ ] CHK013 - ¿Es SC-002 ("sin pérdidas ni duplicados" al elegir incluir) consistente con que la spec no defina un criterio de éxito equivalente para el camino "Descartar" (FR-011)? [Consistency, Spec §SC-002, §FR-011]
  **Pendiente — gap menor de documentación, no bloqueante**: no hay un SC simétrico para "Descartar"; el comportamiento sí está definido con precisión en el contrato, solo falta el criterio medible equivalente en `spec.md`.
- [x] CHK014 - ¿Son consistentes los Edge Cases de "dos dispositivos usados como invitado, luego vinculados a la misma cuenta" y "dispositivo compartido por dos personas" en el tratamiento que dan a la confirmación de vinculación? [Consistency, Spec §Edge Cases]
  **Resuelto**: ambos mencionan explícitamente que se muestra la confirmación de la Historia 2 en cada vinculación.

## Acceptance Criteria Quality

- [x] CHK015 - ¿Es "el sistema le muestra cuántos viajes tiene guardados" (US2, Acceptance Scenarios 1 y 4) verificable como un número exacto, en vez de una expresión aproximada? [Measurability, Spec §US2]
  **Resuelto**: conteo exacto por diseño — `contracts/guest-link-contract.md` cuenta viajes locales con una query directa.
- [ ] CHK016 - ¿Especifica SC-004 ("9 de cada 10 personas... en menos de 15 segundos") el método o tamaño de muestra con el que se valida, o solo declara el número objetivo? [Measurability, Spec §SC-004]
  **Pendiente — aceptado, mismo patrón que 001-tripflow-v0**: `quickstart.md` ya excluye SC-004 de la validación funcional (requiere prueba de usabilidad con personas reales), igual que 001-tripflow-v0 excluye sus SC de usabilidad.
- [x] CHK017 - ¿Es objetivamente verificable la condición "mientras siga teniendo ese dispositivo a mano" en SC-005, o introduce un límite no cuantificado? [Measurability, Spec §SC-005]
  **Resuelto**: es una cláusula de alcance (excluye pérdida/desinstalación), consistente con el edge case de desinstalación.
- [ ] CHK018 - ¿Puede verificarse SC-006 ("0 casos... sin la confirmación de FR-008/FR-009") con una fuente de evidencia clara (por ejemplo, un registro de cada vinculación), o depende de inspección manual no reproducible? [Measurability, Spec §SC-006]
  **Pendiente — aceptado para v1**: sin mecanismo de auditoría/log explícito; se verifica por revisión de código y prueba manual (Principio IV), consistente con el resto de SC de esta spec.

## Scenario Coverage

- [x] CHK019 - ¿Define la spec qué ocurre si la persona cierra o descarta el diálogo de confirmación de FR-008/FR-009 sin elegir "Incluir" ni "Descartar" explícitamente? [Gap, Coverage]
  **Resuelto por el componente existente**: `ConfirmDialog.tsx` no tiene cierre por click fuera del overlay ni por tecla Escape — solo `onCancel`/`onConfirm` cierran el diálogo, así que no existe un tercer estado "cerrado sin elegir".
- [ ] CHK020 - ¿Están definidos los requisitos para el caso en que la conexión se pierde después de que la persona ya eligió "Incluir" pero antes de que la vinculación termine? [Gap, Exception Flow]
  **Pendiente — cubierto por herencia, no explícito en spec.md**: los cambios ya encolados en `cambios_pendientes` quedan pendientes y se reintentan cuando vuelva la conexión (mismo mecanismo de `useSync` de 001-tripflow-v0); no hay pérdida de datos, pero `spec.md` no lo declara.
- [ ] CHK021 - ¿Cubre la spec la interacción entre la Historia 2 (vincular cuenta) y la eliminación de cuenta heredada de `001-tripflow-v0`, para una persona que vincula y luego decide eliminar la cuenta en la misma sesión? [Gap, Coverage]
  **Pendiente — edge case no cubierto, bajo riesgo**: combinación de dos flujos ya existentes por separado; no bloqueante para esta feature.
- [x] CHK022 - ¿Define la spec qué debe pasar si la persona intenta vincular una cuenta por segunda vez mientras la primera vinculación todavía no terminó de sincronizarse? [Gap, Exception Flow]
  **Resuelto**: la identidad activa se actualiza a `session.user.id` inmediatamente (paso 4/6 del contrato), antes de que termine la sincronización — un segundo intento ya vería 0 viajes bajo la identidad anterior, evitando doble vinculación.
- [x] CHK023 - ¿Especifica la spec el orden esperado si una persona busca el acceso a "crear cuenta" (Historia 4) antes de completar la selección de categorías del primer arranque (Historia 1)? [Gap, Coverage]
  **Resuelto (consecuencia del diseño de T004)**: el bootstrap de onboarding envuelve todas las rutas principales, incluida `/cuenta` — una persona invitada nueva pasa primero por la selección de categorías antes de poder llegar a "Cuenta", igual que a cualquier otra pantalla.

## Edge Case Coverage

- [x] CHK024 - En el edge case "Dispositivo compartido por dos personas distintas", ¿especifica la spec qué información sobre los viajes locales se muestra (por ejemplo, solo la cantidad, o también nombres/destinos) para que la persona pueda reconocerlos como propios o ajenos? [Clarity, Spec §Edge Cases]
  **Resuelto**: Assumptions confirma que alcanza con mostrar la cantidad, sin detalle de gastos ni (por extensión) nombres/destinos de viajes.
- [ ] CHK025 - ¿Define la spec un límite (o la ausencia deliberada de límite) para ciclos repetidos de cerrar sesión → usar como invitado → iniciar sesión, que podrían acumular múltiples rondas de datos pendientes de fusión? [Gap, Edge Case]
  **Pendiente — no bloqueante**: sin tope explícito, pero el mecanismo de identidad activa + cola de sincronización no depende de un límite para funcionar correctamente en ciclos repetidos.
- [x] CHK026 - Cuando una categoría local de invitado coincide en nombre con una categoría de la cuenta pero difiere en emoji, ¿define FR-012 cuál emoji prevalece tras la fusión? [Gap, Ambiguity, Spec §FR-012]
  **Resuelto por diseño del contrato**: cuando coincide el nombre, la categoría local se borra por completo (no se fusiona campo a campo) y solo sobrevive la categoría remota — su emoji siempre prevalece.

## Non-Functional Requirements

- [ ] CHK027 - ¿Existe algún requisito o criterio de éxito que acote cuánto puede demorar la confirmación + fusión de datos antes de que se considere una experiencia degradada? [Gap, Non-Functional]
  **Pendiente — sin SLA explícito, bajo riesgo**: `plan.md` § Performance Goals acota que el único costo adicional es un `select` de red, aceptable porque el flujo ya implica espera de red por `signUp`/`signIn`; no hay un número de milisegundos objetivo.
- [x] CHK028 - ¿Especifica la spec requisitos de privacidad sobre qué sucede con los datos descartados (FR-011) más allá de "se eliminan del dispositivo" — por ejemplo, si pueden haber quedado copias en algún estado intermedio? [Completeness, Spec §FR-011]
  **Resuelto**: el contrato + Principio V garantizan que ningún dato descartado llegó nunca a Supabase (RLS), y el borrado en Dexie + purga de `cambios_pendientes` no deja copias intermedias.

## Dependencies & Assumptions

- [ ] CHK029 - ¿Está validado (o al menos declarado como supuesto explícito) el comportamiento esperado si la misma identidad de invitado se usa desde dos pestañas o ventanas abiertas simultáneamente? [Assumption, Spec §Assumptions]
  **Pendiente — gap real, bajo riesgo para v1**: no se declara el comportamiento con múltiples pestañas/ventanas abiertas simultáneamente; podría quedar desincronizado el estado de una pestaña tras vincular en otra, hasta recargar.
- [x] CHK030 - ¿Declara la spec explícitamente que las garantías offline de `001-tripflow-v0` (FR-045 a FR-049) se heredan sin cambios para el uso sin cuenta, o queda a criterio del lector inferirlo? [Dependency, Spec §Contexto, §Dependencies]
  **Resuelto**: Contexto y FR-003 lo declaran explícitamente.
- [x] CHK031 - ¿Está puesto a prueba el supuesto de que "basta con mostrar la cantidad de viajes locales" es información suficiente para que una persona reconozca datos ajenos en un dispositivo compartido? [Assumption, Spec §Assumptions]
  **Resuelto (documentado como supuesto, no una omisión)**: está explícitamente en Assumptions como un supuesto aceptado, no pendiente de validar antes de implementar.

## Ambiguities & Conflicts

- [x] CHK032 - ¿Excluye sin ambigüedad "lugar fijo" (FR-004) la posibilidad de que ese acceso esté en una ubicación distinta en mobile versus desktop? [Ambiguity, Spec §FR-004]
  **Resuelto**: `plan.md` define una única pantalla "Cuenta" en una SPA/PWA responsiva — no hay versión mobile vs desktop distinta.
- [ ] CHK033 - ¿Existe un esquema de trazabilidad que conecte cada paso del algoritmo de `contracts/guest-link-contract.md` con el FR específico de `spec.md` que lo respalda? [Traceability]
  **Pendiente — nice-to-have, no bloqueante**: el contrato referencia FRs en su prosa pero no hay una tabla formal paso→FR.

## Ítems pendientes (aceptados, no bloqueantes para `/speckit-implement`)

CHK005, CHK010, CHK013, CHK016, CHK018, CHK020, CHK021, CHK025, CHK027, CHK029, CHK033.

Ninguno requiere cambiar `spec.md` antes de implementar: son decisiones de alcance ya deliberadas
(CHK005, CHK010, CHK016, CHK025, CHK027), comportamiento ya garantizado por mecanismos existentes
pero no citado explícitamente en `spec.md` (CHK020), o gaps de documentación/trazabilidad de bajo
riesgo (CHK013, CHK018, CHK021, CHK029, CHK033). El más sustantivo para v1 es CHK029 (multi-pestaña)
— vale la pena revisitarlo si aparece como bug reportado, no antes.

## Notes

- Preguntas de calibración respondidas: foco = feature completa; profundidad = estándar;
  audiencia = autor, previo a `/speckit-tasks`.
- Los ítems marcados `[Gap]` señalan ausencia de requisito, no un defecto de implementación —
  requieren decidir si se actualiza `spec.md`/`plan.md` o si se documentan como fuera de alcance
  antes de generar `tasks.md`.
