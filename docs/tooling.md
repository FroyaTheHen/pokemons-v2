# Tooling

This document describes the code quality tools used in this project, what they do, and why they are here.

---

## ESLint

**Config file:** `eslint.config.mjs`

Static analysis tool that catches code problems — unused variables, unsafe patterns, and TypeScript-specific issues — before they become bugs.

Three rule sets are active:

| Plugin                          | Purpose                                           |
| ------------------------------- | ------------------------------------------------- |
| `@eslint/js` recommended        | Core JS best practices                            |
| `typescript-eslint` recommended | TypeScript-specific rules                         |
| `eslint-config-prettier`        | Disables ESLint rules that conflict with Prettier |

Run manually:

```bash
npm run lint        # check
npm run lint:fix    # check and auto-fix
```

---

## Prettier

**Config file:** `.prettierrc`

Opinionated code formatter. Enforces a consistent style so diffs stay focused on logic, not whitespace.

Run manually:

```bash
npm run format          # format all files
npm run format:check    # check without writing
```

---

## Husky

**Config dir:** `.husky/`

Manages Git hooks. Used here to run linting and formatting automatically before every commit, so issues never make it into the repository.

---

## lint-staged

**Config:** `package.json` → `"lint-staged"`

Runs ESLint and Prettier only on files staged for commit (not the entire codebase). This keeps the pre-commit check fast regardless of project size.

What runs on each commit for `*.ts` / `*.tsx` files:

1. `eslint --fix` — fixes auto-fixable issues
2. `prettier --write` — formats the file

If a lint error cannot be auto-fixed, the commit is blocked until the issue is resolved manually.
