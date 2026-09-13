# Arquitectura

## Stack y decisión

Electron 44.3, React, TypeScript y Vite; SQLite mediante `node:sqlite` en el proceso principal. pnpm administra dependencias; esbuild compila el shell. La entrega usa una carpeta autónoma y NSIS directo; electron-builder queda configurado como ruta alternativa para portable/NSIS Windows x64. Las versiones exactas instaladas están fijadas en el manifiesto y lockfile.

Se acepta el coste de memoria y distribución de Chromium/Node por la rapidez de implementación verificable, el ecosistema de UI y la separación tipada de procesos. WPF, WinUI y Tauri se comparan en [ADR-001](technical-decision.md). Si el presupuesto de recursos cambia, medir antes de migrar.

## Límites de la aplicación

```text
src/ui/                 React: páginas, formularios y visualización
        ↓ API limitada de window.noryum
desktop/preload.ts      contextBridge: contrato de acceso
        ↓ IPC
desktop/main.ts         ventana, ciclo de vida, handlers y diálogos de archivo
        ↓
src/data/               validación, consultas SQLite y migraciones
src/domain/             tipos y cálculos puros, reutilizables en pruebas
tests/                  pruebas de riesgo: fechas, métricas y persistencia
scripts/                desarrollo, compilación y comprobación de escritorio
```

El renderer no recibe Node ni acceso directo al filesystem o a SQL. El preload expone operaciones concretas, no un canal IPC arbitrario. Aislamiento de contexto y sandbox son parte del límite de seguridad. Los datos recibidos se validan otra vez en el proceso principal; los tipos TypeScript no sustituyen esa validación.

El frontend presenta datos y solicita cambios. La persistencia conserva hechos y relaciones; las funciones de dominio calculan agregados. No existe backend remoto, infraestructura cloud ni contenido web remoto necesario para la operación cotidiana.

## Persistencia y tiempo

La base predeterminada es `app.getPath('userData')/noryum.sqlite`. SQLite mantiene entidades relacionales, claves foráneas e índices de fecha. Las migraciones versionadas deben ejecutarse de forma transaccional antes de atender operaciones. Datos iniciales vacíos; fixtures exclusivamente en pruebas.

Los días de registro se representan como fechas civiles `YYYY-MM-DD`; los instantes reales se conservan como timestamps. No derivar el día local cortando un timestamp UTC. Una sesión nocturna de sueño se atribuye al día de despertar. Las reglas de agregación, intervalos de semana y denominadores se documentan en [data-model.md](data-model.md).

La copia de seguridad usa SQLite para obtener un archivo consistente. Una futura importación/restauración debe validar formato, versión e integridad y conservar una copia previa antes de reemplazar información. Este hito no incorpora sincronización ni cifrado de base o copias.

## Mantenimiento y límites

- Mantener Electron al día con pruebas de compilación y lanzamiento al actualizarlo.
- Las consultas síncronas de `node:sqlite` son adecuadas para este volumen inicial; medir latencia y trasladar trabajo pesado a un worker si el historial lo exige.
- No registrar notas personales o payloads completos en logs; los errores deben permitir resolver el fallo sin exponer contenido sensible.
- La vista de desarrollo en Vite requiere Electron para acceder a datos reales. No crear una persistencia ficticia del navegador que oculte fallos de IPC.
- El idioma inicial es español. Centralizar futuras traducciones antes de añadir otro idioma; no asumir que cada texto ya cuenta con un catálogo de localización.
- No hay autoactualización ni firma de editor configurada para este hito. El empaquetado es reproducible a partir del código y lockfile, pero futuras publicaciones requieren una política de actualización y firma.

## Validación

`pnpm test` cubre reglas de dominio y SQLite; `pnpm build` valida tipos y compilación; `pnpm test:ui` comprueba flujos con Electron. Verificar por separado la persistencia tras reinicio y el artefacto empaquetado. Estos comandos describen el proceso de verificación y no constituyen por sí solos una afirmación de que todas las comprobaciones hayan pasado.

