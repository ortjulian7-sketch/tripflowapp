# Tripflow Design System (Figma)

**Fuente**: [Figma — tripflow](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow)

**Propósito**: Este documento es un catálogo vivo de los componentes, variantes y tokens
del Design System de Tripflow, extraídos directamente de Figma. Existe para cumplir el
Principio VI de la constitución ("Sistema de diseño como fuente de verdad"): ninguna
especificación ni plan debe inventar botones, inputs o estilos nuevos cuando ya existe un
componente equivalente aquí documentado.

**Regla de oro del propio Design System** (tomada de la página de Color): *"Semantic
tokens alias to primitives — always consume semantic tokens in components."* Es decir: el
código y los planes deben referenciar siempre tokens semánticos (`color-surface-*`,
`color-text-*`, `color-status-*`, etc.), nunca primitivas (`color-blue-500`) ni hex
directos.

**Cómo se usa en el flujo SDD**:

- **spec.md** referencia componentes solo a nivel de negocio (p. ej. "usa el mismo
  indicador de progreso que el Dashboard"), sin detalles técnicos.
- **plan.md** vincula el componente concreto de este catálogo (nombre, node-id de Figma,
  variante, tokens) en su sección de Technical Context, antes de pasar a tasks/implement.
- El **Constitution Check** de cada plan valida contra el Principio VI que la UI propuesta
  reutiliza lo documentado aquí. Si una feature necesita un componente que no existe
  todavía, se documenta primero en este archivo (ver "Cómo agregar un componente nuevo"
  al final) y luego se referencia desde el plan.
- Este catálogo se extrajo de forma centralizada para Fundamentos + componentes base
  (2026-08-12). Componentes nuevos que se agreguen a Figma más adelante se incorporan aquí
  bajo demanda, feature por feature (Principio I: simplicidad, cero alcance fantasma).

---

## Fundamentos

### Color

Sistema de dos capas: **primitivas** (paletas crudas de color) y **semánticas** (roles de
uso, con soporte Light/Dark). Los componentes SIEMPRE deben bindear semánticas, nunca
primitivas.

#### Primitivas

| Familia | Pasos (hex) |
|---|---|
| Blue | 50 `#e5e5ff` · 100 `#c8caff` · 200 `#a5a8ff` · 300 `#7b7fff` · 400 `#4247ff` · 500 `#0500fe` · 800 `#010047` |
| Neutral | 0 `#ffffff` · 0-a50 `#ffffff80` · 50 `#f8f8fc` · 100 `#f2f2ff` · 500 `#8a8aa0` · 850 `#272735` · 900 `#09091a` · 900-a50 `#09091a80` · 950 `#050510` · 1000 `#000000` |
| Amber | 50 `#fdf7ec` · 100 `#fceed9` · 200 `#f5d5a3` · 300 `#eebc6d` · 400 `#e7a336` · 500 `#e08a00` · 600 `#be7500` · 700 `#9d6100` · 900 `#281900` |
| Green | 50 `#f0faf5` · 100 `#e1f5ea` · 200 `#aee1c2` · 300 `#7ccc9a` · 400 `#49b772` · 500 `#16a34a` · 600 `#138b3f` · 700 `#0f7234` · 900 `#041d0d` |
| Red | 50 `#fdf1f1` · 100 `#fbe4e4` · 200 `#f3b4b4` · 300 `#eb8585` · 400 `#e45656` · 500 `#dc2626` · 600 `#bb2020` · 700 `#9a1b1b` · 900 `#280707` |
| Shadow (alpha) | neutral-sm `#00001012` · neutral-md `#00001017` · brand-faint `#0500fe12` · brand-md `#0500fe38` · brand-strong `#0500fe4d` |

#### Semánticas (Light / Dark)

| Token | Light | Dark | Uso |
|---|---|---|---|
| `color-surface-background` | `#f8f8fc` | `#050510` | Fondo de pantalla |
| `color-surface-elevated` | `#ffffff` | `#09091a` | Cards, inputs, botones secundarios |
| `color-surface-secondary` | `#f2f2ff` | `#272735` | Paneles tintados (Card Subtle, pill activo de Nav) |
| `color-surface-selected` | `#e5e5ff` | `#010047` | Estado seleccionado (Chip Selected) |
| `color-text-primary` | `#09091a` | `#ffffff` | Texto principal |
| `color-text-secondary` | `#505064` | `#8a8aa0` | Texto secundario / labels |
| `color-text-brand` | `#0500fe` | `#a5a8ff` | Texto de énfasis de marca |
| `color-text-inverse` | `#ffffff` | `#ffffff` | Texto sobre fondos sólidos (botón Primary) |
| `color-text-placeholder` | `#09091a80` | `#ffffff80` | Placeholder de inputs |
| `color-icon-brand` | `#0500fe` | `#a5a8ff` | Iconos de marca |
| `color-icon-secondary` | `#8a8aa0` | `#8a8aa0` | Iconos neutros |
| `color-border-brand` | `#0500fe` | `#a5a8ff` | Bordes de foco/marca (input focused, card outlined) |
| `color-action-primary-default` | `#0500fe` | `#4247ff` | Fondo de acción primaria (Button/Icon Button Primary) |
| `color-action-primary-disabled` | `#e5e5ff` | `#272735` | Fondo de acción primaria deshabilitada |
| `color-status-success` / `-subtle` / `-border` / `-strong` / `-strong-hover` / `-on-strong` | `#16a34a` / `#e1f5ea` / `#7ccc9a` / `#16a34a` / `#138b3f` / `#ffffff` | `#49b772` / `#041d0d` / `#16a34a` / `#16a34a` / `#49b772` / `#ffffff` | Estados de éxito |
| `color-status-warning` / `-subtle` / `-border` / `-strong` / `-strong-hover` / `-on-strong` | `#be7500` / `#fceed9` / `#eebc6d` / `#e08a00` / `#be7500` / `#ffffff` | `#e7a336` / `#281900` / `#e08a00` / `#e08a00` / `#e7a336` / `#ffffff` | Seguimiento de presupuesto/gasto |
| `color-status-error` / `-subtle` / `-border` / `-strong` / `-strong-hover` / `-on-strong` | `#dc2626` / `#fbe4e4` / `#e45656` / `#dc2626` / `#bb2020` / `#ffffff` | `#e45656` / `#280707` / `#dc2626` / `#dc2626` / `#e45656` / `#ffffff` | Errores, acciones destructivas (Danger) |

**Node**: [Color](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=61-1200)

---

### Effects (sombras)

Cada sombra está bindeada a una primitiva de color de la familia `shadow` (alpha).

| Estilo | Spec | Uso documentado |
|---|---|---|
| `Shadow/SM` | `0,1,4,0` · color `color-shadow-neutral-sm` (`#00001012`) | Inputs, botones, dropdowns |
| `Shadow/MD` | `0,2,12,0` · color `color-shadow-neutral-md` (`#00001017`) | Elevación de card del Dashboard |
| `Shadow/Brand` | `0,2,12,0` · color `color-shadow-brand-md` (`#0500fe38`) | Glow de CTA primario |
| `Shadow/Brand Glow` | 2 capas: `0,0,0,spread 8` con `color-shadow-brand-faint` (`#0500fe12`) + `0,4,20,0` con `color-shadow-brand-strong` (`#0500fe4d`) | Acento del Dashboard (2 capas) |

**Node**: [Effects](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=61-1201)

---

### Spacing & Radius

**Semánticos documentados explícitamente**:

| Token | Valor | Uso |
|---|---|---|
| `space-component-card-padding` | 14px | Padding interno de Card |
| `space-layout-section` | 32px | Separación entre secciones de layout |

**Escala de tamaño (`--size-*`) observada en uso real de componentes** — no es la tabla
de primitivas completa (esa página no se extrajo; son los valores que aparecen bindeados
en Button, Input, Card, Icon Button, Chip, Nav Item, List Item): `4, 6, 8, 10, 12, 14, 16,
20, 48, 56`, y `full` = `999` (círculo/pill completo).

**Radios por componente**:

| Token | Valor | Componente |
|---|---|---|
| `radius-component-button` | 12px | Button, pill de Nav Item (Horizontal activo) |
| `radius-component-input` | 12px | Input, Chip, icon-box de List Item |
| `radius-component-card` | 14px | Card |
| `size-full` | 999px | Icon Button (círculo perfecto) |

**Node**: [Spacing & Radius](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=77-55) — el link apunta al bloque "Semantic Spacing"; si existe una página de escala primitiva de spacing aparte, compártela para completar esta sección.

---

### Typography

Dos familias: **Geist** (toda la UI) y **Catamaran** (uso de marca: `Brand/Display`).

| Estilo | Fuente · tamaño · line-height · tracking |
|---|---|
| Display | Geist SemiBold · 52px · 52px · -1.04px |
| Heading/H1 | Geist SemiBold · 28px · 34px · -0.28px |
| Heading/H2 | Geist SemiBold · 26px · 30px |
| Heading/H3 | Geist SemiBold · 20px · 26px |
| Heading/H4 | Geist SemiBold · 18px · 24px |
| Heading/H5 | Geist SemiBold · 16px · 22px |
| Heading/H6 | Geist SemiBold · 14px · 20px |
| Body/Large | Geist Regular · 16px · 24px |
| Body/Medium | Geist Regular · 14px · 21px |
| Body/Small | Geist Regular · 12px · 16px |
| Label | Geist SemiBold · 11px · 17px |
| Caption | Geist SemiBold · 10px · 15px |
| Button | Geist SemiBold · 15px · 20px |
| Brand/Display | **Catamaran** SemiBold · 15px · 18px |

**Node**: [Typographic](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=61-1203)

---

## Componentes

### Icon (sistema de iconos)

**Node**: [95:3](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=95-2)

**Uso**: Set reducido de iconos de línea para navegación, icono líder de Button y
affordances standalone (buscar, cerrar). Crece solo cuando una pantalla real lo necesita —
no es un set genérico "para todo".

**Construcción**: grilla 16×16, trazo 1.5px, cap y join redondeados, sin relleno (`fill:
none`). Sin color por defecto — el stroke se bindea por instancia al token semántico que
corresponda (`color-icon-secondary`, `color-icon-brand`, `color-text-inverse`, etc.).

**Inventario actual**: Plus, Home, Map, ArrowLeft, ChevronDown, Search, Close, Sparkle,
Trash, Spinner, User.

**Nota — extensión Tripflow v0**: `User` se agregó para el destino de navegación "Cuenta"
(spec `001-tripflow-v0`, FR-055/FR-056: eliminar cuenta): ningún ícono del inventario
original representa a la persona/cuenta. Sigue la misma construcción (grilla 16×16, trazo
1.5px, sin relleno) que el resto del set.

**Do's**: usar INSTANCE_SWAP dentro de Button/Nav Item (nunca hardcodear un vector nuevo);
bindear color a un token semántico; mantener grilla 16×16 y trazo 1.5px en iconos nuevos;
pedir un icono nuevo solo si ninguno existente cubre el significado.

**Don'ts**: no mezclar estilos filled/outlined; no escalar de forma no uniforme; no bakear
un color fijo; no duplicar un icono existente bajo otro nombre.

---

### Logo

**Sin node de Figma propio** — no es un componente del archivo de diseño original; se extrajo de
los assets de marca ya existentes en el código (ver Nota de extensión abajo).

**Uso**: Identifica la marca Tripflow. Aparece en la bienvenida (tamaño grande, junto a las
opciones de entrada) y en la navegación principal (sidebar de escritorio y header de la barra
inferior en móvil), siempre en el mismo tamaño reducido que ya usaba el wordmark del sidebar.

**Anatomía**: ícono de marca (`public/icons/icon.svg`, ya usado como favicon/PWA) + wordmark
"Tripflow" en una sola línea, ícono a la izquierda del texto.

**Propiedades**:

| Propiedad | Valores |
|---|---|
| Size | Small (nav: sidebar y header móvil) · Large (bienvenida) |

**Tokens confirmados**: wordmark tipografía `Brand/Display` (Catamaran SemiBold 15px/18px), color
`color-text-brand`; ícono el asset SVG existente tal cual (ya trae su propio color de marca
bakeado — es un logo, no un ícono de línea que deba bindear `stroke` a un token semántico como el
set de `Icon`).

**Do's**: mantener siempre ícono + wordmark juntos (nunca el ícono solo como sustituto del wordmark
en navegación); usar Small en cualquier contexto de navegación recurrente, Large solo para momentos
de mayor protagonismo de marca (bienvenida).

