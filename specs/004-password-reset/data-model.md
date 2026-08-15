# Data Model: Recuperar contraseña olvidada

**Feature**: [spec.md](./spec.md) | **Fecha**: 2026-08-15

Esta funcionalidad no agrega tablas ni entidades persistentes propias de la app: no toca Dexie
(`src/lib/db.ts`) ni el esquema de Supabase Postgres. Las dos entidades del spec (§ Key Entities)
son:

## Solicitud de recuperación

Correo ingresado por la persona para iniciar el flujo.

- **Persistencia**: ninguna en la app. El envío del correo y la vigencia/invalidación del enlace
  los administra Supabase Auth internamente (tabla interna de Supabase, fuera del control de este
  código).
- **Campos en el cliente**: solo el `email: string` que vive en el `useState` de
  `RecuperarContrasenaPage` mientras se completa el formulario — se descarta al desmontar.

## Usuario

Misma entidad definida en `001-tripflow-v0` (fila de `auth.users` en Supabase), sin cambios de
atributos.

- **Campo afectado por esta feature**: únicamente la credencial de acceso (`encrypted_password`,
  gestionada 100% por Supabase Auth vía `updateUser`). Ningún atributo de negocio (viajes, gastos,
  categorías) se lee ni se modifica.

## Estado de sesión en el cliente (no persistente, solo en memoria)

No es una entidad de negocio, pero vale documentarla porque condiciona el enrutamiento (ver
[research.md §2](./research.md)):

| Estado | Origen | Efecto en `IdentityProvider` |
|---|---|---|
| Sin sesión | Nadie autenticado | `session === null` → `isGuest: true` |
| Sesión normal | `signIn`/`signUp` | `session !== null` → `isGuest: false`, guards normales aplican |
| Sesión de recuperación | Evento `PASSWORD_RECOVERY` al abrir el enlace del correo | `session !== null` igual que una sesión normal — `NuevaContrasenaPage` vive fuera de los guards que asumen "sesión normal" (ver research.md §2) |

No requiere un campo nuevo en `AuthContextValue`: el evento `PASSWORD_RECOVERY` se escucha
localmente dentro de `NuevaContrasenaPage`, no se expone globalmente (Principio I — no agregar
estado global para un solo consumidor).
