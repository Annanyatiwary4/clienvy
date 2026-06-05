import { openaiPattern } from './providers/openai.js';
import { githubPattern } from './providers/github.js';
import { awsPattern } from './providers/aws.js';
import { stripePattern } from './providers/stripe.js';
import { matchGenericAssignments } from './generic.js';

export const providerPatterns = [
  openaiPattern,
  githubPattern,
  awsPattern,
  stripePattern,
];

export function runAllPatterns(content) {
  const matches = [];
  for (const pattern of providerPatterns) {
    matches.push(...pattern.match(content));
  }
  matches.push(...matchGenericAssignments(content));
  return matches;
}