**Don'ts**: no recolorear el ícono por instancia; no separar el wordmark del ícono en layouts
donde ambos caben; no introducir una tipografía, paleta o ícono de marca distintos a los ya
documentados en Fundamentos.

**Nota — extensión spec `003-landing-nav-redesign`**: antes de esta feature no existía un
componente de logo — el ícono (`public/icons/icon.svg`) solo se usaba como favicon/PWA, y el
wordmark "Tripflow" era texto plano únicamente en el sidebar de escritorio (ausente en móvil y en
cualquier pantalla de entrada). Se agrega este componente reutilizando exactamente esos dos assets
ya existentes (ícono + tipografía `Brand/Display`/Catamaran + `color-text-brand`), sin diseñar una
identidad visual nueva (spec `003-landing-nav-redesign`, FR-016 a FR-018).

---

### Button

**Node**: [81:2](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=81-2)

**Uso**: Dispara una acción o navegación. `Primary` para la acción de mayor énfasis de la
pantalla, `Secondary` para acciones de apoyo, `Danger` para acciones destructivas.

**Anatomía**: contenedor + icono líder opcional + label de texto.

**Propiedades**:

| Propiedad | Valores |
|---|---|
| Style | Primary · Secondary · Danger |
| Size | Medium · Large |
| State | Default · Hover · Pressed · Disabled · Loading · Focus |
| Label | texto |
| Show Icon | true/false |
| Icon | instance swap |

