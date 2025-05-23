const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const { extractSecrets } = require('../lib/extract');
const { generateEnvFiles } = require('../lib/generateEnv');
const { replaceSecrets } = require('../lib/replace');

async function setupGitHook(projectPath) {
  const gitDir = path.join(projectPath, '.git');

  if (!(await fs.pathExists(gitDir))) {
    console.log('Git repo not found, initializing one...');
    execSync('git init', { cwd: projectPath });
  }

  const gitHookPath = path.join(gitDir, 'hooks', 'pre-commit');

  const hookScript = `#!/bin/sh
echo "Running clienvy check..."
npx clienvy check || {
  echo "🚫 clienvy check failed. Commit aborted."
  exit 1
}

`;

  try {
    await fs.ensureDir(path.dirname(gitHookPath));
    await fs.writeFile(gitHookPath, hookScript, { mode: 0o755 });
    console.log('✅ Git pre-commit hook installed to run \`clienvy check\`');
  } catch (err) {
    console.error('❌ Failed to install Git hook:', err.message);
  }
}

async function init(projectPath = process.cwd()) {
  
  try {
    console.log('🔍 Scanning for secrets...');
    const secrets = await extractSecrets(projectPath, { silent: true });


    if (!secrets.length) {
      console.log('✅ No secrets found in code. Nothing to replace.');
      return;
    }

    await replaceSecrets(projectPath, { silent: true });
    await generateEnvFiles(projectPath, { silent: true });

    console.log('🔗 Setting up Git pre-commit hook...');
    await setupGitHook(projectPath);

    console.log('🎉 clienvy init completed successfully!');
  } catch (error) {
    console.error('❌ clienvy init failed:', error.message);
  }
}

module.exports = { init };
