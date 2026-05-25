import { validateRepository } from './validate-lib.mjs';

const errors = validateRepository(process.cwd());

if (errors.length > 0) {
  console.error(errors.map(error => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log('Validation passed.');