**Elevación** (automática según Style/Size/State, no es una propiedad separada):
Primary/Large y Danger → `Shadow/SM`. Primary/Medium → `Shadow/Brand` (coincide con el CTA
del nav de escritorio). Secondary siempre plano (outline). Disabled nunca tiene sombra.

**Tokens confirmados**: fondo Primary `color-action-primary-default`, label
`color-text-inverse`; Primary disabled `color-action-primary-disabled`; Secondary fondo
`color-surface-elevated`, borde y label `color-border-brand`/`color-text-brand`; Danger
fondo `color-status-error-strong`, hover `color-status-error-strong-hover`, label
`color-status-error-on-strong`; radio `radius-component-button` (12px); tipografía
`Button` (Geist SemiBold 15px/20px); icono `size-20`; paddings `size-8`/`size-12`/`size-16`.

**Do's**: un solo Primary por pantalla/sección; Secondary + Primary para jerarquía clara
("Cancelar" + "Guardar"); Danger solo para acciones destructivas; labels cortos y
orientados a la acción; Large para CTAs full-width móvil, Medium para nav/toolbar; pasar a
Loading inmediatamente al tap en acciones que tardan.

**Don'ts**: no más de un Primary por vista; no usar Danger solo para "llamar la atención";
no poner icono líder por defecto en todos los botones; no sobreescribir color/radio/padding
con valores hardcodeados; no deshabilitar sin explicar por qué cerca; no combinar Loading
con Disabled.

