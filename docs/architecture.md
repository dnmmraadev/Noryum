# Architecture

## Stack And Decision

Noryum uses Electron 44.3, React, TypeScript, and Vite, with SQLite through `node:sqlite` in the main process. pnpm manages dependencies and esbuild bundles the desktop shell. This delivery uses a standalone folder and direct NSIS packaging; electron-builder remains configured as an alternate path for Windows x64 portable and NSIS builds. Exact installed versions are pinned in the manifest and lockfile.

The Chromium/Node memory and distribution cost is accepted for this first milestone because it enabled a verifiable implementation, a mature UI ecosystem, and a typed boundary between processes. WPF, WinUI, and Tauri are compared in [ADR-001](technical-decision.md). If resource budgets change, measure before migrating.

## Application Boundaries

```text
src/ui/                 React pages, forms, and visualization
        ↓ limited window.noryum API
desktop/preload.ts      contextBridge access contract
        ↓ IPC
desktop/main.ts         window, lifecycle, handlers, and file dialogs
        ↓
src/data/               validation, SQLite queries, and migrations
src/domain/             pure types and calculations, reused by tests
tests/                  risk-focused tests for dates, metrics, and persistence
scripts/                development, build, packaging, and desktop checks
```

The renderer does not receive Node, filesystem access, or direct SQL access. The preload exposes concrete operations, not an arbitrary IPC channel. Context isolation and sandboxing are part of the security boundary. Incoming data is validated again in the main process; TypeScript types do not replace runtime validation.

The frontend displays data and requests changes. Persistence stores facts and relationships; domain functions compute aggregates. There is no remote backend, cloud infrastructure, or remote web content required for daily operation.

## Persistence And Time

The default database is `app.getPath('userData')/noryum.sqlite`. SQLite stores relational entities, foreign keys, and date indexes. Versioned migrations must run transactionally before operations are served. Initial data is empty; fixtures exist only in tests.

Log days are represented as civil dates, `YYYY-MM-DD`; real instants are stored as timestamps. Do not derive a local day by slicing a UTC timestamp. An overnight sleep record is assigned to the wake date. Aggregation rules, week windows, and denominators are documented in [data-model.md](data-model.md).

Backup uses SQLite to produce a consistent file. A future import/restore flow must validate format, version, and integrity, and preserve a previous copy before replacing data. This milestone does not include sync or encryption for the database or backups.

## Maintenance And Limits

- Keep Electron current and verify build plus launch behavior when updating it.
- Synchronous `node:sqlite` queries are suitable for this initial data volume; measure latency and move heavy work to a worker if history size requires it.
- Do not log personal notes or full request payloads; errors should be useful without exposing sensitive content.
- The Vite development view requires Electron for real data access. Do not create browser-only fake persistence that hides IPC failures.
- The initial product language is Spanish. Centralize future translations before adding another language; do not assume every string already has a localization catalog.
- There is no auto-update channel or publisher signing for this milestone. Packaging is reproducible from the code and lockfile, but future releases need an update and signing policy.

## Validation

`pnpm test` covers domain rules and SQLite. `pnpm build` validates types and compilation. `pnpm test:ui` checks desktop flows with Electron. Verify restart persistence and the packaged artifact separately. These commands describe the verification process; by themselves they are not a claim that every check has passed.
