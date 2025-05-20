const fs = require('fs-extra');
const path = require('path');

/**
 * Generate .env and .env.template files with given secrets
 * @param {string} projectPath - directory where files will be created
 * @param {Array<{key: string, value: string}>} secrets - list of secrets
 * @returns {Promise<void>}
 */
async function generateEnvFiles(projectPath, secrets) {
  if (!secrets || secrets.length === 0) {
    throw new Error('No secrets provided to generate env files.');
  }

  const envLines = [];
  const templateLines = [];

  // Use a Set to avoid duplicates
  const seenKeys = new Set();

  for (const { key, value } of secrets) {
    if (!seenKeys.has(key)) {
      envLines.push(`${key}=${value}`);
      templateLines.push(`${key}=`);
      seenKeys.add(key);
    }
  }

  const envContent = envLines.join('\n') + '\n';
  const templateContent = templateLines.join('\n') + '\n';

  // Write .env
  await fs.writeFile(path.join(projectPath, '.env'), envContent, 'utf8');

  // Write .env.template
  await fs.writeFile(path.join(projectPath, '.env.template'), templateContent, 'utf8');

  console.log(`✅ .env and .env.template files created at ${projectPath}`);
}

module.exports = { generateEnvFiles };
