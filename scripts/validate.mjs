import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];

const requiredFiles = [
  'AI.md',
  'README.md',
  'spec.md',
  'docs/downstream-contract.md',
  'docs/setup.md',
  'docs/skill-profiles.md',
  'docs/release-v0.1.0.md',
  'templates/downstream/AGENTS.md',
  'templates/downstream/CLAUDE.md',
  'templates/downstream/.github/copilot-instructions.md',
  'templates/downstream/ai/PROJECT/AI.md',
  'templates/downstream/ai/PROJECT/SKILLS.json',
  'templates/downstream/ai/PROJECT/DECISIONS/DECISIONS.md',
  'templates/downstream/ai/PROJECT/DECISIONS/ADR-0001-template.md',
  'templates/downstream/ai/PROJECT/LESSONS_LEARNED/LESSONS_LEARNED.md',
  'templates/downstream/ai/PROJECT/LESSONS_LEARNED/YYYY-MM-DD-template.md',
  'templates/downstream/ai/PROJECT/SPECS/SPECS.md',
  'templates/downstream/ai/PROJECT/SPECS/SPEC-0001-template.md'
];

const forbiddenRootDirs = [
  'AI-RULES',
  'ARCHITECTURE',
  'BUILD_TOOLS',
  'CI-CD',
  'COMPLIANCE',
  'CORE',
  'DESIGN',
  'FRAMEWORK',
  'LANGUAGE',
  'LIBRARY',
  'PLAN',
  'PROGRAMMING',
  'REVIEW',
  'SECURITY',
  'TEST'
];

const disabledIdentifierPattern = /^[a-z0-9-]+$/;

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function walk(directory, predicate = () => true) {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) {
    return [];
  }

  const results = [];
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const absoluteEntry = path.join(absolute, entry.name);
    const relativeEntry = path.relative(root, absoluteEntry).replaceAll(path.sep, '/');
    if (entry.isDirectory()) {
      if (['.git', 'node_modules'].includes(entry.name)) {
        continue;
      }
      results.push(...walk(relativeEntry, predicate));
    } else if (predicate(relativeEntry)) {
      results.push(relativeEntry);
    }
  }
  return results.sort();
}

function childDirectories(directory) {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) {
    return [];
  }

  if (!fs.statSync(absolute).isDirectory()) {
    errors.push(`Expected directory but found non-directory path: ${directory}`);
    return [];
  }

  return fs
    .readdirSync(absolute, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

function normalizeLink(sourceFile, target) {
  const withoutFragment = target.split('#')[0];
  if (
    withoutFragment.length === 0 ||
    /^[a-z][a-z0-9+.-]*:/i.test(withoutFragment) ||
    withoutFragment.startsWith('//')
  ) {
    return null;
  }

  const normalizedTarget = withoutFragment.replaceAll('\\', '/');
  const sourceDirectory = path.dirname(sourceFile).replaceAll(path.sep, '/');
  const candidate = normalizedTarget.startsWith('/')
    ? normalizedTarget.slice(1)
    : path.posix.join(sourceDirectory, normalizedTarget);
  const resolved = path.posix.normalize(candidate);

  if (resolved === '..' || resolved.startsWith('../') || path.isAbsolute(resolved)) {
    return {
      error: `Link target escapes the repository root: ${target}`
    };
  }

  return {
    path: resolved
  };
}

function markdownLinks(content) {
  const links = [];
  const linkPattern = /(?<!!)\[[^\]]*]\(([^)]+)\)/g;
  for (const match of content.matchAll(linkPattern)) {
    const rawTarget = match[1].trim();
    const target = rawTarget.split(/\s+/)[0].replace(/^<|>$/g, '');
    links.push(target);
  }
  return links;
}

function validateRequiredFiles() {
  for (const file of requiredFiles) {
    if (!exists(file)) {
      errors.push(`Missing required file: ${file}`);
    }
  }
}

function validateNoSelfHostedProject() {
  for (const directory of childDirectories('ai')) {
    if (directory.toLowerCase() === 'project') {
      errors.push(`Repository must not contain root-level ai/PROJECT self-context: ai/${directory}`);
    }
  }
}

function validateNoGeminiSupport() {
  const geminiFiles = walk('.', file => /(^|\/)GEMINI\.md$/i.test(file));
  if (geminiFiles.length > 0) {
    errors.push(`Gemini entrypoint files are not supported: ${geminiFiles.join(', ')}`);
  }
}

function validateNoLargeRuleTree() {
  const forbiddenNames = new Set(forbiddenRootDirs.map(directory => directory.toLowerCase()));
  for (const directory of forbiddenRootDirs) {
    if (exists(directory)) {
      errors.push(`Large rule-tree directory is not allowed at repository root: ${directory}`);
    }
  }
  for (const directory of childDirectories('.')) {
    if (forbiddenNames.has(directory.toLowerCase()) && !forbiddenRootDirs.includes(directory)) {
      errors.push(`Large rule-tree directory is not allowed at repository root: ${directory}`);
    }
  }
}

function validateEntrypointTemplates() {
  const templates = [
    'templates/downstream/AGENTS.md',
    'templates/downstream/CLAUDE.md',
    'templates/downstream/.github/copilot-instructions.md'
  ];

  for (const template of templates) {
    if (exists(template) && !read(template).includes('ai/AI-INSTRUCTIONS/AI.md')) {
      errors.push(`${template} must point to ai/AI-INSTRUCTIONS/AI.md.`);
    }
  }
}

