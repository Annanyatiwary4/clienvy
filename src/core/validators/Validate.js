import { shannonEntropy, entropyLabel } from './entropy.js';
import { calculateConfidence, confidenceLevel } from './confidence.js';
import { DEFAULTS } from '../../config/defaults.js';

export function validateSecret(raw) {
  const entropy = shannonEntropy(raw.value);
  const withEntropy = {
    ...raw,
    entropy,
    entropyLabel: entropyLabel(entropy),
  };
  const confidence = calculateConfidence(withEntropy);
  return {
    ...withEntropy,
    confidence,
    confidenceLevel: confidenceLevel(confidence),
    validated: confidence >= DEFAULTS.confidenceThreshold,
  };
}

export function validateSecrets(secrets) {
  return secrets.map(validateSecret);
}

export function filterValidated(secrets, minConfidence = DEFAULTS.confidenceThreshold) {
  return secrets.filter((s) => s.confidence >= minConfidence);
}
