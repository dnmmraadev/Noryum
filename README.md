# Noryum

**See the patterns. Shape the outcome.**

Aplicación de escritorio para Windows que reúne rutinas, bienestar, estudio, ocio y revisión semanal. Interfaz en español, datos locales en SQLite y uso sin cuenta. La primera apertura no contiene registros ficticios.

## Desarrollo

Requisitos: Windows x64, Node.js 24 y pnpm. La instalación inicial de dependencias requiere conexión; el uso cotidiano de la aplicación empaquetada no.

```powershell
pnpm install --frozen-lockfile
pnpm exec install-electron
pnpm dev
```

`dev` abre Electron con la interfaz servida por Vite. Los cambios de UI se actualizan durante el desarrollo; después de cambiar el proceso principal o el preload, reiniciar el comando.

```powershell
pnpm test
pnpm build
pnpm test:ui
```

`test` ejecuta pruebas de dominio y almacenamiento. `build` comprueba TypeScript y genera `dist/` y `dist-desktop/`. `test:ui` ejecuta la comprobación automatizada del flujo de escritorio sobre la compilación; consultar la evidencia de validación de esta entrega para los resultados efectivamente obtenidos.

## Distribución Windows

La entrega incluye `release/Noryum-0.1.0-Setup-x64.exe` y una carpeta autónoma `release/Noryum-win32-x64/`. Para usar la carpeta sin instalar, abrir `Noryum.exe` y conservar sus archivos juntos. No requiere Node ni herramientas de desarrollo.

```powershell
pnpm package
```

El comando compila y usa electron-builder para producir un ejecutable portable y un instalador NSIS x64 en `release/`. La primera ejecución de empaquetado puede descargar herramientas auxiliares. La configuración de este hito no firma los ejecutables: una publicación con identidad de editor requiere configurar un certificado de firma.

En el entorno aislado de esta entrega se construyó la carpeta autónoma con `node scripts/package-portable.mjs` y el instalador con NSIS 3.12 directamente. El manifiesto de desinstalación se genera con `node scripts/generate-installer.mjs`; después ejecutar `makensis scripts/installer.nsi` con NSIS en PATH y NSISDIR configurado. La desinstalación elimina únicamente archivos enumerados del programa y conserva los datos personales. `pnpm package:folder` reproduce la carpeta autónoma; el icono del EXE se puede aplicar con `rcedit --set-icon public/icon.ico`.

## Datos y copias

La base de datos se crea en `app.getPath('userData')/noryum.sqlite`, dentro del perfil del usuario de Windows. Los registros permanecen al cerrar y volver a abrir Noryum. El ejecutable portable también usa ese perfil: no guarda automáticamente los datos junto al archivo `.exe`.

En Ajustes se puede exportar una copia local consistente de SQLite. Conservar las copias en una ubicación protegida: incluyen los registros personales y este MVP no los cifra. No copiar únicamente el archivo principal de SQLite mientras la aplicación está abierta; usar la función de copia para incluir los cambios pendientes.

La restauración todavía es manual. Cerrar Noryum completamente y conservar una copia de toda su carpeta de datos antes de cambiar archivos. En la carpeta activa, apartar `noryum.sqlite` y sus posibles archivos `noryum.sqlite-wal` y `noryum.sqlite-shm` hacia una carpeta de resguardo; después copiar el respaldo exportado con el nombre `noryum.sqlite` y volver a abrir Noryum. No reutilizar archivos WAL/SHM de otra base. Si falla la apertura, cerrar la aplicación y recuperar el conjunto original completo. Usar una versión de Noryum igual o posterior a la que creó la copia; una base de una versión futura se rechaza para protegerla.

En Windows, la carpeta de datos predeterminada está bajo `%APPDATA%\noryum` en esta entrega. Para pruebas se puede definir `NORYUM_DATA_DIR` antes de arrancar Electron; esa opción cambia la ubicación de los datos y debe apuntar a una carpeta separada de la información personal.

No se requiere una cuenta, servicio remoto ni clave de API. Los datos del MVP se usan para resúmenes descriptivos; no hay diagnóstico médico, medición validada de bienestar ni puntuación global de vida.

## Documentación

- [Decisión técnica y alternativas evaluadas](docs/technical-decision.md)
- [Arquitectura y mantenimiento](docs/architecture.md)
- [Modelo de datos y definiciones de métricas](docs/data-model.md)
- [Principios y alcance del producto](docs/product.md)
- [Escalas subjetivas: evidencia y límites](docs/measurement.md)
- [Resultados de validación y límites](docs/validation.md)
- [Notas de release 0.1.0](docs/release-0.1.0.md)
- [Seguridad y privacidad local](SECURITY.md)

## Publicación en GitHub

El repositorio versiona el código fuente, documentación, pruebas y assets necesarios para reproducir el MVP. Los binarios de Windows se publican como artefactos de release y no se incluyen en Git para evitar historial pesado.

Flujo recomendado para una release:

```powershell
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm package:folder
node scripts/generate-installer.mjs
```

Crear una etiqueta `v0.1.0`, adjuntar `Noryum-0.1.0-Setup-x64.exe`, `Noryum-0.1.0-source.zip` y `Noryum-SHA256SUMS.txt`, y copiar el contenido de [docs/release-0.1.0.md](docs/release-0.1.0.md) como descripción.
