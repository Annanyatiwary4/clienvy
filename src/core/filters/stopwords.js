export const VARIABLE_STOPWORDS = new Set([
  'password',
  'secret',
  'token',
  'apikey',
  'api_key',
  'key',
  'auth',
  'credential',
  'credentials',
]);

export function isVariableNameOnly(name, value) {
  if (!name || !value) return false;
  const normalizedName = name.toLowerCase().replace(/[-_]/g, '');
  const normalizedValue = value.toLowerCase().replace(/[-_]/g, '');
  return VARIABLE_STOPWORDS.has(normalizedName) && normalizedValue === normalizedName;
}

export function isStopwordVariable(name) {
  if (!name) return false;
  const normalized = name.toLowerCase().replace(/[-_]/g, '');
  return VARIABLE_STOPWORDS.has(normalized);
}
