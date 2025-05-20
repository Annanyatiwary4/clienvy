# 🌿 clienv — Smart Environment Variable Manager !!

`clienv` is a lightweight CLI tool that **automatically detects hardcoded secrets**, replaces them with **environment variables**, and **generates `.env` and `.env.template` files** — all with a single command.

It also sets up a **Git pre-commit hook** to prevent secret leaks by ensuring `.env` consistency before each commit.

---

## 🚀 Features

- 🔍 **Scan** your code for hardcoded secrets like API keys, Mongo URIs, JWTs, and more.
- 🔁 **Replace** them with secure `process.env.KEY` or `import.meta.env.KEY` (for React/Vite).
- 📦 **Generate** `.env` and `.env.template` automatically.
- 🛡️ **Pre-commit Git hook** to run secret checks.
- ✅ Works for **Node.js, React, Vite** projects.

---

## 📦 Installation

```bash
npm install -g clienv
```
verify Installation
```bash
clienv --version
```
---

## 🛠️ Commands

  
### clienv init
 Full setup: extract, replace, generate env files, and install Git hook.

### clienv check
 Checks if .env exists and verifies that all keys are present and used correctly.

### clienv extract
 Extracts secrets from your code without replacing or generating files.

### clienv replace
Replaces hardcoded secrets in your code with environment variable references.

### clienv generate
 Generates .env and .env.template files from extracted secrets.

---

## Typical workflow example:

Run full setup once:

```bash
clienv init
```

Later, when you add new secrets:

```bash

- clienv extract
- clienv replace
- clienv generate
```

Use clienv check to verify .env correctness before commits (or rely on the Git hook):

```bash
clienv check
```
---

## 🧠 Why clenv?
Managing secrets manually is error-prone. clenv automates the boring and risky parts so you can:

- ✅ Code securely

- 🧼 Keep your codebase clean

- ⛔ Prevent accidental leaks