---

### Input

**Node**: [117:2](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=117-2)

**Uso**: Captura un dato — texto libre, monto numérico, o elección de una lista. `Text`
para entrada abierta, `Number` para montos/cantidades (moneda), `Select` para opciones
cerradas con indicador final.

**Anatomía**: label opcional arriba + contenedor del campo + elemento líder opcional
(icono/prefijo) + valor/placeholder + elemento final opcional (chevron de Select) + helper
text opcional abajo (se convierte en mensaje de error en estado Error).

**Propiedades**:

| Propiedad | Valores |
|---|---|
| Type | Text · Number · Select |
| State | Default · Focused · Disabled · Error |
| Label / Show Label | texto / true·false |
| Placeholder | texto |
| Helper Text / Show Helper Text | texto / true·false |

**Tokens confirmados**: fondo `color-surface-elevated`, sombra `Shadow/SM`, radio
`radius-component-input` (12px); label `Label` (Geist SemiBold 11px/17px,
`color-text-secondary`); valor `color-text-primary`, placeholder `color-text-placeholder`;
foco → borde `color-border-brand`; error → borde `color-status-error-border`; icono
`color-icon-secondary` / `size-20`; padding `size-16`/`size-12`.

**Do's**: pair Error siempre con Helper Text real; usar Number solo cuando el monto
merece énfasis visual; labels cortos y específicos ("Destino"); ocultar el label solo en
contextos densos autoexplicativos (search bar).

