# Data Model And Calculations

SQLite stores relational tables and foreign keys. `schema_migrations` records versions; each migration either commits completely or rolls back completely. An unknown future version blocks startup to avoid incompatible writes. `preferences` is a single record. There are no accounts and no demo data.

## Entities

- `templates` -> `routines`: recurring template and occurrence with civil date, planned time, and real completion instant. The template declares a start date and weekdays represented by JavaScript values, where Sunday is 0 and Monday is 1. Only this small weekday set is serialized as JSON; records are not JSON blobs. A unique constraint prevents duplicates per template/date. `routine_exclusions` prevents a deleted occurrence from reappearing.
- `checkins`: multiple observations per day, recording instant, four ordinal 1-5 scales, and `scaleVersion=1`. These are not a clinical instrument or diagnosis.
- `sleep`: one primary episode per wake date; intended bedtime, real bedtime, optional estimated sleep start, wake time, and optional subjective quality.
- `activities`: type, minutes, and perceived intensity from 1 to 5.
- `programs` -> `subjects` -> `modules`: learning structure. `study` references a program and optionally a subject/module that belongs to it; it stores time and described output. Completing a module marks content progress, not mastery or retention.
- `leisure`: category, description, minutes, and declared intentionality.
- `reviews`: one reflection per Monday, covering what worked, what was difficult, and the next adjustment.

## Dates, Recurrence, And Editing

Civil dates, `YYYY-MM-DD`, group records for the selected day. For sleep, the backend requires that date to match the wake time converted to the system local timezone; it accepts UTC instants sent by the UI. Duplicate sleep creation is rejected without overwriting data; editing requires the explicit record ID. Planned `HH:mm` times are local. Real instants include UTC/offset information; sleep differences use real elapsed time and respect DST changes. Check-ins are sorted by real instant, not by the textual offset representation. Civil-day arithmetic uses UTC noon rather than adding 24 hours to local instants.

When a day is queried, Noryum materializes that Monday-Sunday week and the previous one, respecting each template start date. This gives comparable two-week plans without creating years of future rows. Reopening a date does not duplicate occurrences or erase completions. Editing a template transactionally updates title, time, and note for pending occurrences from today onward, and removes occurrences that no longer match its days or start date. Deactivating a template removes those pending plans and stops new generation. Past occurrences, completed occurrences, and individual deletion exclusions are preserved. Deleting the template preserves historical occurrences. Editing/deleting an occurrence affects only that date. MVP limitation: querying a historical week that was never materialized generates plans from the template's current definition; historical template versioning does not exist yet.

The repository validates data again at the IPC boundary, uses parameterized queries, and limits operation types. Logged durations: 1-1440 minutes. Sleep: greater than zero and up to 24 hours, with sleep start between bedtime and wake time. Timestamps without timezone are rejected. Backup uses `node:sqlite.backup` to produce a consistent copy even with WAL. Restore/import is not part of this milestone's UI.

## Metric Definitions

- Estimated sleep = wake time minus estimated sleep start, or wake time minus bedtime when sleep start is unknown. That fallback estimates time in bed; it does not physiologically measure sleep. Average and population standard deviation are computed from available durations; variability requires at least two episodes.
- Energy/mood/stress/concentration = average within each day, then average across observed days, avoiding extra weight for days with many check-ins. Because these are ordinal scales, the averages are approximate descriptive summaries.
- Routine completion = completed / planned * 100. With no plans, the result is missing, not zero.
- Study = sum of minutes. Outputs = sessions with an output description; this is not a validated count of exercises or demonstrated learning.
- Activity = sum of minutes, sessions, and distinct recorded dates.
- Intentional leisure = minutes declared intentional / recorded leisure minutes. It is not compared to a moral ideal or the whole day.
- Week = Monday-Sunday. For the selected week through a selected day, the previous comparison uses exactly the same weekdays; both coverages are included in the metrics. No comparison implies causality.
- Missing data: averages with no observations return `null`. Record sums return 0; this means nothing was recorded, not proof that the behavior did not happen. Sleep and check-ins include observed-day counts.

`src/domain/analytics.ts` contains pure calculations. `tests/data.test.ts` covers restart, SQLite backup, migration failure, recurrence/deletion, validation, hierarchy, year boundaries, leap years, DST, missing data, and equivalent weekly comparisons.
