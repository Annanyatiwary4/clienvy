import path from 'path';
import fs from 'fs-extra';
import { runAllPatterns } from '../patterns/index.js';
import { isAllowlistedValue } from '../filters/allowlist.js';
import { isVariableNameOnly } from '../filters/stopwords.js';

function lineNumberAt(content, index) {
  return content.slice(0, index).split('\n').length;
}

function columnAt(content, index) {
  const lineStart = content.lastIndexOf('\n', index - 1) + 1;
  return index - lineStart + 1;
}

function dedupeKey(match) {
  return `${match.file}:${match.line}:${match.value}`;
}

export async function scanFile(filePath, cwd = process.cwd()) {
  const content = await fs.readFile(filePath, 'utf8');
  const rawMatches = runAllPatterns(content);
  const relativeFile = path.relative(cwd, filePath).split(path.sep).join('/');

  const results = [];
  const seen = new Set();

  for (const raw of rawMatches) {
    const value = raw.value;
    if (!value || isAllowlistedValue(value)) continue;
    if (isVariableNameOnly(raw.variableName, value)) continue;
    if (/^[A-Z][A-Z0-9_]{3,}$/.test(value) && !/[a-z0-9]{4,}/.test(value)) continue;

    const line = lineNumberAt(content, raw.index);
    const column = columnAt(content, raw.index);
    const entry = {
      type: raw.type,
      provider: raw.provider,
      value,
      file: relativeFile,
      line,
      column,
      variableName: raw.variableName ?? null,
      providerBonus: raw.providerBonus ?? 0,
      envKeyHint: raw.envKeyHint ?? null,
      fullMatch: raw.fullMatch,
    };

    const key = dedupeKey(entry);
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(entry);
  }

  return results;
}

export async function scanFiles(filePaths, cwd = process.cwd()) {
  const all = [];
  for (const filePath of filePaths) {
    const matches = await scanFile(filePath, cwd);
    all.push(...matches);
  }
  return all;
}
