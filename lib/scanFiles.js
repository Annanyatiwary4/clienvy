// lib/scanFiles.js
const fs = require('fs');
const path = require('path');

const secretPatterns = [
  /api[_-]?key\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
  /secret[_-]?key\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
  /token\s*[:=]\s*['"][A-Za-z0-9_\-]{16,}['"]/i,
  /password\s*[:=]\s*['"][A-Za-z0-9_\-]{6,}['"]/i
];

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!["node_modules", ".git"].includes(file)) {
        scanDirectory(fullPath, results);
      }
    } else {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        secretPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => results.push({
              file: fullPath,
              match
            }));
          }
        });
      } catch (err) {
        // skip binary files
      }
    }
  }
  return results;
}

module.exports = { scanDirectory };
