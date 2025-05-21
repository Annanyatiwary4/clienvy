const fs = require('fs-extra');
const path = require('path');
const { globby } = require('globby');

const SECRET_PATTERNS = [
  {
    name: 'STRIPE_API_KEY',
    regex: /['"`](sk_(test|live)_[a-zA-Z0-9_]{10,})['"`]/g,
  },
  {
    name: 'AWS_ACCESS_KEY_ID',
    regex: /AKIA[0-9A-Z]{16}/g,
  },
  {
    name: 'MONGODB_URI',
    regex: /['"`]?(mongodb(\+srv)?:\/\/[^'"`\s]+)['"`]?/g,
  },
  {
    name: 'JWT_TOKEN',
    regex: /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
  },
  {
    name: 'GOOGLE_OAUTH_TOKEN',
    regex: /ya29\.[0-9A-Za-z\-_]+/g,
  },
  {
    name: 'GENERIC_SECRET_ENV',
    regex: /([A-Z_][A-Z0-9_]*)\s*=\s*['"`]?([a-zA-Z0-9-_]{6,})['"`]?/g,
  },
  {
    name: 'GENERIC_SECRET_JS',
    regex: /(?:const|let|var)?\s*([a-zA-Z0-9_]+)\s*=\s*['"`]([a-zA-Z0-9-_]{6,})['"`]/g,
  },
];

let secretCounter = 1;

function sanitizeToEnvKey(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
}

function generateEnvKey(value, patternName, matchGroups = []) {
  if (patternName === 'GENERIC_SECRET_ENV' || patternName === 'GENERIC_SECRET_JS') {
    return sanitizeToEnvKey(matchGroups[1]) || `SECRET_${secretCounter++}`;
  }
  if (patternName) return patternName;
  return `SECRET_${secretCounter++}`;
}

/**
 * Extract secrets from project files
 * @param {string} projectPath
 * @returns {Promise<Array<{key: string, value: string, file: string, line: number}>>}
 */
async function extractSecrets(projectPath) {
  const patterns = [
    '**/*.js',
    '**/*.ts',
    '**/*.jsx',
    '**/*.tsx',
    '**/*.env',
    '!node_modules',
    '!dist',
    '!build',
    '!**/node_modules/**',
  ];

  const files = await globby(patterns, { cwd: projectPath, absolute: true });
  const secretsFound = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (const pattern of SECRET_PATTERNS) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        let match;

        regex.lastIndex = 0;

        while ((match = regex.exec(line)) !== null) {
          const key = generateEnvKey(null, pattern.name, match);
          const value = match[2] || match[1] || match[0];

          secretsFound.push({
            key,
            value,
            file: path.relative(projectPath, filePath),
            line: i + 1,
          });
        }
      }
    }
  }

  return secretsFound;
}

module.exports = { extractSecrets };
