# Medición de estados subjetivos

Decisión del MVP, 2026-09-12: cuatro preguntas separadas sobre el estado actual, con respuestas enteras **1–5**, nota opcional y versión de escala persistida. Son autorreportes personales diseñados para Noryum; **no constituyen un instrumento clínico validado**.

## Por qué cinco niveles

| Escala | Ventaja de diseño | Coste |
| --- | --- | --- |
| 1–5 | Cinco opciones fáciles de presentar y etiquetar; punto medio explícito. | Menos resolución: pequeñas variaciones pueden caer en la misma categoría. |
| 1–10 | Más opciones para expresar matices y familiaridad para algunas personas. | Sin categoría central única; distinguir valores vecinos puede ser difícil y más detalle numérico no asegura precisión. |

La elección de cinco opciones es una inferencia de UX para un registro breve, no una conclusión científica de que cinco siempre sea mejor. La rapidez real y la comprensión de las etiquetas requieren evaluación con usuarios.

## Evidencia consultada y límites

- Preston y Colman estudiaron 149 personas evaluando servicios: varios índices mejoraron hasta aproximadamente siete categorías y la preferencia fue mayor por diez. Es evidencia a favor de considerar más opciones, pero no evaluó check-ins diarios de bienestar. [Estudio original, 2000](https://pubmed.ncbi.nlm.nih.gov/10769936/).
- Cook y colaboradores analizaron 434 respuestas a interferencia del dolor: recodificar a cinco o seis categorías conservó resultados útiles. La cantidad de opciones presentada a las personas no se manipuló; no demuestra equivalencia de interfaces ni valida preguntas de Noryum. [Estudio original, 2010](https://www.dovepress.com/is-less-more-a-preliminary-investigation-of-the-number-of-response-cat-peer-reviewed-fulltext-article-PROM).
- Un experimento EMA con 411 participantes no halló efectos principales significativos de los factores probados sobre cumplimiento, incluido slider frente a Likert. No comparó directamente 1–5 con 1–10 y no permite prometer que menos opciones aumenten la constancia. [Businelle y colaboradores, 2024](https://www.jmir.org/2024/1/e50275/).
- Un estudio de interpretación de categorías encontró problemas para tratarlas como intervalos equidistantes. Refuerza la necesidad de cautela con promedios e interpretación numérica, aunque su población y preguntas difieren de Noryum. [Knutsson y colaboradores, 2010](https://pubmed.ncbi.nlm.nih.gov/20576159/).

## Contrato de interpretación

Energía, ánimo, estrés y concentración permanecen separados. Un número mayor significa mayor nivel del concepto: en estrés significa **más estrés**, sin invertirlo silenciosamente. Las etiquetas y la pregunta deben mantenerse estables dentro de la misma versión.

Las respuestas son ordinales. Los promedios que muestre el MVP son descripciones aproximadas de respuestas registradas, no medidas clínicas ni distancias psicológicas exactas. No presentar cambios como porcentajes de salud ni comparar personas. Conservar observaciones originales, fecha y versión permite revisar futuros métodos sin alterar la historia.

Omitir observaciones ausentes y mostrar cobertura. Un día sin registro no implica buen o mal estado. Múltiples check-ins en un día pueden reflejar momentos distintos; el método de agregación debe ser explícito en [data-model.md](data-model.md). Horarios de registro y selección voluntaria pueden sesgar la comparación entre semanas.

Los registros de sueño son estimaciones personales: el tiempo entre acostarse y despertar no necesariamente equivale a tiempo dormido. No aplicar umbrales médicos automáticos. El progreso de módulos describe avance declarado, no retención ni dominio. Las relaciones entre variables, si se incorporan después, deben etiquetarse como asociaciones exploratorias.

Antes de cambiar la escala: comprobar comprensión y uso de categorías, recoger comentarios sobre fricción y documentar una nueva versión. No convertir automáticamente valores históricos 1–5 a 1–10 ni mezclar versiones en una misma tendencia.
