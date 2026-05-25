# ai-instructions Specification

## Purpose

`ai-instructions` is the tiny installable instruction layer for downstream
repositories.

It exists to:

- provide a minimal downstream bootstrap layer
- keep downstream repositories small and mostly project-owned
- point downstream repositories at centralized reusable behavior in
  `ai-skills`
- define where downstream AI context, ADRs, lessons learned, and development
  specs live
- avoid duplicating global conventions, checks, and workflows in every
  repository

`ai-instructions` is intentionally small. Reusable behavior belongs in
`ai-skills`, not here.

## Responsibility Boundaries

The repository boundaries are normative:

- `ai-skills`: canonical reusable behavior and skill definitions
- `ai-instructions`: tiny repo-installed bootstrap and context wiring layer
- downstream repository local files: project-owned AI context, ADRs, lessons
  learned, specs, and repo-specific exceptions
- `ai-rules`: legacy source of prior broad rule material, not the shape of this
  project

`ai-instructions` must not become a second global rule catalog. Its role is to
connect a downstream repository to centralized reusable behavior while leaving
project-owned context in the downstream repository itself.

## No Self-Hosting

The `ai-instructions` repository must not install or use its own downstream
contract for itself.

This repository must not contain a root-level downstream self-context tree such
as:

```text
ai/PROJECT/
```

Repository-internal rationale, future-development notes, and release-scope
decisions belong in this `spec.md` file and normal repository documentation, not
in downstream-style ADR, lessons learned, or specs directories.

Downstream-facing examples and starter files may exist only as templates under
`templates/downstream/`. Those templates are not active instructions for this
repository.

## Supported Consumers

v0.1.0 supports these common AI agent entrypoints:

- Codex: `AGENTS.md`
- Claude: `CLAUDE.md`
- GitHub Copilot: `.github/copilot-instructions.md`

No Gemini entrypoint is part of v0.1.0.

## Downstream Install Contract

The supported v0.1.0 delivery model is tracked git subtree installation.

The default downstream shared path is:

```text
ai/AI-INSTRUCTIONS/
```

The downstream project-owned path is:

```text
ai/PROJECT/
```

The shared entrypoint installed from this repository is:

```text
ai/AI-INSTRUCTIONS/AI.md
```

Root entrypoint files in the downstream repository must point to that shared
entrypoint. They must not duplicate the shared instruction body.

v0.1.0 does not provide an npm package, CLI installer, local-only install mode,
or runtime resolver.

## Downstream Project Context

Downstream project-owned context lives under `ai/PROJECT/` and is outside the
vendored `ai/AI-INSTRUCTIONS/` subtree.

Required or recommended downstream files are:

```text
ai/PROJECT/AI.md
ai/PROJECT/SKILLS.json
ai/PROJECT/DECISIONS/DECISIONS.md
ai/PROJECT/LESSONS_LEARNED/LESSONS_LEARNED.md
ai/PROJECT/SPECS/SPECS.md
```

Their roles are:

- `AI.md`: local project context index for agents
- `SKILLS.json`: lightweight profile selection for reusable skills or
  capabilities
- `DECISIONS/`: downstream architecture decision records
- `LESSONS_LEARNED/`: downstream recurring lessons and project experience
- `SPECS/`: downstream specs for AI-agent-driven development work

Every Markdown file under `ai/PROJECT/` should be transitively reachable from
`ai/PROJECT/AI.md`.

## Lightweight Skill Profiles

Downstream repositories select reusable skills through `ai/PROJECT/SKILLS.json`.

The v0.1.0 manifest shape is:

```json
{
  "version": 1,
  "active_profile": "default",
  "profiles": {
    "default": {
      "disabled": []
    }
  }
}
```

Rules:

- the active profile names the profile agents should apply by default
- each profile defines only `disabled`
- `disabled` lists skills agents must not use unless the user explicitly asks
  for them
- disabled identifiers must:
  - use lowercase letters, numbers, and hyphens only
  - be between 1 and 64 characters
  - not start or end with `-`
- missing or unknown skills are not installed by `ai-instructions`

This is an agent-readable manifest, not a resolver engine. It does not install
skills, validate their existence, or execute profiles.

## Relationship to `ai-skills`

`ai-instructions` depends conceptually on `ai-skills`, but it does not own the
reusable behavior itself.

The relationship is:

- `ai-skills` defines reusable behavior
- `ai-instructions` makes that behavior discoverable from downstream
  repositories
- downstream local files add project-owned context only

`ai-instructions` must prefer references to skills over copied rule text.

## Repository Structure

This repository should stay structurally small.

Allowed repository-level artifacts include:

- `AI.md` as the shared downstream instruction entrypoint
- `README.md`
- `spec.md`
- concise docs under `docs/`
- downstream starter files under `templates/downstream/`
- validation helpers under `scripts/`
- release notes and changelog files

The repository must not introduce a large topic tree comparable to `ai-rules`.

## Development Notes

Future development should preserve these choices unless `spec.md` is updated
first:

- keep `ai/AI-INSTRUCTIONS` visible rather than hidden so subtree updates and
  reviews are easy to inspect
- keep project-owned downstream context outside the vendored subtree
- keep supported consumers limited to Codex, Claude, and GitHub Copilot until a
  concrete downstream need justifies another target
- keep profile selection lightweight until multiple real downstream projects
  need a stronger schema or tooling
- keep this repository from self-hosting downstream `ai/PROJECT` content

## Non-Goals for v0.1.0

v0.1.0 does not include:

- a large vendored baseline tree
- duplicated global rule content from `ai-skills`
- a replacement copy of `ai-rules`
- a user-facing migration guide
- a first-class profile resolver or validation engine
- an npm package or CLI installer
- local-only installation mode
- Gemini support
- self-hosted `ai/PROJECT` content in this repository
