# Research: Bienvenida inicial y navegación alineada al Figma Make

**Spec**: [spec.md](./spec.md) | **Fecha**: 2026-08-13

No quedan `NEEDS CLARIFICATION` en `spec.md` (todas las ambigüedades se resolvieron en la
sección Clarifications antes de este plan). Este documento resuelve las decisiones **técnicas**
necesarias para diseñar la implementación sobre el código real de `001-tripflow-v0` /
`002-guest-mode-sync`.

---

## 1. Cómo saber si un dispositivo "todavía no tiene ninguna identidad" (FR-001, FR-002, FR-005)

**Problema**: hoy `IdentityProvider` (`src/features/identity/IdentityProvider.tsx`) calcula
`userId` como `session?.user.id ?? getOrCreateActiveIdentity()` — y `getOrCreateActiveIdentity()`
**crea y persiste** un id de invitado en `localStorage` la primera vez que se lee, como efecto
secundario de que el provider exista. Como `IdentityProvider` envuelve `AppRoutes` completo (ver
`src/App.tsx`), esto ocurre en cada carga de la app sin importar la ruta — incluida una visita a
`/login` o `/registro` que la persona abandona sin completar.

Si la bienvenida se muestra "mientras no exista identidad", pero cualquier render de la app ya
crea una identidad de invitado como side effect, la bienvenida nunca podría reaparecer tras un
abandono (FR-005) ni distinguir "recién decidido" de "de paso, sin decidir nada".

**Decision**: `IdentityProvider` deja de crear identidad como efecto de montarse. Se agrega
`peekActiveIdentity(): string | null` en `activeIdentity.ts` (lee `localStorage`, nunca escribe) y
`IdentityProvider` pasa a exponer:

```ts
interface IdentityContextValue {
  userId: string | null      // null = todavía no hay identidad establecida
  isGuest: boolean
  loading: boolean
  establecerInvitado: () => string  // crea+persiste el id de invitado; solo lo llama Bienvenida
}
```

`userId = session?.user.id ?? peekActiveIdentity()`. La identidad de invitado solo se crea
explícitamente cuando la persona toca "Continuar como invitado" en la bienvenida (llamando
`establecerInvitado()`, que sí usa `getOrCreateActiveIdentity()`).

Un nuevo componente de gate en `routes.tsx` (`EntradaGate`) redirige a `/bienvenida` exactamente
cuando `!loading && !session && userId === null`.

**Por qué no hace falta una bandera nueva para "ya usaba la app antes"**: un dispositivo que ya
tenía `tripflow_active_identity` en `localStorage` (de antes de esta feature, cuando
`IdentityProvider` sí creaba el id de forma eager) hace que `peekActiveIdentity()` devuelva ese
valor desde el primer render — `userId !== null` de entrada, el gate nunca redirige. El edge case
"Identidad previa a esta funcionalidad" queda cubierto sin migración ni bandera adicional
(Principio I: no agregar estado que ya es derivable).

**Alternativas consideradas**:
- *Bandera separada `tripflow_welcome_resuelta` en localStorage, sin tocar `IdentityProvider`*:
  más simple en apariencia, pero no resuelve el problema real — como `getOrCreateActiveIdentity()`
  seguiría corriendo eager en cada carga, cualquier intento de usar "existe id de invitado" para
  poblar esa bandera (incluso una sola vez, al arrancar) queda contaminado por ids creados solo de
  pasada. Requeriría además una migración explícita para el grandfathering, con una ventana de
  carrera real (ver detalle descartado en el análisis de este plan). Rechazada por menos robusta,
  no por más compleja.
- *Hacer `userId` siempre `string`, generando un id "provisorio" no persistido hasta decidir*:
  agrega un estado intermedio (persistido vs. no persistido) que ningún otro código necesita
  distinguir; el `null` explícito es más simple de razonar y el compilador fuerza a los call sites
  correctos a manejarlo.

