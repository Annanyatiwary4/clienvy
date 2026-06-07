# ⚙️ Clienvy — Secret Detection & Environment Migration Engine

> Detect hardcoded secrets, validate them using entropy analysis, generate environment files, and automatically migrate your codebase to secure environment variables.

![NPM Total Downloads](https://img.shields.io/npm/dt/clienvy?color=brightgreen\&label=Total%20Downloads\&style=for-the-badge)

---

## 🚀 Features

* 🔍 Detect hardcoded secrets across your codebase
* 🧠 Entropy-based secret validation
* 🎯 Confidence scoring for every detected secret
* 🛡️ Allowlist-based false positive reduction
* 📦 Automatic `.env` and `.env.template` generation
* 🔁 Replace hardcoded secrets with environment variables
* 🪝 Git pre-commit hook integration
* ⚡ One-command migration using `clienvy init`

---

## 📦 Installation

```bash
npm install -g clienvy
```

Verify installation:

```bash
clienvy --version
```

---

## ⚡ Quick Start

Run the complete migration pipeline:

```bash
clienvy init
```

This will:

```text
Extract Secrets
      ↓
Validate Secrets
      ↓
Generate .env Files
      ↓
Replace Hardcoded Secrets
      ↓
Set Up Git Protection
```

---

# 🛠 Commands

## clienvy init

Runs the complete workflow.

```bash
clienvy init
```

Pipeline:

```text
extract
   ↓
validate
   ↓
generate
   ↓
replace
```

---

## clienvy extract

Extract secrets from the codebase.

```bash
clienvy extract
```

Output:

```text
storage/secrets.json
```

---

## clienvy validate

Validate extracted secrets using entropy and confidence scoring.

```bash
clienvy validate
```

---

## clienvy generate

Generate environment files.

```bash
clienvy generate
```

Creates:

```text
.env
.env.template
```

---

## clienvy replace

Replace hardcoded secrets with environment variables.

```bash
clienvy replace
```

Example:

```js
const apiKey = "sk-abc123";
```

↓

```js
const apiKey = process.env.OPENAI_API_KEY;
```

---

## clienvy check

Verify environment variable consistency.

```bash
clienvy check
```

Checks:

* Missing variables
* Unused variables
* Secret leaks
* Environment consistency

---

# 🔄 Workflow

```text
clienvy init

      ↓

Extract Secrets

      ↓

Store secrets.json

      ↓

Validate Findings

      ↓

Generate .env Files

      ↓

Replace Hardcoded Values

      ↓

Clean Codebase
```

---

# 🧠 Detection Strategy

Clienvy uses a layered detection pipeline:

```text
Regex Detection
       ↓
Allowlist Filtering
       ↓
Entropy Analysis
       ↓
Confidence Scoring
       ↓
Final Verdict
```

This approach significantly reduces false positives compared to regex-only scanners.

---

# 📊 Entropy Analysis

Clienvy uses Shannon Entropy to estimate how random a detected value is.

---

# 🎯 Confidence Scoring

Every detected secret receives a confidence score.

Factors include:

* Regex match strength
* Entropy score
* Variable context
* Provider-specific patterns
* Allowlist penalties

---

# 📂 Project Structure

```text
clienvy/
│
├── bin/
│   └── clenv.js
│
├── src/
│   ├── commands/
│   ├── core/
│   ├── storage/
│   └── config/
│
├── .clienvyignore
├── package.json
└── README.md
```

---

# 📁 Folder Overview

| Folder          | Purpose                                 |
| --------------- | --------------------------------------- |
| bin             | CLI entry point                         |
| commands        | User-facing CLI commands                |
| core/patterns   | Secret detection rules                  |
| core/scanners   | File and content scanning               |
| core/validators | Entropy and confidence analysis         |
| core/filters    | Allowlists and false-positive filtering |
| core/generators | Environment file generation             |
| core/replacers  | Secret replacement engine               |
| storage         | Secrets cache, reports, backups         |
| config          | Global configuration and thresholds     |

---

# 🔍 Supported Secret Types

### Provider Specific

* OpenAI Keys
* GitHub Tokens
* AWS Credentials
* Stripe Keys
* JWT Secrets
* MongoDB URIs

### Generic Secrets

Clienvy can also detect custom secrets such as:

```env
API_KEY=
SECRET=
TOKEN=
PASSWORD=
ACCESS_TOKEN=
PRIVATE_KEY=
```

---

# 🛣 Roadmap

### Core Engine

* [ ] Secret Detection Engine
* [ ] Entropy Validation
* [ ] Confidence Scoring
* [ ] Environment Migration

### Security

* [ ] Live Provider Validation
* [ ] Git History Secret Scanning
* [ ] Secret Fingerprinting
* [ ] Security Reports

### Developer Experience

* [ ] Interactive CLI
* [ ] Rich Console Reports
* [ ] Configuration Profiles
* [ ] CI/CD Integration

---

# 🤝 Contributing

Contributions are welcome.

Whether it's:

* Fixing bugs
* Improving detection patterns
* Adding providers
* Enhancing validation
* Improving documentation

every contribution helps make Clienvy better.

---

# ⭐ Support

If Clienvy helped you secure your codebase, consider giving the project a star:

https://github.com/Annanyatiwary4/clienvy

It helps the project grow and supports future development.
