# Research: Tripflow v0

Cada decisión se evalúa contra el Principio I de la constitución ("ante dos soluciones
posibles, se DEBE elegir siempre la más simple") y contra el pedido explícito de esta
planificación: publicar cuanto antes, funcionar en celular y desktop, y no agregar
infraestructura que la spec no necesite.

## 1. Plataforma de entrega

- **Decision**: Progressive Web App (aplicación web responsiva, instalable, sin apps nativas).
- **Rationale**: una sola base de código cubre celular y computador (FR-004, SC-005) y se
  publica con un despliegue web, sin pasar por revisión de App Store/Play Store. Es el camino
  más rápido a "publicado" que existe para este alcance.
- **Alternatives considered**: apps nativas iOS/Android (rechazado: triplica el trabajo de
  build/mantenimiento y agrega semanas de revisión de tienda que la spec no pide); framework
  cross-platform nativo tipo React Native/Flutter (rechazado: igual requeriría publicar en
  tiendas para celular, y una capa aparte para desktop — más infraestructura sin beneficio
  adicional sobre una PWA para este alcance).

## 2. Framework de frontend

- **Decision**: React + TypeScript + Vite, como SPA (sin server-side rendering).
- **Rationale**: la app es privada (requiere cuenta), así que no hay beneficio de SEO que
  justifique SSR; una SPA servida como archivos estáticos es la infraestructura de despliegue
  más simple posible (sin runtime de servidor que operar).
- **Alternatives considered**: Next.js con SSR (rechazado: agrega un runtime de servidor y
  complejidad de despliegue que esta app —privada, offline-first— no necesita).

## 3. Almacenamiento local offline-first

- **Decision**: IndexedDB vía Dexie.js, con consultas reactivas (`dexie-react-hooks`) como
  fuente de verdad para lectura/escritura en el dispositivo.
- **Rationale**: cumple FR-045/FR-046 (todo funciona sin conexión, incluyendo las métricas
  calculadas) sin depender de red para ninguna operación del día a día.
- **Alternatives considered**: `localStorage` (rechazado: no permite consultas estructuradas
  como agrupar gastos por día o sumar por categoría a la escala que crecerá con el uso);
  motores de sincronización con CRDT (RxDB, ElectricSQL, Automerge) (rechazado: la propia spec
  resuelve los conflictos con una regla simple —gana el cambio más reciente— y describe la
  edición simultánea en dos dispositivos como un caso excepcional, no un caso central; un CRDT
  completo sería complejidad no justificada por el Principio I).

## 4. Backend y cuentas

- **Decision**: Supabase (Postgres administrado + autenticación por correo/contraseña).
- **Rationale**: entrega login y una copia de datos sincronizada sin escribir ni operar un
  servidor propio. El modelo relacional de Postgres calza naturalmente con las consultas que
  la spec pide (totales, desglose por categoría, agrupación por día).
- **Alternatives considered**: Firebase/Firestore (rechazado: modelo de documentos NoSQL exige
  más cálculo manual en el cliente para las mismas agregaciones); backend propio a medida
  (rechazado explícitamente por el pedido del usuario de no agregar infraestructura que la spec
  no necesite — significaría operar un servidor para un problema que un servicio administrado
  ya resuelve).

## 5. Estrategia de sincronización

- **Decision**: sincronización oportunista al recuperar conexión (evento `online` del
  navegador + reintento al abrir la app), sin conexiones en tiempo real (sin websockets). Cada
  registro local guarda una marca de `updated_at`; al sincronizar, gana el cambio con la marca
  más reciente (regla ya definida en la spec). Para eliminaciones, dado que la cantidad de
  viajes y categorías por cuenta es pequeña (Scale/Scope: 1–3 viajes/año), se reconcilian por
  comparación de listas completas: lo que ya no existe en el servidor se elimina localmente, sin
  necesidad de un mecanismo de tombstones.
- **Rationale**: coincide exactamente con FR-047 ("en cuanto se restablezca la conexión", no en
  tiempo real) y con el supuesto de la spec sobre resolución de conflictos.
- **Alternatives considered**: Supabase Realtime (websockets) (rechazado: resuelve un problema
  —actualización en vivo entre dispositivos— que la spec no pide); tombstones de borrado
  (rechazado por ahora: la reconciliación por lista completa es correcta a esta escala y evita
  una tabla y una regla adicionales).

## 6. Categorización automática

- **Decision**: diccionario local de palabras clave en español LATAM + tabla de asociaciones
  aprendidas por cuenta, resuelto con comparación de texto normalizado (sin mayúsculas/tildes),
  sin ningún modelo de lenguaje ni servicio externo.
- **Rationale**: FR-021 exige explícitamente que la categorización funcione en el dispositivo,
  sin conexión y sin depender de un servicio externo — un diccionario es la solución más simple
  que lo cumple y que además explica por qué acierta o falla (a diferencia de un modelo de IA).
- **Alternatives considered**: modelo de embeddings o IA on-device (rechazado: sobredimensionado
  para comparar contra un diccionario de decenas de palabras clave; agregaría peso de descarga y
  complejidad sin necesidad).

## 7. Manejo de dinero

- **Decision**: montos guardados y calculados como enteros en la unidad mínima de la moneda
  (p. ej. centavos), formateados para mostrar con `Intl.NumberFormat` según la moneda del viaje.
- **Rationale**: SC-008 exige que los totales cuadren exactamente en el 100% de los casos;
  aritmética entera evita el error de redondeo de punto flotante sin necesidad de una librería
  de precisión decimal.
- **Alternatives considered**: números de punto flotante (rechazado: riesgo conocido de
  redondeo que pondría en riesgo SC-008); librería de decimales (`decimal.js`/`big.js`)
  (rechazado: innecesaria una vez que se opera en enteros).

## 8. Fechas

- **Decision**: funciones puras propias sobre `Date` normalizado a medianoche local (sin hora),
  cubiertas por pruebas unitarias, para contar días transcurridos/restantes y agrupar gastos por
  día.
- **Rationale**: el dominio solo necesita aritmética de días calendario, no manejo de husos
  horarios complejos ni recurrencias; una docena de líneas bien probadas alcanza.
- **Alternatives considered**: `date-fns`/`dayjs` (rechazado: dependencia adicional para un
  problema ya cubierto por funciones simples).

## 9. Formularios

- **Decision**: estado controlado de React + funciones de validación en línea por formulario
  (sin librería de formularios).
- **Rationale**: todos los formularios de v1 tienen 5 campos o menos, con reglas simples
  (obligatorio / mayor a cero); una librería de formularios resolvería un problema de forms
  complejos que esta v1 no tiene.
- **Alternatives considered**: React Hook Form + Zod (rechazado para v1: el beneficio aparece
  con formularios grandes o anidados; se puede reconsiderar si los formularios crecen en una
  versión futura).

## 10. Estilos y tokens del sistema de diseño

- **Decision**: Tailwind CSS configurado para consumir los tokens semánticos de
  `.specify/memory/design-system.md` como variables CSS (soporte Light/Dark vía
  `prefers-color-scheme`).
- **Rationale**: permite construir pantallas rápido sin perder la disciplina de "siempre tokens
  semánticos, nunca valores sueltos" que exige el Principio VI.
- **Alternatives considered**: CSS Modules a mano (rechazado: más lento de iterar para el
  objetivo de publicar cuanto antes); kit de componentes de terceros tipo MUI/Chakra (rechazado:
  compite con el sistema de diseño propio en vez de reutilizarlo, en contra del Principio VI).

## 11. Eliminación de cuenta

- **Decision**: una única función server-side en Supabase (`delete-account`), invocada por la
  persona autenticada, que borra en cascada viajes/gastos/categorías/asociaciones aprendidas y
  finalmente el usuario de autenticación. La clave de rol de servicio que esto requiere queda
  guardada en el proveedor administrado, nunca en el repositorio.
- **Rationale**: es la única operación de la spec que no se puede resolver de forma segura solo
  desde el cliente, porque borrar el acceso de login (FR-055/FR-056) requiere un privilegio que
  no puede exponerse en código de cliente sin violar el Principio V.
- **Alternatives considered**: borrado completo solo con reglas de acceso por fila (RLS) desde
  el cliente (rechazado: puede borrar los datos pero no la cuenta de login en sí, dejando un
  acceso huérfano); backend de propósito general (rechazado: desproporcionado para una sola
  operación).

## 12. Despliegue

- **Decision**: hosting estático/edge (p. ej. Vercel) conectado al repositorio de GitHub, con
  despliegue automático desde `main` y vistas previas por pull request. Un solo proyecto de
  Supabase para v1 (sin ambiente de staging separado todavía).
- **Rationale**: es el camino de menor esfuerzo operativo hacia "publicado", que es
  explícitamente la prioridad de esta versión.
- **Alternatives considered**: ambiente de staging + pipeline multi-entorno (rechazado para v1:
  overhead operativo que una primera versión no necesita; se puede incorporar después si el
  producto crece más allá de v1).

## 13. Estrategia de pruebas

- **Decision**: Vitest para la lógica pura de cálculo (salud del presupuesto, porcentajes,
  conteo de días, categorización) + una prueba de humo end-to-end con Playwright para el camino
  dorado P1 (crear cuenta → crear viaje → registrar gasto → ver resumen). El resto de los
  criterios de aceptación se valida manualmente contra la app vía `quickstart.md`.
- **Rationale**: concentra la inversión en pruebas automatizadas donde un error sería más
  costoso —la exactitud del dinero (SC-006, SC-007, SC-008)— sin construir una suite E2E
  completa que v1 todavía no necesita, y cumple el Principio IV (verificable sin leer código)
  para el resto del producto.
- **Alternatives considered**: cobertura E2E exhaustiva de las 10 historias de usuario
  (rechazado para v1: alto costo de mantenimiento para el ritmo de publicación buscado; se
  puede ampliar en versiones futuras).
