# Research: Introducción explicativa antes de elegir categorías

**Feature**: `005-onboarding-intro` | Ver `spec.md`

## 1. Contenido y diseño de las 4 pantallas (Figma)

**Decision**: Se implementan los 4 pasos exactamente como llegan del Figma provisto por el
usuario, con **una sola desviación deliberada**: el CTA del paso 4 no dice "Crear mi primer viaje"
(texto del Figma) sino **"Seleccionar mis categorías"**, y navega a `/onboarding/categorias` en vez
de a `/viajes/nuevo`.

| Paso | Ilustración | Título | Subtítulo | CTA | "Saltar" visible |
|---|---|---|---|---|---|
| 1 | `onboarding-plan.svg` | "Plan less. Travel more." | "Tripflow te ayuda a controlar tu presupuesto en tiempo real para que solo pienses en disfrutar." | "Empezar" | Sí |
| 2 | `onboarding-categories.svg` | "Ve exactamente dónde va tu dinero." | "Categorías visuales en tiempo real para que nunca pierdas el control del gasto." | "Siguiente" | Sí |
| 3 | `onboarding-insights.svg` | "Insights que importan." | "Tripflow analiza tus patrones de gasto y te da contexto inteligente en el momento justo." | "Siguiente" | Sí |
| 4 | `onboarding-ready.svg` | "Listo para tu próxima aventura." | "Crea tu primer viaje, define tu presupuesto y empieza a registrar gastos al instante." | **"Seleccionar mis categorías"** (Figma dice "Crear mi primer viaje") | No |

**Rationale**: El Figma fue diseñado asumiendo que el onboarding termina en "crear el primer
viaje" directamente. Pero el flujo real de Tripflow (`002-guest-mode-sync`, confirmado en
`spec.md` de esta feature) es registro/invitado → **categorías** → primer viaje: la introducción
se inserta *antes* de la selección de categorías, no la reemplaza. El usuario lo señaló
explícitamente al pedir el plan: el botón final debe decir "Seleccionar mis categorías" y llevar
ahí, no a Nuevo Viaje. Todo el resto del copy/diseño de Figma se respeta tal cual.

**Alternatives considered**: Mantener el copy y destino literal del Figma ("Crear mi primer viaje"
→ `/viajes/nuevo`), saltando categorías por completo. Rechazado: contradice `FR-004` de `spec.md`
("lleva a la pantalla de selección de categorías ya existente") y la instrucción explícita del
usuario en este plan.

## 2. Estructura de componente: una página con 4 pasos vs. 4 rutas separadas

**Decision**: Una sola página (`IntroOnboardingPage`, ruta única `/onboarding/intro`) con un array
local de 4 configuraciones de paso (ilustración, título, subtítulo, label del CTA) y estado
`paso: number` (0-3) en memoria — sin persistir progreso parcial (ver `spec.md` § Assumptions,
"Progreso no persistido").

**Rationale**: Principio I (simplicidad) — 4 rutas separadas multiplicarían código casi idéntico
(mismo layout, mismo botón "Saltar", mismo Step Indicator) por 4, para una secuencia que nunca se
navega por URL directa ni se enlaza desde otro lugar de la app. El precedente ya establecido en el
proyecto es `CategoriasOnboardingPage`: una pantalla, estado local en memoria, sin router por
sub-paso.

**Alternatives considered**: 4 componentes bajo una ruta con sub-path (`/onboarding/intro/1`...).
Rechazado por Principio I: no hay ningún requisito de deep-linking a un paso específico, y
persistir el paso en la URL contradice la decisión ya tomada de "no persistir progreso parcial".

## 3. Ilustraciones: assets estáticos vs. reconstrucción en código

**Decision**: Los 4 gráficos se extraen como assets SVG estáticos en `public/icons/` (mismo patrón
que `Logo` ya usa para `icon.svg`/`tripflow-lockup.svg`), no como composiciones de componentes
`Icon` en vivo.

- Pasos 1, 3, 4: export directo de Figma, un solo archivo SVG cada uno (`onboarding-plan.svg`,
  `onboarding-insights.svg`, `onboarding-ready.svg`).
- Paso 2 ("Ve exactamente dónde va tu dinero"): Figma lo compone de 5 sub-assets superpuestos (un
  círculo + 4 barras) más 4 elementos de texto (emoji) posicionados con porcentajes absolutos. Se
  reconstruyó a mano como un único SVG plano (`onboarding-categories.svg`) usando las primitivas
  `Blue` ya documentadas en `design-system.md` § Fundamentos › Color, calculando las posiciones
  exactas a partir de los mismos porcentajes que exportó Figma (ver
  `.specify/memory/design-system.md` § Onboarding Illustration para el detalle).

**Rationale**: Un componente `Icon` reusable (grilla 16×16, trazo de línea, un solo color por
instancia) no es el vehículo correcto para una ilustración decorativa de 140×140 con múltiples
colores fijos — forzarlo ahí violaría la anatomía ya documentada de `Icon`. Tratarlas como assets
estáticos (igual que `Logo`) es la opción ya validada en el proyecto para "gráfico de marca con
color bakeado, no reutilizable como ícono de línea". Reconstruir el paso 2 a mano evita depositar 5
archivos SVG + lógica de posicionamiento absoluto por 4 elementos de texto en el componente React,
a cambio de un único archivo con el mismo resultado visual.

