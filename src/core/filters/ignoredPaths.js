export const DEFAULT_IGNORED_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  'vendor',
  '__pycache__',
  '.venv',
  'venv',
  'storage',
];

export const DEFAULT_IGNORED_GLOBS = [
  '**/*.min.js',
  '**/*.map',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
];

export function pathMatchesIgnored(normalizedPath, ignoredSegments) {
  const parts = normalizedPath.split(/[/\\]/);
  return parts.some((part) => ignoredSegments.includes(part));
}
