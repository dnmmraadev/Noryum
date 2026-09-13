# Noryum 0.1.0

First functional Noryum delivery for Windows x64.

## Included

- Electron + React + TypeScript desktop app.
- Local SQLite storage with no account or remote service.
- Six sections: Hoy, Bienestar, Estudio, Tiempo libre, Análisis, and Review semanal.
- Five persistent flows: routines, wellness, study, intentional leisure, and weekly review.
- Local backup export from Settings.
- NSIS x64 installer and standalone Windows folder.

## Validation

- Strict TypeScript passed without errors.
- Renderer and main process build completed successfully.
- Ten domain and persistence tests passed.
- Automated desktop flow covered creation, editing, reload persistence, and renderer isolation.
- Installer integrity verified with 7-Zip.

## Release Artifacts

Binaries are not versioned in Git because they are release artifacts. This delivery generated:

| File | SHA-256 |
| --- | --- |
| Noryum-0.1.0-Setup-x64.exe | `88a3a97aeb4819d9cbf714c02cf30e5c00118984308e6904522166ca6c616d76` |
| Noryum.exe | `0e4c54b9ceb4467dc5e41c012248f427ace8044678de0f1af721cb0df46bd20f` |
| Noryum-0.1.0-source.zip | `c9cfe17d1d30f5a065b10fdb44b1723d39e519d756d773b00a97dc5b6f902a0b` |

## Known Limits

- No digital signature.
- No application-level local encryption.
- No auto-update.
- Install/uninstall behavior has not yet been tested across a clean-machine matrix.
- Manual backup restore.
- Descriptive metrics only; no medical diagnosis or causal inference.
