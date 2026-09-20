# User guide

## Guided setup

New workspaces begin with an optional three-step guide. Select your language, an area to explore and the time you can dedicate. The last screen recommends an available skill and opens its details after saving. You can go back, skip or resume after closing. Existing users can open **Settings → Open guided setup** (Spanish: **Configuración → Abrir configuración guiada**). Reopening does not reset learning records.

New workspaces default to one hour per day, five days per week. Your existing pace is preserved on upgrade. See [Guided setup](ONBOARDING.md) for recovery and persistence details.

## Your first session

1. Open Roadmap and choose a competency.
2. Review its prerequisites and practical evidence.
3. Set its state to Learning and add notes or resources.
4. Use Study plan to find your next available work.
5. Complete project deliverables and review checkpoint readiness.
6. Export a backup from Settings regularly.

## Progress and evidence rules

- Overall and branch progress count only **Competent** competencies. Skipped items remain in the denominator.
- **Skipped** resolves a prerequisite for study planning, but never counts as mastered evidence for employability.
- A project counts toward a checkpoint only when its status is **Competent** and all deliverables are checked.
- Checkpoint readiness includes the complete prerequisite closure and required projects. Competency declarations and actual project deliverables are checked separately.
- Study queues use readiness, active learning/practice, priority and a stable alphabetical tie-breaker. Prerequisites never prevent opening or updating a competency.
- Completed hours mean the estimated workload of mastered competencies, not recorded timer sessions. Remaining hours sum unresolved estimates. Checkpoint remaining weeks include unmastered competencies; extra project work and interviews may take longer.
- Initial cumulative checkpoint ranges are reference estimates, not promises. Dynamic remaining estimates use the configured weekly pace. No readiness label guarantees employment.

## Local data, recovery and backups

Desktop data is normally stored in `%APPDATA%/career-roadmap/roadmap.json`. This legacy directory is intentionally retained after the Noryum rebrand to preserve existing progress. The browser also retains its legacy localStorage key. Electron manages the directory. Writes are serialized and use a temporary file followed by replacement. The application waits for queued writes when quitting and prevents concurrent instances. A failed load does not overwrite the original file. A failed write displays an error; export a backup before closing.

Backups are readable JSON containing `version`, competencies, states, estimates, priorities, dependencies, resources, notes, projects, settings and recent activity. Progress is derived from that information, avoiding conflicting stored totals. Import enforces a 5 MB limit, schema validation, reference validation, unique IDs and acyclic dependencies before presenting a replacement confirmation. Built-in checkpoint roots and projects must be present.

Reset progress clears competency/project states, deliverable checks and project dates. It preserves notes, links, resources, custom competencies and study settings. Export first if you want to preserve your progress history. JSON files are not encrypted; store backups appropriately.

For isolated testing, set the `NORYUM_DATA_DIR` environment variable (the legacy `CAREER_DATA_DIR` is also supported) to a separate absolute directory before launching the executable. This keeps test progress separate from the normal workspace.

## Offline learning

The app itself makes no cloud or AI calls and includes no telemetry. Linked learning pages may require connectivity. Some vendor tools covered by the roadmap have licensing requirements; local alternatives, sample datasets, mocked services and local model adapters can be used to demonstrate the relevant competencies without paid APIs.

## Current scope

This is a single-user local application. It has no sync, login, publishing service, automatic skills assessment, background scheduler, time tracker or updater. Evidence files are referenced by links/notes, not copied into backups. Custom competencies can be deleted; built-in competencies can be edited or skipped. The full map is intentionally larger than the viewport: use pan, minimap, branch filters and checkpoint paths to focus it.

## Roadmap workspace

The competency details panel stays visible on the Roadmap. Before selecting a competency, it shows mastery progress, the next checkpoint and suggested skills. Clear the selection to return to that overview without changing the map width.

Drag the bar below the map to resize it vertically between 320 and 1400 pixels. Focus the bar and use Up/Down arrows for 40-pixel adjustments, or Home/End for minimum/maximum height. The height is remembered on this device separately from exported roadmap data.

## Language

Open **Settings → Interface language** and choose **English** or **Español (Latinoamérica)**. In Spanish, this is **Configuración → Idioma de la interfaz**. Changes apply immediately to navigation, forms, built-in competency content, projects and checkpoints. Search accepts both original and localized competency names and ignores accents.

The language preference is saved on this device separately from workspace backups, like the map height. Switching languages does not rewrite notes, URLs, custom competencies, edited curriculum text or progress. Built-in content is translated only while its original text remains unchanged. External resource pages retain their own language.

The application version appears at the bottom of the sidebar. Check it before reporting an issue or choosing a download.

## Context engineering

In Roadmap, search for **Context Engineering** (Spanish: **Ingeniería de contexto**) in Applied AI. Study Prompt Engineering, RAG Fundamentals, AI Evaluation and Tool / Function Calling first. The unit includes an estimated 24 hours of practice, eight mastery criteria and six source resources. Attach the policy-assistant assignment to the AI Automation project. See the [research and assignment guide](CONTEXT_ENGINEERING.md).

Version 0.5.0 adds this unit when loading or importing older standard workspaces, without resetting personal records. Customized prerequisite lists remain intact. Your completion percentage can change because the curriculum has expanded.
