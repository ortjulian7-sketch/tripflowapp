# Contrato: Selección y persistencia de categorías del onboarding

**Feature**: `003-landing-nav-redesign` | Ver `research.md` §2 y §3, `data-model.md` § Categoria.

Fija el comportamiento exacto de `CategoriasOnboardingPage`, el `Bootstrap` de `routes.tsx` y el
refactor de `src/features/categories/seed.ts`. Reemplaza el comportamiento descrito para este mismo
archivo en `spec.md` de `001-tripflow-v0` (sembrado eager) allí donde entren en conflicto — este
contrato es la versión vigente.

## Catálogo candidato (no persistido)

```ts
// seed.ts
export const CATEGORIAS_CANDIDATAS: { nombre: string; emoji: string }[] // las 7 no protegidas
export const OTRO: { nombre: string; emoji: string } // 'Otro', 🗂️ — protegida
```

`CATEGORIAS_CANDIDATAS` y `OTRO` son datos estáticos en memoria — no se leen ni se escriben en
Dexie hasta la confirmación. `OTRO` **nunca** aparece en la grilla de selección (`FR-012`).

## Pantalla de selección — contrato de estado

- Estado inicial: `Set<string>` de nombres seleccionados, **vacío** (`FR-012`, clarificación de
  `spec.md`: "todas las categorías arrancan deseleccionadas").
- Tocar una categoría no seleccionada → se agrega al set. Tocar una ya seleccionada → se quita.
  Sin límite mínimo ni máximo de selecciones.
- El botón "Continuar" está **siempre habilitado**, sin importar el tamaño del set — incluyendo
  vacío (`FR-013`).
- Ninguna escritura a Dexie ocurre por tocar un `Chip` — solo estado de React en memoria.

## Confirmación — contrato de persistencia

Al tocar "Continuar", en una sola pasada (antes de navegar):

```ts
async function guardarSeleccionInicial(userId: string, nombresSeleccionados: Set<string>): Promise<void>
```

1. Persiste (vía `writeAndQueue`, mismo mecanismo que `crearCategoria`) una fila por cada elemento
   de `CATEGORIAS_CANDIDATAS` cuyo `nombre` esté en `nombresSeleccionados`.
2. Persiste siempre una fila para `OTRO`, sin excepción, sin pasar por el set.
3. Si `nombresSeleccionados` está vacío, el único resultado es la fila de `OTRO` — conteo final = 1
   (`FR-014`, edge case "Cero categorías seleccionadas").
4. Navega a `/viajes/nuevo` recién después de que la persistencia resuelve.

No existe ninguna otra función de siembra en la app tras este refactor —
`seedCategoriasIniciales` (que creaba las 8 juntas) se elimina; `guardarSeleccionInicial` es su
único reemplazo, y solo se llama desde este flujo de confirmación.

## `Bootstrap` — contrato de gate de onboarding

```ts
const necesitaOnboarding =
  categorias.length === 0 && (isGuest || Boolean(location.state?.cuentaNueva))
```

| `necesitaOnboarding` | `categorias.length` | `pathname` | Resultado |
|---|---|---|---|
| `true` | `0` | `/onboarding/categorias` | `<Outlet />` (renderiza la pantalla, sin esperar nada) |
| `true` | `0` | otro | `<Navigate to="/onboarding/categorias" replace state={{ cuentaNueva: !isGuest }} />` |
| `false` | `0` | — | `<Cargando />` (con sesión, cuenta preexistente: esperando `pull`) |
| `false` | `> 0` | — | `<Outlet />` |

`Bootstrap` **no** siembra nada — ni con `useEffect` ni de ninguna otra forma. La única vía para
que `categorias.length` deje de ser `0` es que la persona confirme su selección en
`CategoriasOnboardingPage` (o, para cuentas preexistentes, que el `pull` de `useSync` traiga las
remotas).

## `RegistroPage` — contrato de navegación

Los cuatro caminos de éxito (`signUp` directo, `signUp` + `incluirDatosLocales` con 0 viajes,
confirmar "Incluir", confirmar "Descartar") navegan igual:

```ts
navigate('/onboarding/categorias', { replace: true, state: { cuentaNueva: true } })
```

Sin llamar a ninguna función de siembra antes de navegar (se elimina `asegurarCategorias`).
`LoginPage` nunca pasa `state: { cuentaNueva: true }` — una cuenta que inicia sesión ya existía
antes de este flujo, su conteo en cero (si lo hay) siempre significa "esperando `pull`", nunca
"necesita onboarding".

## Casos fuera de este contrato

- Crear una categoría propia después del onboarding (`crearCategoria`, `FR-011`) no cambia — sigue
  siendo una operación independiente del catálogo candidato.
- La categoría `"Otro"` como respaldo de `sugerirCategoria` (`categorization/suggest.ts`) no
  cambia — sigue buscándose por `nombre === 'Otro'` en el array de categorías ya persistidas, que
  este contrato garantiza que siempre incluye una fila `"Otro"` tras el onboarding.
