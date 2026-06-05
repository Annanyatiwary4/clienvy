import fs from 'fs-extra';
import { getSecretsPath, ensureStorageDirs } from './paths.js';

export async function loadSecrets(cwd = process.cwd()) {
  const path = getSecretsPath(cwd);
  if (!(await fs.pathExists(path))) return [];
  const data = await fs.readJson(path);
  return Array.isArray(data) ? data : [];
}

export async function saveSecrets(secrets, cwd = process.cwd()) {
  await ensureStorageDirs(cwd);
  await fs.writeJson(getSecretsPath(cwd), secrets, { spaces: 2 });
  return getSecretsPath(cwd);
}
