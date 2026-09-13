# Noryum — decisión técnica / ADR-001

Fecha: 2026-09-12. Estado: aceptada para el primer hito.

## Interpretación y alcance
Un espacio personal para planear, registrar y entender la vida cotidiana. El MVP integra rutinas diarias, sueño/actividad/check-ins, estructura de estudio y sesiones, ocio intencional y reflexión semanal. Datos reales, sin cuenta ni conexión, interfaz en español y sin puntuación universal.

## Alternativas evaluadas
| Opción | Ventajas para Noryum | Costes y decisión |
| --- | --- | --- |
| WPF + C# + SQLite | UI nativa, ecosistema maduro, buen acceso a Windows, publicación autónoma | Excelente alternativa Windows; requiere SDK ausente en este equipo y mayor trabajo específico para gráficos e interacción visual. |
| WinUI 3 + C# | Plataforma moderna recomendada por Microsoft, accesibilidad e integración Windows | Windows App SDK y empaquetado agregan configuración; menor velocidad para este primer hito. |
| Tauri 2 + React + SQLite | WebView del sistema, distribución menor, separación Rust/UI | Requiere Rust, C++ Build Tools y WebView2; no están disponibles los toolchains de compilación. Mantener dos lenguajes aumenta el coste inicial. |
| Electron + React + TypeScript + SQLite | Un ecosistema, gráficos SVG, IPC tipado, pruebas reales de escritorio y distribución Windows directa | Incluye Chromium/Node: mayor tamaño y memoria. Se acepta explícitamente este coste por mantenibilidad, rapidez de entrega verificable y coherencia de la UI. |

## Decisión
Electron estable disponible (versión exacta fijada al instalar), React + TypeScript, Vite y SQLite integrado en Node del proceso principal. React ofrece componentes y controles accesibles; Svelte reduciría algo de código y Vue también sería viable, sin una ventaja decisiva para este alcance. SQLite evita un servicio y permite agregaciones relacionales; IndexedDB complica backups consultables y JSON plano dificulta integridad/migraciones. No se usa un backend remoto.

## Arquitectura
Renderer React → API limitada del preload → handlers IPC → servicios de dominio → repositorio SQLite. Renderer aislado, sandbox, sin Node, sin contenido remoto. Validación en el proceso principal. Migraciones versionadas/transaccionales. Cálculos puros separados. Fechas civiles locales para agrupación y timestamps ISO con zona para instantes. Backups consistentes mediante API SQLite. Datos iniciales vacíos; ejemplos solo en pruebas.

## Modelo inicial
Preferences; RoutineTemplate y RoutineOccurrence (fecha, hora prevista, instante real); CheckIn (cuatro respuestas y nota); SleepRecord (inicio, despertar, estimación, objetivo, calidad); ActivitySession; Program → Subject → Module; StudySession; LeisureSession; WeeklyReview. Claves foráneas e índices por fecha. Se posponen experimentos, objetivos complejos, evaluaciones, integraciones y cifrado; los IDs y fechas permiten agregarlos mediante migraciones.

## Estructura y secuencia
`desktop/` shell y preload; `src/domain/` tipos/cálculos; `src/data/` SQLite y migraciones; `src/ui/` componentes y páginas; `tests/` persistencia, métricas y flujos; `docs/` decisiones y alcance.

1. Fijar contratos, modelo y migraciones.
2. Implementar almacenamiento y cálculos con pruebas de fechas, recurrencia y agregación.
3. Construir shell e interfaz con la identidad de referencia.
4. Conectar los cinco flujos y exportación de respaldo.
5. Ejecutar, probar persistencia tras reinicio y corregir problemas.
6. Empaquetar y comprobar el ejecutable Windows.

## Decisiones y riesgos materiales
- Check-in: cinco niveles con extremos etiquetados, misma escala a lo largo del tiempo. Menos opciones favorecen registro rápido; 1–10 ofrece más detalle aparente. Es una decisión de UX, no un instrumento clínico validado. Guardar versión de escala, no producir diagnósticos ni umbrales médicos.
- Medias: omitir ausentes, nunca convertirlos en cero; indicar cobertura. Comparar periodos de calendario equivalentes y etiquetar semana en curso.
- SQLite local no cifra el disco. No almacenar secretos. Copias contienen datos personales; cifrado queda pendiente.
- Electron exige actualizaciones de seguridad y comprobar tamaño/memoria del artefacto. Si el presupuesto futuro de recursos lo requiere, reevaluar Tauri/WPF con mediciones.
- Ejecutable sin firma para este hito; firma e instalador comercial requieren identidad/certificado del editor.

## Fuentes consultadas
- [Windows App SDK](https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/) y [WPF](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/overview/).
- [Tauri: requisitos Windows](https://tauri.app/start/prerequisites/).
- [Electron: arquitectura incluida](https://www.electronjs.org/docs/latest) y [distribución](https://www.electronjs.org/docs/latest/tutorial/distribution-overview).
- [Node: SQLite](https://nodejs.org/api/sqlite.html).
- [Estudio EMA: carga de registro y refinamiento de ítems](https://www.jmir.org/2017/3/e77). Informa el criterio de baja fricción; no valida las cuatro preguntas de Noryum.
