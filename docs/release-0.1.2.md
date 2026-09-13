# Noryum 0.1.2

## Changes

- Added an animated sun/moon button in the top-right header to switch themes and save the preference.
- Introduced an astral dark palette with violet, cyan, and mint accents.
- Fixed dark text inherited from the light theme. Improved secondary text, card boundaries, icons, focus indicators, and button contrast.
- Restored English project documentation and removed GitHub publication instructions from the README. The application interface remains in Spanish.
- Updated application and installer version metadata to 0.1.2.

## Validation and distribution limits

The renderer build passed. Calculated dark-theme contrast is 14.65:1 for primary text, 8.16:1 for secondary text, and 3.48:1 for control borders against their designated surfaces.

The local standalone application's renderer was updated during development. Automated Electron launch was blocked by a `spawn EPERM` error in this environment. A new 0.1.2 installer has not been built or verified; the initial 0.1.0 validation report and artifact hashes remain historical evidence only.
