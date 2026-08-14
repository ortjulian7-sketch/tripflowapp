# Data Model: Introducción explicativa antes de elegir categorías

**Feature**: `005-onboarding-intro` | Ver `spec.md`, `research.md`

## Sin entidades nuevas persistidas

Esta feature no agrega ninguna tabla, campo ni registro nuevo a Dexie/Supabase. El contenido de los
4 pasos (ilustración, título, subtítulo, label del CTA) es una constante estática en el código, no
un dato de usuario. La única entidad que esta feature **lee** (sin modificarla) es `Categoria`, ya
definida en `001-tripflow-v0`, a través del mismo conteo (`categorias.length`) que ya usa el gate de
`Bootstrap()`.

## Estado en memoria (no persistido)

### `PasoOnboardingIntro`

Configuración estática de cada uno de los 4 pasos — vive como una constante en el módulo de
`IntroOnboardingPage`, no como una tabla:

| Campo | Tipo | Descripción |
|---|---|---|
| `ilustracion` | `string` | Ruta del asset SVG (`/icons/onboarding-*.svg`) |
| `titulo` | `string` | Encabezado del paso |
| `subtitulo` | `string` | Texto de apoyo del paso |
| `ctaLabel` | `string` | Label del botón principal de ese paso |

### Estado de la pantalla

| Campo | Tipo | Descripción |
|---|---|---|
| `paso` | `number` (0-3) | Índice del paso actual, en memoria (`useState`), sin persistir — ver `research.md` §2 |

## Contrato de navegación: `cuentaNueva` a través de la introducción

No es una entidad de datos, pero es el único "estado" que esta feature debe propagar
correctamente para no romper el gate ya existente (`research.md` §5):

```ts
// Al entrar: IntroOnboardingPage lee esto de su propia ubicación
type LocationState = { cuentaNueva?: boolean } | null

// Al salir (fin de la introducción o "Saltar"):
navigate('/onboarding/categorias', { replace: true, state: { cuentaNueva: locationState?.cuentaNueva } })
```

Ver `contracts/onboarding-intro-gate-contract.md` para la tabla de decisión completa.
