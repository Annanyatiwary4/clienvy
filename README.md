# ⚙️ clienvy — Smart Environment Variable Manager !!

`clienvy` is a lightweight CLI tool that **automatically detects hardcoded secrets**, replaces them with **environment variables**, and **generates `.env` and `.env.template` files** — all with a single command.

It also sets up a **Git pre-commit hook** to prevent secret leaks by ensuring `.env` consistency before each commit.

---

## 🚀 Features

- 🔍 **Scan** your code for hardcoded secrets like API keys, Mongo URIs, JWTs, and more.
- 🔁 **Replace** them with secure `process.env.KEY` or `import.meta.env.KEY`.
- 📦 **Generate** `.env` and `.env.template` automatically.
- 🛡️ **Pre-commit Git hook** to automatically check for exposed secrets, unused variables, or any potential misuse before every commit.


---

## 📦 Installation

```bash
npm install -g clienvy
```
verify Installation
```bash
clienvy --version
```
---

## 🛠️ Commands

  
### clienvy init
 Full setup: extract, replace, generate env files, and install Git hook.

### clienvy check
 Checks if .env exists and verifies that all keys are present and used correctly.

### clienvy extract
 Extracts secrets from your code without replacing or generating files.

### clienvy replace
Replaces hardcoded secrets in your code with environment variable references.

### clienvy generate
 Generates .env and .env.template files from extracted secrets.

---

## RoadMap:

Run full setup once:

```bash
clienvy init
```

Later, when you add new secrets:

```bash

- clienvy extract
- clienvy generate
- clienvy replace

```

Use clienv check to verify .env correctness before commits (or rely on the Git hook):

```bash
clienvy check
```
---

## 🧠 Why clienvy?
Managing secrets manually is error-prone. clienvy automates the boring and risky parts so you can:

- ✅ Code securely

- 🧼 Keep your codebase clean

- ⛔ Prevent accidental leaks

## 🤝 Contribution
Clienvy is an open project, and we’d love your help! Feel free to jump in — whether it’s fixing bugs, suggesting improvements, or just spreading the word, every contribution makes a difference.And If you really find it helpful, please give it a ⭐ on [GitHub](https://github.com/Annanyatiwary4/clienvy) !.









