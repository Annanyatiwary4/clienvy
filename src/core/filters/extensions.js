export const ALLOWED_EXTENSIONS = new Set([
  '.js',
  '.ts',
  '.tsx',
  '.jsx',
  '.env',
  '.py',
  '.java',
  '.go',
  '.json',
  '.yaml',
  '.yml',
  '.rb',
  '.php',
  '.cs',
  '.rs',
  '.kt',
  '.swift',
  '.mjs',
  '.cjs',
]);

export function hasAllowedExtension(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}
