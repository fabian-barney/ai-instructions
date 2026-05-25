# v0.1.0 Release Checklist

Use this checklist before tagging the first release.

## Validation

- Run `npm run validate`.
- Confirm there is no root-level `ai/PROJECT` directory in this repository.
- Confirm no `GEMINI.md` template or docs contract exists.
- Confirm `templates/downstream/ai/PROJECT/SKILLS.json` parses as manifest
  version `1`.
- Confirm all downstream project Markdown templates are reachable from
  `templates/downstream/ai/PROJECT/AI.md`.
- Confirm docs do not copy large `ai-rules` topic trees or reusable
  `ai-skills` behavior.

## Downstream Rehearsal

In a temporary git repository:

```bash
git init
git commit --allow-empty -m "Initial commit"
git subtree add --prefix "ai/AI-INSTRUCTIONS" https://github.com/fabian-barney/ai-instructions.git <REF> --squash
```

Then copy templates as described in [setup.md](setup.md), verify all referenced
paths exist, and commit the result.

## Update Rehearsal

In the same temporary repository, rehearse:

```bash
git subtree pull --prefix "ai/AI-INSTRUCTIONS" https://github.com/fabian-barney/ai-instructions.git <REF> --squash
```

## Release

- Update [CHANGELOG.md](../CHANGELOG.md).
- Update `package.json` `version` to `0.1.0` in the same release-preparation
  change.
- Tag the release as `v0.1.0`.
- Push the tag after validation and rehearsal pass.
