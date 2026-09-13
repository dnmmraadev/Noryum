# Validación del primer hito

Verificado en Windows x64 el 12 de septiembre de 2026.

## Resultado

- TypeScript: comprobación estricta sin errores.
- Compilación de renderer y shell: correcta; recursos locales incluidos.
- Diez pruebas de datos/dominio aprobadas: persistencia de los cinco flujos, backup consistente, migración fallida con rollback, recurrencia/exclusiones, validación, jerarquía de estudio, fechas civiles/DST, datos ausentes, protección ante sueño duplicado y edición/pausa de plantillas.
- Recorrido automatizado real sobre Electron: creación, edición y finalización de rutina; sueño; movimiento; check-in; programa/materia/módulo; sesión de estudio; ocio; reflexión; preferencias; recurrencia; búsqueda; cancelación de borrado. Sin errores del renderer. El script resume 19 comprobaciones del recorrido, no 19 suites independientes.
- Tras cerrar el proceso y volver a abrirlo se conservaron los cinco flujos, finalización del módulo y reflexión.
- Renderer sin `require`, API limitada a snapshot/invoke/backup y rechazo de operaciones desconocidas.
- Inspección visual de Hoy y Análisis. Vista equivalente al área cliente de una ventana 1050×720 sin desbordamiento horizontal; sidebar desplazable. Los formularios usan diálogo modal con foco y controles etiquetados.

Las capturas de este directorio contienen registros sintéticos de QA. El paquete entregado inicia vacío.

## Distribución y límites de la verificación

Electron 44.3.0 Windows x64 se verificó contra el SHA-256 publicado en su paquete oficial. NSIS 3.12 se verificó contra el checksum incluido en electron-builder. Se generaron la carpeta autónoma y el instalador sin firma digital. El ejecutable de escritorio se abrió en la sesión normal de Windows; no fue necesario desactivar su sandbox.

La terminal aislada impide crear algunos subprocesos y canales internos de Chromium. La verificación usó los compiladores nativos directamente, una aplicación de QA separada con CDP y lanzamiento mediante control de escritorio. Ninguna configuración de depuración de QA se incorpora al paquete de distribución. Los comandos habituales de desarrollo y electron-builder están documentados, pero la ruta de empaquetado usada aquí fue `package-portable.mjs` + `generate-installer.mjs` + NSIS directo.

No se instala ni desinstala el producto en el perfil personal durante QA. La compilación del instalador se verifica y su contenido se inspecciona; la matriz completa de instalación/actualización/desinstalación en equipos limpios sigue pendiente antes de una distribución pública.

Observación puntual con depuración activa: cuatro procesos de Electron sumaron aproximadamente 376 MiB de working set. No es un benchmark ni una garantía; refleja el coste aceptado en ADR-001. Falta medir arranque y memoria en otros equipos.

Límites conocidos: restauración manual, copias sin cifrar, aplicación sin firma ni actualización automática, un episodio principal de sueño por día, autorreportes no clínicos y plantillas sin historial de versiones para semanas que nunca se materializaron. No hay cuentas, sincronización, integraciones ni inferencia causal.

Integridad final: el instalador NSIS de 114.995.954 bytes pasó la prueba completa de archivo con 7-Zip (92 entradas, sin errores). Se confirmó la presencia del EXE y los recursos de la aplicación, sin bases SQLite de prueba. El ejecutable de distribución se abrió con su icono y una base inicial vacía.
