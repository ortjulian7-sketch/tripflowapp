# Contract: Esquema de datos (Supabase Postgres)

Este es el contrato entre la app y su copia sincronizada. La app nunca llama a un servidor
propio: habla directamente contra estas tablas vía el SDK de Supabase, sujeta a las políticas
de acceso por fila (RLS) descritas abajo. El mismo esquema (nombres de tabla y columna) se
refleja en el store local de Dexie (IndexedDB) descrito en `data-model.md`.

## Regla general de acceso (RLS)

Todas las tablas exigen `auth.uid() = user_id` (directo o vía el viaje/categoría dueños del
registro) tanto para lectura como para escritura. Esto es lo que garantiza FR-012 (aislamiento
entre viajes) y que ninguna persona pueda leer o modificar datos de otra cuenta.

## `viajes`

| Columna | Tipo | Constraint |
|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` |
| `user_id` | uuid | FK → `auth.users(id)`, `NOT NULL`, RLS: `auth.uid() = user_id` |
| `nombre` | text | `NOT NULL` |
| `destino` | text | `NOT NULL` |
| `fecha_salida` | date | `NOT NULL` |
| `fecha_regreso` | date | nullable |
| `presupuesto_total` | integer | `NOT NULL`, `CHECK (presupuesto_total > 0)` |
| `moneda` | text | `NOT NULL`, `CHECK` contra catálogo acotado de códigos ISO 4217 |
| `created_at` | timestamptz | default `now()` |
| `updated_at` | timestamptz | default `now()`, se actualiza en cada `UPDATE` |

`ON DELETE CASCADE` hacia `gastos.trip_id`.

## `gastos`

| Columna | Tipo | Constraint |
|---|---|---|
| `id` | uuid | PK |
| `trip_id` | uuid | FK → `viajes(id) ON DELETE CASCADE`, `NOT NULL` |
| `categoria_id` | uuid | FK → `categorias(id) ON DELETE RESTRICT`, `NOT NULL` |
| `monto` | integer | `NOT NULL`, `CHECK (monto > 0)` |
| `descripcion` | text | `NOT NULL`, `CHECK (descripcion <> '')` |
| `fecha` | date | `NOT NULL` |
| `momento_registro` | timestamptz | default `now()` |
| `categoria_elegida_manualmente` | boolean | default `false` |
| `created_at` / `updated_at` | timestamptz | igual que `viajes` |

`ON DELETE RESTRICT` en `categoria_id` es la red de seguridad a nivel de base de datos para
FR-028; la app igualmente valida antes y muestra el mensaje explicativo, esta restricción solo
evita que un bug deje un gasto sin categoría válida.

RLS: `auth.uid() = (SELECT user_id FROM viajes WHERE id = trip_id)`.

## `categorias`

| Columna | Tipo | Constraint |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `auth.users(id)`, `NOT NULL` |
| `nombre` | text | `NOT NULL`, `UNIQUE (user_id, nombre)` |
| `emoji` | text | `NOT NULL` |
| `protegida` | boolean | default `false` (`true` solo en la categoría "Otro" creada al registrarse) |
| `created_at` / `updated_at` | timestamptz | — |

RLS: `auth.uid() = user_id`. Sin `ON DELETE CASCADE` hacia `gastos` (ver arriba: `RESTRICT`).

## `asociaciones_aprendidas`

| Columna | Tipo | Constraint |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `auth.users(id)`, `NOT NULL` |
| `termino` | text | `NOT NULL`, `UNIQUE (user_id, termino)` |
| `categoria_id` | uuid | FK → `categorias(id) ON DELETE CASCADE`, `NOT NULL` |
| `created_at` / `updated_at` | timestamptz | — |

`ON DELETE CASCADE` en `categoria_id` implementa el edge case "categoría eliminada con
asociaciones aprendidas": al borrar la categoría, sus asociaciones desaparecen solas.

RLS: `auth.uid() = user_id`.

## Fuera de este esquema

No existe tabla ni endpoint para exportar datos, dividir gastos entre personas, ni adjuntar
fotos de recibos — quedan fuera de v0 (ver "Out of Scope" en `spec.md`).
