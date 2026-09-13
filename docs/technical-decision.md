# Noryum Technical Decision / ADR-001

Date: 2026-09-12. Status: accepted for the first milestone.

## Interpretation And Scope

Noryum is a personal space for planning, recording, and understanding everyday life. The MVP brings together daily routines, sleep/activity/check-ins, study structure and sessions, intentional leisure, and weekly reflection. It uses real data, requires no account or connection, keeps the interface in Spanish, and does not produce a universal score.

## Evaluated Alternatives

| Option | Benefits For Noryum | Costs And Decision |
| --- | --- | --- |
| WPF + C# + SQLite | Native UI, mature ecosystem, strong Windows access, standalone publishing | Excellent Windows option; the SDK was absent on this machine and the visual/interactive layer would take more platform-specific work. |
| WinUI 3 + C# | Modern Microsoft-recommended platform, accessibility, and Windows integration | Windows App SDK and packaging add setup cost; slower path for this first milestone. |
| Tauri 2 + React + SQLite | System WebView, smaller distribution, Rust/UI separation | Requires Rust, C++ Build Tools, and WebView2; the required toolchains were not available. Maintaining two languages raises initial cost. |
| Electron + React + TypeScript + SQLite | One ecosystem, SVG graphics, typed IPC, real desktop testing, and direct Windows distribution | Includes Chromium/Node, increasing size and memory. This cost is accepted for maintainability, delivery speed, and UI coherence. |

## Decision

Use the available stable Electron version, React + TypeScript, Vite, and SQLite integrated through Node in the main process. React provides accessible components and controls; Svelte would reduce some code and Vue would also be viable, but neither offers a decisive advantage for this scope. SQLite avoids a service and supports relational aggregates; IndexedDB complicates inspectable backups and plain JSON weakens integrity and migrations. No remote backend is used.

## Architecture

React renderer -> limited preload API -> IPC handlers -> domain services -> SQLite repository. The renderer is isolated, sandboxed, has no Node access, and loads no remote content. Validation happens in the main process. Migrations are versioned and transactional. Pure calculations are separated. Local civil dates are used for grouping, and ISO timestamps with timezone are used for instants. Backups are consistent through the SQLite API. Initial data is empty; examples exist only in tests.

## Initial Model

Preferences; RoutineTemplate and RoutineOccurrence with date, planned time, and real instant; CheckIn with four answers and a note; SleepRecord with start, wake, estimate, target, and quality; ActivitySession; Program -> Subject -> Module; StudySession; LeisureSession; WeeklyReview. Foreign keys and date indexes are included. Experiments, complex goals, assessments, integrations, and encryption are postponed; IDs and dates allow them to be added through future migrations.

## Structure And Sequence

`desktop/` shell and preload; `src/domain/` types/calculations; `src/data/` SQLite and migrations; `src/ui/` components and pages; `tests/` persistence, metrics, and flows; `docs/` decisions and scope.

1. Define contracts, model, and migrations.
2. Implement storage and calculations with tests for dates, recurrence, and aggregation.
3. Build the shell and interface using the reference identity.
4. Connect the five flows and backup export.
5. Run the app, test restart persistence, and fix issues.
6. Package and inspect the Windows executable.

## Material Decisions And Risks

- Check-in: five levels with labeled endpoints, stable within the same scale version. Fewer options favor quick entry; 1-10 offers more apparent detail. This is a UX decision, not a validated clinical instrument. Store scale version, and do not produce medical diagnoses or thresholds.
- Averages: omit missing observations, never coerce them to zero, and show coverage. Compare equivalent calendar periods and label an in-progress week.
- Local SQLite does not encrypt the disk. Do not store secrets. Backups contain personal data; encryption is pending.
- Electron requires security updates and size/memory checks. If future resource budgets require it, reevaluate Tauri or WPF with measurements.
- The executable is unsigned for this milestone; publisher signing and commercial installation require a publisher identity/certificate.

## Sources Consulted

- [Windows App SDK](https://learn.microsoft.com/en-us/windows/apps/windows-app-sdk/) and [WPF](https://learn.microsoft.com/en-us/dotnet/desktop/wpf/overview/).
- [Tauri: Windows prerequisites](https://tauri.app/start/prerequisites/).
- [Electron: included architecture](https://www.electronjs.org/docs/latest) and [distribution](https://www.electronjs.org/docs/latest/tutorial/distribution-overview).
- [Node: SQLite](https://nodejs.org/api/sqlite.html).
- [EMA study on response burden and item refinement](https://www.jmir.org/2017/3/e77). This informed the low-friction criterion; it does not validate Noryum's four check-in questions.
