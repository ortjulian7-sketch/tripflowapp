# Data Model: Bienvenida inicial y navegación alineada al Figma Make

**Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

No se agrega ninguna tabla ni columna a Dexie/Postgres. Esta feature solo introduce un campo
**derivado** (no persistido aparte) y reutiliza `Categoria` tal cual la define `001-tripflow-v0`.

---

## Estado de bienvenida (dispositivo)

Entidad conceptual de `spec.md` (Key Entities). **No es una tabla ni un campo de
`localStorage` nuevo** — es un valor derivado, calculado en cada carga a partir de identidad ya
existente (`research.md` §1):

```
resuelta = session !== null || peekActiveIdentity() !== null
```

| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| `resuelta` | `boolean` (derivado, no persistido) | `useAuth().session` + `peekActiveIdentity()` (lee `localStorage['tripflow_active_identity']`, no crea) | `true` en cuanto exista sesión O identidad de invitado ya establecida. Vive solo en el dispositivo — no es de cuenta ni se sincroniza (coincide con `spec.md`). |

**Transiciones** (todas de `resuelta = false` → `resuelta = true`, nunca al revés):

1. Persona toca "Continuar como invitado" → `IdentityProvider.establecerInvitado()` persiste un id
   en `localStorage` → `peekActiveIdentity() !== null` desde la próxima lectura.
2. Persona completa "Iniciar sesión" o "Registrarse" con éxito → Supabase Auth persiste una sesión
   → `session !== null`.
3. Dispositivo que ya tenía identidad de antes de esta feature → `resuelta` es `true` desde el
   primer render, sin transición visible (grandfathering, `research.md` §1).

**Por qué no es una tabla/columna**: agregar un campo persistido duplicaría una señal que ya existe
en dos lugares (`localStorage['tripflow_active_identity']`, sesión de Supabase Auth) — violaría
Principio I (simplicidad) al introducir una fuente de verdad adicional que podría desincronizarse
de la real.

---

## Categoria (sin cambios de esquema — cambia el momento de creación)

Misma entidad de `001-tripflow-v0` (`src/lib/db.ts`):

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | sin cambios |
| `user_id` | `string` | sin cambios |
| `nombre` | `string` | sin cambios |
| `emoji` | `string` | sin cambios |
| `protegida` | `boolean` | sin cambios — `"Otro"` sigue siendo la única `true` |
| `created_at` / `updated_at` | `string` (ISO) | sin cambios |

**Lo que cambia es el flujo de creación durante el onboarding** (`research.md` §2,
`contracts/onboarding-categorias-contract.md`): antes, las 8 filas (7 + "Otro") se creaban todas
juntas, eager, antes de que la pantalla de selección renderizara. Ahora:

1. La pantalla de onboarding mantiene un catálogo **candidato**, en memoria, no persistido — las 7
   categorías no protegidas (mismo `nombre`/`emoji` que hoy define `CATEGORIAS_INICIALES`, ver
   `seed.ts`) — más un estado de selección local (`Set<string>` de nombres, default vacío).
2. Al confirmar ("Continuar"), se persiste en una sola operación: las categorías candidatas cuyo
   `nombre` está en el set seleccionado, más `"Otro"` (protegida, siempre, sin pasar por el set —
   nunca aparece en la grilla de selección).
3. Ninguna fila de `Categoria` existe en Dexie/Supabase antes de ese momento — a diferencia de
   antes, donde existían (todas) desde antes de que la persona viera la pantalla.

**Regla de negocio sin cambios**: `crearCategoria`/`renombrarCategoria`
(`categoryRepository.ts`) — crear una categoría propia después del onboarding sigue funcionando
exactamente igual (`FR-011`), no forma parte de este catálogo candidato inicial.

---

## Usuario, Viaje, Gasto

Sin cambios de atributos respecto a `001-tripflow-v0`/`002-guest-mode-sync` (confirmado en
`spec.md` § Key Entities).
