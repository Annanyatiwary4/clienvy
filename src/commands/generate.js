import chalk from 'chalk';
import { loadSecrets, saveSecrets } from '../core/utils/secretsStore.js';
import { filterValidated } from '../core/validators/Validate.js';
import { assignEnvKeys } from '../core/utils/envKey.js';
import { writeEnvFiles } from '../core/generators/envGenerator.js';

export async function generateCommand(cwd = process.cwd()) {
  const secrets = await loadSecrets(cwd);
  if (secrets.length === 0) {
    console.log(chalk.yellow('No secrets found. Run: clenv extract && clenv validate'));
    return;
  }

  const eligible = filterValidated(
    secrets.filter((s) => s.confidence != null ? s.confidence >= 50 : true)
  );
  const withKeys = assignEnvKeys(eligible.length ? eligible : secrets);
  await saveSecrets(
    secrets.map((s) => {
      const updated = withKeys.find((w) => w.value === s.value && w.file === s.file && w.line === s.line);
      return updated ? { ...s, envKey: updated.envKey } : s;
    }),
    cwd
  );

  const paths = await writeEnvFiles(withKeys, cwd);

  console.log(chalk.cyan('Generate complete'));
  console.log(chalk.green(`  ${paths.envPath}`));
  console.log(chalk.green(`  ${paths.templatePath}`));
  console.log(chalk.gray(`  Keys: ${withKeys.length}`));

  return paths;
}
