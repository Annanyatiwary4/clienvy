import fs from 'fs-extra';
import path from 'path';
import { getBackupsDir } from '../utils/paths.js';

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function processEnvAccess(envKey, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(ext)) {
    return `process.env.${envKey}`;
  }
  if (['.py'].includes(ext)) {
    return `os.environ.get("${envKey}")`;
  }
  return `process.env.${envKey}`;
}

function replaceInContent(content, secret) {
  const { value, envKey } = secret;
  if (!value || !envKey) return { content, replaced: false };

  const replacement = processEnvAccess(envKey, secret.file);
  let next = content;

  const assignQuoted = new RegExp(
    `([A-Za-z_$][\\w$]*\\s*=\\s*)(["'\`])${escapeRegExp(value)}\\2`,
    'g'
  );
  const quotedOnly = new RegExp(`(["'\`])${escapeRegExp(value)}\\1`, 'g');

  if (assignQuoted.test(content)) {
    assignQuoted.lastIndex = 0;
    next = content.replace(assignQuoted, `$1${replacement}`);
  } else if (quotedOnly.test(content)) {
    quotedOnly.lastIndex = 0;
    next = content.replace(quotedOnly, replacement);
  } else {
    const bare = new RegExp(`=\\s*${escapeRegExp(value)}(?=\\s*[,;\\n]|$)`, 'g');
    next = content.replace(bare, `= ${replacement}`);
  }

  return { content: next, replaced: next !== content };
}

export async function backupFile(filePath, cwd) {
  const backupsDir = getBackupsDir(cwd);
  await fs.ensureDir(backupsDir);
  const base = path.basename(filePath);
  const stamp = Date.now();
  const dest = path.join(backupsDir, `${base}.${stamp}.bak`);
  await fs.copy(filePath, dest);
  return dest;
}

export async function replaceInFile(filePath, secrets, cwd = process.cwd()) {
  let content = await fs.readFile(filePath, 'utf8');
  const fileSecrets = secrets.filter((s) => {
    const normalized = path.relative(cwd, path.resolve(cwd, s.file)).split(path.sep).join('/');
    const target = path.relative(cwd, filePath).split(path.sep).join('/');
    return normalized === target;
  });

  if (fileSecrets.length === 0) return { replaced: 0 };

  await backupFile(filePath, cwd);
  let count = 0;
  for (const secret of fileSecrets) {
    const result = replaceInContent(content, secret);
    if (result.replaced) {
      content = result.content;
      count += 1;
    }
  }

  await fs.writeFile(filePath, content, 'utf8');
  return { replaced: count };
}

export async function replaceInProject(secrets, cwd = process.cwd()) {
  const byFile = new Map();
  for (const secret of secrets) {
    const fullPath = path.join(cwd, secret.file);
    if (!byFile.has(fullPath)) byFile.set(fullPath, []);
    byFile.get(fullPath).push(secret);
  }

  let total = 0;
  for (const [filePath, fileSecrets] of byFile) {
    if (!(await fs.pathExists(filePath))) continue;
    const { replaced } = await replaceInFile(filePath, fileSecrets, cwd);
    total += replaced;
  }
  return { total };
}
