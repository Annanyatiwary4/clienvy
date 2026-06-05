import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { findFiles } from '../core/scanners/fileScanner.js';
import { scanFiles } from '../core/scanners/contentScanner.js';
import { loadSecrets } from '../core/utils/secretsStore.js';
import { getEnvPath } from '../core/utils/paths.js';
import { filterValidated } from '../core/validators/Validate.js';

function parseEnvFile(content) {
  const keys = new Set();
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq > 0) keys.add(trimmed.slice(0, eq).trim());
  }
  return keys;
}

export async function checkCommand(cwd = process.cwd()) {
  let failed = false;

  const envPath = getEnvPath(cwd);
  if (!(await fs.pathExists(envPath))) {
    console.log(chalk.red('Missing .env file. Run: clenv generate'));
    failed = true;
  }

  const secrets = await loadSecrets(cwd);
  const validated = filterValidated(secrets.filter((s) => s.confidence != null));

  const files = await findFiles(cwd);
  const newMatches = await scanFiles(files, cwd);

  if (newMatches.length > 0) {
    const known = new Set(validated.map((s) => `${s.file}:${s.line}:${s.value}`));
    const unknown = newMatches.filter((m) => !known.has(`${m.file}:${m.line}:${m.value}`));
    if (unknown.length > 0) {
      console.log(chalk.red(`New hardcoded secrets detected: ${unknown.length}`));
      for (const u of unknown.slice(0, 5)) {
        console.log(chalk.red(`  ${u.file}:${u.line} (${u.type})`));
      }
      failed = true;
    }
  }

  if (await fs.pathExists(envPath)) {
    const envKeys = parseEnvFile(await fs.readFile(envPath, 'utf8'));
    const requiredKeys = new Set(
      secrets.filter((s) => s.envKey && (s.confidence ?? 0) >= 50).map((s) => s.envKey)
    );

    for (const key of requiredKeys) {
      if (!envKeys.has(key)) {
        console.log(chalk.red(`Missing env var in .env: ${key}`));
        failed = true;
      }
    }

    const secretKeys = new Set(secrets.map((s) => s.envKey).filter(Boolean));
    for (const key of envKeys) {
      if (!secretKeys.has(key) && !key.startsWith('NODE_')) {
        console.log(chalk.yellow(`Unused env var: ${key}`));
      }
    }
  }

  if (failed) {
    console.log(chalk.red('\nCheck failed — commit blocked.\n'));
    process.exitCode = 1;
    return false;
  }

  console.log(chalk.green('Check passed — no issues found.'));
  return true;
}
