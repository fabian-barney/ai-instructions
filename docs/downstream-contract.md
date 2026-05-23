# Downstream Contract

This document defines the v0.1.0 downstream file contract for repositories that
install `ai-instructions`.

## Install Paths

Install the shared instruction layer at:

```text
ai/AI-INSTRUCTIONS/
```

Keep project-owned AI context at:

```text
ai/PROJECT/
```

The shared subtree must remain replaceable. Do not put project-owned notes,
ADRs, lessons learned, or specs under `ai/AI-INSTRUCTIONS`.

## Root Entrypoints

Downstream repositories may create these root-level files from the templates:

```text
AGENTS.md
CLAUDE.md
.github/copilot-instructions.md
```

Each root entrypoint must point to:

```text
ai/AI-INSTRUCTIONS/AI.md
```

No Gemini entrypoint is part of v0.1.0.

## Project-Owned Files

The downstream project context should use this structure:

```text
ai/PROJECT/
|-- AI.md
|-- SKILLS.yml
|-- DECISIONS/
|   |-- DECISIONS.md
|   `-- ADR-0001-template.md
|-- LESSONS_LEARNED/
|   |-- LESSONS_LEARNED.md
|   `-- YYYY-MM-DD-template.md
`-- SPECS/
    |-- SPECS.md
    `-- SPEC-0001-template.md
```

`ai/PROJECT/AI.md` is the local project index. Every Markdown file under
`ai/PROJECT` should be reachable by following Markdown links from that file.

## Ownership Rules

- `ai/AI-INSTRUCTIONS` is package-owned and updateable by subtree pull.
- `ai/PROJECT` is downstream-owned and must not be overwritten by
  `ai-instructions` updates.
- Root entrypoint files are downstream-owned pointers to the shared entrypoint.
- Reusable behavior belongs in `ai-skills`, not in this repository and not in
  downstream project context.
