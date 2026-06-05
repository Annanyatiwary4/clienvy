import fs from 'fs-extra';
import { getEnvPath, getEnvTemplatePath } from '../utils/paths.js';

function formatEnvLine(key, value) {
  const safe = String(value).replace(/\n/g, '\\n');
  if (/[\s#="'`]/.test(safe)) {
    return `${key}="${safe}"`;
  }
  return `${key}=${safe}`;
}

export function buildEnvContent(secrets, { template = false } = {}) {
  const lines = [];
  const seen = new Set();

  for (const secret of secrets) {
    const key = secret.envKey;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (template) {
      lines.push(`${key}=`);
    } else {
      lines.push(formatEnvLine(key, secret.value));
    }
  }

  return lines.join('\n') + (lines.length ? '\n' : '');
}

export async function writeEnvFiles(secrets, cwd = process.cwd()) {
  const envContent = buildEnvContent(secrets, { template: false });
  const templateContent = buildEnvContent(secrets, { template: true });

  await fs.writeFile(getEnvPath(cwd), envContent, 'utf8');
  await fs.writeFile(getEnvTemplatePath(cwd), templateContent, 'utf8');

  return {
    envPath: getEnvPath(cwd),
    templatePath: getEnvTemplatePath(cwd),
  };
}
