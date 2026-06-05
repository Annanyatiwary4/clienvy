#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { initCommand } from '../src/commands/init.js';
import { extractCommand } from '../src/commands/extract.js';
import { validateCommand } from '../src/commands/validate.js';
import { generateCommand } from '../src/commands/generate.js';
import { replaceCommand } from '../src/commands/replace.js';
import { checkCommand } from '../src/commands/check.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const program = new Command();

program
  .name('clenv')
  .description('Secret Detection → Validation → Environment Migration → Code Remediation')
  .version(pkg.version);

program
  .command('init')
  .description('Full pipeline: extract → validate → generate → replace')
  .action(() => initCommand());

program
  .command('extract')
  .description('Scan codebase and save matches to storage/secrets.json')
  .action(() => extractCommand());

program
  .command('validate')
  .description('Score matches with entropy and confidence')
  .action(() => validateCommand());

program
  .command('generate')
  .description('Create .env and .env.template from secrets.json')
  .action(() => generateCommand());

program
  .command('replace')
  .description('Replace hardcoded secrets with process.env references')
  .action(() => replaceCommand());

program
  .command('check')
  .description('Verify env files and detect new secrets (for Git hooks)')
  .action(() => checkCommand());

program.parse();
