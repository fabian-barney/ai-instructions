# Contributing

Keep changes focused on the boundary defined in [spec.md](spec.md):
`ai-instructions` is the tiny downstream bootstrap layer, not a second global
rule catalog.

## Local Checks

- Use Node.js 24 LTS for local checks; the technical minimum remains Node.js 20.
- Run `npm run validate`.
- Run `npm test`.

## Setup

- Follow the downstream install and update flow in [docs/setup.md](docs/setup.md).
- Do not self-host downstream `ai/PROJECT` or `ai/AI-INSTRUCTIONS` trees in
  this repository.

## Pull Requests

- Keep each branch and PR focused on one issue or one tightly scoped change.
- Link the issue in the PR body.
- Make sure validation and tests pass before asking for merge.

## Repository Boundaries

- Put reusable behavior in `ai-skills`, not here.
- Treat `ai-rules` as legacy reference material, not a model for expanding this
  repository.
