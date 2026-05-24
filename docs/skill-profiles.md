# Skill Profiles

Downstream repositories use `ai/PROJECT/SKILLS.yml` to describe which reusable
skills or capabilities should be disabled for AI-agent work.

## Manifest Shape

```yaml
version: 1
active_profile: default
profiles:
  default:
    disabled: []
```

## Semantics

- `version` is the manifest version. v0.1.0 supports only `1`.
- `active_profile` names the profile agents should use by default.
- `profiles` contains named profile definitions.
- `disabled` lists skills that should not be used unless the user explicitly
  asks for them.
- unlisted skills remain available by default.

Disabled identifiers must:

- use lowercase letters, numbers, and hyphens only
- be between 1 and 64 characters
- not start or end with `-`

## Limits

`SKILLS.yml` is intentionally lightweight. It does not:

- install skills
- validate whether skills exist
- resolve dependencies
- execute profiles
- override explicit user instructions

Agents should treat the manifest as project-owned guidance for choosing
available skills.
