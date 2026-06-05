import { WEIGHTS } from '../../config/weights.js';
import { CONFIDENCE_LEVELS } from '../../config/weights.js';
import { entropyScore } from './entropy.js';
import { getAllowlistPenalty } from '../filters/allowlist.js';
import { isStopwordVariable } from '../filters/stopwords.js';

function regexScoreForType(type) {
  if (type === 'generic' || type === 'generic_env') {
    return WEIGHTS.regexScore * 0.6;
  }
  return WEIGHTS.regexScore;
}

function contextScore(secret, filePath) {
  let score = 0;
  const name = secret.variableName || '';
  if (/KEY|TOKEN|SECRET|PASSWORD/i.test(name)) {
    score += WEIGHTS.variableNameBonus;
  }
  if (filePath && filePath.endsWith('.env')) {
    score += WEIGHTS.envFileBonus;
  }
  if (secret.envKeyHint) {
    score += 5;
  }
  return Math.min(score, WEIGHTS.contextScore);
}

export function calculateConfidence(secret) {
  const entropy = secret.entropy ?? 0;
  const providerBonus = secret.providerBonus ?? 0;
  const allowlistPenalty = getAllowlistPenalty(secret.value) * WEIGHTS.allowlistPenalty;

  let score =
    regexScoreForType(secret.type) +
    entropyScore(entropy) +
    contextScore(secret, secret.file) +
    providerBonus -
    allowlistPenalty;

  if (isStopwordVariable(secret.variableName) && entropy < 3.5) {
    score -= 15;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return score;
}

export function confidenceLevel(confidence) {
  if (confidence >= CONFIDENCE_LEVELS.definite.min) return CONFIDENCE_LEVELS.definite.label;
  if (confidence >= CONFIDENCE_LEVELS.veryLikely.min) return CONFIDENCE_LEVELS.veryLikely.label;
  if (confidence >= CONFIDENCE_LEVELS.suspicious.min) return CONFIDENCE_LEVELS.suspicious.label;
  return CONFIDENCE_LEVELS.falsePositive.label;
}
