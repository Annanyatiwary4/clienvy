const PROVIDER_ENV_KEYS = {
  openai: 'OPENAI_API_KEY',
  github: 'GITHUB_TOKEN',
  aws: 'AWS_ACCESS_KEY_ID',
  stripe: 'STRIPE_SECRET_KEY',
};

export function toEnvKey(secret) {
  if (secret.envKey) return secret.envKey;
  if (secret.envKeyHint) return secret.envKeyHint;
  if (PROVIDER_ENV_KEYS[secret.type]) return PROVIDER_ENV_KEYS[secret.type];

  const name = secret.variableName || secret.type || 'SECRET';
  return name
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .toUpperCase();
}

export function assignEnvKeys(secrets) {
  const used = new Map();
  return secrets.map((secret) => {
    let base = toEnvKey(secret);
    let key = base;
    let n = 1;
    while (used.has(key)) {
      n += 1;
      key = `${base}_${n}`;
    }
    used.set(key, true);
    return { ...secret, envKey: key };
  });
}
