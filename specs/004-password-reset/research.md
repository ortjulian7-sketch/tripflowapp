# Research: Recuperar contraseña olvidada

**Feature**: [spec.md](./spec.md) | **Fecha**: 2026-08-15

## 1. Proveedor y método de recuperación

**Decision**: Usar `supabase.auth.resetPasswordForEmail(email, { redirectTo })` para disparar el
correo, y `supabase.auth.updateUser({ password })` para establecer la contraseña nueva.

**Rationale**: `AuthProvider.tsx` ya envuelve Supabase Auth para `signUp`/`signIn`/`signOut`
(`src/features/auth/AuthProvider.tsx:38-51`). Ambos métodos son el flujo estándar de Supabase para
este caso — no requieren backend propio, tabla nueva, ni endpoint custom, cumpliendo el Principio I
(simplicidad) y las Assumptions del spec.

**Alternatives considered**: Construir un flujo propio de tokens de un solo uso (tabla + Edge
Function) — descartado: Supabase ya administra vigencia, invalidación de enlaces previos
(Edge Case "Solicitudes repetidas") y la plantilla del correo; reconstruirlo violaría el Principio I
sin ningún beneficio funcional.

## 2. Enrutamiento: sesión de recuperación vs. guards existentes

**Decision**: `/recuperar-contrasena` (pedir el correo) se agrega al grupo `RedirectIfAuth` junto a
`/login` y `/registro`. `/recuperar-contrasena/confirmar` (establecer contraseña nueva) se agrega
como ruta de nivel superior, **fuera** de `RedirectIfAuth` y de `EntradaGate`/`Bootstrap`.

**Rationale**: Al abrir el enlace del correo, Supabase autentica a la persona con una sesión de
recuperación temporal (evento `PASSWORD_RECOVERY` vía `onAuthStateChange`, ya suscrito en
`AuthProvider.tsx:29-33`) — es decir, `session` deja de ser `null` antes de que la persona termine
de establecer su contraseña nueva. `IdentityProvider.tsx:31` deriva `userId`/`isGuest` directo de
`session`, así que:
- Si la pantalla de confirmación quedara bajo `RedirectIfAuth` (`src/app/routes.tsx:108-112`), la
  persona sería redirigida a `/` apenas se crea la sesión de recuperación, sin llegar a ver el
  formulario.
- Si quedara bajo `EntradaGate`/`Bootstrap` (`src/app/routes.tsx:88-102`, `114-120`), correría la
  lógica de onboarding/categorías sobre una sesión de recuperación todavía sin contraseña
  confirmada — un estado que esos guards no fueron diseñados para manejar.

Al confirmar la contraseña nueva con éxito, la pantalla llama `signOut()` explícitamente y navega a
`/login` con un toast de éxito. Esto satisface FR-007 ("puede iniciar sesión con ella de inmediato")
sin necesitar enseñarle a `RedirectIfAuth`/`EntradaGate` un tercer estado de sesión — mismo patrón
que `LoginPage`/`RegistroPage`, que también navegan explícitamente al terminar en vez de depender de
un guard reactivo (ver comentario en `src/app/routes.tsx:73-80`).

**Alternatives considered**: Dejar entrar a la persona directamente a la app tras establecer la
contraseña (sin `signOut`) — descartado: obligaría a `Bootstrap`/`EntradaGate` a distinguir una
sesión "recién recuperada" de una normal (p. ej. para no disparar onboarding en una cuenta
existente), complejidad no pedida por el spec (Principio III) para un beneficio marginal (ahorrar un
login manual).

## 3. Detección de enlace vencido o ya usado (FR-008)

**Decision**: Al montar `/recuperar-contrasena/confirmar`, leer `window.location.hash` con
`URLSearchParams`. Si contiene `error` (Supabase redirige con
`error=access_denied&error_code=otp_expired` cuando el enlace venció o ya se usó), mostrar de
inmediato el mensaje de FR-008 con un enlace para volver a `/recuperar-contrasena`. Si no hay
`error`, esperar el evento `PASSWORD_RECOVERY` de `onAuthStateChange` (con un timeout corto de
fallback al mismo mensaje de enlace inválido, por si la pantalla se abre directamente sin token) antes
de renderizar el formulario de contraseña nueva.

**Rationale**: Es el mecanismo documentado de Supabase Auth para comunicar el resultado del enlace
al cliente — no requiere decodificar el JWT ni llamar a un endpoint adicional.

**Alternatives considered**: Intentar `updateUser({ password })` a ciegas y traducir el error
recién ahí — descartado: dejaría a la persona completar el formulario entero antes de enterarse de
que el enlace ya no servía, peor UX que detectarlo al llegar (SC-004 pide que entienda "qué pasó" sin
fricción extra).

## 4. Mensaje de confirmación de envío (FR-002 a FR-004)

**Decision**: Reusar `useToast()` (`src/components/Toast.tsx`, ya montado en `App.tsx` vía
`ToastProvider`) para mostrar el mismo mensaje de éxito sin importar si el correo existe o no.

**Rationale**: `resetPasswordForEmail` de Supabase ya responde sin distinguir si el correo tiene
cuenta asociada (mismo comportamiento pedido por FR-004/SC-003) — el frontend solo necesita mostrar
el mensaje de éxito siempre que la llamada no falle por un error de red/formato, sin lógica adicional
de anti-enumeración.

**Alternatives considered**: Mensaje inline en la pantalla (como el `role="alert"` de error en
Login/Registro) — descartado en favor del toast porque el toast ya es el patrón establecido en el
código actual para confirmaciones efímeras, y dejar la pantalla del formulario visible permite
reenviar el correo sin navegar.

## 5. Traducción de errores

**Decision**: Extender `traducirErrorAuth` (`src/features/auth/authErrors.ts`) solo para los casos
de error genéricos de `resetPasswordForEmail`/`updateUser` (p. ej. correo inválido, contraseña corta)
que ya cubre para signUp/signIn. El caso de enlace vencido/usado (FR-008) NO pasa por esta función:
es un estado detectado antes de cualquier submit (ver §3), con su propio mensaje dedicado.

**Rationale**: Mantiene una sola fuente de traducciones para errores de formulario, consistente con
el patrón ya usado en `LoginPage`/`RegistroPage`, sin duplicar strings.

## Resumen de NEEDS CLARIFICATION

Ninguno pendiente: el spec ya resolvió las ambigüedades de negocio en su sección Assumptions: la
única clarificación técnica nueva (integración de la sesión de recuperación con las guardas de
ruteo existentes) queda resuelta en §2.
