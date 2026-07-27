# dutch-polack

A TypeScript project.

## Agent Neighbor (no-backend web app)

`index.html` is a self-contained "Agent Neighbor" site — a Street Context Index
for any address. It needs **no backend and no database**: the browser queries
municipal open-data APIs directly.

- **Philadelphia** — [OpenDataPhilly Carto SQL API](https://phl.carto.com)
  (311, L&I violations, permits) via a PostGIS radius query.
- **New York** — [NYC Open Data / Socrata](https://data.cityofnewyork.us)
  (311, HPD violations) via a bounding-box query.
- Everywhere else, and the domains without a wired feed yet (fire, schools,
  environment, reliability), fall back to a clearly labeled demonstration model.

Open `index.html` in a browser, or serve it statically (e.g. GitHub Pages from
the repo root). There are no keys or build step for the page itself.

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
