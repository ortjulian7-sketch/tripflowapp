<!--
Sync Impact Report
- Version change: (plantilla sin versionar) → 1.0.0
- Ratificación inicial de la constitución de Tripflow.
- Principios establecidos:
  I. Simplicidad ante todo (nuevo)
  II. Idioma y mercado (nuevo)
  III. Cero alcance fantasma (nuevo)
  IV. Verificable por una persona no técnica (nuevo)
  V. Datos del usuario con respeto (nuevo)
  VI. Sistema de diseño como fuente de verdad (nuevo)
- Secciones agregadas: Alcance del Producto, Flujo de Trabajo y Calidad, Gobernanza
- Secciones eliminadas: ninguna
- Plantillas dependientes: .specify/templates/{plan,spec,tasks,checklist}-template.md no fueron
  modificadas (fuera del alcance de este comando); revisar en la próxima ejecución de
  /speckit-plan o /speckit-tasks que sus referencias a principios sigan siendo válidas.
- TODOs diferidos: ninguno
-->

# Tripflow Constitution

Tripflow es una aplicación que permite controlar el presupuesto de un viaje. Permite
planificar viajes y registrar los gastos realizados para ayudar al usuario a mantenerse
dentro de su presupuesto.

## Core Principles

### I. Simplicidad ante todo

Ante dos soluciones posibles, se DEBE elegir siempre la más simple. Tripflow es una
versión 1 (v1) y no debe incorporar complejidad anticipada ni funcionalidades
innecesarias. Toda propuesta de diseño o implementación que agregue complejidad debe
justificar por qué la alternativa más simple no es suficiente.

### II. Idioma y mercado

Todo el producto DEBE estar en español LATAM: textos de interfaz, mensajes de error,
notificaciones y cualquier contenido visible para la persona usuaria. La aplicación DEBE
permitir el uso de diferentes monedas cuando sea necesario, dado que los viajes pueden
implicar gastos en monedas distintas a la de origen.

### III. Cero alcance fantasma

No se DEBE implementar ninguna funcionalidad que no esté explícitamente definida en la
especificación. Las nuevas ideas pueden proponerse en cualquier momento, pero nunca
desarrollarse sin antes ser aprobadas e incorporadas formalmente a la spec
correspondiente. Código, pantallas o flujos que no tengan respaldo en una spec aprobada
se consideran una violación de este principio.

### IV. Verificable por una persona no técnica

Todo criterio de éxito de una spec DEBE poder validarse usando la aplicación
directamente, sin necesidad de leer código, revisar bases de datos ni comprender
detalles técnicos. Si un criterio de aceptación no puede comprobarse mediante el uso
normal de la app, debe reescribirse hasta que lo sea.

### V. Datos del usuario con respeto

Solo se DEBE solicitar la información estrictamente necesaria para el funcionamiento del
producto. No se deben almacenar claves, secretos ni información sensible dentro del
código. Cualquier dato personal o financiero solicitado a la persona usuaria debe tener
un propósito claro y directamente vinculado a planificar viajes o registrar gastos.

### VI. Sistema de diseño como fuente de verdad

Toda interfaz DEBE construirse utilizando los componentes, tokens, estilos y patrones
definidos por el sistema de diseño del producto. No se deben crear soluciones visuales
aisladas cuando exista una alternativa dentro del sistema de diseño. Cuando surja una
necesidad visual no cubierta, se DEBE resolver extendiendo el sistema de diseño de forma
apropiada, en lugar de crear una solución puntual fuera de él.

## Alcance del Producto

Tripflow existe para controlar el presupuesto de un viaje: planificar el presupuesto y
registrar los gastos reales para ayudar a la persona usuaria a mantenerse dentro de lo
planeado. Cualquier funcionalidad propuesta debe evaluarse contra este propósito central;
lo que no aporte directamente a planificar o controlar el presupuesto de un viaje queda
fuera del alcance de esta v1 (ver Principio I y Principio III).

## Flujo de Trabajo y Calidad

Toda funcionalidad nueva sigue el flujo spec → plan → tasks → implement. Antes de pasar
de una fase a la siguiente, el artefacto correspondiente (spec, plan o lista de tareas)
DEBE verificarse contra los seis principios de esta constitución. En particular, los
criterios de éxito de cada spec deben cumplir el Principio IV (verificable por una
persona no técnica) antes de considerarse aprobados. Cualquier desviación de un
principio debe quedar justificada explícitamente en el artefacto correspondiente o
corregirse antes de avanzar.

## Gobernanza

Esta constitución prevalece sobre cualquier otra práctica, guía o preferencia individual
dentro del proyecto. Ningún artefacto (spec, plan, tareas o código) puede contradecir los
principios aquí establecidos sin una enmienda formal a este documento.

**Enmiendas**: Cualquier cambio a esta constitución (agregar, modificar o eliminar un
principio o sección) debe documentarse explícitamente, justificar su motivo y actualizar
el número de versión según el versionado semántico definido abajo. Los cambios quedan
registrados en el Sync Impact Report al inicio de este archivo.

**Versionado**: Esta constitución sigue versionado semántico (MAYOR.MENOR.PARCHE):
- MAYOR: eliminación o redefinición incompatible de un principio existente.
- MENOR: incorporación de un nuevo principio o sección, o expansión material de una guía
  existente.
- PARCHE: aclaraciones, correcciones de redacción o ajustes no semánticos.

**Revisión de cumplimiento**: Toda spec, plan de implementación y lista de tareas debe
verificarse contra estos principios antes de avanzar a la siguiente fase del flujo de
trabajo. Cualquier desviación debe justificarse explícitamente o corregirse.

**Version**: 1.0.0 | **Ratified**: 2026-08-12 | **Last Amended**: 2026-08-12
