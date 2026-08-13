# Specification Quality Checklist: Tripflow v0 — Control de presupuesto de viaje

**Purpose**: Validar la completitud y calidad de la especificación antes de pasar a planificación
**Created**: 2026-08-13
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

**Ambigüedades resueltas antes de redactar** (8 preguntas contestadas por el usuario, 0 marcadores
`[NEEDS CLARIFICATION]` restantes):

1. Cuenta obligatoria desde el inicio.
2. Una sola moneda por viaje, sin conversión.
3. Categorización automática como sugerencia preseleccionada, nunca bloqueante.
4. Solo presupuesto total; sin topes por categoría.
5. Salud del viaje = presupuesto diario restante (disponible ÷ días restantes), recalculado.
6. Onboarding de selección de categorías.
7. Fecha de regreso opcional (viaje abierto).
8. Búsqueda por texto + filtro por rango de fechas.

**Contradicciones detectadas en el material original y cómo se resolvieron**:

- *RF3 ("sin fricción de cuentas") vs. cuenta obligatoria + onboarding*: RF3 se reinterpretó como
  "sin pantallas de valor previas"; el camino queda registro → categorías → viaje, con el
  onboarding reducido a una pantalla saltable con todo preseleccionado (FR-002, FR-003).
- *Corrección de gastos*: la edición de un gasto reutiliza exactamente la experiencia de registro
  (mismos campos, mismo orden, mismo comportamiento), precargada con los valores guardados
  (FR-018). Esto reduce la superficie de producto y elimina una pantalla nueva que diseñar.
- *Respuesta 5 vs. respuesta 7*: un viaje abierto no tiene días restantes, por lo que no admite
  cálculo de ritmo. Se especificó el estado degradado explícitamente (FR-037, US4 escenario 5).
- *Regla "un gasto sin categoría reconocible no se puede guardar" vs. existencia de "Otro"*: la
  regla queda cubierta de facto porque "Otro" siempre está disponible y es la preselección de
  respaldo (FR-023). Se agregó como supuesto que "Otro" no puede eliminarse.
- *"Editar funciona igual que crear" vs. sugerencia automática de categoría*: al editar, la
  categoría ya guardada se trata como elección manual, de modo que corregir un typo en la
  descripción no cambia la categoría por debajo (FR-024, US7 escenario 3).
- *RF7 ("categorías como paso opcional posterior") vs. sin topes por categoría*: se interpretó
  como personalización de categorías, no como presupuestos por categoría (US9, Out of Scope).
- *Números incoherentes en el mockup del resumen*: documentado en Dependencies con el cálculo
  correcto según FR-032 a FR-035.

**Criterios que requieren validación con usuarios reales** (no verificables en escritorio):
SC-003, SC-004 y SC-009. Deben medirse con pruebas de usabilidad y uso real, no en QA funcional.

**Cobertura de diseño**: la edición de gasto reutiliza la pantalla de registro (FR-018), por lo
que no requiere diseño nuevo. Las pantallas de gestión de categorías, onboarding de categorías,
búsqueda con filtro de fechas y estados vacíos no existen todavía en Figma y se derivan de esta
especificación.
