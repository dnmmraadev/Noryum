# Verification record

Verified on Windows x64, September 17â€“18, 2026.

## Version 0.5.0 release checks

- TypeScript, ESLint, all 21 unit tests and production bundling passed on September 20, 2026.
- Browser checks confirmed legacy-workspace upgrade, English competency details and source links, and Latin American Spanish content.
- The packaged Windows application loaded an isolated legacy roadmap, displayed the new unit, saved curriculum revision 1 and preserved completed states, personal notes and checked project deliverables.
- English screenshots were visually reviewed. The new node is visible within the Applied AI branch.
- Windows executable FileVersion and ProductVersion are 0.5.0.0.

## Version 0.4.0 release checks

- TypeScript, ESLint, all 16 unit tests and production bundling passed.
- Browser checks passed for first-run display, English/Spanish, back navigation, draft resume, input validation, simulated save failure/retry, completion persistence, skip, replay/cancel and older saved workspaces.
- Setup does not change skill states, project deliverables or personal notes. Recommendations respect prerequisites.
- Spanish screenshots were reviewed at 1510×980 and 1100×720. The packaged Windows app passed real file persistence, restart, Spanish language, keyboard navigation and light-theme checks using isolated test data.

## Version 0.3.0 release checks

- TypeScript and ESLint passed.
- Twelve tests passed, including complete Spanish curriculum coverage, preservation of custom content and canonical backup data, dynamic-message translation and accent-insensitive search.
- Browser interaction checks passed for immediate language switching, localized competency objectives, Spanish search, canonical dropdown values, unchanged workspace data when switching language, persistence after reload and all navigation views.
- Spanish screenshots were inspected at 1510×980 and 1100×800. External resource names and the brand descriptor intentionally retain their original names.
- The packaged 0.3.0 application launched on Windows and switched to Spanish through its native interface. The personal roadmap file retained its original SHA-256 hash.
- Production frontend bundling and Windows packaging passed; executable metadata reports 0.3.0.0. The Windows ZIP passed archive integrity verification. Existing roadmap resizing tests cover mouse, keyboard, stable panel width and preference persistence.

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
