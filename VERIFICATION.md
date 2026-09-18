# Verification record

Verified on Windows x64, September 17â€“18, 2026.

## Version 0.2.0 release checks

Type checking, lint, all nine tests, production bundling and Windows packaging passed again for 0.2.0. The executable reports ProductName Noryum and FileVersion/ProductVersion 0.2.0.0. The interactive checks below describe the previously verified implementation; the 0.2.0 update changes documentation and packaging metadata.

## Automated checks

- TypeScript strict type checking: passed.
- ESLint: passed.
- Vitest: 9 tests passed, covering seed integrity, independent English, dependency unlocking, skipped-state semantics, project-deliverable gating, deterministic planning, prerequisite closure, pace recalculation, complete JSON round trips, invalid references, cycles and unsafe resource URLs.
- Production frontend bundle: passed.
- Windows folder packaging: passed.
- Dependency audit after upgrading Electron and Vitest: zero reported vulnerabilities at verification time.

## Interactive checks

- The packaged `Career Roadmap.exe` launched and rendered the full 92-competency roadmap.
- A native competency change from Not started to Competent updated overall mastery and checkpoint readiness and was written to `roadmap.json`.
- The native application was closed and relaunched. The new window restored the persisted Competent state.
- Dashboard, Roadmap, Study plan, Employability, Projects, Portfolio and Settings were visually reviewed. Resources were checked for rendered content and editable links.
- Search for SQL returned three competencies; an Applied AI branch filter returned 15; the first checkpoint path returned 11. Combined search/state filters displayed the expected empty state.
- Graph node clicks, fit-to-view and zoom controls were exercised.
- Browser reload retained competency status and notes.
- Project status, deliverable checks and notes appeared in Portfolio.
- Setting a three-hour day and five-day week recalculated the workload to 15 hours/week; light theme rendered correctly.
- Export produced a readable JSON file with all 92 competencies, five projects, notes, deliverables, settings and activity.
- Import rejected an invalid-version file without changing the workspace. Importing the exported backup displayed a replacement confirmation and restored settings and project evidence.
- Custom competency creation and editing, adding a resource, cancelling deletion, confirmed deletion, and reset progress were exercised in the separate browser test store. Export preceded destructive test operations.
- No browser console errors or warnings were recorded during the completed UI checks.

Browser tests used the same production bundle as the desktop renderer. Browser storage is separate from desktop storage. Native persistence was tested against the actual Electron file adapter. Automated tests do not simulate power loss or every possible malformed file.

## Issues found and corrected

- A zero-percent checkpoint was incorrectly displayed as 100% because of a truthy fallback. The display now uses a nullish fallback.
- Form labels included option text in accessible names. Controls now have explicit label associations.
- Navigation retained scroll position from long project pages. Changing views now returns to the top.
- Raw validation errors were too verbose. Import now reports the first invalid field in readable English.
- Project-linked skills were incorrectly drawn with project styling. Only project competencies receive that style.
- Filtered checkpoints retained incorrect numbering. Their canonical numbering and colors are preserved.
- Lane collision resolution could position a dependent above its prerequisite. Placement now reserves parent positions before placing dependents.

## Distribution and environment limits

The verified deliverable is an unsigned Electron folder distribution. Keep its runtime files together. Tauri was not built because Rust/MSVC were unavailable. No signed installer, auto-updater or cross-platform package is claimed.

Restricted shell launches in this environment could not initialize some native subprocesses. The app was successfully launched and inspected through the normal Windows desktop launch path. Frontend bundling uses esbuild with inherited streams; development and preview servers were checked via localhost. The optional electron-builder single-file packaging command is documented but was not verified here.

Estimated study hours and job readiness are planning aids, not measured study time or employment guarantees. External resource availability is not required for the app and was not exhaustively checked.
