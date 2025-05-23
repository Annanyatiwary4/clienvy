const fs = require('fs-extra');
const path = require('path');
const { globby } = require('globby');
const SECRET_PATTERNS = require('./Pattern');

let secretCounter = 1;

function sanitizeToEnvKey(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
}

function generateEnvKey(value, patternName) {
  return sanitizeToEnvKey(patternName || `SECRET_${secretCounter++}`);
}

/**
 * Extract secrets from project files
 * @param {string} projectPath
 * @returns {Promise<Array<{key: string, value: string, file: string, line: number}>>}
 */
async function extractSecrets(projectPath, options = {}) {
  const { silent = false } = options;
  const patterns = [
    '**/*.js',
    '**/*.ts',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.env',
    '!node_modules',
    '!dist',
    '!build',
    '!**/node_modules/**',
  ];

  const files = await globby(patterns, { cwd: projectPath, absolute: true });

  // Load existing secrets if any
  const cacheDir = path.join(projectPath, '.clienvy');
  await fs.ensureDir(cacheDir);
  const cachePath = path.join(cacheDir, 'secrets.json');
  let existingSecrets = [];
  if (await fs.pathExists(cachePath)) {
    existingSecrets = await fs.readJson(cachePath);
  }

  const secretsFound = [];
  const usedKeys = new Set();

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track usage of process.env.KEY
      const envKeyMatch = line.match(/process\.env\.([A-Z0-9_]+)/g);
      if (envKeyMatch) {
        for (const match of envKeyMatch) {
          const key = match.split('process.env.')[1];
          usedKeys.add(key);
        }
      }

      for (const pattern of SECRET_PATTERNS) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        regex.lastIndex = 0;

        let match;
        while ((match = regex.exec(line)) !== null) {
          const key = generateEnvKey(match[0], pattern.name);
          const value = match[0];

          secretsFound.push({
            key,
            value,
            file: path.relative(projectPath, filePath),
            line: i + 1,
          });
        }
      }
    }
  }

  // Preserve existing secrets that are still referenced via process.env
  const mergedSecrets = [
    ...existingSecrets.filter(secret => usedKeys.has(secret.key)),
    ...secretsFound.filter(
      newSecret => !existingSecrets.some(old => old.key === newSecret.key)
    )
  ];

  await fs.writeJson(cachePath, mergedSecrets, { spaces: 2 });

  if (!silent) {
    console.log(`✅ Extracted and saved ${secretsFound.length} new secrets.`);
    console.log(
      "\n📁 `.clienvy/secrets.json` has been updated.\n" +
      "🔒 Make sure to add the following to your `.gitignore` to avoid committing secrets:"
    );
  }

  return mergedSecrets;
}

module.exports = { extractSecrets };
