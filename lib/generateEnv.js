const fs = require('fs-extra');
const path = require('path');

async function generateEnvFiles(projectPath, options = {}) {
  const { silent = false } = options;
  const cachePath = path.join(projectPath, '.clienvy', 'secrets.json');

  if (!(await fs.pathExists(cachePath))) {
    if (!silent) console.log('⚠️  secrets.json not found. Run `clienvy extract` first.');
    return;
  }

  const secrets = await fs.readJson(cachePath);
  if (!Array.isArray(secrets) || secrets.length === 0) {
    if (!silent) console.log('⚠️  No secrets found in secrets.json.');
    return;
  }

  const finalEnv = {};
  for (const { key, value } of secrets) {
    if (/^[A-Z0-9_]+$/.test(key)) {
      finalEnv[key] = value || 'PLACEHOLDER';
    }
  }

  const envPath = path.join(projectPath, '.env');
  const envContent = Object.entries(finalEnv)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';

  await fs.writeFile(envPath, envContent, 'utf8');
  if (!silent) console.log(`✅ .env created with ${Object.keys(finalEnv).length} keys.`);

  const templatePath = path.join(projectPath, '.env.template');
  const templateContent = Object.keys(finalEnv).map(k => `${k}=`).join('\n') + '\n';

  await fs.writeFile(templatePath, templateContent, 'utf8');
  if (!silent) console.log(`✅ .env.template created.`);
}

module.exports = { generateEnvFiles };
