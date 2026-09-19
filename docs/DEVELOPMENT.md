# Development guide

## Technology choices

React 19, TypeScript, XYFlow/React Flow, Lucide icons, Zod validation, Electron and plain CSS design tokens. The desktop wrapper uses context isolation, a sandboxed renderer, no renderer Node access and a two-method preload bridge. Electron was selected because this build environment has no Rust/MSVC toolchain required for Tauri. It has a larger distribution and memory footprint than Tauri. Native HTML controls provide accessible forms without an additional component library.

The production frontend is bundled using esbuild. The development server uses esbuild with automatic rebuilds; refresh the browser after edits. Vite provides the test transformation pipeline, with an in-process TypeScript transform that avoids native worker dependencies during test configuration. Vitest runs dependency, readiness and backup validation tests.

## Development requirements

- Windows 10/11 x64 for the delivered desktop distribution.
- Node.js 24 LTS with npm 12 (or a compatible recent npm).
- Network access only to install packages and download Electron/build tooling.

```sh
npm ci --legacy-peer-deps
npm run dev
```

`npm run dev` starts a browser development server at `http://127.0.0.1:5173` with automatic source rebuilds. Open that URL and refresh after making edits. Browser previews use a separate localStorage store; they do not change desktop data. To test the native wrapper:

```sh
npm run build
npm run desktop
```

For the exact production browser preview:

```sh
npm run build
npm run preview
```

Then open `http://127.0.0.1:4173`.

## Build a Windows executable

```sh
npm run package
```

This creates a runnable folder in `release/<version>/Noryum/`. Close existing copies of the packaged application before rebuilding. Distribute the entire folder, preferably as a ZIP. The package contains the production application and Electron's runtime and license files; it does not require Node.js on the recipient's computer.

An optional electron-builder configuration can produce a single portable executable:

```sh
npm run package:installer
```

That optional packaging route downloads additional tooling and is not the verified distribution route in the restricted build environment. The provided folder distribution is unsigned and includes the Noryum executable icon. No Tauri build or signed installer is included.

## Quality checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

See [Verification](../VERIFICATION.md) for the checks actually performed on the delivered build, including any limitations. `npm run format` formats source files.

## Project structure

```text
src/model.ts          Types, backup schema and graph validation
src/data.ts           Initial competency content, resources, projects, checkpoints
src/logic.ts          Dependencies, mastery, readiness, estimates and study planning
src/persistence.ts    Desktop/browser persistence and export adapter
src/Graph.tsx         Interactive XYFlow map and graph layout
src/App.tsx           Navigation, views, competency forms and confirmations
src/style.css         Theme tokens and responsive layouts
src/logic.test.ts     Deterministic logic and validation tests
electron/main.cjs     Window lifecycle, serialized disk writes and external links
electron/preload.cjs  Narrow load/save bridge
scripts/build.mjs    Production frontend bundle
scripts/package.mjs  Windows folder distribution
scripts/preview.mjs  Local production preview server
```

Edit `src/data.ts` to change the default roadmap. Each row specifies an ID, English title, comma-separated prerequisite IDs and practical evidence. Structured objects define project deliverables and checkpoint roles. IDs must remain unique, and prerequisites must refer to existing nodes without cycles. Changes to defaults apply to new workspaces; existing user data is not silently replaced. Use export/import or competency editing for an existing workspace.


## Release process

Update package.json and the lockfile version, update CHANGELOG.md, run all quality checks, and package on Windows x64. Executable metadata is derived from package.json. Zip the entire Noryum folder and attach it to a matching Git tag release, together with SHA-256 checksums. Keep generated executables and archives out of Git. `NORYUM_PACKAGE_DIR` can select a separate output directory when an older packaged copy is running.

## Localization

English remains the canonical source language. `src/locales/es-419.json` contains the professional Latin American Spanish catalog. `src/i18n.ts` provides the locale subscription, safe display translation, localized search normalization and dynamic-message formatting. Keep status values, IDs and stored content in their canonical form; translate visible labels rather than option values. Notes and user-authored content are never rewritten by language changes. Add tests when extending dynamic messages or curriculum coverage.

Read [Versioning](VERSIONING.md) before publishing. A source commit is not itself a new downloadable release; update the version before building and publishing a new artifact.
