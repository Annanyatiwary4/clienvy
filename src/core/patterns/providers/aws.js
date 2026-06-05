import { Pattern } from '../Pattern.js';

export const awsPattern = new Pattern({
  id: 'aws',
  name: 'AWS',
  regex: /\b(AKIA[0-9A-Z]{16})\b/g,
  providerBonus: 50,
  envKeyHint: 'AWS_ACCESS_KEY_ID',
});
