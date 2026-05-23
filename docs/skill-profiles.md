# Skill Profiles

Downstream repositories use `ai/PROJECT/SKILLS.yml` to describe which shared
`ai-skills` should be default candidates for AI-agent work.

## Manifest Shape

```yaml
version: 1
active_profile: default
profiles:
  default:
    enabled:
      - ai-skills-plan
    disabled: []
```

## Semantics

- `version` is the manifest version. v0.1.0 supports only `1`.
- `active_profile` names the profile agents should use by default.
- `profiles` contains named profile definitions.
- `enabled` lists skills that should be considered default candidates.
- `disabled` lists skills that should not be used unless the user explicitly
  asks for them.

Skill ids should be canonical `ai-skills-*` names.

## Limits

`SKILLS.yml` is intentionally lightweight. It does not:

- install skills
- validate whether skills exist
- resolve dependencies
- execute profiles
- override explicit user instructions

Agents should treat the manifest as project-owned guidance for choosing
available skills.
