const fs = require('fs-extra');
const path = require('path');
const { globby } = require('globby');
const SECRET_PATTERNS = require('./Pattern');
const { analyzeEntropy, validateSecretFormat } = require('./validate');
const validationConfig = require('./validationConfig');

/**
 * Sanitize string to ENV-friendly key
 */
let secretCounter = 1;
function sanitizeToEnvKey(name) {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
}

function generateEnvKey(value, patternName) {
  return sanitizeToEnvKey(patternName || `SECRET_${secretCounter++}`);
}

/**
 * Recursive regex-based scanner for language-agnostic secret detection
 */
function scanDirectory(dir, results = []) {
  const secretRegexPatterns = [
    /api[_-]?key\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
    /secret[_-]?key\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
    /token\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
    /password\s*[:=]\s*['"][A-Za-z0-9_\-]{6,}['"]/i
  ];

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        scanDirectory(fullPath, results);
      }
    } else {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        secretRegexPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => {
              results.push({
                file: path.relative(process.cwd(), fullPath),
                match
              });
            });
          }
        });
      } catch (err) {
        // Skip binary or unreadable files
      }
    }
  }

  return results;
}

/**
 * Extract secrets from project files
 */
async function extractSecrets(projectPath, options = {}) {
  const {
    silent = false,
    enableValidation = false,
    checkEntropy = true,
    checkFormat = true,
    entropyThreshold = validationConfig.entropy.entropyThreshold,
    regexScan = false  // <-- Use CLI flag here
  } = options;

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

  const cacheDir = path.join(projectPath, '.clienvy');
  await fs.ensureDir(cacheDir);
  const cachePath = path.join(cacheDir, 'secrets.json');
  let existingSecrets = [];
  if (await fs.pathExists(cachePath)) {
    existingSecrets = await fs.readJson(cachePath);
  }

  const secretsFound = [];
  const usedKeys = new Set();

  // --- Existing pattern-based scanning ---
  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track usage of process.env.KEY
      const envKeyMatch = line.match(/process\.env\.([A-Z0-9_]+)/g);
      if (envKeyMatch) {
        for (const match of envKeyMatch) {
          const key = match.split('process.env.')[1];
          usedKeys.add(key);
        }
      }

      for (const pattern of SECRET_PATTERNS) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        regex.lastIndex = 0;

        let match;
        while ((match = regex.exec(line)) !== null) {
          const key = generateEnvKey(match[0], pattern.name);
          const value = match[0];

          const secret = {
            key,
            value,
            name: pattern.name,
            file: path.relative(projectPath, filePath),
            line: i + 1,
          };

          if (enableValidation) {
            const validation = {};
            if (checkEntropy) {
              validation.entropy = analyzeEntropy(value, {
                entropyThreshold,
                minLength: validationConfig.entropy.minLength,
                minEntropyLength: validationConfig.entropy.minEntropyLength
              });
            }
            if (checkFormat) {
              validation.format = validateSecretFormat(value, pattern.name);
            }

            let score = validationConfig.scoring.patternMatch;
            if (validation.entropy?.isHighEntropy) score += validationConfig.scoring.highEntropy;
            if (validation.format?.isValidFormat === true) score += validationConfig.scoring.validFormat;

            let confidence = 'medium';
            if (score >= validationConfig.scoring.thresholds.high) confidence = 'high';
            else if (score >= validationConfig.scoring.thresholds.medium) confidence = 'medium';
            else confidence = 'low';

            validation.confidence = confidence;
            validation.score = score;
            secret.validation = validation;
          }

          secretsFound.push(secret);
        }
      }
    }
  }

  // --- Regex-based, language-agnostic scanning only if --regex-scan is enabled ---
  if (regexScan) {
    const regexResults = scanDirectory(projectPath);
    regexResults.forEach(item => {
      const key = generateEnvKey(item.match, 'RegexSecret');
      const secret = {
        key,
        value: item.match,
        name: 'RegexSecret',
        file: item.file,
        line: 'N/A'
      };
      if (!secretsFound.some(s => s.value === secret.value && s.file === secret.file)) {
        secretsFound.push(secret);
      }
    });
  }

  // Preserve existing secrets that are still referenced via process.env
  const mergedSecrets = [
    ...existingSecrets.filter(secret => usedKeys.has(secret.key)),
    ...secretsFound.filter(
      newSecret => !existingSecrets.some(old => old.key === newSecret.key)
    )
  ];

  await fs.writeJson(cachePath, mergedSecrets, { spaces: 2 });

  if (!silent) {
    if (enableValidation) {
      const highConfidence = mergedSecrets.filter(s => s.validation?.confidence === 'high').length;
      const mediumConfidence = mergedSecrets.filter(s => s.validation?.confidence === 'medium').length;
      const lowConfidence = mergedSecrets.filter(s => s.validation?.confidence === 'low').length;

      console.log(`✅ Extracted and validated ${secretsFound.length} new secrets.`);
      console.log(`📊 Validation Summary:`);
      console.log(`   🟢 High confidence: ${highConfidence}`);
      console.log(`   🟡 Medium confidence: ${mediumConfidence}`);
      console.log(`   🟠 Low confidence: ${lowConfidence}`);
    } else {
      console.log(`✅ Extracted and saved ${secretsFound.length} new secrets.`);
    }
    console.log(
      "\n📁 `.clienvy/secrets.json` has been updated.\n" +
      "🔒 Make sure to add the following to your `.gitignore` to avoid committing secrets:"
    );
  }

  return mergedSecrets;
}

module.exports = { extractSecrets };
