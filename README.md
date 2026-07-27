# dutch-polack

A TypeScript project.

## Requirements

- Node.js >= 20

## Getting started

```bash
npm install
```

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run build`     | Compile TypeScript to `dist/`                |
| `npm run typecheck` | Type-check without emitting output           |
| `npm run lint`      | Run ESLint                                    |
| `npm run lint:fix`  | Run ESLint and auto-fix where possible       |
| `npm test`          | Run the test suite with Vitest               |

## Project layout

```
src/            Source code
  index.ts      Entry point
  index.test.ts Tests (co-located)
```

## License

[MIT](./LICENSE)
