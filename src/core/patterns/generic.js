import { Pattern } from './Pattern.js';

const ASSIGNMENT_REGEX =
  /(?<name>[A-Za-z_][A-Za-z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|ACCESS_TOKEN))\s*[=:]\s*["'`](?<value>[^"'`\n]{8,})["'`]/gi;

const ENV_STYLE_REGEX =
  /(?<name>[A-Z][A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|ACCESS_TOKEN)[A-Z0-9_]*)\s*=\s*(?<value>[^\s#\n]{8,})/g;

export const genericAssignmentPattern = new Pattern({
  id: 'generic',
  name: 'Generic',
  regex: ASSIGNMENT_REGEX,
  providerBonus: 0,
});

export const genericEnvPattern = new Pattern({
  id: 'generic_env',
  name: 'Generic Env',
  regex: ENV_STYLE_REGEX,
  providerBonus: 5,
});

export function matchGenericAssignments(content) {
  const fromAssignment = genericAssignmentPattern.match(content);
  const fromEnv = genericEnvPattern.match(content);
  return [...fromAssignment, ...fromEnv];
}
