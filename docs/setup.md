# Setup and Update

`ai-instructions` v0.1.0 supports tracked git subtree installation only.

## Paths

Use these paths in downstream repositories:

```text
AI_INSTRUCTIONS_PATH=ai/AI-INSTRUCTIONS
AI_PROJECT_PATH=ai/PROJECT
```

## Setup

Run setup from the downstream repository root.

1. Confirm the working tree is clean:

   ```bash
   git status --porcelain
   ```

   If there is output, commit or stash the current work before continuing.

2. Choose a ref.

   Prefer a tagged release:

   ```bash
   git ls-remote --refs --tags --sort="version:refname" https://github.com/fabian-barney/ai-instructions.git "v*"
   ```

   Use the latest `v*` tag when one exists. Use `main` only when explicitly
   testing unreleased work.

3. Add the subtree:

   ```bash
   git subtree add --prefix "ai/AI-INSTRUCTIONS" https://github.com/fabian-barney/ai-instructions.git <REF> --squash
   ```

4. Copy downstream templates from the installed subtree:

   ```bash
   cp ai/AI-INSTRUCTIONS/templates/downstream/AGENTS.md AGENTS.md
   cp ai/AI-INSTRUCTIONS/templates/downstream/CLAUDE.md CLAUDE.md
   mkdir -p .github
   cp ai/AI-INSTRUCTIONS/templates/downstream/.github/copilot-instructions.md .github/copilot-instructions.md
   mkdir -p ai/PROJECT
   cp -R ai/AI-INSTRUCTIONS/templates/downstream/ai/PROJECT/. ai/PROJECT/
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item ai/AI-INSTRUCTIONS/templates/downstream/AGENTS.md AGENTS.md
   Copy-Item ai/AI-INSTRUCTIONS/templates/downstream/CLAUDE.md CLAUDE.md
   New-Item -ItemType Directory -Force .github | Out-Null
   Copy-Item ai/AI-INSTRUCTIONS/templates/downstream/.github/copilot-instructions.md .github/copilot-instructions.md
   New-Item -ItemType Directory -Force ai/PROJECT | Out-Null
   Copy-Item ai/AI-INSTRUCTIONS/templates/downstream/ai/PROJECT/* ai/PROJECT/ -Recurse
   ```

5. Edit `ai/PROJECT/AI.md` and `ai/PROJECT/SKILLS.yml` for the downstream
   project.

6. Commit the subtree and downstream-owned files together or in separate
   commits according to the downstream repository's normal policy.

## Update

Run updates from the downstream repository root.

1. Confirm the working tree is clean:

   ```bash
   git status --porcelain
   ```

2. Choose the target ref with the same release-tag preference used for setup.

3. Pull the subtree:

   ```bash
   git subtree pull --prefix "ai/AI-INSTRUCTIONS" https://github.com/fabian-barney/ai-instructions.git <REF> --squash
   ```

4. Review template changes under `ai/AI-INSTRUCTIONS/templates/downstream/`.
   Apply them manually to downstream-owned root entrypoints or `ai/PROJECT`
   files only when the downstream project wants those changes.

## Non-Goals

v0.1.0 does not support:

- local-only installation
- an installer CLI
- automatic updates to `ai/PROJECT`
- generated entrypoints
- Gemini entrypoints
