# Noryum

**See the patterns. Shape the outcome.**

Noryum is a Windows desktop app for routines, wellness, study, intentional leisure, analytics, and weekly review. The interface is in Spanish, the data is stored locally in SQLite, and the app does not require an account. First launch contains no fake records.

## Development

Requirements: Windows x64, Node.js 24, and pnpm. The first dependency install requires a network connection; day-to-day use of the packaged app does not.

```powershell
pnpm install --frozen-lockfile
pnpm exec install-electron
pnpm dev
```

`dev` opens Electron with the UI served by Vite. UI changes reload during development; restart the command after changing the main process or preload.

```powershell
pnpm test
pnpm build
pnpm test:ui
```

`test` runs domain and storage tests. `build` checks TypeScript and generates `dist/` and `dist-desktop/`. `test:ui` runs the automated desktop flow against the built app; see the validation evidence for the results obtained in this milestone.

## Windows Distribution

The current source version is 0.1.2. Packaging targets `release/Noryum-0.1.2-Setup-x64.exe` through the direct NSIS workflow and a standalone folder at `release/Noryum-win32-x64/`. Version 0.1.2 does not yet include a newly verified installer. To use the folder without installing, open `Noryum.exe` and keep its companion files together. Node and developer tools are not required.

```powershell
pnpm package
```

The command builds the app and uses electron-builder to produce a portable executable and an x64 NSIS installer in `release/`. The first packaging run may download helper tools. This milestone does not sign the binaries; publishing with a verified publisher identity requires a signing certificate.

Inside the isolated delivery environment, the standalone folder was built with `node scripts/package-portable.mjs` and the installer was built directly with NSIS 3.12. The uninstall manifest is generated with `node scripts/generate-installer.mjs`; then run `makensis scripts/installer.nsi` with NSIS on PATH and `NSISDIR` configured. Uninstall removes only enumerated program files and preserves personal data. `pnpm package:folder` reproduces the standalone folder; the executable icon can be applied with `rcedit --set-icon public/icon.ico`.

## Data And Backups

The database is created at `app.getPath('userData')/noryum.sqlite`, inside the current Windows user profile. Records persist after closing and reopening Noryum. The portable executable also uses that profile; it does not automatically store data next to the `.exe`.

Settings can export a consistent local SQLite backup. Keep backups in a protected location: they include personal records and this MVP does not encrypt them. Do not copy only the main SQLite file while the app is open; use the backup function so pending WAL changes are included.

Restore is still manual. Close Noryum completely and keep a copy of the entire active data folder before replacing files. In the active folder, move `noryum.sqlite` and any `noryum.sqlite-wal` and `noryum.sqlite-shm` files to a safeguard folder; then copy the exported backup as `noryum.sqlite` and reopen Noryum. Do not reuse WAL/SHM files from another database. If startup fails, close the app and restore the original complete set. Use the same or a newer Noryum version than the one that created the backup; a database from a future version is rejected to protect it.

On Windows, the default data folder is under `%APPDATA%\noryum` in this delivery. Tests can set `NORYUM_DATA_DIR` before starting Electron; that option changes the data location and must point to a folder separate from personal information.

No account, remote service, or API key is required. MVP data is used for descriptive summaries only; Noryum does not provide medical diagnosis, a validated wellness measure, or a universal life score.

## Documentation

- [Technical decision and evaluated alternatives](docs/technical-decision.md)
- [Architecture and maintenance](docs/architecture.md)
- [Data model and metric definitions](docs/data-model.md)
- [Product principles and scope](docs/product.md)
- [Subjective scales: evidence and limits](docs/measurement.md)
- [Validation results and limits](docs/validation.md)
- [Release notes 0.1.2](docs/release-0.1.2.md)
- [Release notes 0.1.0 (historical)](docs/release-0.1.0.md)
- [Local security and privacy](SECURITY.md)
