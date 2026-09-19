# Security policy

## Supported version

Security reports are currently assessed against version 0.4.0. Older releases are retained for reference; no maintenance commitment is made for them.

## Reporting a vulnerability

Use the repository's **Security → Report a vulnerability** option when available. Do not publish exploit details, credentials or personal backups in public issues. If private reporting is unavailable, open an issue requesting a private reporting channel without including sensitive details.

Describe the affected version, impact and minimal reproduction steps using synthetic data. There is no guaranteed response or remediation timeline.

## Data and boundaries

Noryum stores workspace data locally. JSON backups and local data are not encrypted. External resource links open in the system browser. The renderer is sandboxed, uses context isolation and has no Node.js access; desktop persistence goes through a narrow preload bridge.

The Windows release is unsigned and has no automatic updater. Download releases from this repository. Keep backups, and do not import untrusted files containing private or misleading evidence.
