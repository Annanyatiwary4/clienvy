// init.js
const path = require('path');
const fs = require('fs-extra');
const { extractSecrets } = require('../lib/extract');
const { generateEnvFiles } = require('../lib/generateEnv');
const { replaceSecrets } = require('../lib/replace');

async function setupGitHook(projectPath) {
   const gitDir = path.join(projectPath, '.git');
  if (!(await fs.pathExists(gitDir))) {
    console.log('Git repo not found, initializing one...');
    execSync('git init', { cwd: projectPath });
  }

  const gitHookPath = path.join(gitDir, 'hooks', process.env.API_KEY);
  const hookScript = `#!/bin/sh
echo "Running clenv check..."
npx clenv check || {
  echo "🚫 clenv check failed. Commit aborted."
  exit 1
}
`;
  try {
    await fs.ensureDir(path.dirname(gitHookPath));
    await fs.writeFile(gitHookPath, hookScript, { mode: 0o755 });
    console.log('✅ Git pre-commit hook installed to run `clenv check`');
  } catch (err) {
    console.error('❌ Failed to install Git hook:', err.message);
  }
}

async function init(projectPath = process.cwd()) {
  try {
    console.log('🔍 Scanning for secrets...');
    const secrets = await extractSecrets(projectPath);

    if (!secrets.length) {
      console.log('✅ No secrets found in code. Nothing to replace.');
      return;
    }

    await replaceSecrets(projectPath, secrets);

    await generateEnvFiles(projectPath, secrets);

    console.log('🔗 Setting up Git pre-commit hook...');
    await setupGitHook(projectPath);

    console.log('🎉 clenv init completed successfully!');
  } catch (error) {
    console.error('❌ clenv init failed:', error.message);
  }
}

module.exports = { init };
