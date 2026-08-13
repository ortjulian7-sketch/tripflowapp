# Data Model: Tripflow v0

Entidades extraídas de la sección "Key Entities" de `spec.md`, con los campos y reglas de
validación necesarios para cumplir los Functional Requirements. Todas viven primero en
IndexedDB (dispositivo) y se respaldan en Postgres (Supabase) según `contracts/sync-contract.md`.

## Usuario

Dueño de la cuenta. Se apoya en el usuario de autenticación de Supabase; no se duplica en una
tabla propia salvo lo estrictamente necesario.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | uuid | = id del usuario en Supabase Auth |
| `email` | string | requerido, único (lo gestiona el proveedor de auth) |
| `created_at` | timestamp | automático |

**Relaciones**: 1 Usuario → N Viajes, N Categorías, N Asociaciones aprendidas.

## Viaje

Contenedor de un presupuesto y sus gastos (FR-005 a FR-013).

| Campo | Tipo | Regla |
|---|---|---|
| `id` | uuid | generado al crear |
| `user_id` | uuid (fk Usuario) | requerido |
| `nombre` | string | requerido |
| `destino` | string | requerido |
| `fecha_salida` | date | requerido |
| `fecha_regreso` | date, nullable | opcional; `null` = viaje abierto (FR-006) |
| `presupuesto_total` | integer (unidad mínima de moneda) | requerido, > 0 (FR-007) |
| `moneda` | string (código ISO 4217, catálogo acotado LATAM+USD+EUR) | requerido; **inmutable** tras la creación (FR-009) |
| `created_at` / `updated_at` | timestamp | `updated_at` es la marca usada para resolver conflictos de sincronización |

**Validación**: `presupuesto_total > 0`. `fecha_regreso`, si existe, debe ser posterior o igual
a `fecha_salida` (regla de formulario, no bloquea gastos fuera de rango — ver Edge Cases de la
spec).

**Estados derivados** (no almacenados, se calculan en `features/budget-health`):

- **Abierto vs. cerrado**: abierto si `fecha_regreso` es `null`.
- **No comenzado / en curso / terminado**: según `hoy` respecto a `fecha_salida`/`fecha_regreso`.
- **Salud del presupuesto** (solo si el viaje es cerrado y ya comenzó): una de `vas_bien`,
  `ojo_con_el_ritmo`, `vas_acelerado`, `te_pasaste_del_presupuesto`, calculada por FR-033 a
  FR-035 a partir de `presupuesto_total`, `fecha_salida`, `fecha_regreso` y la suma de gastos.

**Eliminación**: borra en cascada todos sus Gastos (FR-054). Las Categorías del usuario no se
ven afectadas.

## Gasto

Un desembolso registrado (FR-014 a FR-020).

| Campo | Tipo | Regla |
|---|---|---|
| `id` | uuid | generado al crear |
| `trip_id` | uuid (fk Viaje) | requerido |
| `categoria_id` | uuid (fk Categoría) | requerido |
| `monto` | integer (unidad mínima de la moneda del viaje) | requerido, > 0 |
| `descripcion` | string | requerido, no vacío |
| `fecha` | date | requerido; precargada con hoy al crear (FR-015) |
| `momento_registro` | timestamp | automático, no editable por la persona |
| `categoria_elegida_manualmente` | boolean | true si la persona tocó una categoría (propia o distinta de la sugerida) o si el gasto viene de una edición (FR-024); controla si la preselección automática puede seguir actualizándose |
| `created_at` / `updated_at` | timestamp | igual que Viaje, para sincronización |

**Validación**: `monto > 0`, `descripcion` no vacía, `categoria_id` debe existir. Sin
restricción sobre `fecha` respecto al rango del viaje (edge case explícito de la spec: se
permite fuera de rango).

**Relaciones**: pertenece a exactamente 1 Viaje y exactamente 1 Categoría.

**Eliminación**: permanente, sin recuperación (FR-019).

## Categoría

Etiqueta de clasificación del gasto, propiedad de la cuenta (FR-025 a FR-028).

| Campo | Tipo | Regla |
|---|---|---|
| `id` | uuid | generado al crear |
| `user_id` | uuid (fk Usuario) | requerido |
| `nombre` | string | requerido, único por usuario |
| `emoji` | string | requerido |
| `protegida` | boolean | true únicamente para "Otro"; impide su eliminación (Assumptions: "Otro es permanente") |
| `created_at` / `updated_at` | timestamp | — |

**Seed inicial por cuenta nueva** (Assumptions de la spec): Alojamiento, Comida, Transporte,
Actividades, Compras, Salud, Telecom, Otro (`protegida = true` solo en Otro).

**Validación de eliminación**: se rechaza si existe al menos un Gasto con ese `categoria_id`
(FR-028), o si `protegida = true`. El mensaje de bloqueo debe explicar el motivo.

**Renombrar**: los Gastos ya guardados referencian `categoria_id`, así que al renombrar
muestran el nombre nuevo automáticamente (FR-... consistente con el requisito de renombrado).

## Asociación aprendida

Vínculo entre un término de descripción y la categoría que la persona confirmó para él
(FR-021, FR-022).

| Campo | Tipo | Regla |
|---|---|---|
| `id` | uuid | generado al crear/actualizar |
| `user_id` | uuid (fk Usuario) | requerido |
| `termino` | string normalizado (minúsculas, sin tildes) | requerido |
| `categoria_id` | uuid (fk Categoría) | requerido |
| `created_at` / `updated_at` | timestamp | `updated_at` decide cuál corrección prevalece si el mismo término se asoció a categorías distintas en momentos distintos (edge case de la spec) |

**Unicidad**: único por (`user_id`, `termino`); una corrección nueva sobre el mismo término
reemplaza (upsert) a la anterior en vez de crear un duplicado.

**Eliminación en cascada**: al eliminar una Categoría, se eliminan sus Asociaciones aprendidas
asociadas (edge case: "esos términos vuelven a resolverse desde cero").

## Entidad técnica interna: cambio pendiente de sincronización

No es una entidad de negocio ni se expone a la persona usuaria; sostiene FR-047/FR-048/FR-049.

| Campo | Tipo | Regla |
|---|---|---|
| `entidad` | enum (`viaje`, `gasto`, `categoria`, `asociacion_aprendida`) | qué tabla local cambió |
| `entidad_id` | uuid | id del registro afectado |
| `operacion` | enum (`crear`, `actualizar`, `eliminar`) | — |
| `intentado_at` | timestamp, nullable | último intento de sync, para reintentos |

Se limpia automáticamente cuando el cambio se confirma sincronizado. Ver
`contracts/sync-contract.md` para el flujo completo.

## Diagrama de relaciones

```text
Usuario 1──N Viaje 1──N Gasto N──1 Categoría 1──N Usuario
Usuario 1──N Categoría
Usuario 1──N Asociación aprendida N──1 Categoría
```
