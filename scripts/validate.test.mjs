import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  markdownLinks,
  normalizeLink,
  parseSkillsManifest,
  shouldDescend,
  validateRepository,
  validateSkillsManifestObject,
  walk
} from './validate-lib.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('parseSkillsManifest parses the example manifest', () => {
  const manifest = parseSkillsManifest(`{
  "version": 1,
  "active_profile": "default",
  "profiles": {
    "default": {
      "disabled": []
    }
  }
}`);

  assert.deepEqual(manifest, {
    version: 1,
    active_profile: 'default',
    profiles: {
      default: {
        disabled: []
      }
    }
  });
});

test('parseSkillsManifest reports line and column for invalid JSON', () => {
  assert.throws(
    () =>
      parseSkillsManifest(`{
  "version": 1,
  "active_profile":
}`),
    /line 4, column 1/
  );
});

test('validateSkillsManifestObject accepts the example manifest', () => {
  const errors = validateSkillsManifestObject({
    version: 1,
    active_profile: 'default',
    profiles: {
      default: {
        disabled: []
      }
    }
  });

  assert.deepEqual(errors, []);
});

test('validateSkillsManifestObject rejects malformed profile data', () => {
  const errors = validateSkillsManifestObject({
    version: 1,
    active_profile: 'default',
    profiles: {
      Default: {
        disabled: ['bad_skill']
      }
    }
  });

  assert.ok(errors.includes('SKILLS.json active_profile must exist in profiles.'));
  assert.ok(errors.includes('Profile name must use lowercase letters, numbers, and hyphens only: Default.'));
  assert.ok(errors.includes('Profile Default has invalid disabled identifier bad_skill.'));
});

test('normalizeLink handles relative, escaped, absolute, and fragment-only targets', () => {
  assert.deepEqual(normalizeLink('docs/example.md', '../README.md'), { path: 'README.md' });
  assert.deepEqual(normalizeLink('docs/example.md', '..\\README.md'), { path: 'README.md' });
  assert.equal(normalizeLink('docs/example.md', 'https://example.com'), null);
  assert.equal(normalizeLink('docs/example.md', '#fragment'), null);
  assert.deepEqual(normalizeLink('docs/example.md', '../../escape.md'), {
    error: 'Link target escapes the repository root: ../../escape.md'
  });
});

test('markdownLinks extracts inline and reference links while skipping images', () => {
  const links = markdownLinks(`
[inline](./one.md)
[paren](./two(test).md)
[ref][alpha]
![image](./ignored.png)

[alpha]: ./three.md
`);

  assert.deepEqual(links, ['./one.md', './two(test).md', './three.md']);
});

test('shouldDescend keeps .github and skips hidden/build directories', () => {
  assert.equal(shouldDescend('.github'), true);
  assert.equal(shouldDescend('.vscode'), false);
  assert.equal(shouldDescend('dist'), false);
  assert.equal(shouldDescend('docs'), true);
});

test('walk respects descent rules', () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-instructions-walk-'));
  try {
    fs.mkdirSync(path.join(fixtureRoot, '.github'), { recursive: true });
    fs.mkdirSync(path.join(fixtureRoot, '.vscode'), { recursive: true });
    fs.mkdirSync(path.join(fixtureRoot, 'dist'), { recursive: true });
    fs.mkdirSync(path.join(fixtureRoot, 'docs'), { recursive: true });
    fs.writeFileSync(path.join(fixtureRoot, '.github', 'kept.md'), '# kept\n');
    fs.writeFileSync(path.join(fixtureRoot, '.vscode', 'ignored.md'), '# ignored\n');
    fs.writeFileSync(path.join(fixtureRoot, 'dist', 'ignored.md'), '# ignored\n');
    fs.writeFileSync(path.join(fixtureRoot, 'docs', 'kept.md'), '# kept\n');

    const files = walk(fixtureRoot, '.', candidate => candidate.endsWith('.md'));
    assert.deepEqual(files, ['.github/kept.md', 'docs/kept.md']);
  } finally {
    fs.rmSync(fixtureRoot, { force: true, recursive: true });
  }
});

test('validateRepository passes on the repository root', () => {
  assert.deepEqual(validateRepository(repoRoot), []);
});
