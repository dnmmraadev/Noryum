# First Milestone Validation

Verified on Windows x64 on 2026-09-12.

## Result

- TypeScript: strict check passed without errors.
- Renderer and shell build: successful, with local resources included.
- Ten data/domain tests passed: persistence for the five flows, consistent backup, failed migration rollback, recurrence/exclusions, validation, study hierarchy, civil dates/DST, missing data, duplicate sleep protection, and template edit/pause behavior.
- Real automated Electron flow: routine creation, editing, and completion; sleep; movement; check-in; program/subject/module; study session; leisure; reflection; preferences; recurrence; search; and delete cancellation. No renderer errors. The script summarizes 19 flow checks, not 19 independent suites.
- After closing and reopening the process, the five flows, module completion, and reflection persisted.
- Renderer has no `require`, the exposed API is limited to snapshot/invoke/backup, and unknown operations are rejected.
- Visual inspection covered Hoy and Análisis. A viewport equivalent to the client area of a 1050x720 window had no horizontal overflow; the sidebar scrolls. Forms use a modal dialog with focus handling and labeled controls.

Screenshots in this directory contain synthetic QA records. The delivered package starts empty.

## Distribution And Verification Limits

Electron 44.3.0 Windows x64 was verified against the SHA-256 of its official package. NSIS 3.12 was verified against the checksum included in electron-builder. The standalone folder and unsigned installer were generated. The desktop executable opened in the normal Windows session; disabling its sandbox was not required.

The isolated terminal prevents some Chromium subprocesses and internal channels from starting. Verification used native compilers directly, a separate QA app with CDP, and launch through desktop control. No QA debugging configuration is included in the distribution package. The usual development and electron-builder commands are documented, but the packaging path used here was `package-portable.mjs` + `generate-installer.mjs` + direct NSIS.

The product was not installed or uninstalled in the personal profile during QA. The installer build was verified and its contents inspected; the full install/update/uninstall matrix on clean machines remains pending before public distribution.

One active debug observation: four Electron processes totaled approximately 376 MiB of working set. This is not a benchmark or guarantee; it reflects the cost accepted in ADR-001. Startup and memory still need measurement on other machines.

Known limits: manual restore, unencrypted backups, unsigned app, no automatic update, one primary sleep episode per day, non-clinical self-reports, and no template history for weeks that were never materialized. There are no accounts, sync, integrations, or causal inference.

Final integrity: the 114,995,954-byte NSIS installer passed a full 7-Zip archive test with 92 entries and no errors. The EXE and app resources were present, with no test SQLite databases. The distribution executable opened with its icon and an empty initial database.
