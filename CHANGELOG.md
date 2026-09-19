# Changelog

## 0.3.0 — 2026-09-18

### Added

- Immediate language selection between English and professional Latin American Spanish.
- Localized navigation, forms, built-in curriculum, project deliverables, checkpoints, accessibility labels and activity messages.
- Accent-insensitive search across original and localized competency names.
- Adjustable roadmap height with pointer/keyboard controls and a remembered display preference.
- Permanent Roadmap details panel with progress, next checkpoint and suggested skills before selection.
- Visible application version and a documented release-numbering policy.

### Compatibility

Language changes preserve personal notes, custom content, canonical states and the version 1 backup format. Language and map height remain device-local preferences. Earlier published release assets are unchanged.

## 0.2.0 — 2026-09-18

### Added

- Visual roadmap with 92 competencies, seven tracks, prerequisites and focused checkpoint paths.
- Study planning, five practical projects, portfolio evidence and five employability checkpoints.
- Local persistence, validated JSON backups, editable competencies and resources, and light/dark themes.
- Noryum branding across the application, favicon, native window and Windows executable.
- User and development guides, contribution guidance and security reporting instructions.

### Changed

- Replaced the previous repository implementation with the React/TypeScript/Electron application.
- Standardized the application and Windows executable version on 0.2.0.
- Derived executable version metadata from package.json to keep future builds consistent.

### Compatibility

Career Roadmap workspace data and backups retain their existing format and storage location. Migration from Noryum 0.1.x is not verified; retain an export and the old installation before upgrading.

### Distribution

Windows x64 folder distribution, unsigned. Extract the whole archive before launching. No automatic updater or signed installer is included.

Previous releases remain available in GitHub history and Releases.