**Alternatives considered**: Replicar literalmente la estructura de 5 `<img>` + 4 `<p>` de emoji
que devuelve Figma dentro de `IntroOnboardingPage`. Rechazado por Principio I: agrega 5 requests de
red (o 5 archivos) y posicionamiento absoluto frágil por porcentajes para un resultado idéntico al
de un solo SVG estático.

## 4. Botón "Guardar" del CTA: reutilizar `Button` tal cual

**Decision**: El CTA de cada paso es `<Button variant="primary" size="large">` sin ninguna
modificación al componente compartido, a pesar de que el Figma de esta pantalla en particular
muestra una sombra `drop-shadow` de marca (`0px 4px 12px rgba(5,0,254,0.24)`) distinta a la
`Shadow/SM` que `design-system.md` documenta hoy para `Button Primary/Large`.

**Rationale**: Principio I + VI — la diferencia es un matiz de sombra en una sola pantalla; crear
una variante nueva de `Button` (o un override puntual) por esto es exactamente el tipo de
"solución visual aislada" que el Principio VI busca evitar. Se prioriza la consistencia del
componente ya documentado sobre la réplica exacta de una sombra en un único Figma.

**Alternatives considered**: Agregar una prop `elevated`/`glow` a `Button`. Rechazado: alcance
fantasma para una diferencia cosmética menor no pedida explícitamente por el usuario.

## 5. Propagar el paso "cuenta nueva" (`cuentaNueva`) a través de la introducción

**Decision**: `IntroOnboardingPage` lee su propio `location.state?.cuentaNueva` (con `useLocation`)
y lo reenvía explícitamente en el `state` del `navigate('/onboarding/categorias', ...)` al terminar
o saltar la introducción.

**Rationale**: El gate `Bootstrap()` (`src/app/routes.tsx`) decide si corresponde onboarding con
`categorias.length === 0 && (isGuest || Boolean(location.state?.cuentaNueva))`. Ese `state` no
sobrevive automáticamente a una segunda llamada a `navigate()` — si `IntroOnboardingPage` no lo
reenvía, una cuenta nueva (no invitada) que pasa por la introducción llegaría a
`/onboarding/categorias` con `cuentaNueva` perdido, `necesitaOnboarding` evaluaría `false`, y
`Bootstrap` quedaría mostrando "Cargando…" indefinidamente en vez de la selección de categorías
(porque el conteo de categorías sigue en cero, pero ya no se interpretaría como "todavía no
completó el onboarding"). Es un bug real si no se maneja explícitamente, no una hipótesis.

**Alternatives considered**: Cambiar `Bootstrap()` para no depender de `location.state` en absoluto
(p. ej. usar un flag persistido). Rechazado: rediseñar el gate está fuera del alcance de esta
feature (`spec.md` § Assumptions ya fija "reutiliza el gate existente sin agregar estado
independiente") y el propio `003-landing-nav-redesign` ya dejó esta forma de gate como decisión
tomada.

## 6. Punto de entrada: qué pantallas deben apuntar a `/onboarding/intro` en vez de a
`/onboarding/categorias`

**Decision**: Se actualizan los 4 call sites que hoy navegan directo a `/onboarding/categorias`
para que apunten a `/onboarding/intro` en su lugar, preservando el mismo `state` que ya pasaban:

- `BienvenidaPage.handleContinuarComoInvitado`
- `LoginPage.handleContinuarComoInvitado` (agregado en la iteración anterior de UI)
- `RegistroPage.handleContinuarComoInvitado` (ídem)
- `RegistroPage.handleSubmit` / `confirmarIncluir` / `confirmarDescartar` (los 3 casos de cuenta
  nueva, con `state: { cuentaNueva: true }`)

Y el propio `Bootstrap()` cambia su redirección por defecto de `/onboarding/categorias` a
`/onboarding/intro` cuando `necesitaOnboarding` es `true` y el `pathname` actual no es ya uno de
los dos pasos del onboarding.

**Rationale**: Es la forma mínima y explícita de garantizar que **todo** camino hacia el onboarding
pase primero por la introducción (`FR-001`), sin duplicar la condición `necesitaOnboarding` en cada
pantalla de entrada. `LoginPage` (inicio de sesión con cuenta existente) no se toca: no navega
nunca a onboarding — una cuenta existente con categorías en cero solo espera el `pull` (`Cargando`,
comportamiento ya definido en `003-landing-nav-redesign` § research.md §3), sin pasar por la
introducción.

## 7. "Mostrarlo solo una vez"

**Decision**: No se agrega ningún flag nuevo. Se confirma (inspeccionando
`src/features/categories/seed.ts`) que `guardarSeleccionInicial` siempre persiste la categoría
protegida "Otro" además de las candidatas elegidas, así que `categorias.length` pasa de `0` a `≥1`
apenas la persona confirma la selección — incluso si no eligió ninguna candidata. Eso ya hace que
`necesitaOnboarding` (y por lo tanto la introducción + la selección de categorías) sea `false` para
siempre después de la primera vez, para esa identidad.

**Rationale**: Es exactamente el comportamiento pedido ("recuerda el onboarding solo mostrarlo una
vez... después de crear cuenta o continuar como invitado") y ya está garantizado por
`002-guest-mode-sync`/`003-landing-nav-redesign` sin tocar código adicional — confirma que la
`Assumption` de `spec.md` ("reutiliza el gate existente") es correcta y suficiente.
