# Contrato: Recuperación de contraseña

**Feature**: [spec.md](../spec.md) | **Fecha**: 2026-08-15

Tripflow no expone una API propia: el "contrato" de esta feature son (a) los métodos nuevos de
`AuthProvider` y (b) las rutas nuevas, con sus guardas. Ver decisiones en
[research.md](../research.md).

## 1. `AuthProvider` — métodos nuevos

Mismo estilo que `signUp`/`signIn`/`signOut` (`src/features/auth/AuthProvider.tsx`): envuelven una
llamada de Supabase Auth y traducen el error con `traducirErrorAuth`.

```ts
resetPassword: (email: string) => Promise<{ error: string | null }>
updatePassword: (newPassword: string) => Promise<{ error: string | null }>
```

- **`resetPassword(email)`**
  - Llama `supabase.auth.resetPasswordForEmail(email, { redirectTo: <origin>/recuperar-contrasena/confirmar })`.
  - **Pre**: `email` no vacío (validación HTML `required`, igual que Login/Registro).
  - **Post-éxito**: `{ error: null }` — el llamador (`RecuperarContrasenaPage`) muestra el toast de
    confirmación (FR-002 a FR-004). No distingue si el correo tiene cuenta o no (mismo
    comportamiento para ambos casos, por diseño de Supabase).
  - **Post-error**: `{ error: string }` únicamente ante fallas de red/formato — nunca revela si el
    correo existe (FR-004).

- **`updatePassword(newPassword)`**
  - Llama `supabase.auth.updateUser({ password: newPassword })`. Requiere que ya exista una sesión
    de recuperación activa (evento `PASSWORD_RECOVERY` ya recibido, ver §2).
  - **Pre**: `newPassword.length >= 6` (FR-006, mismo mínimo que Registrarse; validación en el
    formulario antes de llamar).
  - **Post-éxito**: `{ error: null }` — el llamador (`NuevaContrasenaPage`) hace `signOut()` y
    navega a `/login` con toast de éxito (FR-007).
  - **Post-error**: `{ error: string }` vía `traducirErrorAuth` (p. ej. contraseña muy corta
    rechazada server-side).

No se modifican `signUp`, `signIn` ni `signOut` (FR-012).

## 2. Rutas nuevas y sus guardas

| Ruta | Pantalla | Guard | Motivo |
|---|---|---|---|
| `/recuperar-contrasena` | `RecuperarContrasenaPage` (pedir correo) | `RedirectIfAuth` (mismo grupo que `/login`, `/registro`) | Una persona con sesión normal activa no necesita pedir un enlace de recuperación |
| `/recuperar-contrasena/confirmar` | `NuevaContrasenaPage` (contraseña nueva) | Ninguno — ruta de nivel superior, fuera de `RedirectIfAuth` y `EntradaGate`/`Bootstrap` | La sesión de recuperación (`PASSWORD_RECOVERY`) no debe activar esas guardas — ver research.md §2 |

`LoginPage` agrega un enlace `¿Olvidaste tu contraseña?` hacia `/recuperar-contrasena` (FR-001),
mismo patrón visual que el enlace existente "Crear cuenta" (`text-text-brand font-semibold`).

## 3. Eventos de Supabase consumidos

- `supabase.auth.onAuthStateChange` — `NuevaContrasenaPage` escucha el evento `PASSWORD_RECOVERY`
  localmente (no se expone en `AuthContextValue`, ver data-model.md) para saber cuándo mostrar el
  formulario de contraseña nueva.
- `window.location.hash` — `NuevaContrasenaPage` lo inspecciona al montar para detectar
  `error=access_denied&error_code=otp_expired` (u otro `error`) y mostrar el mensaje de FR-008 sin
  esperar ningún evento.

## 4. Fuera de contrato

- No hay endpoint HTTP propio ni Edge Function nueva.
- No hay cambios en el esquema de Supabase Postgres ni en Dexie.
