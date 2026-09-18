# Noryum identity

- Application name: **Noryum**.
- Brand descriptor: **Intelligent Business Engineering**.
- Full project name: **Noryum - Intelligent Business Engineering**.
- Package identifier: `noryum-intelligent-business-engineering`.
- Windows executable: `Noryum.exe`.
- Windows application identity: `com.noryum.desktop`.

The supplied PNG is preserved unmodified in `assets/icon.png`. `assets/icon.ico` contains 16, 24, 32, 48, 64, 128 and 256 pixel representations. The executable icon, native window, header, loading screen and favicon use this identity. Build assets are self-contained and do not depend on the original Downloads file.

Packaging embeds the icon and Windows version metadata through `scripts/brand-executable.mjs`. The distribution remains unsigned.

## Compatibility

The legacy `%APPDATA%/career-roadmap` directory, `roadmap.json` filename and browser localStorage key are retained deliberately. Existing progress and backups remain compatible. New exports are named `noryum-backup.json`. Both `NORYUM_DATA_DIR` and the previous `CAREER_DATA_DIR` override are supported.

Existing pinned shortcuts pointing at the old executable should be replaced with a pin to `Noryum.exe`.

## Verification

- Strict type checking, lint, nine existing tests and the production build passed.
- Executable metadata reports Noryum, the full brand descriptor, version 0.2.0 and original filename Noryum.exe.
- The embedded ICO was extracted and its largest representation verified pixel-identical to the source ICO. All seven sizes are present.
- Noryum launched successfully on Windows; its title-bar icon and in-app branding were visually verified.
- The saved roadmap file had the same SHA-256 hash before and after the rebrand launch.
