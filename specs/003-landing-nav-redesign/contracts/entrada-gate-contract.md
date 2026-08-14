# Contrato: Gate de entrada (identidad activa → ruteo)

**Feature**: `003-landing-nav-redesign` | Ver `research.md` §1, `data-model.md` § Estado de
bienvenida.

Este contrato fija el comportamiento exacto de `IdentityProvider` y del nuevo componente
`EntradaGate` (`src/app/routes.tsx`). Cualquier tarea que los implemente o los testee debe cumplir
esta tabla de decisión sin excepciones.

## `IdentityProvider` — contrato de valores expuestos

```ts
interface IdentityContextValue {
  userId: string | null
  isGuest: boolean
  loading: boolean
  establecerInvitado: () => string
}
```

| `loading` (auth) | `session` | `peekActiveIdentity()` | `userId` | `isGuest` |
|---|---|---|---|---|
| `true` | — | — | `null` | `false` |
| `false` | `Session` | — (no se evalúa) | `session.user.id` | `false` |
| `false` | `null` | `string` (ya existía) | ese `string` | `true` |
| `false` | `null` | `null` | `null` | `false` |

Reglas:

- `peekActiveIdentity()` **nunca** escribe `localStorage`. Es la única función permitida para leer
  la identidad de invitado desde código que corre antes de que la persona haya decidido algo en
  Bienvenida (gate, `LoginPage`, `RegistroPage`).
- `establecerInvitado()` es la **única** llamada permitida a `getOrCreateActiveIdentity()` (que sí
  crea+persiste) en toda la app. Se invoca exclusivamente desde el handler de "Continuar como
  invitado" en `BienvenidaPage`.
- Ninguna otra pantalla, hook o efecto puede crear una identidad de invitado como side effect de
  montarse o renderizar.

## `EntradaGate` — contrato de ruteo

Componente de ruta (mismo patrón que `RedirectIfAuth`/`Bootstrap` ya existentes), evaluado por
encima de `Bootstrap` en el árbol de rutas:

| `loading` | `session` | `userId` (de `IdentityProvider`) | Resultado |
|---|---|---|---|
| `true` | — | — | `<Cargando />` (no decide todavía) |
| `false` | `Session` | — | `<Outlet />` (sigue a `Bootstrap` normalmente) |
| `false` | `null` | `string` | `<Outlet />` (invitado ya establecido, sigue a `Bootstrap`) |
| `false` | `null` | `null` | `<Navigate to="/bienvenida" replace />` |

`/bienvenida`, `/login` y `/registro` viven **fuera** de `EntradaGate` (envueltas solo por
`RedirectIfAuth`, que ya existe y las saca de circulación si hay sesión activa) — nunca deben
quedar anidadas dentro de `EntradaGate`, o su propio render dispararía una redirección a sí mismas.

## `LoginPage` / `RegistroPage` con `identidadAnterior` nulo

Ambas pantallas pueden montar con `userId === null` (llegada directa desde Bienvenida, sin invitado
previo). Contrato:

```ts
const cantidadViajes = identidadAnterior ? await contarViajesLocales(identidadAnterior) : 0
```

Con `identidadAnterior === null`, `cantidadViajes` es siempre `0` sin tocar Dexie — nunca hay datos
locales que vincular porque nunca existió una identidad bajo la cual pudieran haberse creado. El
resto del flujo de vinculación (`linkGuestData.ts`) no cambia: sigue operando exactamente igual
cuando `identidadAnterior` sí es un `string` (invitado establecido que decide crear cuenta o
iniciar sesión desde `Cuenta`, camino que `002-guest-mode-sync` ya cubre).

## Casos fuera de este contrato

- Cerrar sesión (`CuentaPage.handleCerrarSesion`) no pasa por este gate: ya congela la identidad
  activa en la cuenta antes de cerrar sesión (`002-guest-mode-sync` FR-015), por lo que
  `peekActiveIdentity()` siempre encuentra un valor inmediatamente después — nunca vuelve a
  `/bienvenida`.
- Eliminar cuenta (`CuentaPage.confirmarEliminacion`) borra Dexie completo y redirige a `/login`
  directo (fuera de `EntradaGate`) — comportamiento ya existente, sin cambios.
