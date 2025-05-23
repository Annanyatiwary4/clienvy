const fs = require('fs-extra');
const path = require('path');

async function replaceSecrets(projectPath, options = {}) {
  const { silent = false } = options;
  const cachePath = path.join(projectPath, '.clienvy', 'secrets.json');

  if (!(await fs.pathExists(cachePath))) {
    if (!silent) console.log('⚠️  secrets.json not found. Run `clienvy extract` first.');
    return;
  }

  const secrets = await fs.readJson(cachePath);
  if (!Array.isArray(secrets) || secrets.length === 0) {
    if (!silent) console.log('⚠️  No secrets found for replacement.');
    return;
  }

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
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(['"\`])${escapedValue}\\1`, 'g');

      const replacement = isReactFile ? `import.meta.env.${key}` : `process.env.${key}`;
      content = content.replace(regex, replacement);
    }

    await fs.writeFile(absoluteFile, content, 'utf8');
    if (!silent) console.log(`✅ Replaced secrets in ${relativeFile}`);
  }
}

module.exports = { replaceSecrets };
