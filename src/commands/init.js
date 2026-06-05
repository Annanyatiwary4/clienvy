import chalk from 'chalk';
import { extractCommand } from './extract.js';
import { validateCommand } from './validate.js';
import { generateCommand } from './generate.js';
import { replaceCommand } from './replace.js';

export async function initCommand(cwd = process.cwd()) {
  console.log(chalk.bold.cyan('\nClienvy — init\n'));

  await extractCommand(cwd);
  await validateCommand(cwd);
  await generateCommand(cwd);
  await replaceCommand(cwd);

  console.log(chalk.bold.green('\nDone. Your codebase has been migrated to environment variables.\n'));
  console.log(chalk.gray('  storage/secrets.json — source of truth'));
  console.log(chalk.gray('  .env — local values (do not commit)'));
  console.log(chalk.gray('  .env.template — safe to commit\n'));
}
