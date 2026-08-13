# Tripflow

Controlá el presupuesto de tu viaje: creá un viaje con presupuesto, registrá gastos en
segundos y mirá de un vistazo si vas a sostenerlo hasta el final — funciona igual en el
celular y en la computadora, incluso sin conexión.

Repositorio de desarrollo de TripFlow. Este proyecto usa [Spec Kit](https://github.com/github/spec-kit)
para desarrollo dirigido por especificaciones (spec-driven development): cada feature se
documenta como especificación, plan y tareas antes de implementarse
(`specs/001-tripflow-v0/`), y todo el proceso queda registrado en este repositorio.

## Stack

React + TypeScript + Vite, con Dexie.js (IndexedDB) como fuente de verdad offline-first y
Supabase (Postgres + Auth) como respaldo sincronizado. Sin servidor propio: la única pieza
server-side es la Edge Function `delete-account`. Ver `specs/001-tripflow-v0/plan.md` para el
detalle completo de las decisiones técnicas.

## Instalación

```bash
npm install
cp .env.example .env.local
```

Completá `.env.local` con los datos de tu proyecto de Supabase:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

**Nunca** pongas ahí la clave de rol de servicio (`service_role`) — esa clave solo debe existir
como secreto del proyecto de Supabase, usada exclusivamente por la Edge Function
`delete-account` (nunca en este repositorio ni en código de cliente).

### Configurar el proyecto de Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Aplicá el esquema: pegá el contenido de `supabase/migrations/0001_schema.sql` en el SQL
   Editor del proyecto (o usá la CLI de Supabase: `supabase db push`).
3. Desplegá la función de borrado de cuenta:
   ```bash
   supabase functions deploy delete-account
   ```
   Esa función necesita `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` como
   secretos del proyecto (Supabase los provee automáticamente a las Edge Functions).
4. En Authentication → Settings, desactivá "Confirm email" para desarrollo/pruebas (si lo
   dejás activo, `signUp` no devuelve sesión de inmediato y el flujo de registro sin fricción
   de la spec no funciona hasta confirmar el correo).

## Desarrollo

```bash
npm run dev        # servidor de desarrollo
npm run build       # build de producción (incluye chequeo de tipos)
npm run preview     # sirve el build de producción localmente
npm run lint         # ESLint
npm run format        # Prettier
npm run test           # Vitest (lógica pura: dinero, fechas, salud del presupuesto, etc.)
npm run test:e2e        # Playwright (camino dorado P1 — requiere Supabase real, ver arriba)
```

## Validación manual

`specs/001-tripflow-v0/quickstart.md` describe 10 escenarios para validar cada historia de
usuario directamente en la app, sin leer código (Principio IV de la constitución).

## Despliegue

Pensado para hosting estático/edge (p. ej. [Vercel](https://vercel.com)) conectado al
repositorio, con despliegue automático desde `main`. Configurá `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY` como variables de entorno del proyecto en Vercel — nunca subas
`.env.local` al repositorio (ya está en `.gitignore`).