function getLineAndColumn(content, offset) {
  const beforeOffset = content.slice(0, offset);
  const lines = beforeOffset.split(/\r?\n/);
  const line = lines.length;
  const column = (lines.at(-1) ?? '').length + 1;
  return { line, column };
}

function formatJsonParseError(content, error) {
  const positionMatch = error.message.match(/position (\d+)/);
  const baseMessage = error.message.replace(/\s+at position \d+.*$/, '');
  if (!positionMatch) {
    return baseMessage;
  }

  const position = Number(positionMatch[1]);
  const { line, column } = getLineAndColumn(content, position);
  const lineText = content.split(/\r?\n/)[line - 1] ?? '';
  return `${baseMessage} at line ${line}, column ${column}: ${lineText}`;
}

function parseSkillsManifest(content) {
  let manifest;
  try {
    manifest = JSON.parse(content);
  } catch (error) {
    throw new Error(formatJsonParseError(content, error));
  }

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('SKILLS.json must be a top-level JSON object.');
  }

  return manifest;
}

function validateSkillsManifest() {
  const manifestPath = 'templates/downstream/ai/PROJECT/SKILLS.json';
  if (!exists(manifestPath)) {
    return;
  }

  try {
    const manifest = parseSkillsManifest(read(manifestPath));
    if (manifest.version !== 1) {
      errors.push('SKILLS.json version must be 1.');
    }
    if (typeof manifest.active_profile !== 'string' || manifest.active_profile.length === 0) {
      errors.push('SKILLS.json must define active_profile as a non-empty string.');
    }
    if (!manifest.profiles || typeof manifest.profiles !== 'object' || Array.isArray(manifest.profiles)) {
      errors.push('SKILLS.json must define profiles as an object.');
      return;
    }
    if (!Object.hasOwn(manifest.profiles, manifest.active_profile)) {
      errors.push('SKILLS.json active_profile must exist in profiles.');
    }
    for (const [name, profile] of Object.entries(manifest.profiles)) {
      if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
        errors.push(`Profile ${name} must be a JSON object.`);
        continue;
      }
      for (const key of Object.keys(profile)) {
        if (key !== 'disabled') {
          errors.push(`Profile ${name} must not define ${key}.`);
        }
      }
      if (!Array.isArray(profile.disabled)) {
        errors.push(`Profile ${name} must define disabled as a list.`);
      }
      if (Array.isArray(profile.disabled)) {
        for (const identifier of profile.disabled) {
          if (!disabledIdentifierPattern.test(identifier)) {
            errors.push(
              `Profile ${name} has invalid disabled identifier ${identifier}.`
            );
            continue;
          }
          if (identifier.length < 1 || identifier.length > 64) {
            errors.push(
              `Profile ${name} has disabled identifier outside 1-64 characters: ${identifier}.`
            );
          }
          if (identifier.startsWith('-') || identifier.endsWith('-')) {
            errors.push(
              `Profile ${name} has disabled identifier with invalid edge hyphen: ${identifier}.`
            );
          }
        }
      }
    }
  } catch (error) {
    errors.push(`SKILLS.json parse failed: ${error.message}`);
  }
}

function validateMarkdownLinks() {
  for (const file of walk('.', candidate => candidate.endsWith('.md') && !candidate.startsWith('.git/'))) {
    const content = read(file);
    for (const link of markdownLinks(content)) {
      const resolved = normalizeLink(file, link);
      if (resolved?.error) {
        errors.push(`Invalid Markdown link in ${file}: ${resolved.error}`);
        continue;
      }
      const isVirtualSharedEntrypoint =
        resolved?.path === 'templates/downstream/ai/AI-INSTRUCTIONS/AI.md' && exists('AI.md');
      if (resolved && !exists(resolved.path) && !isVirtualSharedEntrypoint) {
        errors.push(`Broken Markdown link in ${file}: ${link}`);
      }
    }
  }
}

function validateProjectTemplateReachability() {
  const projectRoot = 'templates/downstream/ai/PROJECT';
  const entrypoint = `${projectRoot}/AI.md`;
  if (!exists(entrypoint)) {
    return;
  }

  const inScope = new Set(walk(projectRoot, file => file.endsWith('.md')));
  const reachable = new Set();
  const queue = [entrypoint];

  while (queue.length > 0) {
    const current = queue.shift();
    if (reachable.has(current)) {
      continue;
    }

    reachable.add(current);
    for (const link of markdownLinks(read(current))) {
      const resolved = normalizeLink(current, link);
      if (resolved?.path && inScope.has(resolved.path) && !reachable.has(resolved.path)) {
        queue.push(resolved.path);
      }
    }
  }

  for (const file of inScope) {
    if (!reachable.has(file)) {
      errors.push(`Downstream project template is not reachable from AI.md: ${file}`);
    }
  }
}

validateRequiredFiles();
validateNoSelfHostedProject();
validateNoGeminiSupport();
validateNoLargeRuleTree();
validateEntrypointTemplates();
validateSkillsManifest();
validateMarkdownLinks();
validateProjectTemplateReachability();

if (errors.length > 0) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log('Validation passed.');
