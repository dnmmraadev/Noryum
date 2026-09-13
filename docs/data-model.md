# Modelo de datos y cálculos

SQLite guarda tablas relacionales y claves foráneas. `schema_migrations` registra versiones; cada migración se confirma completa o se revierte completa. Una versión futura desconocida bloquea la apertura para evitar escrituras incompatibles. `preferences` es un registro; no hay cuentas ni datos de demostración.

## Entidades

- `templates` → `routines`: plantilla recurrente y ocurrencia con fecha civil, hora prevista e instante real de finalización. La plantilla declara inicio y días representados por JS (domingo=0, lunes=1). Solo el pequeño conjunto de días se serializa como JSON; los registros no son blobs JSON. Una restricción única evita duplicados por plantilla/fecha. `routine_exclusions` impide que una ocurrencia eliminada reaparezca.
- `checkins`: múltiples observaciones por día, instante de registro, cuatro escalas ordinales de 1–5 y `scaleVersion=1`. No representan un instrumento clínico ni diagnóstico.
- `sleep`: un episodio principal por fecha de despertar; hora prevista de acostarse, hora real, inicio de sueño estimado opcional, despertar y calidad subjetiva opcional.
- `activities`: tipo, minutos e intensidad percibida 1–5.
- `programs` → `subjects` → `modules`: estructura de aprendizaje. `study` referencia un programa y opcionalmente una asignatura/módulo perteneciente a él; guarda tiempo y resultado descrito. Completar un módulo indica avance de contenido, no dominio ni retención.
- `leisure`: categoría, descripción, minutos e intencionalidad declarada.
- `reviews`: reflexión única por lunes, con lo que funcionó, dificultades y próximo ajuste.

## Fechas, recurrencia y edición

Fechas civiles `YYYY-MM-DD` agrupan los registros en el día elegido. Para sueño, el backend exige que esa fecha coincida con el despertar convertido a la zona local del sistema; acepta instantes UTC enviados por la interfaz. Una creación duplicada de sueño se rechaza sin sobrescribir datos; editar requiere el ID explícito del registro. Horas previstas `HH:mm` son locales. Los instantes reales incluyen zona UTC/offset; las diferencias de sueño usan tiempo transcurrido real y respetan cambios DST. Los check-ins se ordenan por instante real, no por representación textual del offset. La aritmética de días civiles usa UTC mediodía, no sumar 24 horas a instantes locales.

Al consultar un día se materializan su semana de lunes a domingo y la anterior, respetando el inicio de cada plantilla. Esto da planes comparables de dos semanas sin crear años de datos anticipados. Reabrir una fecha no duplica ocurrencias ni borra completados. Editar una plantilla actualiza transaccionalmente título, hora y nota de las ocurrencias pendientes de hoy en adelante, y retira las que dejan de coincidir con sus días/inicio. Desactivarla retira esos planes pendientes y detiene nueva generación. Las ocurrencias pasadas, completadas y exclusiones por borrado individual se conservan. Eliminar la plantilla conserva sus ocurrencias históricas. Editar/borrar una ocurrencia cambia solo esa fecha. Limitación del MVP: consultar una semana histórica nunca materializada genera sus planes con la definición vigente de la plantilla; todavía no existe versionado histórico de plantillas.

El repositorio valida datos nuevamente al entrar desde IPC, usa consultas parametrizadas y limita tipos de operación. Duraciones registradas: 1–1440 minutos; sueño: mayor que cero y hasta 24 horas; inicio de sueño entre acostarse y despertar. No se aceptan timestamps sin zona. El respaldo usa `node:sqlite.backup` para obtener una copia consistente incluso con WAL. Restauración/importación no forman parte de la interfaz de este hito.

## Definiciones de métricas

- Sueño estimado = despertar − inicio estimado, o despertar − acostarse cuando no se conoce el inicio. Ese fallback estima tiempo en cama; no mide fisiológicamente el sueño. Promedio y desviación estándar poblacional de duraciones disponibles; variabilidad requiere al menos dos episodios.
- Energía/ánimo/estrés/concentración = media dentro del día y después media de los días observados, evitando dar más peso a días con muchos check-ins. Por ser escalas ordinales, son resúmenes descriptivos aproximados.
- Cumplimiento de rutina = completadas / planificadas × 100. Sin planes el resultado es ausente, no cero.
- Estudio = suma de minutos. Resultados = sesiones con descripción de resultado; no es conteo validado de ejercicios ni aprendizaje demostrado.
- Actividad = suma de minutos, sesiones y fechas distintas con registro.
- Ocio intencional = minutos declarados intencionales / minutos de ocio registrados. No se compara con un ideal moral ni con toda la jornada.
- Semana = lunes–domingo. Para la semana seleccionada hasta un día, la comparación anterior usa exactamente los mismos días de semana; ambas coberturas aparecen en las métricas. Ninguna comparación implica causalidad.
- Datos faltantes: promedios sin observaciones devuelven `null`. Sumas de registros devuelven 0; esto significa nada registrado, no prueba de ausencia de comportamiento. Sueño y check-in incluyen número de días observados.

`src/domain/analytics.ts` contiene cálculos puros. `tests/data.test.ts` cubre reinicio, copia SQLite, fallo de migración, recurrencia/eliminación, validación, jerarquía, cambio de año, años bisiestos, DST, datos ausentes y comparaciones semanales equivalentes.

