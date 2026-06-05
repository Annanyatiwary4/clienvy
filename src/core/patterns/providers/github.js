import { Pattern } from '../Pattern.js';

export const githubPattern = new Pattern({
  id: 'github',
  name: 'GitHub',
  regex: /\b(ghp_[a-zA-Z0-9]{36,})\b/g,
  providerBonus: 50,
  envKeyHint: 'GITHUB_TOKEN',
});
