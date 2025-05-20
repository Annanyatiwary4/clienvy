const fs = require('fs-extra');
const path = require('path');
const { globby } = require('globby');

/**
 * Replace hardcoded secrets in code with env variable references.
 * @param {string} projectPath
 * @param {Array<{key: string, value: string, file: string, line: number}>} secrets
 * @returns {Promise<void>}
 */
async function replaceSecrets(projectPath, secrets) {
  if (!secrets || secrets.length === 0) {
    throw new Error('No secrets provided for replacement.');
  }

  // Group secrets by file for efficient processing
  const fileMap = new Map();

  for (const secret of secrets) {
    if (!fileMap.has(secret.file)) {
      fileMap.set(secret.file, []);
    }
    fileMap.get(secret.file).push(secret);
  }

  for (const [relativeFile, secretsInFile] of fileMap.entries()) {
    const absoluteFile = path.join(projectPath, relativeFile);
    let content = await fs.readFile(absoluteFile, 'utf8');

    // Determine replacement style by file extension
    const ext = path.extname(absoluteFile).toLowerCase();
    const isReactFile = ext === '.jsx' || ext === '.tsx';

    for (const { key, value } of secretsInFile) {
      // Create regex to replace the secret value as a quoted string
      // Escape value for regex
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Regex to match the secret inside quotes (single, double, or backtick)
      const regex = new RegExp(`(['"\`])${escapedValue}\\1`, 'g');

      const replacement = isReactFile
        ? `import.meta.env.${key}`
        : `process.env.${key}`;

      content = content.replace(regex, replacement);
    }

    await fs.writeFile(absoluteFile, content, 'utf8');
    console.log(`✅ Replaced secrets in ${relativeFile}`);
  }
}

module.exports = { replaceSecrets };