**Don'ts**: no mostrar Error y Disabled a la vez; no depender solo del anillo rojo (siempre
Helper Text); no usar Select para menos de 2 opciones; no hardcodear el prefijo "$" — es
default de Tripflow (MXN), debe parametrizarse por moneda.

**Nota — extensión Tripflow v0 (`Type: Date`)**: el catálogo solo documenta Text/Number/Select;
los campos de fecha de "Crear/editar viaje" y "Registrar gasto" (fecha de salida, regreso,
fecha del gasto) necesitan el selector nativo del navegador (accesible, funciona offline, sin
reinventar un calendario). Se implementó como un cuarto valor de `Type` que reutiliza
exactamente el mismo chrome visual (fondo, sombra, radio, tokens de foco/error) que
Text/Number — mismo componente, sin solución visual aislada.

---

### Icon Button

**Node**: [134:4](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=134-4)

**Uso**: Botón circular solo-icono para una acción flotante de alta frecuencia (el FAB de
"nuevo gasto", el atajo de búsqueda del Dashboard).

**Anatomía**: círculo perfecto con un icono centrado, sin label. A diferencia de Button, la
elevación es lo que comunica "flotando" — todo estado excepto Disabled lleva sombra.

**Propiedades**:

| Propiedad | Valores |
|---|---|
| Style | Primary · Secondary |
| Size | Medium (48px) · Large (56px) |
| State | Default · Hover · Pressed · Disabled · Focus |
| Icon | instance swap |

**Tokens confirmados**: forma circular vía `size-full` (999px de radio); Primary fondo
`color-action-primary-default`, icono `color-text-inverse`, sombra `Shadow/Brand Glow` (2
capas); Primary disabled `color-action-primary-disabled` (sin sombra); Secondary fondo
`color-surface-elevated`, sombra `Shadow/MD`.

**Do's**: exactamente un Primary Icon Button por pantalla; icono instantáneamente
reconocible sin label (si necesita explicarse, usar Button); posición consistente entre
pantallas (bottom-right para Primary).

**Don'ts**: no más de un Primary Icon Button en pantalla; no usarlo cuando la acción
necesita label para claridad; no usarlo inline en un formulario o lista (es para acciones
flotantes a nivel de pantalla).

---

### Card

**Node**: [131:2](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=131-2)

**Uso**: Superficie tintada genérica para agrupar contenido relacionado — el callout de
insight de IA y el panel resumen de "Viaje activo" son ambos Card con contenido distinto
adentro.

**Anatomía**: solo superficie (fondo, radio, padding y, en Outlined, borde). Sin slots
internos fijos.

**Propiedades**:

| Propiedad | Valores |
|---|---|
| Style | Subtle · Outlined |
| Content | texto/composición libre |

**Tokens confirmados**: radio `radius-component-card` (14px); Subtle fondo
`color-surface-secondary`; Outlined borde `color-border-brand`; texto
`color-text-primary`; padding `size-16` (gap interno `size-10`).

**Do's**: usar Outlined con moderación (un callout por pantalla); anidar componentes reales
(Icon, Button, List Item) en vez de solo texto; dejar que Card haga hug/fill de su padre.

**Don'ts**: no apilar varios Outlined seguidos; **nunca** agregar drop shadow a Card (es
plana/tintada por diseño); no usarlo para un solo botón o icono; no agregar estado de
foco/interactivo (es un contenedor estático — si el contenido debe ser tappable, envolverlo
en Button o usar List Item/Nav Item).

