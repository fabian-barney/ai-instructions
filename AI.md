# AI Instructions

This file is the shared downstream entrypoint for repositories that install
`ai-instructions` at `ai/AI-INSTRUCTIONS`.

## Read Order

When working in a downstream repository:

1. Read this file.
2. Read `ai/PROJECT/AI.md` if it exists.
3. Read `ai/PROJECT/SKILLS.yml` if it exists.
4. Follow project-owned ADRs, lessons learned, and specs linked from
   `ai/PROJECT/AI.md`.

## Responsibilities

- Keep reusable behavior in shared reusable skill catalogs or instruction
  libraries.
- Keep project-owned context in `ai/PROJECT`.
- Use `ai/PROJECT/SKILLS.yml` to identify the active skill profile.
- Treat `ai/PROJECT/DECISIONS` as the downstream ADR area.
- Treat `ai/PROJECT/LESSONS_LEARNED` as the downstream project learning area.
- Treat `ai/PROJECT/SPECS` as the downstream AI-driven development specs area.

## Skill Profile Semantics

For the active profile in `ai/PROJECT/SKILLS.yml`:

- `disabled` lists skills that should not be used unless the user explicitly
  asks for them.
- unlisted skills remain available by default.

This file does not install or define those skills. It only points agents at the
downstream project's selection.

## Boundary

Do not copy global conventions, correctness checks, review workflows, release
workflows, or other reusable behavior into the downstream project. Prefer
referencing existing shared reusable behavior and keep only project-specific
context in `ai/PROJECT`.
