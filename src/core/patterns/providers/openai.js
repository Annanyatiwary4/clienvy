import { Pattern } from '../Pattern.js';

export const openaiPattern = new Pattern({
  id: 'openai',
  name: 'OpenAI',
  regex: /\b(sk-[a-zA-Z0-9]{20,})\b/g,
  providerBonus: 50,
  envKeyHint: 'OPENAI_API_KEY',
});