**Nota — instancia "AIInsight" (Dashboard, nodes 204:1525 / 205:1756)**: variante puntual de
Card usada para el callout de salud del presupuesto — fondo `color-surface-secondary` (como
Subtle) pero con borde `rgba(5,0,254,0.09)` (marca al 9%, más tenue que `color-border-brand`
de Outlined). Contenido fijo: ícono `sparkle` (`color-icon-brand`, 14px) + título corto en
**Catamaran SemiBold 15px** (`color-text-brand` — segundo uso de marca además del wordmark del
Logo) + cuerpo en `Body/Medium` (`color-text-primary`). El tono del título/ícono puede
cambiar a `color-status-warning-strong`/`color-status-error` cuando el mensaje de salud lo
amerita (FR-036 del spec `001-tripflow-v0`: los estados intermedios comparten tono, se
distinguen por texto).

---

### Nav Item

**Node**: [125:2](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=125-2)

**Uso**: Un destino dentro de la navegación primaria de Tripflow. `Vertical` para la bottom
bar móvil (icono arriba del label), `Horizontal` para el sidebar de escritorio (icono al
lado del label, fondo tipo pill cuando está activo).

**Anatomía**: icono + label. Activo cambia color a azul de marca y aumenta un paso el peso
del label; en Horizontal además agrega fondo pill.

**Propiedades**:

| Propiedad | Valores |
|---|---|
| Layout | Vertical · Horizontal |
| State | Active · Inactive · Focus |
| Label | texto |
| Icon | instance swap (cualquier componente de Icon) |

**Tokens confirmados**: activo `color-text-brand`; inactivo `color-text-secondary`; icono
`color-icon-secondary`; fondo pill (Horizontal activo) `color-surface-secondary`; radio de
pill `radius-component-button` (12px, reutiliza el token de Button).

**Do's**: layout según contexto (Vertical en bottom bar, Horizontal en sidebar, nunca
mezclados); exactamente un Active por instancia de navegación; labels cortos de una o dos
palabras; en un tab bar/sidebar real, usar sizing "Fill container" en la instancia (el
master usa Hug solo para preview aislado).

**Don'ts**: no dejar todos los items Inactive; no usar Nav Item para acciones de página
(usar Button — esto es solo para destinos); no cambiar radio/spacing del pill por instancia.

---

### Chip

**Node**: [144:2](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=144-2)

**Uso**: Una opción dentro de un selector multi-choice — el grid de categorías de
"Registrar gasto" está construido con Chips. A diferencia de Button, representa una
elección que se alterna, no una acción que se dispara.

**Anatomía**: un emoji (no un icono vectorial — las categorías de Tripflow usan emoji
nativo) apilado sobre un label corto. Selected agrega fondo tintado y borde de marca.

**Propiedades**:

| Propiedad | Valores |
|---|---|
| State | Default · Selected · Focus |
| Icon | emoji (texto, no componente Icon) |
| Label | texto corto |

**Tokens confirmados**: radio `radius-component-input` (12px, comparte token con Input);
Default fondo `color-surface-elevated`, sombra `Shadow/SM`, label `color-text-secondary`;
Selected fondo `color-surface-selected`, borde `color-border-brand`, label
`color-text-brand`; tipografía `Caption` (Geist SemiBold 10px/15px).

**Do's**: usarlo en grid/fila de elecciones mutuamente exclusivas o multi-select; labels de
una o dos palabras; un emoji representativo consistente por categoría.

**Don'ts**: no usarlo para una sola acción standalone (eso es Button); no reemplazar el
emoji por un Icon vectorial (identidad propia del componente); no dejar más de un Chip
Selected en un picker de elección única.

---

### List Item

**Node**: [149:9](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=149-9)

**Nota**: a diferencia de los demás, este componente **no tiene página de documentación**
propia (sin anatomía/propiedades/do's-don'ts declarados en Figma) — solo existe la
instancia base. Lo que sigue es lo inferible de su estructura real; si se necesita a fondo
para una spec, conviene pedir al diseño que se documente formalmente en Figma primero.

**Anatomía observada**: `icon-box` (emoji sobre fondo tintado) + `text-group` (title +
subtitle apilados) + `amount` (texto alineado a la derecha).

**Tokens confirmados**: `icon-box` fondo `color-surface-secondary`, radio
`radius-component-input` (12px); title `color-text-primary`; subtitle
`color-text-secondary`, tipografía `Body/Small` (Geist Regular 12px/16px); gaps
`size-12`/`size-14`.

