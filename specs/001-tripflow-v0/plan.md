# Implementation Plan: Tripflow v0 — Control de presupuesto de viaje

**Branch**: `001-tripflow-v0` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-tripflow-v0/spec.md`

## Summary

Tripflow v0 debe permitir a una persona crear un viaje con presupuesto, registrar gastos en
segundos y ver de un vistazo si va a sostener ese presupuesto hasta el final — funcionando
igual en el teléfono y en la computadora, incluso sin conexión.

**Enfoque técnico**: una única aplicación web responsiva (funciona igual en navegador móvil y
de escritorio, instalable como app sin pasar por tiendas de aplicaciones), con los datos
guardados primero en el propio dispositivo (para que todo — crear, editar, borrar, consultar —
funcione sin internet) y respaldados/sincronizados automáticamente contra un backend
administrado (autenticación + base de datos) cuando hay conexión. No se construye un servidor
propio: la única pieza de lógica del lado del servidor es una función mínima para borrar una
cuenta de forma segura y permanente.

## Decisiones clave (en lenguaje de negocio)

- **Una sola app web, no apps nativas de iOS/Android**: se puede publicar de inmediato con un
  link, sin esperar la revisión de App Store / Play Store, y sin mantener tres versiones
  distintas del mismo producto. Cumple "funciona en celular y en computador" sin ese costo.
- **Los datos viven primero en el teléfono/computador de la persona**: registrar, editar,
  borrar y ver los gastos funciona exactamente igual con o sin internet (requisito explícito
  de la spec), porque la app nunca depende de la red para responder.
- **La sincronización es automática y silenciosa**: al recuperar conexión, los cambios pendientes
  se suben solos; la persona nunca tiene que apretar un botón de "sincronizar".
- **Un solo proveedor administrado para cuentas y respaldo de datos** (no un servidor propio que
  haya que operar, actualizar y vigilar): reduce el v1 a "una app + un servicio ya existente",
  que es la forma más rápida de publicar sin agregar infraestructura que la spec no pide.
- **La categorización automática de gastos corre en el propio dispositivo**, con un diccionario
  simple que aprende de las correcciones de la persona — no depende de ningún servicio externo
  de inteligencia artificial, así que también funciona sin conexión y sin costo por uso.
- **Los montos de dinero se guardan como números enteros (centavos), nunca como decimales
  aproximados**, para que la suma de gastos, el porcentaje y el disponible siempre cuadren
  exactamente con lo registrado (la spec lo exige en 100% de los casos).
- **Borrar una cuenta es la única operación que sí necesita un pequeño componente en el
  servidor**: es la única acción que no se puede hacer de forma segura solo desde el
  teléfono/computador de la persona, porque implica eliminar también su acceso (login). Se
  resuelve con la pieza mínima posible, no con un backend completo.
- **No se agregan librerías ni sistemas para problemas que la spec no tiene**: sin manejo de
  conflictos complejos entre dispositivos (la propia spec dice "gana el cambio más reciente"),
  sin un motor de formularios, sin librería de fechas — todo elegido por ser lo más simple que
  cumple cada requisito, según el Principio I de la constitución.

## Technical Context

**Language/Version**: TypeScript 5.x sobre React 18 (aplicación cliente, sin runtime de
servidor propio).

**Primary Dependencies**: React + React Router (navegación), Dexie.js (capa de almacenamiento
local offline-first sobre IndexedDB, con consultas reactivas), `@supabase/supabase-js`
(autenticación por correo/contraseña + base de datos Postgres administrada, usada como respaldo
sincronizado), `vite-plugin-pwa` (empaqueta la app como Progressive Web App instalable y con
caché de la interfaz para uso offline), Tailwind CSS (consume los tokens semánticos de
`.specify/memory/design-system.md` como variables, para no hardcodear valores fuera del sistema
de diseño).

**Storage**: IndexedDB en el dispositivo (fuente de verdad para lectura/escritura offline) +
Postgres administrado por Supabase (copia sincronizada, requerida por FR-056 para poder borrarla
al eliminar la cuenta). Los montos se guardan como enteros en unidad mínima de moneda (p. ej.
centavos) para evitar errores de redondeo.

**Testing**: Vitest (funciones puras de cálculo: salud del presupuesto, porcentajes, conteo de
días, categorización) + Playwright (una prueba de humo del camino dorado P1: crear cuenta → crear
viaje → registrar gasto → ver resumen). El resto de los criterios de aceptación se valida
manualmente contra la app siguiendo `quickstart.md`, en línea con el Principio IV de la
constitución (verificable por una persona no técnica).

**Target Platform**: Web responsiva (navegador móvil y de escritorio), instalable como PWA. Sin
build nativo de iOS/Android en v1.

**Project Type**: Aplicación web de un solo frontend (SPA/PWA) + backend administrado
(Supabase) sin servidor propio, salvo una función mínima para borrado de cuenta.

**Performance Goals**: lectura/escritura de datos reflejadas en pantalla en <100ms (no dependen
de red porque el dispositivo es la fuente de verdad); el estado de salud del presupuesto debe
poder leerse "de un vistazo" (FR-039 / SC-004), lo cual es un objetivo de diseño de la interfaz
más que un número de rendimiento técnico.

**Constraints**: debe funcionar 100% sin conexión para crear/editar/eliminar/consultar viajes y
gastos (FR-045 a FR-049); nunca debe perderse un dato registrado offline; la sincronización debe
ser automática, no iniciada por la persona; toda la interfaz en español LATAM (Principio II);
toda la UI debe reutilizar los componentes/tokens de `.specify/memory/design-system.md`
(Principio VI); ningún secreto ni clave en el código del repositorio (Principio V).

**Scale/Scope**: una persona por cuenta, 1 a 3 viajes al año, decenas o pocos cientos de gastos
por viaje. Escala deliberadamente pequeña: no se diseña para alta concurrencia ni multi-tenant
complejo, porque la spec no lo requiere.

**UI Components**: mapeo de pantallas a componentes de `.specify/memory/design-system.md`
(Principio VI):

| Pantalla | Componentes reutilizados |
|---|---|
| Resumen (Dashboard) | Card — Style: Subtle (panel "viaje activo"); Progress Bar — Style: Warning (% gastado); Progress Bar — Style: Brand (días transcurridos); List Item (gastos por día); Icon Button — Style: Primary, Size: Large (FAB "nuevo gasto"); Nav Item — Layout: Horizontal (desktop) / Vertical (mobile) |
| Registrar/editar gasto | Input — Type: Number (monto); Input — Type: Text (descripción); Chip — grid de categorías (Default/Selected); Input — Type: Select (fecha); Button — Style: Primary, Size: Large ("Guardar"); Button — Style: Secondary ("Cancelar") |
| Crear/editar viaje | Input — Type: Text (nombre, destino); Input — Type: Select (moneda, fechas); Input — Type: Number (presupuesto); Button — Style: Primary ("Crear viaje" / "Guardar cambios") |
| Onboarding de categorías | Chip — grid multi-selección, todas en estado Selected por defecto; Button — Style: Primary ("Continuar") |
| Gestión de categorías | List Item (nombre + emoji); Icon Button — Style: Secondary (Trash, eliminar); Input — Type: Text (nombre nuevo); Button — Style: Danger (confirmar eliminación) |
| Búsqueda y filtro de gastos | Input — Type: Text, Show Label: false (buscador, icono Search); Input — Type: Select ×2 (rango de fechas); List Item (resultados); Card — Style: Subtle (estado vacío) |
| Confirmaciones destructivas (borrar gasto/viaje/cuenta) | Button — Style: Danger; texto de advertencia con `color-status-error` |
| Estado de salud del presupuesto | Texto con tokens `color-status-success` / `color-status-warning` / `color-status-error`; Progress Bar (ver nota abajo) |

**Nota — extensión menor requerida al sistema de diseño**: `design-system.md` solo documenta
hoy las variantes `Warning` y `Brand` de Progress Bar. El estado "Vas bien" (tratamiento de
éxito) y "Te pasaste del presupuesto" (tratamiento de error) necesitan dos variantes adicionales
(`Success`, `Error`). Ambas reutilizan tokens semánticos ya existentes en el catálogo
(`color-status-success-strong`, `color-status-error-strong`) — no se crea ningún token nuevo,
solo se documentan dos variantes más del mismo componente, tal como el Principio VI prevé
("extender el sistema de diseño de forma apropiada"). Se registra como la primera tarea de
implementación de UI en `tasks.md`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Estado | Nota |
|---|---|---|
| I. Simplicidad ante todo | ✅ Cumple | Un solo frontend + un backend administrado (sin servidor propio); se descartaron explícitamente librerías de formularios, de fechas y motores de sincronización complejos (CRDT) por no ser necesarios — ver `research.md`. |
| II. Idioma y mercado | ✅ Cumple | Toda la interfaz en español LATAM; selector de moneda por viaje sobre catálogo acotado LATAM + USD + EUR. |
| III. Cero alcance fantasma | ✅ Cumple | El plan solo cubre pantallas y funciones respaldadas por un FR de la spec; nada de lo listado en "Out of Scope" se incluye en el diseño técnico. |
| IV. Verificable por persona no técnica | ✅ Cumple | `quickstart.md` traduce cada historia de usuario en pasos manuales dentro de la app; ningún criterio de éxito requiere leer código o base de datos. |
| V. Datos del usuario con respeto | ✅ Cumple | Solo se pide correo/contraseña y los datos de viaje/gasto necesarios; la única clave sensible (rol de servicio para borrar cuentas) vive en el proveedor administrado, nunca en el repositorio. |
| VI. Sistema de diseño como fuente de verdad | ⚠️ Cumple con extensión menor pendiente | Progress Bar necesita 2 variantes nuevas (`Success`, `Error`) antes de construir el indicador de salud del presupuesto; se documentan reutilizando tokens ya existentes (ver nota en Technical Context). No es una desviación del principio — es el mecanismo de extensión que el propio principio describe. |

*Re-evaluación tras Phase 1 (Design & Contracts): ver al final de este documento.*

## Project Structure

### Documentation (this feature)

```text
specs/001-tripflow-v0/
├── plan.md              # Este archivo (/speckit-plan)
├── research.md          # Fase 0 (/speckit-plan)
├── data-model.md         # Fase 1 (/speckit-plan)
├── quickstart.md         # Fase 1 (/speckit-plan)
├── contracts/             # Fase 1 (/speckit-plan)
│   ├── data-schema.md
│   ├── sync-contract.md
│   └── delete-account-function.md
└── tasks.md               # Fase 2 (/speckit-tasks — no generado por /speckit-plan)
```

### Source Code (repository root)

```text
tripflow/
├── src/
│   ├── app/                  # Rutas/páginas (React Router): dashboard, nuevo-viaje,
│   │                          # nuevo-gasto (también sirve para editar), categorias,
│   │                          # buscar, onboarding, login/registro
│   ├── components/           # Componentes de UI mapeados 1:1 al catálogo de design-system.md
│   │                          # (Button, Input, Chip, Card, ListItem, ProgressBar, NavItem, IconButton)
│   ├── features/
│   │   ├── trips/             # Reglas de negocio de viajes (crear, editar, eliminar, aislamiento)
│   │   ├── expenses/           # Reglas de negocio de gastos (crear, editar, eliminar, agrupar por día)
│   │   ├── budget-health/       # Cálculo puro: gastado, disponible, %, días, estado de salud
│   │   ├── categorization/      # Diccionario local + asociaciones aprendidas
│   │   ├── categories/          # Gestión de categorías de la cuenta
│   │   └── sync/                # Cola de cambios pendientes + reconciliación con Supabase
│   ├── lib/
│   │   ├── db.ts                # Cliente Dexie (IndexedDB)
│   │   └── supabase.ts          # Cliente Supabase (auth + Postgres)
│   └── styles/
│       └── tokens.css            # Variables CSS generadas desde design-system.md
├── public/
├── supabase/
│   ├── migrations/               # Esquema SQL + políticas RLS (ver contracts/data-schema.md)
│   └── functions/
│       └── delete-account/        # Única función server-side (ver contracts/delete-account-function.md)
├── tests/
│   ├── unit/                      # Vitest: budget-health, categorization, fechas, dinero
│   └── e2e/                       # Playwright: camino dorado P1
└── specs/001-tripflow-v0/          # Este flujo de trabajo SDD
```

**Structure Decision**: proyecto único de frontend (SPA/PWA en `src/`) que habla directamente
con Supabase vía SDK — sin capa de API propia intermedia. La carpeta `supabase/` documenta el
esquema y la única función server-side dentro del mismo repositorio, evitando un segundo
repositorio o servicio para "backend". Esto corresponde a la Opción 1 (proyecto único) del
template, adaptada: no hay separación frontend/backend en código propio porque el backend es un
servicio administrado consumido por SDK.

## Complexity Tracking

*Sin violaciones que justificar: todas las decisiones de esta Fase 1 caben dentro de los seis
principios de la constitución (ver Constitution Check arriba). La única salvedad — las 2
variantes nuevas de Progress Bar — es la vía de extensión que el propio Principio VI prescribe,
no una desviación.*

## Re-evaluación de la Constitution Check (post Fase 1)

Tras generar `research.md`, `data-model.md`, `contracts/` y `quickstart.md`, se revisó de nuevo
cada principio contra el diseño final:

| Principio | Estado tras diseño |
|---|---|
| I. Simplicidad ante todo | ✅ Se mantiene: `data-model.md` define solo 4 entidades de negocio + 1 entidad técnica interna (cola de sincronización); `contracts/sync-contract.md` usa reconciliación por comparación de listas en vez de un motor de sincronización con tombstones, justificado por la escala mínima del producto (Scale/Scope). |
| II. Idioma y mercado | ✅ Se mantiene: sin cambios de diseño que lo afecten. |
| III. Cero alcance fantasma | ✅ Se mantiene: el esquema de datos en `contracts/data-schema.md` no agrega ninguna tabla o campo sin un FR que lo respalde. |
| IV. Verificable por persona no técnica | ✅ Se mantiene: `quickstart.md` cubre las historias P1–P3 con pasos manuales verificables en la app. |
| V. Datos del usuario con respeto | ✅ Se mantiene: `contracts/delete-account-function.md` confirma que la clave de rol de servicio nunca sale del proveedor administrado. |
| VI. Sistema de diseño como fuente de verdad | ⚠️ Extensión documentada, no bloqueante: queda registrada como primera tarea de UI en `tasks.md` (agregar variantes `Success`/`Error` a Progress Bar). |

No quedan violaciones sin justificar. El plan está listo para `/speckit-tasks`.
