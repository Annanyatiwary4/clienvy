import chalk from 'chalk';
import { loadSecrets, saveSecrets } from '../core/utils/secretsStore.js';
import { validateSecrets, filterValidated } from '../core/validators/Validate.js';
import { getReportsDir } from '../core/utils/paths.js';
import fs from 'fs-extra';
import path from 'path';

export async function validateCommand(cwd = process.cwd()) {
  const raw = await loadSecrets(cwd);
  if (raw.length === 0) {
    console.log(chalk.yellow('No secrets in storage/secrets.json. Run: clenv extract'));
    return [];
  }

  const validated = validateSecrets(raw);
  const accepted = filterValidated(validated);
  await saveSecrets(validated, cwd);

  const reportPath = path.join(getReportsDir(cwd), `validation-${Date.now()}.json`);
  await fs.writeJson(
    reportPath,
    {
      total: validated.length,
      accepted: accepted.length,
      rejected: validated.length - accepted.length,
      secrets: validated,
    },
    { spaces: 2 }
  );

  console.log(chalk.cyan('Validate complete'));
  console.log(chalk.gray(`  Total: ${validated.length}`));
  console.log(chalk.green(`  Accepted (≥50%): ${accepted.length}`));
  console.log(chalk.gray(`  Report: ${reportPath}`));

  for (const s of accepted.slice(0, 10)) {
    console.log(
      chalk.white(`  ${s.file}:${s.line}`),
      chalk.dim(`${s.type} entropy=${s.entropy} confidence=${s.confidence}%`)
    );
  }
  if (accepted.length > 10) {
    console.log(chalk.dim(`  ... and ${accepted.length - 10} more`));
  }

  return validated;
}
