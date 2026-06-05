export const DEFAULTS = {
  storageDir: 'storage',
  secretsFile: 'secrets.json',
  reportsDir: 'reports',
  backupsDir: 'backups',
  envFile: '.env',
  envTemplateFile: '.env.template',
  ignoreFile: '.clienvyignore',
  entropyThreshold: 3,
  confidenceThreshold: 50,
  highConfidenceThreshold: 90,
};

export const SCAN_OPTIONS = {
  concurrency: 8,
};
