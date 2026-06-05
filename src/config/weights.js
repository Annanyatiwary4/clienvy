export const WEIGHTS = {
  regexScore: 40,
  entropyScore: 25,
  contextScore: 20,
  providerBonus: 50,
  allowlistPenalty: 30,
  variableNameBonus: 15,
  envFileBonus: 10,
};

export const ENTROPY_BANDS = {
  low: { max: 3, score: 0, label: 'Probably text' },
  suspicious: { min: 3, max: 4, score: 10, label: 'Suspicious' },
  likely: { min: 4, max: 5, score: 20, label: 'Likely secret' },
  strong: { min: 5, score: 25, label: 'Strong secret' },
};

export const CONFIDENCE_LEVELS = {
  definite: { min: 90, label: 'Definitely Secret' },
  veryLikely: { min: 70, label: 'Very Likely' },
  suspicious: { min: 50, label: 'Suspicious' },
  falsePositive: { min: 0, label: 'Probably False Positive' },
};
