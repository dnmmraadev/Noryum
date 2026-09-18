# Contributing

Thank you for helping improve Noryum. Read the [license](LICENSE) before reusing or distributing code or assets; this repository is not released under an open-source license.

## Bugs and ideas

Search existing issues first. For a bug, include the application version, Windows version, steps to reproduce, expected behavior and actual behavior. Use a small synthetic example. Remove private notes, paths, tokens and evidence links from screenshots and attachments. For a feature request, explain the user problem and an example workflow.

## Development changes

Discuss substantial changes in an issue before implementation. Keep changes focused, follow the existing architecture, and write code, UI copy and documentation in English. Preserve stable competency IDs and backup compatibility. Follow the setup in [Development](docs/DEVELOPMENT.md).

Before submitting a pull request, run:

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Include the problem solved, a brief description of the resulting behavior, checks performed and screenshots for visible changes. Add meaningful tests for behavior changes. Do not commit personal data, build outputs, credentials or node_modules.

Be respectful, specific and constructive. Maintainers decide whether to accept contributions; submitting a change does not expand the license permissions.
