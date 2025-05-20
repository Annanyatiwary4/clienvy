const fs = require('fs-extra');
const path = require('path');
const { globby } = require('globby');

async function check(projectPath) {
  const envPath = path.join(projectPath, '.env');

  if (!(await fs.pathExists(envPath))) {
    console.log('.env file does not exist.');
    return; // exit early
  }

  // If .env exists, proceed with your full checking logic
  // Load .env keys
  const envContent = await fs.readFile(envPath, 'utf8');
  const envKeys = new Set(
    envContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line.includes('='))
      .map(line => line.split('=')[0])
  );

  // Scan source files for env references
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

  const usedKeys = new Set();

  const envVarRegex = /\bimport\.meta\.env\.([A-Z0-9_]+)\b|\bprocess\.env\.([A-Z0-9_]+)\b/g;

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');
    let match;
    while ((match = envVarRegex.exec(content)) !== null) {
      // match[1] or match[2] is the env key used
      const key = match[1] || match[2];
      if (key) {
        usedKeys.add(key);
      }
    }
  }

  // Find missing keys: used in code but not in .env
  const missingKeys = [...usedKeys].filter(k => !envKeys.has(k));

  // Find unused keys: in .env but not used in code
  const unusedKeys = [...envKeys].filter(k => !usedKeys.has(k));

  if (missingKeys.length === 0 && unusedKeys.length === 0) {
    console.log('✅ All environment variables are properly used.');
  } else {
    if (missingKeys.length > 0) {
      console.log('❌ Missing keys (used in code but not defined in .env):');
      for (const key of missingKeys) {
        console.log(`  - ${key}`);
      }
    }
    if (unusedKeys.length > 0) {
      console.log('⚠️ Unused keys (defined in .env but not used in code):');
      for (const key of unusedKeys) {
        console.log(`  - ${key}`);
      }
    }
  }
}

module.exports = { check };