**Estados interactivos (inferidos, extensión Tripflow v0)**: como el componente no tiene
página de documentación en Figma, esta implementación define los estados necesarios para
usarlo en filas accionables (editar gasto — spec `001-tripflow-v0` FR-018/FR-069; gestionar
categorías — FR-076/FR-077):

- **Tappable**: cuando la fila navega o abre una acción al tocarla (p. ej. abrir un gasto
  para editarlo), el área de `icon-box` + `text-group` + `amount` se envuelve en un elemento
  interactivo propio — nunca la fila completa, para poder convivir con una acción
  secundaria (ver Trailing action).
- **Pressed**: mismo fondo que Card — Style: Subtle (`color-surface-secondary`) aplicado
  solo al área tappable mientras se mantiene presionada.
- **Trailing action**: una fila puede exponer una acción secundaria (p. ej. borrar) como un
  ícono al final, fuera del área tappable principal — implementado como un elemento
  interactivo hermano, no anidado, para evitar controles interactivos uno dentro de otro.

---

### Progress Bar

**Node**: [154:3](https://www.figma.com/design/y4MkvZsFG6K6P5uvjFeLR3/tripflow?node-id=154-3)

**Uso**: Indicador horizontal delgado de progreso/avance. Usado en el Dashboard para
"42% del presupuesto gastado" y en "Viaje activo" para el indicador de días de viaje.

**Anatomía**: dos partes — un `Track` que ocupa el ancho completo disponible, y un `Fill`
encima. No existe una propiedad de porcentaje: el ancho de la capa `Fill` se ajusta
manualmente para representar el valor, y queda recortado (`clip`) para nunca exceder el
`Track`.

**Variantes (propiedad `Style`)**:

| Variante | Uso |
|---|---|
| `Warning` | Seguimiento de presupuesto/gasto |
| `Brand` | Progreso informativo neutro (p. ej. días de viaje transcurridos) |
| `Success` | Estado de salud del presupuesto "Vas bien" (extensión Tripflow v0, ver abajo) |
| `Error` | Estado de salud del presupuesto "Te pasaste del presupuesto" (extensión Tripflow v0, ver abajo) |

**Tokens confirmados**: `Warning` → `color-status-warning-strong` (corregido tras inspeccionar
el Dashboard real, node 204:1499 — el pixel exportado usa `-strong`, no la base `color-status-warning`);
`Brand` → `color-action-primary-default`; `Success` → `color-status-success-strong`; `Error` →
`color-status-error-strong`; fondo del Track → `color-surface-secondary` / `color-surface-selected`
según contexto.

**Nota — extensión Tripflow v0**: `Success` y `Error` fueron agregadas para el indicador de
salud del presupuesto (spec `001-tripflow-v0`, FR-035/FR-038), que necesita un tratamiento
visual inequívoco de éxito y de error además del ya existente `Warning`. Ambas reutilizan
tokens semánticos ya documentados en Fundamentos › Color (`color-status-success-strong`,
`color-status-error-strong`) — no se creó ningún token nuevo. Siguen exactamente la misma
anatomía y las mismas reglas fijas (altura 4px, `Fill` topado al 100%) que `Warning`/`Brand`.

**Reglas fijas**: altura de 4px constante en toda instancia — no debe modificarse por
instancia individual.

**Do's**: acompañar siempre con el número que representa cerca; dejar que el `Track` ocupe
el ancho completo de su contenedor padre; usar `Warning` específicamente para gasto/presupuesto.

**Don'ts**: no dejar que el `Fill` exceda el `Track` (tope visual en 100%, no desbordar); no
usarlo para estados indeterminados/carga (usar el spinner del estado Loading de Button); no
cambiar la altura de 4px.

---

## Cómo agregar un componente nuevo a este catálogo

1. Abrir la página de documentación del componente en Figma (patrón `↳ NombreComponente`).
2. Extraer: descripción de uso, anatomía, tabla de propiedades/variantes, do's & don'ts y
   tokens reales (`get_variable_defs` sobre el frame que contiene las instancias/símbolos
   del componente).
3. Agregar una sección aquí siguiendo el mismo formato que los componentes existentes.
4. Referenciar el componente desde el `plan.md` de la feature que lo necesita.
