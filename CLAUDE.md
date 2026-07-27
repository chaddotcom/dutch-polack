# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

`dutch-polack` — a TypeScript project (Node.js >= 20, ES modules).

## Setup

Dependencies are installed automatically at session start by
`.claude/hooks/session-start.sh` (runs `npm install`). To do it manually:

```bash
npm install
```

## Common commands

- `npm run build` — compile TypeScript to `dist/`
- `npm run typecheck` — type-check without emitting
- `npm run lint` — run ESLint
- `npm run lint:fix` — ESLint with auto-fix
- `npm test` — run the Vitest suite

## Conventions

- **Language:** TypeScript with `strict` mode. Prefer explicit types on public
  APIs.
- **Modules:** ES modules (`"type": "module"`). Use `.js` extensions in
  relative import specifiers (e.g. `import { greet } from "./index.js"`), as
  required by NodeNext resolution.
- **Tests:** Vitest, co-located as `*.test.ts` next to the code they cover.
- **Before committing:** run `npm run lint` and `npm test`.
