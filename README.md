# dutch-polack

A TypeScript project.

## Agent Neighbor (no-backend web app)

`index.html` is a self-contained "Agent Neighbor" site — a Street Context Index
for any address. It needs **no backend and no database**: the browser queries
municipal open-data APIs directly.

Live-data cities (civic + development domains):

- **Philadelphia** — [OpenDataPhilly Carto SQL API](https://phl.carto.com)
  (311, L&I violations, permits) via a PostGIS radius query.
- **New York, Chicago, Los Angeles, Austin, Seattle, Dallas, San Francisco** —
  Socrata open-data APIs via bounding-box queries.
- **Boston** — [CKAN datastore](https://data.boston.gov) SQL API.
- **Washington DC** — [ArcGIS](https://opendata.dc.gov) FeatureServer query.
- Everywhere else, and every domain without a wired feed yet (fire, schools,
  environment, reliability), is marked **"Not yet available."** Nothing is
  modeled or estimated — the index is a partial roll-up over only the domains
  that have real records.

City coverage is config-driven: each city is one entry in the `CITIES` array
plus a dataset config, so adding or correcting a city is a small, localized
change. Only domains with a responding live feed are scored; if every dataset
for a covered city fails, the report shows "not yet available" rather than a
fabricated score.

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
