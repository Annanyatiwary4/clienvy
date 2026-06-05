export const ALLOWLIST_VALUE_PATTERNS = [
  /^test$/i,
  /^dummy$/i,
  /^example$/i,
  /^sample$/i,
  /^localhost$/i,
  /^changeme$/i,
  /^placeholder$/i,
  /^your[-_]?/i,
  /^xxx+$/i,
  /^12345$/,
  /^password$/i,
  /^secret$/i,
  /^<.*>$/,
  /^\$\{.*\}$/,
  /^process\.env\./,
];

export function isAllowlistedValue(value) {
  if (!value || typeof value !== 'string') return true;
  const trimmed = value.trim();
  if (trimmed.length < 4) return true;
  return ALLOWLIST_VALUE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function getAllowlistPenalty(value) {
  return isAllowlistedValue(value) ? 1 : 0;
}
