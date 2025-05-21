const fs = require('fs-extra');
const path = require('path');

/**
 * Replace hardcoded secrets in code with env variable references.
 * @param {string} projectPath
 * @param {Array<{key: string, value: string, file: string, line: number}>} secrets
 */
async function replaceSecrets(projectPath, secrets) {
  if (!secrets || secrets.length === 0) {
    throw new Error('No secrets provided for replacement.');
  }

  // Group secrets by file
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

    const ext = path.extname(absoluteFile).toLowerCase();
    const isReactFile = ext === '.jsx' || ext === '.tsx';

    for (const { key, value } of secretsInFile) {
      // Escape secret value for regex
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match the secret inside quotes (single, double, or backtick)
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
