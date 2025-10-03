const fs = require('fs-extra');
const path = require('path');
const { globby } = require('globby');
const SECRET_PATTERNS = require('./Pattern');
const { analyzeEntropy, validateSecretFormat } = require('./validate');
const validationConfig = require('./validationConfig');

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
 * Extract secrets from project files with optional validation
 * @param {string} projectPath
 * @param {object} options - Options for extraction and validation
 * @returns {Promise<Array<{key: string, value: string, file: string, line: number, validation?: object}>>}
 */
async function extractSecrets(projectPath, options = {}) {
  const { 
    silent = false, 
    enableValidation = false,
    checkEntropy = true,
    checkFormat = true,
    entropyThreshold = validationConfig.entropy.entropyThreshold
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

  // Load existing secrets if any
  const cacheDir = path.join(projectPath, '.clienvy');
  await fs.ensureDir(cacheDir);
  const cachePath = path.join(cacheDir, 'secrets.json');
  let existingSecrets = [];
  if (await fs.pathExists(cachePath)) {
    existingSecrets = await fs.readJson(cachePath);
  }

  const secretsFound = [];
  const usedKeys = new Set();

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

          // Add validation if enabled
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
            
            // Calculate confidence score
            let score = validationConfig.scoring.patternMatch;
            
            if (validation.entropy?.isHighEntropy) {
              score += validationConfig.scoring.highEntropy;
            }
            
            if (validation.format?.isValidFormat === true) {
              score += validationConfig.scoring.validFormat;
            }
            
            // Determine confidence
            let confidence = 'medium';
            if (score >= validationConfig.scoring.thresholds.high) {
              confidence = 'high';
            } else if (score >= validationConfig.scoring.thresholds.medium) {
              confidence = 'medium';
            } else {
              confidence = 'low';
            }
            
            validation.confidence = confidence;
            validation.score = score;
            secret.validation = validation;
          }

          secretsFound.push(secret);
        }
      }
    }
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
