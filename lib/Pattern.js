// Pattern.js
module.exports = [
  // ========================
  // 📦 DATABASE CONNECTIONS
  // ========================
  {
    name: 'MONGODB_URI',
    regex: /mongodb(?:\+srv)?:\/\/[^\s"'`]+/gi,
  },
  {
    name: 'POSTGRES_URI',
    regex: /postgres(?:ql)?:\/\/[^\s"'`]+/gi,
  },
  {
    name: 'MYSQL_URI',
    regex: /mysql:\/\/[^\s"'`]+/gi,
  },
  {
    name: 'SQLITE_URI',
    regex: /sqlite:\/\/[^\s"'`]+/gi,
  },
  {
    name: 'MSSQL_URI',
    regex: /mssql:\/\/[^\s"'`]+/gi,
  },
  {
    name: 'REDIS_URI',
    regex: /redis:\/\/[^\s"'`]+/gi,
  },

  // ========================
  // 🔐 API KEYS & SECRETS
  // ========================
  {
    name: 'STRIPE_API_KEY',
    regex: /(sk|rk)_(test|live)_[a-zA-Z0-9]{24,}/g,
  },
  {
    name: 'SENDGRID_API_KEY',
    regex: /SG\.[a-zA-Z0-9._-]{20,}\.[a-zA-Z0-9._-]{20,}/g,
  },

  {
    name: 'JWT_TOKEN',
    regex: /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g,
  },
  {
    name: 'GOOGLE_OAUTH_TOKEN',
    regex: /ya29\.[0-9A-Za-z\-_]+/g,
  },
  {
    name: 'OPENAI_API_KEY',
    regex: /sk-[a-zA-Z0-9]{32,}/g,
  },
  {
    name: 'HUGGINGFACE_TOKEN',
    regex: /hf_[a-zA-Z0-9]{32,}/g,
  },
  {
    name: 'COHERE_API_KEY',
    regex: /cohere_[a-zA-Z0-9-_]{32,}/g,
  },

  // ========================
  // ☁️ CLOUD CREDENTIALS
  // ========================
  {
    name: 'AWS_ACCESS_KEY_ID',
    regex: /AKIA[0-9A-Z]{16}/g,
  },
  {
    name: 'AWS_SECRET_ACCESS_KEY',
    regex: /(?<![A-Z0-9])AWS_SECRET_ACCESS_KEY\s*=\s*[A-Za-z0-9/+=]{40}/g,
  },

  // ========================
  // 🔑 OAUTH / APP SECRETS
  // ========================
  {
    name: 'GOOGLE_CLIENT_SECRET',
    regex: /(?<![A-Z_])GOOGLE_CLIENT_SECRET\s*=\s*[a-zA-Z0-9-_]{32,}/g,
  },
  {
    name: 'FACEBOOK_APP_SECRET',
    regex: /(?<![A-Z_])FACEBOOK_APP_SECRET\s*=\s*[a-fA-F0-9]{32}/g,
  },
  {
    name: 'DISCORD_CLIENT_SECRET',
    regex: /(?<![A-Z_])DISCORD_CLIENT_SECRET\s*=\s*[a-zA-Z0-9-_]{32,}/g,
  },

  // ========================
  // 🌐 API URL DETECTION
  // ========================
  {
    name: 'API_URL',
    regex: /https?:\/\/(?:localhost|127\.0\.0\.1|[\w.-]+)(?::\d+)?(?:\/[^\s"'`]*)?/gi,
  },
];
