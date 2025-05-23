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
  .name('clienvy')
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

program
  .command('replace [projectPath]')
  .description('Replace hardcoded secrets with env variable references')
  .action(async (projectPath = process.cwd()) => {
    try {
      // DO NOT call extractSecrets here! Just read secrets.json inside replaceSecrets.
      await replaceSecrets(path.resolve(projectPath));
    } catch (err) {
      console.error('Error replacing secrets:', err);
    }
  });

program
  .command('generate [projectPath]')
  .description('Generate .env and .env.template files')
  .action(async (projectPath = process.cwd()) => {
    try {
      // DO NOT call extractSecrets here! Just read secrets.json inside generateEnvFiles.
      await generateEnvFiles(path.resolve(projectPath));
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
