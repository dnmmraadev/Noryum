# Noryum 0.1.0

Primera entrega funcional de Noryum para Windows x64.

## Incluye

- Aplicación de escritorio Electron + React + TypeScript.
- Almacenamiento local en SQLite sin cuenta ni servicio remoto.
- Seis secciones: Hoy, Bienestar, Estudio, Tiempo libre, Análisis y Review semanal.
- Cinco flujos persistentes: rutinas, bienestar, estudio, ocio intencional y revisión semanal.
- Exportación local de backup desde Ajustes.
- Instalador NSIS x64 y carpeta autónoma para Windows.

## Validación

- TypeScript estricto sin errores.
- Build de renderer y proceso principal correcto.
- Diez pruebas de dominio y persistencia aprobadas.
- Recorrido automatizado de escritorio con creación, edición, persistencia tras recarga y validación de aislamiento del renderer.
- Integridad del instalador verificada con 7-Zip.

## Artefactos de esta entrega

Los binarios no se versionan en Git porque son artefactos de release. Esta entrega generó:

| Archivo | SHA-256 |
| --- | --- |
| Noryum-0.1.0-Setup-x64.exe | `88a3a97aeb4819d9cbf714c02cf30e5c00118984308e6904522166ca6c616d76` |
| Noryum.exe | `0e4c54b9ceb4467dc5e41c012248f427ace8044678de0f1af721cb0df46bd20f` |
| Noryum-0.1.0-source.zip | `c9cfe17d1d30f5a065b10fdb44b1723d39e519d756d773b00a97dc5b6f902a0b` |

## Límites conocidos

- Sin firma digital.
- Sin cifrado local propio.
- Sin auto-update.
- Instalación/desinstalación todavía no probada en matriz de equipos limpios.
- Restauración de backups manual.
- Métricas descriptivas, sin diagnóstico médico ni inferencia causal.
