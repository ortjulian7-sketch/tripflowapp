# Contract: Sincronización entre el dispositivo y la copia en Supabase

Define cómo la app cumple FR-045 a FR-049 sin exponer nunca a la persona un botón de
"sincronizar" ni una pantalla de conflictos.

## Principio

IndexedDB (el dispositivo) es siempre la fuente de verdad para lo que la persona ve y edita.
Supabase es un respaldo sincronizado, nunca el camino que la interfaz espera para responder.

## Cuándo se dispara la sincronización

- Al recuperar conexión (evento `online` del navegador).
- Al abrir la app, si hay conexión.
- No hay sincronización en tiempo real (sin websockets/Realtime) — ver `research.md` §5.

## Empuje (push): cambios locales → Supabase

1. Cada creación/edición/eliminación local (Viaje, Gasto, Categoría, Asociación aprendida) se
   escribe primero en IndexedDB y agrega una fila a la cola local de "cambio pendiente"
   (`data-model.md`, entidad técnica interna).
2. Al sincronizar, cada cambio pendiente se envía a Supabase como `insert`/`update`/`delete`
   sobre la tabla correspondiente de `contracts/data-schema.md`.
3. Si el envío tiene éxito, se elimina de la cola local. Si falla (sin red, error transitorio),
   permanece en la cola para el siguiente intento — ningún dato registrado offline se pierde
   (FR-049).

## Extracción (pull): Supabase → dispositivo

1. Se traen todos los Viajes y Categorías del usuario (colecciones pequeñas, ver Scale/Scope en
   `plan.md`) y los Gastos/Asociaciones aprendidas asociados.
2. **Reconciliación por comparación de listas**: cualquier registro presente localmente pero
   ausente en la respuesta del servidor se elimina localmente (implementa las eliminaciones sin
   necesitar una tabla de tombstones, justificado por el volumen bajo de datos por cuenta).
3. Para registros presentes en ambos lados con `updated_at` distinto, **gana el que tiene la
   marca de tiempo más reciente** — la misma regla que la persona usuaria ya conoce por la spec
   ("prevalece el cambio más reciente").

## Indicador visible de estado (FR-048)

La interfaz debe reflejar tres estados simples, derivados del tamaño de la cola de cambios
pendientes y del resultado del último intento:

- **Todo sincronizado**: cola vacía.
- **Cambios pendientes**: cola con al menos un elemento (típicamente por estar offline).
- **Sincronizando**: hay un intento de push/pull en curso.

## Qué NO hace este contrato

- No resuelve conflictos campo por campo dentro de un mismo registro — la unidad de conflicto
  es el registro completo (Viaje o Gasto), consistente con que cada cuenta es de una sola
  persona y la edición simultánea en dos dispositivos es un caso excepcional, no uno a
  optimizar (ver `research.md` §5).
- No sincroniza en tiempo real entre dispositivos abiertos simultáneamente.
