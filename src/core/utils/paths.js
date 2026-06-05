import path from 'path';
import fs from 'fs-extra';
import { DEFAULTS } from '../../config/defaults.js';

export function getProjectRoot(cwd = process.cwd()) {
  return cwd;
}

export function getStorageDir(cwd = process.cwd()) {
  return path.join(getProjectRoot(cwd), DEFAULTS.storageDir);
}

export function getSecretsPath(cwd = process.cwd()) {
  return path.join(getStorageDir(cwd), DEFAULTS.secretsFile);
}

export function getReportsDir(cwd = process.cwd()) {
  return path.join(getStorageDir(cwd), DEFAULTS.reportsDir);
}

export function getBackupsDir(cwd = process.cwd()) {
  return path.join(getStorageDir(cwd), DEFAULTS.backupsDir);
}

export function getEnvPath(cwd = process.cwd()) {
  return path.join(getProjectRoot(cwd), DEFAULTS.envFile);
}

export function getEnvTemplatePath(cwd = process.cwd()) {
  return path.join(getProjectRoot(cwd), DEFAULTS.envTemplateFile);
}

export async function ensureStorageDirs(cwd = process.cwd()) {
  await fs.ensureDir(getStorageDir(cwd));
  await fs.ensureDir(getReportsDir(cwd));
  await fs.ensureDir(getBackupsDir(cwd));
}
