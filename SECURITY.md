# Security

Noryum is a local-first Windows desktop application. It stores personal records in SQLite under the current Windows user profile and does not require an account, cloud service, API key, or external integration.

## Supported Version

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |

## Data Handling

- The production app starts with an empty database.
- Personal data stays on the local machine unless the user manually exports or copies it.
- Backups created from Ajustes include personal records and are not encrypted by this MVP.
- Test and QA databases are excluded from the repository and distribution package.

## Known Limits

- Windows binaries are unsigned in this milestone.
- There is no automatic update channel.
- Restore is manual.
- Local SQLite data is not encrypted by the application.

Before public distribution, verify installer install/update/uninstall behavior on a clean Windows profile, sign the executable, and define a responsible disclosure contact.
