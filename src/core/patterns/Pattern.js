export class Pattern {
  constructor({ id, name, regex, providerBonus = 0, envKeyHint = null }) {
    this.id = id;
    this.name = name;
    this.regex = regex;
    this.providerBonus = providerBonus;
    this.envKeyHint = envKeyHint;
  }

  match(content) {
    const results = [];
    const flags = this.regex.flags.includes('g') ? this.regex.flags : `${this.regex.flags}g`;
    const re = new RegExp(this.regex.source, flags);
    let match;
    while ((match = re.exec(content)) !== null) {
      const value = match.groups?.value ?? match[1] ?? match[0];
      const variableName = match.groups?.name ?? match.groups?.key ?? null;
      results.push({
        type: this.id,
        provider: this.name,
        value: value?.trim?.() ?? value,
        fullMatch: match[0],
        index: match.index,
        variableName,
        providerBonus: this.providerBonus,
        envKeyHint: this.envKeyHint,
      });
      if (match[0].length === 0) re.lastIndex++;
    }
    return results;
  }
}
