# Versioning and local organization

Noryum follows a documented convention inspired by [Semantic Versioning 2.0.0](https://semver.org/). Semantic Versioning describes public API compatibility; Noryum also applies the convention to user-facing features and its supported backup format. Versions below 1.0 indicate initial development, not a stable public API.

## Selecting a version before publishing

- **0.MINOR.0:** a release with new user-visible functionality, including compatible additions.
- **0.MINOR.PATCH:** a release limited to compatible bug fixes and small corrections.
- **1.0.0:** a deliberate stability milestone with an explicitly supported compatibility contract; not an automatic consequence of adding features.
- **Pre-release suffixes:** use `-alpha.1`, `-beta.1` or `-rc.1` only when intentionally distributing an incomplete preview. Do not call a preview a stable release.

Before every GitHub push for a release, inspect the latest published tag, summarize changes since it and determine the next version. Ask the owner when the scope or intended milestone is ambiguous. Keep package.json, package-lock.json, Windows metadata, UI version, release tag, archive filenames and release notes consistent.

Never change files or overwrite assets under an already published version. Publish corrected artifacts under a new version. GitHub Releases associate a tag with release notes and downloadable binaries; see [GitHub's release documentation](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases).

## Why this release is 0.5.0

The last published release is 0.4.0. This release adds a researched Context Engineering competency and compatible curriculum updates for existing workspaces. This expands the learning functionality, so the next minor version is 0.5.0. Existing releases are not overwritten.

The JSON backup schema stays at **version 1**. The optional setup and curriculum revision fields allow older backups to remain valid. Curriculum upgrades preserve personal records; see the context engineering guide for custom-graph exceptions. Backup schema versions are independent of application release numbers. Language and map height are device preferences and do not change the backup contract. Existing 0.2.0/Career Roadmap data remains supported; migration from the older Noryum 0.1.x implementation is still unverified.

## Local layout

```text
Noryum/
  README.md                  Local inventory and launch instructions
  source/                    Current Git checkout and development dependencies
  releases/
    0.2.0/                   Published 0.2.0 files, kept unchanged
    0.3.0/                   Previous published release
    0.4.0/                   Previous published release
    0.5.0/                   Current version's Windows folder, ZIP and checksums
  builds/
    0.5.0/                   Screenshots and verification artifacts
  archive/                   Clearly labeled historical and unpublished builds
```

The archive distinguishes the original Career Roadmap build, the earlier branding build whose executable reported 1.1.0, and the post-0.2.0 roadmap preview. Those local labels describe provenance; they do not invent GitHub releases. The original files are retained.

Normal `npm run package` output is `source/release/<version>/Noryum/`. Set `NORYUM_PACKAGE_DIR` to the appropriate local `releases/<version>/Noryum` directory when maintaining the layout above. The runnable folder must retain all Electron runtime files. User data remains outside these folders in the existing application data directory.
