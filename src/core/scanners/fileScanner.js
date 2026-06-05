import path from 'path';
import fs from 'fs-extra';
import fg from 'fast-glob';
import { hasAllowedExtension } from '../filters/extensions.js';
import { DEFAULT_IGNORED_DIRS, DEFAULT_IGNORED_GLOBS } from '../filters/ignoredPaths.js';
import { DEFAULTS } from '../../config/defaults.js';

async function loadClienvyIgnore(cwd) {
  const ignorePath = path.join(cwd, DEFAULTS.ignoreFile);
  if (!(await fs.pathExists(ignorePath))) return [];
  const content = await fs.readFile(ignorePath, 'utf8');
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

export async function findFiles(cwd = process.cwd()) {
  const userIgnore = await loadClienvyIgnore(cwd);
  const ignore = [
    ...DEFAULT_IGNORED_DIRS.map((d) => `**/${d}/**`),
    ...DEFAULT_IGNORED_GLOBS,
    ...userIgnore,
  ];

  const patterns = ['**/*'];
  const entries = await fg(patterns, {
    cwd,
    absolute: true,
    dot: false,
    ignore,
    onlyFiles: true,
    suppressErrors: true,
  });

  return entries.filter((filePath) => {
    const relative = path.relative(cwd, filePath);
    if (relative.startsWith('storage' + path.sep) && relative.includes('backups')) {
      return false;
    }
    return hasAllowedExtension(filePath);
  });
}
