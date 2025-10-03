#!/usr/bin/env node
const path = require('path');
const { extractSecrets } = require('../lib/extract');
const { generateEnvFiles } = require('../lib/generateEnv');
const { program } = require('commander');
const { replaceSecrets } = require('../lib/replace');
const { init } = require('../lib/init');
const { check } = require('../lib/check');
const { validateSecrets, generateValidationReport } = require('../lib/validate');

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
  .option('-v, --validate', 'Enable validation during extraction')
  .option('--entropy-threshold <number>', 'Set entropy threshold', parseFloat, 4.0)
  .action(async (projectPath = process.cwd(), options) => {
    console.log(`🔍 Scanning project: ${projectPath}`);

    try {
      const extractOptions = {
        enableValidation: options.validate,
        checkEntropy: options.validate,
        checkFormat: options.validate,
        entropyThreshold: options.entropyThreshold || 4.0
      };
      
      const secrets = await extractSecrets(path.resolve(projectPath), extractOptions);
      if (secrets.length === 0) {
        console.log('No secrets found!');
      } else {
        console.log(`Found ${secrets.length} secrets:\n`);
        
        if (options.validate) {
          const table = secrets.map(secret => ({
            Key: secret.key,
            Type: secret.name || 'Unknown',
            File: secret.file,
            Line: secret.line,
            Confidence: secret.validation?.confidence || 'N/A',
            Score: secret.validation?.score || 'N/A'
          }));
          console.table(table);
        }
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

// New validate command for comprehensive secret validation
program
  .command('validate [projectPath]')
  .description('Validate extracted secrets with entropy and format analysis')
  .option('-f, --format <format>', 'Output format: table, json', 'table')
  .option('--entropy-threshold <number>', 'Set entropy threshold', parseFloat, 4.0)
  .action(async (projectPath = process.cwd(), options) => {
    console.log(`🔍 Validating secrets in: ${projectPath}`);
    
    try {
      const cachePath = path.join(path.resolve(projectPath), '.clienvy', 'secrets.json');
      
      if (!(await fs.pathExists(cachePath))) {
        console.log('⚠️  No secrets found. Run `clienvy extract` first.');
        return;
      }
      
      const secrets = await fs.readJson(cachePath);
      
      if (!Array.isArray(secrets) || secrets.length === 0) {
        console.log('⚠️  No secrets to validate.');
        return;
      }
      
      console.log(`📊 Found ${secrets.length} secrets to validate...`);
      
      const validationOptions = {
        checkEntropy: true,
        checkFormat: true,
        performLiveCheck: false,
        entropyOptions: {
          entropyThreshold: options.entropyThreshold
        }
      };
      
      console.log('🔄 Starting validation...');
      const results = await validateSecrets(secrets, validationOptions);
      const report = generateValidationReport(results);
      
      if (options.format === 'json') {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log('\n📊 Validation Summary:');
        console.log(`Total secrets: ${report.summary.total}`);
        console.log(`High confidence: ${report.summary.highConfidence}`);
        console.log(`Medium confidence: ${report.summary.mediumConfidence}`);
        console.log(`Low confidence: ${report.summary.lowConfidence}`);
        console.log(`Format valid: ${report.summary.formatValid}`);
        console.log(`High entropy: ${report.summary.highEntropy}`);
        
        console.log('\n📋 Detailed Results:');
        console.table(report.details.map(detail => ({
          Key: detail.key,
          Type: detail.type,
          File: `${detail.file}:${detail.line}`,
          Confidence: detail.confidence,
          Score: detail.score
        })));
      }
      
      console.log('\n✅ Validation completed!');
      
    } catch (err) {
      console.error('Error during validation:', err.message);
    }
  });

program.parse(process.argv);
