export function shannonEntropy(value) {
  if (!value || typeof value !== 'string' || value.length === 0) return 0;

  const freq = new Map();
  for (const char of value) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }

  const len = value.length;
  let entropy = 0;
  for (const count of freq.values()) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Math.round(entropy * 100) / 100;
}

export function entropyScore(entropy) {
  if (entropy < 3) return 0;
  if (entropy < 4) return 10;
  if (entropy < 5) return 20;
  return 25;
}

export function entropyLabel(entropy) {
  if (entropy < 3) return 'Probably text';
  if (entropy < 4) return 'Suspicious';
  if (entropy < 5) return 'Likely secret';
  return 'Strong secret';
}