**Impacto en consumidores existentes**: `DashboardPage`, `GastoFormPage`, `NuevoViajePage`,
`CategoriasPage`, `CategoriasOnboardingPage`, `CuentaPage` (rama con sesión) siguen leyendo
`userId` como hoy — todas están anidadas bajo `EntradaGate` → `Bootstrap`, que garantiza
`userId !== null` antes de que monten. Se asevera con `userId!`/no-null en esos call sites (cambio
mecánico de una línea por archivo, mismo patrón que `002-guest-mode-sync` aplicó al generalizar
`session.user.id` a "identidad activa"). `LoginPage`/`RegistroPage` sí corren con `userId` posible
`null` (llegan directo desde Bienvenida): tratan `identidadAnterior === null` como "cero viajes
locales, no hay nada que vincular", sin necesidad de tocar `linkGuestData.ts`.

---

## 2. Por qué la bienvenida y el defecto de onboarding comparten una causa raíz

**Hallazgo**: el defecto de `spec.md` ("todas las categorías aparecen preseleccionadas y no
responden al toque") no es un bug de estado de UI — es consecuencia de que `Bootstrap`
(`routes.tsx`) siembra **las 8 categorías completas** vía `seedCategoriasIniciales(userId)` en un
`useEffect`, *antes* de que la pantalla de onboarding se muestre. `CategoriasOnboardingPage` hoy
solo lee lo ya sembrado (`useLiveQuery`) y lo pinta como `Chip` con `selected` fijo y
`tabIndex={-1}` — no hay ningún estado de selección que alternar porque, para cuando la pantalla
renderiza, la decisión ya fue tomada por el sistema, no por la persona.

**Decision**: invertir el orden — la pantalla de onboarding pasa a mostrar un catálogo **local, no
persistido todavía** de categorías candidatas (las 7 no protegidas), con estado de selección propio
(`useState<Set<string>>`, default vacío por la clarificación de `spec.md`). "Continuar" persiste
recién ahí: las categorías elegidas + "Otro" (protegida, fuera de la grilla, siempre incluida).
`Bootstrap` deja de sembrar nada — su única señal para "necesita onboarding" sigue siendo
"conteo de categorías en cero", que ahora es válida porque nada se siembra hasta que la persona
confirma su elección (y "Otro" garantiza que, tras confirmar, el conteo pase a ≥1 incluso con cero
categorías opcionales elegidas — así el gate deja de redirigir a onboarding sin depender de una
bandera de "onboarding completado" nueva).

**Alternativas consideradas**:
- *Dejar el seed eager y solo arreglar el `Chip` para que alterne estado post-siembra, borrando de
  la base la categoría al destocarla*: funcionaría visualmente, pero cada toque dispara una
  escritura+borrado en Dexie y una entrada en la cola de sync (`cambios_pendientes`) que después se
  revierte — ruido de sincronización real para una decisión que todavía no es definitiva. Rechazada
  por Principio I: la versión sin persistencia intermedia es la más simple que cumple `FR-012`.

## 3. Cuentas recién creadas y la señal de "esperar el pull" de `Bootstrap`

**Problema derivado de la decisión #2**: `Bootstrap` ya distinguía, para personas con sesión, "el
conteo en cero es un pull en curso" (espera) de "el conteo en cero es porque soy invitado sin
sembrar todavía" (redirige a onboarding) — apoyándose en `isGuest`. Hoy ese caso con sesión nunca
llega a onboarding con conteo cero porque `RegistroPage` sembraba las 8 categorías por adelantado
(`asegurarCategorias`) antes de navegar. Al quitar ese seed adelantado (porque también reproduce el
mismo defecto para cuentas nuevas, no solo para invitados — ver #2), una cuenta recién creada
llegaría a `Bootstrap` con conteo cero y **sin ser invitada**, cayendo en la rama "esperar pull" —
un loop de carga infinito, porque una cuenta nueva no tiene nada remoto que un pull vaya a traer.

**Decision**: `RegistroPage` navega a `/onboarding/categorias` pasando `state: { cuentaNueva: true
}` en sus cuatro caminos de éxito (`signUp` sin datos locales, `signUp` con datos locales y cero
viajes, confirmar incluir, confirmar descartar) — es un hecho garantizado por Supabase Auth: todo
`signUp` exitoso crea una cuenta nueva, nunca hay nada remoto previo que esperar. `Bootstrap` trata
`isGuest || location.state?.cuentaNueva` de forma equivalente para decidir "necesita onboarding, no
esperes pull". `LoginPage` nunca pasa ese estado (una cuenta que inicia sesión ya existía antes, su
conteo en cero siempre es "pull en curso", como hoy).

**Alternativa considerada**: agregar una columna/bandera persistida "onboarding completado" en
`categorias` o en una tabla nueva. Rechazada por Principio I: el conteo de categorías ya es una
señal suficiente una vez que "Otro" se persiste siempre al confirmar (#2); una bandera nueva
duplicaría esa señal sin necesidad.

---

## 4. Ubicación de "Registrar gasto" y "Nuevo viaje" como destinos de navegación (FR-006)

**Hallazgo**: `/gastos/nuevo` ya vive dentro del grupo de rutas envuelto por `AppShell`
(`routes.tsx`) — ya convive con la navegación visible hoy. `/viajes/nuevo`, en cambio, vive fuera
de ese grupo (a la par de `/onboarding/categorias`, bajo `Bootstrap` directo) porque hoy cumple un
único rol: el paso "primer viaje" del onboarding. Sin embargo ya existe un segundo punto de entrada
a esa misma ruta — el botón "+" de `TripSwitcher` (`src/app/dashboard/TripSwitcher.tsx`) para crear
un viaje adicional una vez que ya existe uno.

**Decision**: mover `/viajes/nuevo` dentro del grupo `AppShell` (mismo tratamiento que
`/gastos/nuevo`), reutilizando exactamente `NuevoViajePage` para ambos casos de uso (primer viaje
del onboarding y viaje adicional desde nav) — sin bifurcar el componente. Efecto colateral
necesario: el wrapper raíz de `NuevoViajePage` (hoy `min-h-screen flex flex-col items-center
justify-center`, pensado para pantalla standalone tipo Login/Registro) pasa al mismo patrón de
contenedor que ya usan `CuentaPage`/`CategoriasPage` dentro de `AppShell`
(`mx-auto w-full max-w-sm flex flex-col gap-6 py-6`) — es un ajuste de layout para convivir con el
`<main>` de `AppShell`, no un cambio de campos/orden del formulario (`Out of Scope` de `spec.md`
solo excluye esto último).

**Alternativa considerada**: mantener `/viajes/nuevo` fuera de `AppShell` y agregar una ruta nueva
tipo `/viajes/agregar` dentro de `AppShell` que reutilice el mismo componente para el caso "desde
nav". Rechazada por Principio I: duplicaría la ruta para el mismo componente y la misma acción sin
ninguna diferencia de comportamiento real.

---

## 5. Icono de "Buscar" en el panel principal (FR-008)

`Buscar` deja de ser un ítem de `NAV_ITEMS` (el cuarto slot lo ocupa ahora "Cuenta" original más
"Registrar"/"Nuevo viaje" nuevos — cuatro destinos ya completan el patrón de la referencia + Cuenta,
sin espacio para un quinto). El ícono `search` ya existe en el inventario de
`.specify/memory/design-system.md` (no requiere agregar nada al catálogo de iconos); se instala
como un `IconButton` (`variant="secondary"`, mismo patrón que los botones de `TripSwitcher`) visible
en el panel principal (`DashboardPage`), que navega a `/buscar` (ruta y pantalla sin cambios).

---

## 6. Logo de marca (US5, FR-016 a FR-018)

**Hallazgo**: no existe hoy un componente de logo. El wordmark "Tripflow" en el sidebar de
escritorio (`AppShell.tsx` línea 20) es texto plano (`font-brand text-lg text-text-brand`), sin el
ícono. El único asset de marca gráfico es `public/icons/icon.svg` (usado solo como favicon/PWA).

**Decision**: nuevo componente `src/components/Logo.tsx` que combina `<img src="/icons/icon.svg"
alt="" />` (ya servido como asset estático, sin necesidad de convertirlo a componente React) + un
`<span>` con el wordmark "Tripflow" en `font-brand`/`color-text-brand` — mismos tokens que ya usa el
sidebar. Prop `size` (`'small' | 'large'`, o similar) para cubrir el tamaño reducido de nav
(sidebar/header móvil) y el tamaño mayor de la bienvenida, sin introducir tipografía, ícono ni
paleta nuevos (`FR-018`). Se documenta como extensión del catálogo en
`.specify/memory/design-system.md`, siguiendo el mismo formato que las notas "extensión Tripflow
v0" ya presentes ahí (p. ej. la de `Icon`/`User` o `Progress Bar`/`Success`+`Error`).

**Dónde se usa**: `AppShell.tsx` reemplaza el texto plano del sidebar por `<Logo />`, y agrega
`<Logo />` al header móvil (hoy solo tiene `SyncIndicator`, alineado a la derecha — pasa a
`justify-between` con el logo a la izquierda), cubriendo el hueco que señala `FR-017`.
`BienvenidaPage` lo usa en tamaño grande sobre las tres opciones de entrada (`FR-016`).

**Alternativa considerada**: inline el SVG como componente React (como hace `Icon.tsx` con sus
íconos de 16×16) en vez de `<img>`. Rechazada por Principio I: el ícono de marca no necesita
bindear `stroke`/`currentColor` a un token semántico por instancia (a diferencia del set de
`Icon`, es siempre el mismo ícono a todo color, no una línea monocromática) — `<img>` reutiliza el
asset ya existente sin duplicar el SVG en el bundle de JS.

---

## 7. Orden de contenido del panel principal (FR-007)

**Hallazgo**: comparando `DashboardPage.tsx` contra `FR-007`, el bloque `BudgetSummary` YA sigue
internamente el orden pedido (gastado+% → barra de progreso → disponible → días). Lo que no
coincide es lo que antecede a ese bloque: hoy `TripSwitcher` + un `Card` con nombre/destino/fechas
de viaje aparecen **antes**, compitiendo por ser lo primero que se lee, cuando `FR-007` pide que el
monto gastado sea la cifra protagonista.

**Decision**: reordenar `DashboardPage` para que `BudgetSummary` (monto gastado como cifra
principal) sea el primer bloque de contenido sustantivo; la identidad del viaje (nombre, destino,
selector) pasa a un encabezado compacto que enmarca sin anteceder visualmente el número. El único
otro bloque no cubierto explícitamente por `FR-007` es el `Card` de detalle del viaje
(nombre/destino/fechas/presupuesto) — se conserva (no está en el alcance eliminarlo, sigue siendo
información real del viaje) pero se subordina en jerarquía visual al monto gastado, no en orden
de aparición estructural obligatorio salvo por lo listado en `FR-007`. El detalle pixel-a-pixel de
esta jerarquía (tamaños, si el Card queda colapsado/expandible) se resuelve en `tasks.md`/
implementación, no en este plan.

---

## 8. Botones de la bienvenida: ¿un Primary o tres iguales?

`spec.md` (`FR-001`) pide "tres opciones igual de visibles". El catálogo de `Button` en
`.specify/memory/design-system.md` documenta como regla fija "un solo Primary por pantalla" — no
prohíbe cero Primary. **Decision**: las tres opciones usan `Button variant="secondary" size="large"`
(mismo peso visual, sin jerarquía inventada que `spec.md` no pidió) — lectura literal de "igual de
visibles" sin violar el máximo de un Primary del sistema de diseño, y sin que este plan le asigne
una prioridad a una opción sobre otra que ninguna clarificación estableció (Principio III: cero
alcance fantasma).

---

## 9. Testing

Sin cambios de enfoque respecto a `002-guest-mode-sync`: Vitest para lógica pura nueva (ninguna
función pura nueva de negocio se introduce acá — la selección de onboarding es estado de UI, no
una función a testear de forma aislada) + extensión de la prueba de humo Playwright existente
(`tests/e2e/camino-dorado.spec.ts`), que hoy asume `page.goto('/')` lleva directo a onboarding con
todo preseleccionado — ambos caminos dorados (con cuenta y sin cuenta) necesitan actualizarse para
pasar primero por `/bienvenida` y tocar categorías explícitamente antes de "Continuar" (detalle de
`tasks.md`). El resto se valida manualmente vía `quickstart.md`.
