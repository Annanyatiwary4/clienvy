import chalk from 'chalk';
import { findFiles } from '../core/scanners/fileScanner.js';
import { scanFiles } from '../core/scanners/contentScanner.js';
import { saveSecrets } from '../core/utils/secretsStore.js';
import { ensureStorageDirs } from '../core/utils/paths.js';

export async function extractCommand(cwd = process.cwd()) {
  await ensureStorageDirs(cwd);
  const files = await findFiles(cwd);
  const matches = await scanFiles(files, cwd);

  const secrets = matches.map((m) => ({
    type: m.type,
    provider: m.provider,
    value: m.value,
    file: m.file,
    line: m.line,
    column: m.column,
    variableName: m.variableName,
    providerBonus: m.providerBonus,
    envKeyHint: m.envKeyHint,
    fullMatch: m.fullMatch,
  }));

  const outPath = await saveSecrets(secrets, cwd);

  console.log(chalk.cyan('Extract complete'));
  console.log(chalk.gray(`  Files scanned: ${files.length}`));
  console.log(chalk.gray(`  Matches found: ${secrets.length}`));
  console.log(chalk.gray(`  Saved to: ${outPath}`));

  return secrets;
}
