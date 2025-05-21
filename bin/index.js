#!/usr/bin/env node
const path = require('path');
const { extractSecrets } = require('../lib/extract');
const { generateEnvFiles } = require('../lib/generateEnv');
const { program } = require('commander');
const { replaceSecrets } = require('../lib/replace');
const { init } = require('../lib/init');
const { check } = require('../lib/check');

const pkg = require('../package.json');

program
  .name('clenv')
  .description('CLI tool to extract secrets, replace them, and generate .env files')
  .version(pkg.version);


  // command to extract hardcoded secrets from project files
  // This command scans the project files for hardcoded secrets and prints them to the console.
  // It uses the process.env.VITE_TOKEN function from the `lib/extract` module to perform the scanning.
program
  .command('extract [projectPath]')
  .description('Scan project files and extract hardcoded secrets')
  .action(async (projectPath = process.cwd()) => {
    console.log(`🔍 Scanning project: ${projectPath}`);

    try {
      const secrets = await extractSecrets(path.resolve(projectPath));
      if (secrets.length === 0) {
        console.log('No secrets found!');
      } else {
        console.log(`Found ${secrets.length} secrets:\n`);
       
      }
    } catch (err) {
      console.error('Error during extraction:', err);
    }
  });

  //command to replace hardcoded secrets with environment variables
program
  .command('replace [projectPath]')
  .description('Replace hardcoded secrets with env variable references')
  .action(async (projectPath = process.cwd()) => {
    try {
      const secrets = await extractSecrets(path.resolve(projectPath));
      if (secrets.length === 0) {
        console.log('No secrets found to replace.');
        return;
      }

      await replaceSecrets(path.resolve(projectPath), secrets);
    } catch (err) {
      console.error('Error replacing secrets:', err);
    }
  });


  // command to generate .env and .env.template files
  // This command generates .env and .env.template files based on the extracted secrets.
program
  .command('generate [projectPath]')
  .description('Generate .env and .env.template files')
  .action(async (projectPath = process.cwd()) => {
    try {
      // First, extract secrets
      const secrets = await extractSecrets(path.resolve(projectPath));
      if (secrets.length === 0) {
        console.log('No secrets found to generate env files.');
        return;
      }

      // Remove duplicates and keep key & value only
      const uniqueSecretsMap = new Map();
      secrets.forEach(({ key, value }) => {
        if (!uniqueSecretsMap.has(key)) uniqueSecretsMap.set(key, value);
      });
      const uniqueSecrets = Array.from(uniqueSecretsMap, ([key, value]) => ({ key, value }));

      await generateEnvFiles(path.resolve(projectPath), uniqueSecrets);
    } catch (err) {
      console.error('Error generating env files:', err);
    }
  });

  // 🚀 Init full setup
program
  .command('init [projectPath]')
  .description('Full setup: extract, replace, generate .env files, and set up Git hook')
  .action(async (projectPath = process.cwd()) => {
    try {
      await init(path.resolve(projectPath));
    } catch (err) {
      console.error('Error running clenv init:', err.message);
    }
  });


  // command to check for missing or unused environment variables
  program
  .command('check [projectPath]')
  .description('Check for missing or unused environment variables')
  .action(async (projectPath = process.cwd()) => {
    try {
      await check(path.resolve(projectPath));
    } catch (err) {
      console.error('Error during check:', err.message);
    }
  });

program.parse(process.argv);
