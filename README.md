# ai-instructions

Tiny downstream AI instruction layer for repositories that use shared
`ai-skills`.

`ai-instructions` is installed into downstream repositories, typically as a git
subtree under `ai/AI-INSTRUCTIONS`. It provides a small shared entrypoint,
templates for common AI agent entrypoints, and conventions for project-owned AI
context under `ai/PROJECT`.

It intentionally does not contain reusable engineering rules. Reusable behavior
belongs in [`ai-skills`](https://github.com/fabian-barney/ai-skills).

## Supported Consumers

- Codex via `AGENTS.md`
- Claude via `CLAUDE.md`
- GitHub Copilot via `.github/copilot-instructions.md`

## Downstream Layout

```text
AGENTS.md
CLAUDE.md
.github/copilot-instructions.md
ai/
|-- AI-INSTRUCTIONS/
|   `-- AI.md
`-- PROJECT/
    |-- AI.md
    |-- SKILLS.yml
    |-- DECISIONS/
    |-- LESSONS_LEARNED/
    `-- SPECS/
```

The files under `ai/PROJECT` are owned by the downstream project. This
repository does not self-host that layout for itself.

## Setup

See [docs/setup.md](docs/setup.md) for tracked git subtree setup and update
commands.

## Project Contract

- [spec.md](spec.md) is the authoritative contract for this repository.
- [docs/downstream-contract.md](docs/downstream-contract.md) defines the
  downstream file layout.
- [docs/skill-profiles.md](docs/skill-profiles.md) defines the lightweight
  `SKILLS.yml` profile manifest.

## Validation

Requires Node.js 20 or newer. There are no package dependencies to install for
the current validator.

Run:

```bash
npm run validate
```
