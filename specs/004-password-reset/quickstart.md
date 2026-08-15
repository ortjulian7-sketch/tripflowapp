# Quickstart: Recuperar contraseña olvidada

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Prerrequisitos

- `.env.local` con `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` de un proyecto Supabase real (ver
  `.env.example`) — el flujo de recuperación depende del envío de correo real de Supabase Auth, no
  hay mock local para esto.
- Una cuenta de prueba existente (creada vía `/registro` o vinculada desde invitado, ver
  User Story 3 del spec) con acceso al correo de esa cuenta.
- `npm install` ya corrido.

## Validar User Story 1 — Solicitar el correo (P1)

```bash
npm run dev
```

1. Ir a `/login`.
2. Confirmar que aparece el enlace "¿Olvidaste tu contraseña?" (FR-001).
3. Tocarlo → llegar a `/recuperar-contrasena`.
4. Ingresar el correo de la cuenta de prueba y confirmar.
5. **Esperado**: toast de confirmación de envío (FR-002, FR-003); revisar la bandeja de entrada del
   correo de prueba y confirmar que llegó el email de Supabase.
6. Repetir con un correo que no tenga cuenta asociada.
7. **Esperado**: mismo toast de confirmación, sin ninguna diferencia visible (FR-004, SC-003).

## Validar User Story 2 — Establecer contraseña nueva (P1)

1. Abrir el enlace recibido por correo (te lleva a `/recuperar-contrasena/confirmar`).
2. **Esperado**: formulario para ingresar y confirmar una contraseña nueva (FR-005).
3. Ingresar una contraseña de al menos 6 caracteres y confirmar.
4. **Esperado**: la app navega a `/login` con un toast de éxito (FR-007).
5. Iniciar sesión con el correo y la contraseña nueva.
6. **Esperado**: acceso concedido de inmediato (SC-002).

### Enlace vencido/usado (FR-008)

1. Solicitar dos correos de recuperación seguidos para la misma cuenta (Edge Case "Solicitudes
   repetidas").
2. Abrir el enlace del primer correo (el más viejo).
3. **Esperado**: mensaje claro de enlace inválido/vencido, con un camino para volver a
   `/recuperar-contrasena` y pedir uno nuevo (SC-004) — nunca el formulario de contraseña.

## Validar User Story 3 — Cuenta vinculada desde invitado (P2)

1. Seguir el flujo de `002-guest-mode-sync` para crear una cuenta vinculando datos de invitado.
2. Cerrar sesión.
3. Repetir "Validar User Story 1" y "Validar User Story 2" con el correo de esa cuenta.
4. **Esperado**: comportamiento idéntico a una cuenta creada directamente en Registrarse.

## Validar sin conexión (FR-010)

1. En las DevTools, simular offline (Network → Offline) en `/recuperar-contrasena` y en
   `/recuperar-contrasena/confirmar`.
2. Intentar enviar cada formulario.
3. **Esperado**: mensaje "Este paso requiere conexión a internet." (mismo texto que Login/Registro),
   sin bloquear el resto de la app.

## Tests automatizados

```bash
npm run test        # unit (Vitest) — sin casos nuevos esperados para este feature, ver research.md §5
npm run test:e2e     # Playwright — agrega tests/e2e/recuperar-contrasena.spec.ts
```
