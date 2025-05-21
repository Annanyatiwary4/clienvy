const fs = require('fs-extra');
const path = require('path');

/**
 * Read .env file as key-value map
 * @param {string} envFilePath
 * @returns {Promise<Record<string, string>>}
 */
async function readEnvFile(envFilePath) {
  const envMap = {};
  if (!(await fs.pathExists(envFilePath))) return envMap;

  const content = await fs.readFile(envFilePath, 'utf8');
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const val = trimmed.slice(eqIndex + 1).trim();
    envMap[key] = val;
  }

  return envMap;
}

/**
 * Write .env file from key-value map
 * @param {string} envFilePath
 * @param {Record<string, string>} envMap
 */
async function writeEnvFile(envFilePath, envMap) {
  const content = Object.entries(envMap)
    .map(([key, val]) => `${key}=${val}`)
    .join('\n') + '\n';
  await fs.writeFile(envFilePath, content, 'utf8');
}

/**
 * Generate .env and .env.template files, merging with existing .env
 * @param {string} projectPath
 * @param {Array<{key: string, value: string}>} secrets
 */
async function generateEnvFiles(projectPath, secrets) {
  if (!secrets || secrets.length === 0) {
    throw new Error('No secrets provided to generate env files.');
  }

  const envPath = path.join(projectPath, '.env');
  const templatePath = path.join(projectPath, '.env.template');

  const existingEnvMap = await readEnvFile(envPath);

  // Merge secrets: add new keys with actual value or placeholder if missing, keep existing values intact
  for (const { key, value } of secrets) {
    if (!(key in existingEnvMap)) {
      existingEnvMap[key] = value || 'PLACEHOLDER';
    }
  }

  await writeEnvFile(envPath, existingEnvMap);

  // Write template file with empty values for all keys
  const templateLines = Object.keys(existingEnvMap)
    .map((key) => `${key}=`);
  await fs.writeFile(templatePath, templateLines.join('\n') + '\n', 'utf8');

  console.log(`✅ Updated .env and .env.template files at ${projectPath}`);
}

module.exports = { generateEnvFiles };
