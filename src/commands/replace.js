import chalk from 'chalk';
import { loadSecrets } from '../core/utils/secretsStore.js';
import { filterValidated } from '../core/validators/Validate.js';
import { assignEnvKeys } from '../core/utils/envKey.js';
import { replaceInProject } from '../core/replacers/codeReplacer.js';

export async function replaceCommand(cwd = process.cwd()) {
  const secrets = await loadSecrets(cwd);
  if (secrets.length === 0) {
    console.log(chalk.yellow('No secrets found. Run: clenv extract'));
    return;
  }

  const eligible = secrets.filter((s) => (s.confidence ?? 100) >= 50);
  const withKeys = assignEnvKeys(
    eligible.map((s) => (s.envKey ? s : { ...s, envKey: undefined }))
  );

  const { total } = await replaceInProject(withKeys, cwd);

  console.log(chalk.cyan('Replace complete'));
  console.log(chalk.gray(`  Replacements applied: ${total}`));
  console.log(chalk.dim('  Backups saved under storage/backups/'));

  return { total };
}
