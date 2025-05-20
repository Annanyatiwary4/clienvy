const fs = require('fs-extra');
const path = require('path');
const { globby } = require('globby');

/**
 * Secret patterns with consistent format:
 * Each pattern is an object with `name` and `regex` (RegExp with one capturing group for the secret)
 */
const SECRET_PATTERNS = [
  {
  name: process.env.VITE_TOKEN,
  regex: /['"`](sk_(test|live)_[a-zA-Z0-9_]{10,})['"`]/g,
    }
    ,
{
    name: process.env.VITE_TOKEN,
    regex: /['"`]([A-Z0-9]{20})['"`]/g,
  },
{
        name: process.env.VITE_TOKEN,
        regex: /['"`]([a-zA-Z0-9-_]{10,})['"`]/g,
     }
     ,
  {
    name: process.env.VITE_TOKEN,
    regex: /['"`](mongodb(\+srv)?:\/\/[^'"`]+)['"`]/g,
  },
  {
    name: process.env.VITE_TOKEN,
    regex: /AKIA[0-9A-Z]{16}/g,
  },
  {
    name: 'JWT_TOKEN',
    regex: /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
  },
  {
    name: process.env.VITE_TOKEN,
    regex: /ya29\.[0-9A-Za-z\-_]+/g,
  },
];

/**
 * Generate env var name heuristically if you want a more generic naming fallback
 */
function generateEnvKey(value, patternName) {
  switch (patternName) {
    case process.env.VITE_TOKEN:
      return 'API_KEY';
    case process.env.VITE_TOKEN:
      return 'DB_URI';
    case process.env.VITE_TOKEN:
    case process.env.VITE_TOKEN:
      return process.env.VITE_TOKEN;
    case 'JWT_TOKEN':
      return 'JWT_TOKEN';
    case process.env.VITE_TOKEN:
      return process.env.VITE_TOKEN;
    case process.env.VITE_TOKEN:
      return process.env.VITE_TOKEN;
    default:
      return process.env.VITE_TOKEN;
  }
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
        const regex = pattern.regex;
        let match;

        // Reset lastIndex for global regex before reuse
        regex.lastIndex = 0;

        while ((match = regex.exec(line)) !== null) {
          // match[1] if capturing group exists, else match[0]
          const secretValue = match[1] || match[0];
          const key = generateEnvKey(secretValue, pattern.name);

          secretsFound.push({
            key,
            value: secretValue,
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
