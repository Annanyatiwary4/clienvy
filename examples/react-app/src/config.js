const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
const someToken = process.env.VITE_TOKEN;
const OAUTH_TOKEN = process.env.OAUTH_TOKEN; // OAuth token example
const JWT_TOKEN = process.env.JWT_TOKEN; // JWT token example
const GENERIC_SECRET = process.env.VITE_TOKEN; // Generic secret token

module.exports = { awsAccessKey, someToken, OAUTH_TOKEN, JWT_TOKEN, GENERIC_SECRET };
